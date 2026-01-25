/**
 * Ruleset-1.1 Clauses
 * 
 * Four-domain clause implementations:
 * - CL-D1-01: Budget Decision Record
 * - CL-D2-01: Terminal Lifecycle State
 * - CL-D3-01: Authorization Decision
 * - CL-D4-01: Termination Decision
 * 
 * Pattern: pointer-first → resolve → minimal field check
 */

import type { RunBundle, Event } from '@/lib/bundles/types';
import { getPointersByRequirement, resolvePointer } from '@/lib/evidence/resolve';
import { inSynonymGroup, isTerminalState, normalizeToken } from '@/lib/evidence/synonyms';
import { REASON_CODES } from '@/lib/gates/reason_codes';
import type { ClauseResult, ClauseEvidence, ClauseDefinition } from './types';
import { CLAUSE_DEFINITIONS } from './types';

// =============================================================================
// Clause Evaluation Context
// =============================================================================

interface ClauseContext {
    bundle: RunBundle;
    definition: ClauseDefinition;
}

// =============================================================================
// Common Clause Evaluation Helpers
// =============================================================================

function createClauseResult(
    definition: ClauseDefinition,
    status: ClauseResult['status'],
    evidence: ClauseEvidence,
    notes: string[],
    reasonCode?: string
): ClauseResult {
    return {
        clause_id: definition.clause_id,
        requirement_id: definition.requirement_id,
        status,
        reason_code: reasonCode,
        evidence,
        notes,
    };
}

/**
 * Common pattern: Get pointers → resolve → return evidence structure
 */
function resolveEvidenceForRequirement(
    bundle: RunBundle,
    requirementId: string
): ClauseEvidence {
    const pointers = getPointersByRequirement(bundle, requirementId);
    const resolved = pointers.map(p => resolvePointer(bundle, p));

    const resolvedCount = resolved.filter(r => r.resolved !== 'none').length;
    const unresolvedCount = resolved.filter(r => r.resolved === 'none').length;

    return {
        pointers,
        resolved,
        resolved_count: resolvedCount,
        unresolved_count: unresolvedCount,
    };
}

// =============================================================================
// Event Field Checkers
// =============================================================================

/**
 * Check if event has a valid budget/resource decision outcome.
 */
function hasBudgetOutcome(event: Event): boolean {
    const outcome = event.outcome ?? event.decision_outcome ?? event.result;
    if (!outcome) return false;

    const normalized = normalizeToken(outcome);
    // Budget outcomes: allow, deny, throttle, suspend, resume
    return (
        inSynonymGroup('outcome_allow', normalized) ||
        inSynonymGroup('outcome_deny', normalized) ||
        ['throttle', 'throttled', 'suspend', 'suspended', 'resume', 'resumed'].includes(normalized)
    );
}

/**
 * Check if event is a budget/resource governance decision.
 */
function isBudgetDecision(event: Event): boolean {
    const eventType = normalizeToken(event.event_type);
    const decisionKind = event.decision_kind ?? event.kind ?? event.type;

    // Check event_type contains budget-related keywords
    if (eventType.includes('budget') || eventType.includes('quota') || eventType.includes('resource')) {
        return true;
    }

    // Check decision_kind
    if (decisionKind && inSynonymGroup('decision_kind_budget', decisionKind)) {
        return true;
    }

    return false;
}

/**
 * Check if event indicates terminal state.
 */
function hasTerminalState(event: Event): boolean {
    const toState = event.to_state ?? event.state ?? event.status;
    return toState ? isTerminalState(toState) : false;
}

/**
 * Check if event is authorization decision with outcome.
 */
function isAuthzDecision(event: Event): boolean {
    const eventType = normalizeToken(event.event_type);
    const decisionKind = event.decision_kind ?? event.kind ?? event.type;

    if (eventType.includes('authz') || eventType.includes('authorization') || eventType.includes('permission')) {
        return true;
    }

    if (decisionKind && inSynonymGroup('decision_kind_authz', decisionKind)) {
        return true;
    }

    return false;
}

function hasAuthzOutcome(event: Event): boolean {
    const outcome = event.outcome ?? event.decision_outcome ?? event.result;
    if (!outcome) return false;

    return inSynonymGroup('outcome_allow', outcome) || inSynonymGroup('outcome_deny', outcome);
}

/**
 * Check if event is termination decision.
 */
function isTerminationDecision(event: Event): boolean {
    const eventType = normalizeToken(event.event_type);
    const decisionKind = event.decision_kind ?? event.kind ?? event.type;

    if (eventType.includes('terminat') || eventType.includes('abort') || eventType.includes('stop')) {
        return true;
    }

    if (decisionKind && inSynonymGroup('decision_kind_terminate', decisionKind)) {
        return true;
    }

    return false;
}

// =============================================================================
// CL-D1-01: Budget Decision Record
// =============================================================================

