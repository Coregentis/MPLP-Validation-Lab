/**
 * Ruleset-1.0 Adjudicator
 * 
 * Wraps the existing GoldenFlow evaluation logic into the registry's
 * RulesetEvalResult format to complete the unified adjudication contract.
 * 
 * This is a minimal adapter layer - it reuses all existing GF evaluation
 * logic without modification.
 */

import type { RunBundle } from '@/lib/bundles/types';
import type { RulesetEvalResult, ClauseResult } from '@/lib/rulesets/registry';

// =============================================================================
// Adjudicator Implementation
// =============================================================================

/**
 * Adjudicate a run using ruleset-1.0 (GoldenFlow-based evaluation).
 * 
 * For v0.2 packs, this uses the pre-computed verdict.json gf_verdicts
 * at load time (already normalized into RunBundle.verdict).
 */
export async function adjudicatorFn(bundle: RunBundle): Promise<RulesetEvalResult> {
    const verdict = bundle.verdict;

    // If no verdict, return NOT_EVALUATED
    if (!verdict) {
        return {
            ruleset_id: 'ruleset-1.0',
            run_id: bundle.run_id,
            evaluated_at: new Date().toISOString(),
            topline_verdict: 'NOT_EVALUATED',
            reason_code: 'VERDICT_MISSING',
            clauses: [],
        };
    }

    // Convert gf_verdicts to clauses
    const clauses: ClauseResult[] = [];

    for (const gfv of verdict.gf_verdicts || []) {
        // Map each GF to a clause (e.g., GF-01 → CL-GF-01)
        const clauseId = `CL-${gfv.gf_id.toUpperCase()}`;

        // Determine clause status from GF verdict
        let clauseStatus: ClauseResult['status'] = 'PASS';
        let reasonCode: string | undefined;
        const notes: string[] = [];

        if (gfv.status === 'FAIL') {
            clauseStatus = 'FAIL';
            reasonCode = `GF-${gfv.gf_id.toUpperCase()}-FAILED`;
        } else if (gfv.status === 'NOT_EVALUATED') {
            clauseStatus = 'NOT_EVALUATED';
            reasonCode = `GF-${gfv.gf_id.toUpperCase()}-NOT-EVALUATED`;
        } else if (gfv.status === 'NOT_ADMISSIBLE') {
            clauseStatus = 'NOT_ADMISSIBLE';
            reasonCode = `GF-${gfv.gf_id.toUpperCase()}-NOT-ADMISSIBLE`;
        }

        // Add coverage to notes (uses coverage field from GoldenFlowVerdict)
        if (gfv.coverage) {
            notes.push(`Requirements: ${gfv.coverage.passed} PASS, ${gfv.coverage.failed} FAIL of ${gfv.coverage.total} total`);
        }

        clauses.push({
            clause_id: clauseId,
            requirement_id: gfv.gf_id,
            status: clauseStatus,
            reason_code: reasonCode,
            notes,
            // Map GF pointers to evidence_refs
            evidence_refs: (gfv.pointers || []).map(p => ({
                pointer: p,
                resolved: 'none' as const,
            })),
        });
    }

    // Determine topline from verdict
    let toplineVerdict: RulesetEvalResult['topline_verdict'] = 'NOT_EVALUATED';
    let toplineReasonCode: string | null = null;

    if (verdict.topline === 'PASS') {
        toplineVerdict = 'PASS';
    } else if (verdict.topline === 'FAIL') {
        toplineVerdict = 'FAIL';
        // Find first failing clause's reason
        const firstFail = clauses.find(c => c.status === 'FAIL');
        toplineReasonCode = firstFail?.reason_code || 'GOLDENFLOW_EVAL_FAILED';
    } else if (verdict.topline === 'NOT_ADMISSIBLE') {
        toplineVerdict = 'NOT_ADMISSIBLE';
        toplineReasonCode = verdict.reason_code || 'ADMISSION_FAILED';
    }

    // Handle admission status (takes precedence)
    if (verdict.admission === 'NOT_ADMISSIBLE') {
        toplineVerdict = 'NOT_ADMISSIBLE';
        toplineReasonCode = verdict.reason_code || 'ADMISSION_FAILED';
    }

    return {
        ruleset_id: 'ruleset-1.0',
        run_id: bundle.run_id,
        evaluated_at: verdict.evaluated_at || new Date().toISOString(),
        topline_verdict: toplineVerdict,
        reason_code: toplineReasonCode,
        clauses,
        // No domain_meta for ruleset-1.0 (GF-based, not domain-based)
    };
}
