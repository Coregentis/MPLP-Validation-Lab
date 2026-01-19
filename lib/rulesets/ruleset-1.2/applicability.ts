/**
 * Ruleset-1.2 Applicability
 * 
 * Determines which packs are applicable for ruleset-1.2 evaluation.
 * Same rules as ruleset-1.1: arb-d* prefixed packs.
 */

/**
 * Check if run_id indicates an arbitration pack (v0.3/v0.4 four-domain).
 */
export function isArbitrationPack(runId: string): boolean {
    return runId.startsWith('arb-');
}
