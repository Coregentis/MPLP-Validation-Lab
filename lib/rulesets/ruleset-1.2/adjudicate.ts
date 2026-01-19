/**
 * Ruleset-1.2 Adjudicator
 * 
 * v0.4 Semantic Invariant Adjudication
 * - Evaluates 12 clauses (3 per domain)
 * - Returns RulesetEvalResult per registry contract
 */

import type { RunBundle } from '@/lib/bundles/types';
import type { RulesetEvalResult, DomainMeta, ClauseResult as RegistryClauseResult } from '@/lib/rulesets/registry';
import { CLAUSE_DEFINITIONS, DOMAIN_NAMES, type ClauseResult } from './types';
import { evaluateClause } from './clauses';
import { isArbitrationPack } from '@/lib/rulesets/ruleset-1.1/applicability';

// =============================================================================
// Adjudicator Entry Point
// =============================================================================

/**
 * Adjudicate a run using ruleset-1.2 (12-clause semantic invariants).
 */
export async function adjudicatorFn(bundle: RunBundle): Promise<RulesetEvalResult> {
    // Check applicability
    if (!isArbitrationPack(bundle.run_id)) {
        return createNotApplicableResult(bundle);
    }

    // Evaluate all 12 clauses
    const clauseResults: ClauseResult[] = [];
    for (const def of CLAUSE_DEFINITIONS) {
        const result = evaluateClause(bundle, def.clause_id);
        if (result) {
            clauseResults.push(result);
        }
    }

    // Aggregate results by domain
    const domainMeta: DomainMeta[] = [];
    for (const domain of ['D1', 'D2', 'D3', 'D4'] as const) {
        const domainClauses = clauseResults.filter(
            c => CLAUSE_DEFINITIONS.find(d => d.clause_id === c.clause_id)?.domain === domain
        );

        const domainStatus = domainClauses.every(c => c.status === 'PASS')
            ? 'PASS'
            : domainClauses.some(c => c.status === 'FAIL')
                ? 'FAIL'
                : 'NOT_EVALUATED';

        domainMeta.push({
            domain_id: domain,
            domain_name: DOMAIN_NAMES[domain],
            status: domainStatus,
        });
    }

    // Determine topline verdict
    const failedClauses = clauseResults.filter(c => c.status === 'FAIL');
    const notEvaluatedClauses = clauseResults.filter(c => c.status === 'NOT_EVALUATED');

    let toplineVerdict: RulesetEvalResult['topline_verdict'] = 'PASS';
    let reasonCode: string | null = null;

    if (failedClauses.length > 0) {
        toplineVerdict = 'FAIL';
        reasonCode = failedClauses[0].reason_code || 'CLAUSE_FAILED';
    } else if (notEvaluatedClauses.length > 0 && clauseResults.filter(c => c.status === 'PASS').length === 0) {
        toplineVerdict = 'NOT_EVALUATED';
        reasonCode = notEvaluatedClauses[0].reason_code || 'CLAUSES_NOT_EVALUATED';
    }

    // Convert to registry ClauseResult format
    const registryClauses: RegistryClauseResult[] = clauseResults.map(c => ({
        clause_id: c.clause_id,
        requirement_id: c.requirement_id,
        status: c.status,
        reason_code: c.reason_code,
        domain_id: CLAUSE_DEFINITIONS.find(d => d.clause_id === c.clause_id)?.domain,
        evidence_refs: c.evidence.resolved.map(r => ({
            pointer: r.pointer,
            resolved: r.resolved,
            content: r.content ? { ...r.content } : undefined,
        })),
        notes: c.notes,
    }));

    return {
        ruleset_id: 'ruleset-1.2',
        run_id: bundle.run_id,
        evaluated_at: new Date().toISOString(),
        topline_verdict: toplineVerdict,
        reason_code: reasonCode,
        domain_meta: domainMeta,
        clauses: registryClauses,
    };
}

/**
 * Create NOT_EVALUATED result for non-applicable packs.
 */
function createNotApplicableResult(bundle: RunBundle): RulesetEvalResult {
    return {
        ruleset_id: 'ruleset-1.2',
        run_id: bundle.run_id,
        evaluated_at: new Date().toISOString(),
        topline_verdict: 'NOT_EVALUATED',
        reason_code: 'PACK_NOT_APPLICABLE_FOR_RULESET_1_2',
        clauses: [],
    };
}
