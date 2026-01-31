/**
 * Ruleset-1.1 Applicability
 * 
 * SSOT for domain-specific clause applicability.
 * Determines which clauses to evaluate based on run characteristics.
 * 
 * Used by:
 * - adjudicatorFn (registry entry point)
 * - RulesetEvaluationSection (UI)
 * 
 * DO NOT duplicate this logic elsewhere.
 */

import type { RunBundle } from '@/lib/bundles/types';
import { CLAUSE_DEFINITIONS } from './types';

// =============================================================================
// Run ID Prefix → Clause Mapping
// =============================================================================

/**
 * Detect applicable clauses based on run_id prefix.
 * 
 * v0.3 arbitration packs use domain-specific prefixes:
 * - arb-d1-* → only evaluate CL-D1-01
 * - arb-d2-* → only evaluate CL-D2-01
 * - arb-d3-* → only evaluate CL-D3-01
 * - arb-d4-* → only evaluate CL-D4-01
 * 
 * For runs without domain prefix, returns undefined (evaluate all).
 * 
 * @param runId - The run identifier
 * @returns Array of clause IDs to evaluate, or undefined for all
 */
export function detectApplicableClauses(runId: string): string[] | undefined {
    const prefix = runId.toLowerCase();

    // v0.3 arbitration packs (domain-specific)
    if (prefix.startsWith('arb-d1-')) {
        return ['CL-D1-01'];
    }
    if (prefix.startsWith('arb-d2-')) {
        return ['CL-D2-01'];
    }
    if (prefix.startsWith('arb-d3-')) {
        return ['CL-D3-01'];
    }
    if (prefix.startsWith('arb-d4-')) {
        return ['CL-D4-01'];
    }

    // Default: evaluate all clauses
    return undefined;
}

/**
 * Get all clause IDs that will be evaluated for a given run.
 * Resolves undefined to full clause list.
 */
export function getEffectiveClauseIds(runId: string): string[] {
    const detected = detectApplicableClauses(runId);
    return detected ?? CLAUSE_DEFINITIONS.map(d => d.clause_id);
}

/**
 * Check if a run is a v0.3 arbitration pack or v0.15 benchmark run.
 */
export function isArbitrationPack(runId: string): boolean {
    const id = runId.toLowerCase();
    return id.startsWith('arb-') || id.includes('-d1-budget-');
}

/**
 * Detect applicable clauses from bundle (uses run_id).
 * Convenience wrapper for bundle-first call sites.
 */
export function detectApplicableClausesFromBundle(bundle: RunBundle): string[] | undefined {
    return detectApplicableClauses(bundle.run_id);
}
