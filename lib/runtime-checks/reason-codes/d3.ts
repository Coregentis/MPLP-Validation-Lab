/**
 * Reason Code Taxonomy - D3 Authz Domain
 * 
 * Failure codes for Authorization Decision validation.
 * Covers CL-D3-01, CL-D3-02, CL-D3-03 (v0.4 expansion).
 */

export const D3_REASON_CODES = [
    // CL-D3-01: Authorization Decision Event (pointer/event presence)
    'D3_DECISION_EVENT_MISSING',
    'D3_DECISION_OUTCOME_MISSING',

    // CL-D3-02: Subject/Resource/Action Triple (v0.4 semantic invariant)
    'D3_SUBJECT_MISSING',
    'D3_RESOURCE_MISSING',
    'D3_ACTION_MISSING',
    'D3_SUBJECT_RESOURCE_ACTION_INCOMPLETE',

    // CL-D3-03: Deny Confirm Gate (v0.4 semantic invariant)
    'D3_DENY_WITHOUT_CONFIRM_GATE',
    'D3_SILENT_ALLOW_DETECTED',
] as const;

export type D3ReasonCode = typeof D3_REASON_CODES[number];

/**
 * Check if a code is a D3 domain reason code.
 */
export function isD3ReasonCode(code: string): code is D3ReasonCode {
    return D3_REASON_CODES.includes(code as D3ReasonCode);
}
