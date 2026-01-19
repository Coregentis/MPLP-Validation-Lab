/**
 * Reason Code Taxonomy - D4 Termination Domain
 * 
 * Failure codes for Termination & Recovery validation.
 * Covers CL-D4-01, CL-D4-02, CL-D4-03 (v0.4 expansion).
 */

export const D4_REASON_CODES = [
    // CL-D4-01: Termination Decision Event (pointer/event presence)
    'D4_TERMINATION_EVENT_MISSING',
    'D4_TERMINATION_DECISION_MISSING',

    // CL-D4-02: Termination Reason Category (v0.4 semantic invariant)
    'D4_TERMINATION_REASON_MISSING',
    'D4_TERMINATION_REASON_INVALID',
    'D4_TERMINATION_REASON_NOT_IN_ALLOWED_SET',

    // CL-D4-03: Post-Termination Controlled Recovery (v0.4 semantic invariant)
    'D4_POST_TERMINATION_EXECUTION_DETECTED',
    'D4_RECOVERY_PATH_INVALID',
    'D4_UNCONTROLLED_CONTINUATION_DETECTED',
] as const;

export type D4ReasonCode = typeof D4_REASON_CODES[number];

/**
 * Check if a code is a D4 domain reason code.
 */
export function isD4ReasonCode(code: string): code is D4ReasonCode {
    return D4_REASON_CODES.includes(code as D4ReasonCode);
}