export function evaluateCLD1_01(bundle: RunBundle): ClauseResult {
    const def = CLAUSE_DEFINITIONS.find(d => d.clause_id === 'CL-D1-01')!;
    const notes: string[] = [];

    // Step 1: Check for pointers
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers found for RQ-D1-01');
        return createClauseResult(
            def,
            'FAIL',
            evidence,
            notes,
            REASON_CODES.BUNDLE_POINTER_MISSING(def.requirement_id)
        );
    }

    // Step 2: Check resolved events
    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    // Step 3: Validate at least one event is budget decision with outcome
    let validBudgetDecision = false;
    for (const ref of evidence.resolved) {
        if (ref.resolved === 'event' && ref.event) {
            if (isBudgetDecision(ref.event) && hasBudgetOutcome(ref.event)) {
                validBudgetDecision = true;
                notes.push(`Valid budget decision found: ${ref.event.event_id}`);
                break;
            }
        }
    }

    if (!validBudgetDecision) {
        notes.push('No valid budget decision event with outcome found');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// CL-D2-01: Terminal Lifecycle State
// =============================================================================

export function evaluateCLD2_01(bundle: RunBundle): ClauseResult {
    const def = CLAUSE_DEFINITIONS.find(d => d.clause_id === 'CL-D2-01')!;
    const notes: string[] = [];

    // Step 1: Check for pointers
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers found for RQ-D2-01');
        return createClauseResult(
            def,
            'FAIL',
            evidence,
            notes,
            REASON_CODES.BUNDLE_POINTER_MISSING(def.requirement_id)
        );
    }

    // Step 2: Check resolved events
    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    // Step 3: Check for terminal state event
    let foundTerminalState = false;
    for (const ref of evidence.resolved) {
        if (ref.resolved === 'event' && ref.event) {
            if (hasTerminalState(ref.event)) {
                foundTerminalState = true;
                const state = ref.event.to_state ?? ref.event.state ?? ref.event.status;
                notes.push(`Terminal state found: ${state} in event ${ref.event.event_id}`);
                break;
            }
        }
        // Also check snapshots (future)
        if (ref.resolved === 'snapshot' && ref.snapshot) {
            const state = ref.snapshot.data?.state ?? ref.snapshot.data?.status;
            if (state && isTerminalState(state)) {
                foundTerminalState = true;
                notes.push(`Terminal state found in snapshot: ${state}`);
                break;
            }
        }
    }

    if (!foundTerminalState) {
        notes.push('No terminal state evidence found');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// CL-D3-01: Authorization Decision
// =============================================================================

export function evaluateCLD3_01(bundle: RunBundle): ClauseResult {
    const def = CLAUSE_DEFINITIONS.find(d => d.clause_id === 'CL-D3-01')!;
    const notes: string[] = [];

    // Step 1: Check for pointers
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers found for RQ-D3-01');
        return createClauseResult(
            def,
            'FAIL',
            evidence,
            notes,
            REASON_CODES.BUNDLE_POINTER_MISSING(def.requirement_id)
        );
    }

    // Step 2: Check resolved events
    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    // Step 3: Validate at least one authz decision with outcome
    let validAuthzDecision = false;
    for (const ref of evidence.resolved) {
        if (ref.resolved === 'event' && ref.event) {
            if (isAuthzDecision(ref.event) && hasAuthzOutcome(ref.event)) {
                validAuthzDecision = true;
                const outcome = ref.event.outcome ?? ref.event.decision_outcome ?? ref.event.result;
                notes.push(`Authorization decision found: ${outcome} in event ${ref.event.event_id}`);
                break;
            }
        }
    }

    if (!validAuthzDecision) {
        notes.push('No valid authorization decision event with outcome found');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// CL-D4-01: Termination Decision
// =============================================================================

export function evaluateCLD4_01(bundle: RunBundle): ClauseResult {
    const def = CLAUSE_DEFINITIONS.find(d => d.clause_id === 'CL-D4-01')!;
    const notes: string[] = [];

    // Step 1: Check for pointers
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers found for RQ-D4-01');
        return createClauseResult(
            def,
            'FAIL',
            evidence,
            notes,
            REASON_CODES.BUNDLE_POINTER_MISSING(def.requirement_id)
        );
    }

    // Step 2: Check resolved events
    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    // Step 3: Validate termination decision event exists
    let validTerminationDecision = false;
    for (const ref of evidence.resolved) {
        if (ref.resolved === 'event' && ref.event) {
            if (isTerminationDecision(ref.event)) {
                validTerminationDecision = true;
                notes.push(`Termination decision found: ${ref.event.event_id}`);
                break;
            }
        }
    }

    if (!validTerminationDecision) {
        notes.push('No termination decision event found');
        return createClauseResult(def, 'FAIL', evidence, notes, REASON_CODES.REQ_FAIL(def.requirement_id));
    }

    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// Clause Evaluator Registry
// =============================================================================

export type ClauseEvaluator = (bundle: RunBundle) => ClauseResult;

export const CLAUSE_EVALUATORS: Record<string, ClauseEvaluator> = {
    'CL-D1-01': evaluateCLD1_01,
    'CL-D2-01': evaluateCLD2_01,
    'CL-D3-01': evaluateCLD3_01,
    'CL-D4-01': evaluateCLD4_01,
};

/**
 * Evaluate a single clause by ID.
 */
export function evaluateClause(bundle: RunBundle, clauseId: string): ClauseResult | null {
    const evaluator = CLAUSE_EVALUATORS[clauseId];
    if (!evaluator) return null;
    return evaluator(bundle);
}
