/**
 * Synonym Table for Evidence Field Normalization
 * 
 * Provides unified token normalization and synonym group matching
 * for four-domain clause evaluation.
 */

// =============================================================================
// Synonym Group IDs
// =============================================================================

export type SynonymGroupId =
    | 'decision_kind_budget'
    | 'decision_kind_authz'
    | 'decision_kind_terminate'
    | 'terminal_state_success'
    | 'terminal_state_failure'
    | 'terminal_state_cancelled'
    | 'outcome_allow'
    | 'outcome_deny'
    | 'outcome_terminated';

// =============================================================================
// Token Normalization
// =============================================================================

/**
 * Normalize any value to a comparable token string.
 * Handles: trim, lowercase, replace separators with underscore.
 */
export function normalizeToken(input: unknown): string {
    return String(input ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '_');
}

// =============================================================================
// Synonym Definitions
// =============================================================================

export const SYNONYMS: Record<SynonymGroupId, Set<string>> = {
    // D1: Budget decision kinds
    decision_kind_budget: new Set([
        'budget', 'cost', 'quota', 'token_budget', 'rate_limit',
        'resource_budget', 'throttle', 'suspend', 'resume'
    ]),

    // D3: Authorization decision kinds
    decision_kind_authz: new Set([
        'authz', 'authorize', 'authorization', 'permission',
        'access_control', 'access'
    ]),

    // D4: Termination decision kinds
    decision_kind_terminate: new Set([
        'terminate', 'termination', 'abort', 'stop', 'cancel', 'kill'
    ]),

    // D2: Terminal states - success
    terminal_state_success: new Set([
        'success', 'succeeded', 'done', 'completed', 'finished'
    ]),

    // D2: Terminal states - failure
    terminal_state_failure: new Set([
        'fail', 'failed', 'error', 'failure'
    ]),

    // D2: Terminal states - cancelled
    terminal_state_cancelled: new Set([
        'cancelled', 'canceled', 'aborted'
    ]),

    // Decision outcomes - allow
    outcome_allow: new Set([
        'allow', 'allowed', 'grant', 'granted', 'permit', 'permitted', 'approve', 'approved'
    ]),

    // Decision outcomes - deny
    outcome_deny: new Set([
        'deny', 'denied', 'reject', 'rejected', 'refuse', 'refused', 'block', 'blocked'
    ]),

    // Decision outcomes - terminated
    outcome_terminated: new Set([
        'terminated', 'stopped', 'aborted', 'killed', 'cancelled', 'canceled'
    ]),
};

// =============================================================================
// Synonym Matching
// =============================================================================

/**
 * Check if a value matches any token in a synonym group.
 */
export function inSynonymGroup(group: SynonymGroupId, value: unknown): boolean {
    const normalized = normalizeToken(value);
    return SYNONYMS[group].has(normalized);
}

/**
 * Check if a value matches any of the provided synonym groups.
 */
export function inAnySynonymGroup(groups: SynonymGroupId[], value: unknown): boolean {
    const normalized = normalizeToken(value);
    return groups.some(group => SYNONYMS[group].has(normalized));
}

/**
 * Check if value is a terminal state (success, failure, or cancelled).
 */
export function isTerminalState(value: unknown): boolean {
    return inAnySynonymGroup([
        'terminal_state_success',
        'terminal_state_failure',
        'terminal_state_cancelled'
    ], value);
}
