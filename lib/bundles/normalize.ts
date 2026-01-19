/**
 * Verdict Normalization
 * 
 * Maps legacy disk verdict format to NormalizedVerdict.
 * This is the ONLY place legacy format parsing happens.
 * All downstream code sees NormalizedVerdict only.
 * 
 * IMPORTANT: This file ONLY contains pure functions.
 * No I/O, no file reading, no ndjson parsing.
 */

import type {
    NormalizedVerdict,
    GoldenFlowVerdict,
    DomainVerdict,
} from './types';

// =============================================================================
// Legacy Format (internal parsing only)
// =============================================================================

/** @internal - Only used for parsing legacy verdict.json */
interface LegacyVerdictDisk {
    run_id?: string;
    scenario_id?: string;
    admission?: string;
    gf_verdicts?: Array<{
        gf_id: string;
        status: string;
        coverage?: { total: number; passed: number; failed: number; not_evaluated: number };
        pointers?: Array<{ artifact_path: string; locator: string; requirement_id: string; content_hash?: string }>;
    }>;
    versions?: { protocol?: string; schema?: string; ruleset?: string };
    evaluated_at?: string;
    topline?: string;
    domain_verdicts?: DomainVerdict[];
    reason_code?: string | null;
}

// =============================================================================
// Normalization Helpers
// =============================================================================

function normalizeAdmission(s?: string): 'ADMISSIBLE' | 'NOT_ADMISSIBLE' | 'UNKNOWN' {
    const upper = String(s ?? '').toUpperCase();
    if (upper === 'ADMISSIBLE') return 'ADMISSIBLE';
    if (upper === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    return 'UNKNOWN';
}

function normalizeStatus(s: string): 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE' {
    const upper = String(s ?? '').toUpperCase();
    if (upper === 'PASS') return 'PASS';
    if (upper === 'FAIL') return 'FAIL';
    if (upper === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    return 'NOT_EVALUATED';
}

/**
 * Derive topline from normalized verdicts.
 * IMPORTANT: This uses NORMALIZED gf_verdicts, not raw, to avoid case/enum drift.
 */
function deriveTopline(
    admission: NormalizedVerdict['admission'],
    gfVerdicts: GoldenFlowVerdict[],
    rawTopline?: string
): string {
    // If topline exists in raw (ABMC format), use it directly
    if (rawTopline) return rawTopline;

    // Derive from admission
    if (admission === 'NOT_ADMISSIBLE') return 'NOT_ADMISSIBLE';
    if (admission === 'UNKNOWN') return 'UNKNOWN';

    // Derive from normalized gf_verdicts
    if (gfVerdicts.length === 0) return 'UNKNOWN';
    if (gfVerdicts.some(g => g.status === 'FAIL')) return 'FAIL';
    if (gfVerdicts.every(g => g.status === 'PASS')) return 'PASS';
    return 'PARTIAL';
}

// =============================================================================
// Main Mapping Function
// =============================================================================

/**
 * Map any disk verdict (legacy or ABMC) to NormalizedVerdict.
 * This is the single normalization entry point.
 * 
 * @param raw - Raw parsed JSON from verdict.json
 * @param runId - Fallback run_id from directory name
 * @returns Normalized verdict structure
 */
export function mapToNormalizedVerdict(
    raw: Record<string, unknown>,
    runId: string
): NormalizedVerdict {
    const legacyRaw = raw as LegacyVerdictDisk;

    // Normalize admission first
    const admission = normalizeAdmission(legacyRaw.admission);

    // Normalize GF verdicts
    const gfVerdicts: GoldenFlowVerdict[] = (legacyRaw.gf_verdicts || []).map(gf => ({
        gf_id: gf.gf_id,
        status: normalizeStatus(gf.status),
        coverage: gf.coverage || { total: 0, passed: 0, failed: 0, not_evaluated: 0 },
        pointers: gf.pointers || [],
    }));

    // Derive topline AFTER normalization
    const topline = deriveTopline(admission, gfVerdicts, legacyRaw.topline);

    return {
        run_id: legacyRaw.run_id || runId,
        scenario_id: legacyRaw.scenario_id || 'unknown',
        admission,
        gf_verdicts: gfVerdicts,
        domain_verdicts: legacyRaw.domain_verdicts || [],
        topline,
        versions: {
            protocol: legacyRaw.versions?.protocol || 'unknown',
            schema: legacyRaw.versions?.schema || 'unknown',
            ruleset: legacyRaw.versions?.ruleset || 'unknown',
        },
        evaluated_at: legacyRaw.evaluated_at || new Date().toISOString(),
        reason_code: legacyRaw.reason_code ?? null,
    };
}
