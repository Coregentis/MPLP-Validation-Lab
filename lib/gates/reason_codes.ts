/**
 * Standardized Reason Codes
 * 
 * Single source of truth for all reason codes used by gates,
 * evaluators, and UI. Ensures consistency across the system.
 * 
 * IMPORTANT: All components must import from here.
 * Do NOT define reason code strings inline elsewhere.
 */

export const REASON_CODES = {
    // Bundle structure - B1 (verdict)
    BUNDLE_MISSING_B1: 'BUNDLE-MISSING-B1',
    BUNDLE_INVALID_B1: 'BUNDLE-INVALID-B1',

    // Bundle structure - B2 (bundle.manifest)
    BUNDLE_MISSING_B2: 'BUNDLE-MISSING-B2',
    BUNDLE_INVALID_B2: 'BUNDLE-INVALID-B2',

    // Bundle structure - B3 (integrity)
    BUNDLE_MISSING_B3: 'BUNDLE-MISSING-B3',
    BUNDLE_INVALID_B3: 'BUNDLE-INVALID-B3',

    // Bundle structure - B4 (evidence_pointers)
    BUNDLE_MISSING_B4: 'BUNDLE-MISSING-B4',
    BUNDLE_INVALID_B4: 'BUNDLE-INVALID-B4',

    // Pack
    PACK_MISSING: 'PACK-MISSING',
    PACK_PARTIAL: 'PACK-PARTIAL',

    // Pointer requirements
    BUNDLE_POINTER_MISSING: (rqId: string) => `BUNDLE-POINTER-MISSING-${rqId}`,

    // Reason code requirements (V02-G2)
    REASON_CODE_REQUIRED_MISSING: 'REASON-CODE-REQUIRED-MISSING',

    // Admission gates
    ADM_GATE_PIN_FAIL: 'ADM-GATE-PIN-FAIL',
    ADM_GATE_CONTRACT_FAIL: 'ADM-GATE-CONTRACT-FAIL',

    // Requirement failures (used by clauses)
    REQ_FAIL: (rqId: string) => `REQ-FAIL-${rqId}`,

    // Not evaluated
    EVAL_NOT_APPLICABLE: (rqId: string) => `EVAL-NOT-APPLICABLE-${rqId}`,
} as const;

// Type for static reason codes (excludes functions)
export type StaticReasonCode = Exclude<
    typeof REASON_CODES[keyof typeof REASON_CODES],
    (...args: unknown[]) => string
>;
