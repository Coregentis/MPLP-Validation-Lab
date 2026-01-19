/**
 * Reason Code Taxonomy - D2 Lifecycle Domain
 * 
 * Failure codes for Terminal Lifecycle State validation.
 * Covers CL-D2-01, CL-D2-02, CL-D2-03 (v0.4 expansion).
 */

export const D2_REASON_CODES = [
    // CL-D2-01: Terminal State Event (pointer/event presence)
    'D2_TERMINAL_EVENT_MISSING',
    'D2_TERMINAL_STATE_MISSING',

    // CL-D2-02: Terminal State Validity (v0.4 semantic invariant)
    'D2_TERMINAL_STATE_INVALID',
    'D2_TERMINAL_STATE_NOT_IN_ALLOWED_SET',

    // CL-D2-03: Post-Terminal No Execution (v0.4 semantic invariant)
    'D2_POST_TERMINAL_EXECUTION_DETECTED',
    'D2_TERMINAL_STATE_REVERSAL_DETECTED',
] as const;

export type D2ReasonCode = typeof D2_REASON_CODES[number];

/**
 * Check if a code is a D2 domain reason code.
 */
export function isD2ReasonCode(code: string): code is D2ReasonCode {
    return D2_REASON_CODES.includes(code as D2ReasonCode);
}
