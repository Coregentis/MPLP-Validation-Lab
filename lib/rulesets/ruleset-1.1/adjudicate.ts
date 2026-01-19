/**
 * Ruleset-1.1 Adjudicator
 * 
 * Entry point for four-domain evidence-based adjudication.
 * Evaluates all enabled clauses and produces Ruleset11Verdict.
 */

import type { RunBundle } from '@/lib/bundles/types';
import type { RulesetEvalResult, ClauseResult as RegistryClauseResult } from '@/lib/rulesets/registry';
import { CLAUSE_EVALUATORS } from './clauses';
import {
    CLAUSE_DEFINITIONS,
    DOMAIN_NAMES,
    type ClauseResult,
    type DomainVerdictResult,
    type Ruleset11Verdict,
    type DomainId,
} from './types';

// =============================================================================
// Adjudicator Options
// =============================================================================

export interface AdjudicateOptions {
    /** 
     * Which clauses to evaluate. Default: all defined clauses.
     * Pass specific IDs to evaluate only those (e.g., ['CL-D1-01', 'CL-D2-01'])
     */
    clauseIds?: string[];

    /**
     * If true, stop evaluation on first failure. Default: false (evaluate all).
     */
    failFast?: boolean;
}

// =============================================================================
// Main Adjudicator
// =============================================================================

/**
 * Evaluate a bundle against ruleset-1.1 clauses.
 * 
 * @param bundle - The loaded RunBundle (SSOT)
 * @param opts - Adjudication options
 * @returns Ruleset11Verdict with domain verdicts and topline
 */
export function adjudicateRuleset11(
    bundle: RunBundle,
    opts: AdjudicateOptions = {}
): Ruleset11Verdict {
    const clauseIds = opts.clauseIds ?? CLAUSE_DEFINITIONS.map(d => d.clause_id);
    const failFast = opts.failFast ?? false;

    const clauseResults: ClauseResult[] = [];
    let firstFailReason: string | null = null;

    // Evaluate each clause
    for (const clauseId of clauseIds) {
        const evaluator = CLAUSE_EVALUATORS[clauseId];
        if (!evaluator) {
            // Unknown clause - skip with warning (could also be NOT_EVALUATED)
            continue;
        }

        const result = evaluator(bundle);
        clauseResults.push(result);

        // Track first failure reason
        if (result.status === 'FAIL' && !firstFailReason && result.reason_code) {
            firstFailReason = result.reason_code;
        }

        // Fail fast if requested
        if (failFast && result.status === 'FAIL') {
            break;
        }
    }

    // Group results by domain
    const domainVerdicts = buildDomainVerdicts(clauseResults);

    // Compute topline
    const allPassed = clauseResults.length > 0 && clauseResults.every(r => r.status === 'PASS');
    const topline: 'PASS' | 'FAIL' = allPassed ? 'PASS' : 'FAIL';

    return {
        ruleset_id: 'ruleset-1.1',
        run_id: bundle.run_id,
        evaluated_at: new Date().toISOString(),
        topline,
        domain_verdicts: domainVerdicts,
        clause_results: clauseResults,
        reason_code: topline === 'FAIL' ? firstFailReason : null,
    };
}

// =============================================================================
// Domain Verdict Builder
// =============================================================================

function buildDomainVerdicts(clauseResults: ClauseResult[]): DomainVerdictResult[] {
    const domainMap = new Map<DomainId, ClauseResult[]>();

    // Group clauses by domain
    for (const result of clauseResults) {
        const def = CLAUSE_DEFINITIONS.find(d => d.clause_id === result.clause_id);
        if (!def) continue;

        const existing = domainMap.get(def.domain) || [];
        existing.push(result);
        domainMap.set(def.domain, existing);
    }

    // Build domain verdicts
    const verdicts: DomainVerdictResult[] = [];
    for (const [domain, clauses] of domainMap.entries()) {
        const allPassed = clauses.every(c => c.status === 'PASS');
        const anyFailed = clauses.some(c => c.status === 'FAIL');

        let status: DomainVerdictResult['status'];
        if (allPassed) {
            status = 'PASS';
        } else if (anyFailed) {
            status = 'FAIL';
        } else {
            status = 'NOT_EVALUATED';
        }

        verdicts.push({
            domain,
            domain_name: DOMAIN_NAMES[domain],
            status,
            clauses,
        });
    }

    // Sort by domain ID
    verdicts.sort((a, b) => a.domain.localeCompare(b.domain));

    return verdicts;
}

// =============================================================================
// Adapter to RulesetEvalResult (for registry compatibility)
// =============================================================================

/**
 * Convert Ruleset11Verdict to the registry's RulesetEvalResult format.
 * This allows the adjudicator to work with the registry's AdjudicatorFn signature.
 * 
 * Includes domain_meta for generic UI grouping.
 */
export function toRulesetEvalResult(verdict: Ruleset11Verdict): RulesetEvalResult {
    return {
        ruleset_id: verdict.ruleset_id,
        run_id: verdict.run_id,
        evaluated_at: verdict.evaluated_at,
        topline_verdict: verdict.topline,
        reason_code: verdict.reason_code,

        // Domain metadata for UI grouping
        domain_meta: verdict.domain_verdicts.map(dv => ({
            domain_id: dv.domain,
            domain_name: dv.domain_name,
            status: dv.status,
        })),

        // Clause results with domain_id for grouping
        clauses: verdict.clause_results.map(c => {
            // Find domain for this clause
            const domain = verdict.domain_verdicts.find(dv =>
                dv.clauses.some(dc => dc.clause_id === c.clause_id)
            );

            return {
                clause_id: c.clause_id,
                requirement_id: c.requirement_id,
                status: c.status,
                reason_code: c.reason_code,
                domain_id: domain?.domain,
                evidence_refs: c.evidence.resolved.map(r => ({
                    pointer: r.pointer,
                    resolved: r.resolved,
                    content: r.event || r.snapshot || undefined,
                })),
                notes: c.notes,
            };
        }),
    };
}


// =============================================================================
// Domain-Selective Adjudication (v0.3 8-packs support)
// =============================================================================

// Import from SSOT - DO NOT duplicate this logic
import { detectApplicableClausesFromBundle } from './applicability';

/**
 * AdjudicatorFn-compatible wrapper.
 * This is what gets registered in the ruleset registry.
 * 
 * Automatically detects domain-specific packs and evaluates only
 * the applicable clause(s) based on run_id prefix.
 */
export async function adjudicatorFn(bundle: RunBundle): Promise<RulesetEvalResult> {
    // Detect applicable clauses based on run_id (uses SSOT)
    const clauseIds = detectApplicableClausesFromBundle(bundle);

    const verdict = adjudicateRuleset11(bundle, { clauseIds });
    return toRulesetEvalResult(verdict);
}
