/**
 * Semantic Field Extractor
 * 
 * Domain-aware extraction of semantic fields from events.
 * This is the ONLY place where domain-specific field extraction logic lives.
 * Clauses MUST use this extractor; they MUST NOT parse events directly.
 * 
 * v0.4: Provides stable field set for semantic invariant evaluation.
 */

import type { Event } from '@/lib/bundles/types';
import { normalizeToken, inSynonymGroup, isTerminalState } from './synonyms';

// =============================================================================
// Extracted Semantic Fields (Stable Contract)
// =============================================================================

/**
 * Semantic fields extracted from an event.
 * This is the ONLY interface clauses should depend on for evidence content.
 * All fields are optional; clauses check presence as part of evaluation.
 */
export interface SemanticFields {
    // === Common Fields ===
    /** Normalized event_type */
    event_type: string;
    /** Timestamp from event */
    timestamp: string;

    // === D1: Budget Decision ===
    /** Decision kind (budget, authz, terminate, etc.) */
    decision_kind?: string;
    /** Decision outcome (allow, deny, throttle, etc.) */
    outcome?: string;
    /** Budget scope identifier (optional) */
    budget_scope?: string;

    // === D2: Lifecycle State ===
    /** Target state after transition */
    to_state?: string;
    /** Whether to_state is a terminal state */
    is_terminal?: boolean;

    // === D3: Authorization ===
    /** Subject (actor/principal) */
    subject?: string;
    /** Resource being accessed */
    resource?: string;
    /** Action being performed */
    action?: string;

    // === D4: Termination ===
    /** Reason category for termination */
    termination_reason?: string;
    /** Whether a recovery guard is present */
    has_recovery_guard?: boolean;

    // === Extraction Metadata ===
    /** Which domain this event primarily relates to (if determinable) */
    primary_domain?: 'D1' | 'D2' | 'D3' | 'D4';
    /** Fields that were found but couldn't be normalized */
    extraction_notes?: string[];
}

// =============================================================================
// Field Extraction Logic
// =============================================================================

/**
 * Extract semantic fields from an event.
 * Uses synonym-based normalization for robustness.
 */
export function extractSemanticFields(event: Event): SemanticFields {
    const notes: string[] = [];
    const fields: SemanticFields = {
        event_type: normalizeToken(event.event_type),
        timestamp: event.timestamp,
    };

    // --- Extract decision_kind ---
    const rawKind = event.decision_kind ?? event.kind ?? event.type;
    if (rawKind) {
        fields.decision_kind = normalizeToken(rawKind);
    }

    // --- Extract outcome ---
    const rawOutcome = event.outcome ?? event.decision_outcome ?? event.result;
    if (rawOutcome) {
        fields.outcome = normalizeToken(rawOutcome);
    }

    // --- Extract budget_scope ---
    const rawScope = event.budget_scope ?? event.scope ?? event.quota_id;
    if (rawScope) {
        fields.budget_scope = String(rawScope);
    }

    // --- Extract to_state ---
    const rawToState = event.to_state ?? event.state ?? event.status;
    if (rawToState) {
        fields.to_state = normalizeToken(rawToState);
        fields.is_terminal = isTerminalState(rawToState);
    }

    // --- Extract S/R/A triple for authz ---
    const rawSubject = event.subject ?? event.actor ?? event.principal ?? event.user;
    if (rawSubject) {
        fields.subject = String(rawSubject);
    }

    const rawResource = event.resource ?? event.target ?? event.object;
    if (rawResource) {
        fields.resource = String(rawResource);
    }

    const rawAction = event.action ?? event.operation ?? event.method;
    if (rawAction) {
        fields.action = String(rawAction);
    }

    // --- Extract termination_reason ---
    const rawTermReason = event.termination_reason ?? event.reason ?? event.cause;
    if (rawTermReason) {
        fields.termination_reason = normalizeToken(rawTermReason);
    }

    // --- Extract recovery guard indicator ---
    const rawRecovery = event.recovery_guard ?? event.recovery_path ?? event.controlled_recovery;
    if (rawRecovery !== undefined) {
        fields.has_recovery_guard = Boolean(rawRecovery);
    }

    // --- Determine primary domain ---
    fields.primary_domain = inferPrimaryDomain(fields);

    // Add any notes
    if (notes.length > 0) {
        fields.extraction_notes = notes;
    }

    return fields;
}

/**
 * Infer the primary domain from extracted fields.
 */
function inferPrimaryDomain(fields: SemanticFields): 'D1' | 'D2' | 'D3' | 'D4' | undefined {
    const kind = fields.decision_kind ?? '';
    const eventType = fields.event_type;

    // D1: Budget-related
    if (
        inSynonymGroup('decision_kind_budget', kind) ||
        eventType.includes('budget') ||
        eventType.includes('quota') ||
        eventType.includes('throttle')
    ) {
        return 'D1';
    }

    // D3: Authz-related (check before D4 since terminate might have authz)
    if (
        inSynonymGroup('decision_kind_authz', kind) ||
        eventType.includes('authz') ||
        eventType.includes('authorization') ||
        eventType.includes('permission')
    ) {
        return 'D3';
    }

    // D4: Termination-related
    if (
        inSynonymGroup('decision_kind_terminate', kind) ||
        eventType.includes('terminat') ||
        eventType.includes('abort') ||
        eventType.includes('stop')
    ) {
        return 'D4';
    }

    // D2: Lifecycle state transition (if terminal state present)
    if (fields.is_terminal) {
        return 'D2';
    }

    // Cannot determine
    return undefined;
}

// =============================================================================
// Validation Helpers (for clauses)
// =============================================================================

/**
 * Check if outcome is in allowed set for budget decisions.
 */
export function isValidBudgetOutcome(outcome: string | undefined): boolean {
    if (!outcome) return false;
    return (
        inSynonymGroup('outcome_allow', outcome) ||
        inSynonymGroup('outcome_deny', outcome) ||
        ['throttle', 'throttled', 'suspend', 'suspended', 'resume', 'resumed'].includes(outcome)
    );
}

/**
 * Check if outcome is in allowed set for authz decisions.
 */
export function isValidAuthzOutcome(outcome: string | undefined): boolean {
    if (!outcome) return false;
    return inSynonymGroup('outcome_allow', outcome) || inSynonymGroup('outcome_deny', outcome);
}

/**
 * Check if S/R/A triple is complete.
 */
export function hasCompleteSRA(fields: SemanticFields): boolean {
    return Boolean(fields.subject && fields.resource && fields.action);
}

/**
 * Allowed termination reason categories.
 */
const ALLOWED_TERMINATION_REASONS = new Set([
    'ttl', 'timeout', 'loop', 'loop_detected', 'manual', 'user_cancel',
    'error', 'failure', 'resource_exhausted', 'policy_violation', 'external'
]);

/**
 * Check if termination reason is in allowed set.
 */
export function isValidTerminationReason(reason: string | undefined): boolean {
    if (!reason) return false;
    return ALLOWED_TERMINATION_REASONS.has(reason);
}

/**
 * Terminal state allowed set.
 */
const ALLOWED_TERMINAL_STATES = new Set([
    'success', 'succeeded', 'done', 'completed', 'finished',
    'fail', 'failed', 'error', 'failure',
    'cancelled', 'canceled', 'aborted', 'terminated'
]);

/**
 * Check if terminal state is in allowed set.
 */
export function isValidTerminalState(state: string | undefined): boolean {
    if (!state) return false;
    return ALLOWED_TERMINAL_STATES.has(state);
}
