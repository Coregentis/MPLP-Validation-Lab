/**
 * Reason Code Taxonomy - Common Codes
 * 
 * Stable, system-wide reason codes that are not domain-specific.
 * These are used by bundle loading, admission gates, and registry.
 */

export const COMMON_REASON_CODES = [
    // Verdict/Evaluation
    'VERDICT_MISSING',
    'ADMISSION_FAILED',
    'RULESET_NOT_FOUND',
    'ADJUDICATOR_MISSING',
    'GOLDENFLOW_EVAL_FAILED',

    // Bundle Structure - B1 (verdict)
    'BUNDLE-MISSING-B1',
    'BUNDLE-INVALID-B1',

    // Bundle Structure - B2 (bundle.manifest)
    'BUNDLE-MISSING-B2',
    'BUNDLE-INVALID-B2',

    // Bundle Structure - B3 (integrity)
    'BUNDLE-MISSING-B3',
    'BUNDLE-INVALID-B3',

    // Bundle Structure - B4 (evidence_pointers)
    'BUNDLE-MISSING-B4',
    'BUNDLE-INVALID-B4',

    // Pack Structure
    'PACK-MISSING',
    'PACK-PARTIAL',

    // Admission Gates
    'ADM-GATE-PIN-FAIL',
    'ADM-GATE-CONTRACT-FAIL',

    // Reason Code Governance
    'REASON-CODE-REQUIRED-MISSING',
] as const;

export type CommonReasonCode = typeof COMMON_REASON_CODES[number];

/**
 * Check if a code is a known common reason code.
 */
export function isCommonReasonCode(code: string): code is CommonReasonCode {
    return COMMON_REASON_CODES.includes(code as CommonReasonCode);
}
