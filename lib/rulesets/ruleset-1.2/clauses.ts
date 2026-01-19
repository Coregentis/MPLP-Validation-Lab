/**
 * Ruleset-1.2 Clauses
 * 
 * v0.4 Semantic Invariant Implementations:
 * - 12 clauses (3 per domain)
 * - Uses SemanticFields from extract.ts (MUST NOT parse events directly)
 * - All reason_codes from PR1 taxonomy
 * 
 * Pattern per domain:
 *   01: Existence - pointer/event present
 *   02: Field Semantics - extracted fields valid
 *   03: Gate/Post-action Invariant - cross-event verification
 */

import type { RunBundle, Event } from '@/lib/bundles/types';
import { getPointersByRequirement, resolvePointer } from '@/lib/evidence/resolve';
import {
    extractSemanticFields,
    isValidBudgetOutcome,
    isValidAuthzOutcome,
    hasCompleteSRA,
    isValidTerminationReason,
    isValidTerminalState,
    type SemanticFields,
} from '@/lib/evidence/extract';
import { inSynonymGroup, isTerminalState, normalizeToken } from '@/lib/evidence/synonyms';
import type { ClauseResult, ClauseEvidence, ClauseDefinition } from './types';
import { CLAUSE_DEFINITIONS, getClauseById } from './types';

// =============================================================================
// Common Helpers
// =============================================================================

function createEmptyEvidence(): ClauseEvidence {
    return {
        pointers: [],
        resolved: [],
        resolved_count: 0,
        unresolved_count: 0,
    };
}

function createClauseResult(
    def: ClauseDefinition,
    status: ClauseResult['status'],
    evidence: ClauseEvidence,
    notes: string[],
    reasonCode?: string
): ClauseResult {
    return {
        clause_id: def.clause_id,
        requirement_id: def.requirement_id,
        status,
        reason_code: reasonCode,
        evidence,
        notes,
    };
}

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

function getFirstSemanticFields(evidence: ClauseEvidence): SemanticFields | null {
    for (const ref of evidence.resolved) {
        if (ref.content) {
            return ref.content;
        }
    }
    return null;
}

function getAllEvents(bundle: RunBundle): Event[] {
    return bundle.pack?.trace?.events ?? [];
}

// =============================================================================
// D1: Budget Decision Record
// =============================================================================

