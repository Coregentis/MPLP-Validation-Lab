/**
 * Reason Code Taxonomy - D1 Budget Domain
 * 
 * Failure codes for Budget Decision Record validation.
 * Covers CL-D1-01, CL-D1-02, CL-D1-03 (v0.4 expansion).
 */

export const D1_REASON_CODES = [
    // CL-D1-01: Budget Decision Record (pointer/event presence)
    'D1_DECISION_EVENT_MISSING',
    'D1_DECISION_OUTCOME_MISSING',

    // CL-D1-02: Outcome Locatable (v0.4 semantic invariant)
    'D1_OUTCOME_NOT_LOCATABLE',
    'D1_OUTCOME_INVALID',

    // CL-D1-03: Deny/Defer Gate Enforcement (v0.4 semantic invariant)
    'D1_BUDGET_DENY_WITHOUT_GATE',
    'D1_BUDGET_DEFER_WITHOUT_GATE',
    'D1_POST_DENY_EXECUTION_DETECTED',
] as const;

export type D1ReasonCode = typeof D1_REASON_CODES[number];

/**
 * Check if a code is a D1 domain reason code.
 */
export function isD1ReasonCode(code: string): code is D1ReasonCode {
    return D1_REASON_CODES.includes(code as D1ReasonCode);
}