/** CL-D1-01: Budget decision evidence exists */
export function evaluateCLD1_01(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D1-01')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers for RQ-D1-01');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D1_DECISION_EVENT_MISSING');
    }

    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D1_DECISION_EVENT_MISSING');
    }

    notes.push(`Resolved ${evidence.resolved_count} evidence item(s)`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D1-02: Budget outcome is valid and locatable */
export function evaluateCLD1_02(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D1-02')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D1-01'); // Uses same evidence

    if (evidence.resolved_count === 0) {
        notes.push('No resolved evidence to check outcome');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D1_DECISION_EVENT_MISSING');
    }

    const fields = getFirstSemanticFields(evidence);
    if (!fields) {
        notes.push('Cannot extract semantic fields');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D1_OUTCOME_NOT_LOCATABLE');
    }

    if (!fields.outcome) {
        notes.push('No outcome field in evidence');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D1_DECISION_OUTCOME_MISSING');
    }

    if (!isValidBudgetOutcome(fields.outcome)) {
        notes.push(`Invalid budget outcome: ${fields.outcome}`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D1_OUTCOME_INVALID');
    }

    notes.push(`Valid budget outcome: ${fields.outcome}`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D1-03: Deny/throttle triggers gate enforcement */
export function evaluateCLD1_03(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D1-03')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D1-01');

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.outcome) {
        notes.push('No outcome to check for gate enforcement');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D1_DECISION_OUTCOME_MISSING');
    }

    // If outcome is allow, this clause is N/A (PASS)
    if (inSynonymGroup('outcome_allow', fields.outcome)) {
        notes.push('Outcome is allow - gate enforcement N/A');
        return createClauseResult(def, 'PASS', evidence, notes);
    }

    // For deny/throttle, check for gate evidence in trace
    const events = getAllEvents(bundle);
    const hasGateEvent = events.some(e => {
        const et = normalizeToken(e.event_type);
        return et.includes('gate') || et.includes('block') || et.includes('stop');
    });

    if (!hasGateEvent) {
        notes.push(`Deny/throttle (${fields.outcome}) but no gate enforcement evidence`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D1_BUDGET_DENY_WITHOUT_GATE');
    }

    notes.push('Gate enforcement evidence found');
    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// D2: Terminal Lifecycle State
// =============================================================================

/** CL-D2-01: Terminal state evidence exists */
export function evaluateCLD2_01(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D2-01')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers for RQ-D2-01');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D2_TERMINAL_EVENT_MISSING');
    }

    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D2_TERMINAL_EVENT_MISSING');
    }

    notes.push(`Resolved ${evidence.resolved_count} evidence item(s)`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D2-02: Terminal state is in allowed set */
export function evaluateCLD2_02(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D2-02')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D2-01');

    if (evidence.resolved_count === 0) {
        notes.push('No resolved evidence to check terminal state');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D2_TERMINAL_EVENT_MISSING');
    }

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.to_state) {
        notes.push('No to_state field in evidence');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D2_TERMINAL_STATE_MISSING');
    }

    if (!isValidTerminalState(fields.to_state)) {
        notes.push(`Terminal state not in allowed set: ${fields.to_state}`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D2_TERMINAL_STATE_NOT_IN_ALLOWED_SET');
    }

    notes.push(`Valid terminal state: ${fields.to_state}`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D2-03: No execution events after terminal state */
export function evaluateCLD2_03(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D2-03')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D2-01');

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.is_terminal) {
        notes.push('Cannot determine terminal state timestamp');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D2_TERMINAL_EVENT_MISSING');
    }

    const terminalTimestamp = fields.timestamp;
    const events = getAllEvents(bundle);

    // Find execution events after terminal
    const postTerminalExecutions = events.filter(e => {
        if (e.timestamp <= terminalTimestamp) return false;
        const et = normalizeToken(e.event_type);
        return et.includes('exec') || et.includes('dispatch') || et.includes('invoke') || et.includes('run');
    });

    if (postTerminalExecutions.length > 0) {
        notes.push(`Found ${postTerminalExecutions.length} execution event(s) after terminal state`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D2_POST_TERMINAL_EXECUTION_DETECTED');
    }

    notes.push('No post-terminal execution events detected');
    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// D3: Authorization Decision
// =============================================================================

/** CL-D3-01: Authz decision evidence exists */
export function evaluateCLD3_01(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D3-01')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers for RQ-D3-01');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D3_DECISION_EVENT_MISSING');
    }

    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D3_DECISION_EVENT_MISSING');
    }

    notes.push(`Resolved ${evidence.resolved_count} evidence item(s)`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D3-02: Subject/Resource/Action triple complete */
export function evaluateCLD3_02(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D3-02')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D3-01');

    if (evidence.resolved_count === 0) {
        notes.push('No resolved evidence to check S/R/A');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D3_DECISION_EVENT_MISSING');
    }

    const fields = getFirstSemanticFields(evidence);
    if (!fields) {
        notes.push('Cannot extract semantic fields');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D3_SUBJECT_RESOURCE_ACTION_INCOMPLETE');
    }

    const missing: string[] = [];
    if (!fields.subject) missing.push('subject');
    if (!fields.resource) missing.push('resource');
    if (!fields.action) missing.push('action');

    if (missing.length > 0) {
        notes.push(`Missing S/R/A fields: ${missing.join(', ')}`);
        const reasonCode = missing.length === 3
            ? 'D3_SUBJECT_RESOURCE_ACTION_INCOMPLETE'
            : missing.includes('subject') ? 'D3_SUBJECT_MISSING'
                : missing.includes('resource') ? 'D3_RESOURCE_MISSING'
                    : 'D3_ACTION_MISSING';
        return createClauseResult(def, 'FAIL', evidence, notes, reasonCode);
    }

    notes.push(`S/R/A complete: ${fields.subject}/${fields.resource}/${fields.action}`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D3-03: Deny triggers confirm gate */
export function evaluateCLD3_03(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D3-03')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D3-01');

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.outcome) {
        notes.push('No outcome to check for deny confirmation');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D3_DECISION_OUTCOME_MISSING');
    }

    // If outcome is allow, this clause is N/A (PASS)
    if (inSynonymGroup('outcome_allow', fields.outcome)) {
        notes.push('Outcome is allow - confirm gate N/A');
        return createClauseResult(def, 'PASS', evidence, notes);
    }

    // For deny, check for confirm gate evidence
    const events = getAllEvents(bundle);
    const hasConfirmGate = events.some(e => {
        const et = normalizeToken(e.event_type);
        return et.includes('confirm') || et.includes('gate') || et.includes('audit');
    });

    if (!hasConfirmGate) {
        notes.push(`Deny (${fields.outcome}) but no confirm gate evidence`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D3_DENY_WITHOUT_CONFIRM_GATE');
    }

    notes.push('Confirm gate evidence found');
    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// D4: Termination & Recovery
// =============================================================================

/** CL-D4-01: Termination evidence exists */
export function evaluateCLD4_01(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D4-01')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, def.requirement_id);

    if (evidence.pointers.length === 0) {
        notes.push('No evidence pointers for RQ-D4-01');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D4_TERMINATION_EVENT_MISSING');
    }

    if (evidence.resolved_count === 0) {
        notes.push('All pointers failed to resolve');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D4_TERMINATION_EVENT_MISSING');
    }

    notes.push(`Resolved ${evidence.resolved_count} evidence item(s)`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D4-02: Termination reason is valid category */
export function evaluateCLD4_02(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D4-02')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D4-01');

    if (evidence.resolved_count === 0) {
        notes.push('No resolved evidence to check termination reason');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D4_TERMINATION_EVENT_MISSING');
    }

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.termination_reason) {
        notes.push('No termination_reason field in evidence');
        return createClauseResult(def, 'FAIL', evidence, notes, 'D4_TERMINATION_REASON_MISSING');
    }

    if (!isValidTerminationReason(fields.termination_reason)) {
        notes.push(`Termination reason not in allowed set: ${fields.termination_reason}`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D4_TERMINATION_REASON_NOT_IN_ALLOWED_SET');
    }

    notes.push(`Valid termination reason: ${fields.termination_reason}`);
    return createClauseResult(def, 'PASS', evidence, notes);
}

/** CL-D4-03: Post-termination is controlled recovery only */
export function evaluateCLD4_03(bundle: RunBundle): ClauseResult {
    const def = getClauseById('CL-D4-03')!;
    const notes: string[] = [];
    const evidence = resolveEvidenceForRequirement(bundle, 'RQ-D4-01');

    const fields = getFirstSemanticFields(evidence);
    if (!fields?.timestamp) {
        notes.push('Cannot determine termination timestamp');
        return createClauseResult(def, 'NOT_EVALUATED', evidence, notes, 'D4_TERMINATION_EVENT_MISSING');
    }

    const terminationTimestamp = fields.timestamp;
    const events = getAllEvents(bundle);

    // Find any non-recovery events after termination
    const postTermEvents = events.filter(e => e.timestamp > terminationTimestamp);
    const nonRecoveryEvents = postTermEvents.filter(e => {
        const et = normalizeToken(e.event_type);
        // Recovery-related events are allowed
        if (et.includes('recover') || et.includes('cleanup') || et.includes('shutdown')) {
            return false;
        }
        // Execution events are not
        if (et.includes('exec') || et.includes('dispatch') || et.includes('invoke') || et.includes('tool_call')) {
            return true;
        }
        return false;
    });

    if (nonRecoveryEvents.length > 0) {
        notes.push(`Found ${nonRecoveryEvents.length} non-recovery event(s) after termination`);
        return createClauseResult(def, 'FAIL', evidence, notes, 'D4_POST_TERMINATION_EXECUTION_DETECTED');
    }

    notes.push('Only controlled recovery after termination');
    return createClauseResult(def, 'PASS', evidence, notes);
}

// =============================================================================
// Clause Evaluator Registry
// =============================================================================

export type ClauseEvaluator = (bundle: RunBundle) => ClauseResult;

export const CLAUSE_EVALUATORS: Record<string, ClauseEvaluator> = {
    // D1
    'CL-D1-01': evaluateCLD1_01,
    'CL-D1-02': evaluateCLD1_02,
    'CL-D1-03': evaluateCLD1_03,
    // D2
    'CL-D2-01': evaluateCLD2_01,
    'CL-D2-02': evaluateCLD2_02,
    'CL-D2-03': evaluateCLD2_03,
    // D3
    'CL-D3-01': evaluateCLD3_01,
    'CL-D3-02': evaluateCLD3_02,
    'CL-D3-03': evaluateCLD3_03,
    // D4
    'CL-D4-01': evaluateCLD4_01,
    'CL-D4-02': evaluateCLD4_02,
    'CL-D4-03': evaluateCLD4_03,
};

/**
 * Evaluate a single clause by ID.
 */
export function evaluateClause(bundle: RunBundle, clauseId: string): ClauseResult | null {
    const evaluator = CLAUSE_EVALUATORS[clauseId];
    if (!evaluator) return null;
    return evaluator(bundle);
}

/**
 * Evaluate all clauses for a domain.
 */
export function evaluateDomain(bundle: RunBundle, domain: 'D1' | 'D2' | 'D3' | 'D4'): ClauseResult[] {
    const clauseIds = CLAUSE_DEFINITIONS
        .filter(c => c.domain === domain)
        .map(c => c.clause_id);

    return clauseIds.map(id => evaluateClause(bundle, id)!).filter(Boolean);
}
