/**
 * Ruleset-1.2 Types
 * 
 * v0.4 Semantic Invariant Adjudication
 * 12 clauses: 3 per domain (D1-D4)
 * Pattern: Existence → Field Semantics → Gate/Post-action Invariant
 */

// =============================================================================
// Clause Definitions
// =============================================================================

export interface ClauseDefinition {
    clause_id: string;
    requirement_id: string;
    domain: 'D1' | 'D2' | 'D3' | 'D4';
    name: string;
    description: string;
    invariant_type: 'existence' | 'field_semantics' | 'gate_invariant';
}

/**
 * All 12 clause definitions for ruleset-1.2.
 */
export const CLAUSE_DEFINITIONS: ClauseDefinition[] = [
    // D1: Budget Decision Record
    {
        clause_id: 'CL-D1-01',
        requirement_id: 'RQ-D1-01',
        domain: 'D1',
        name: 'Budget Decision Evidence',
        description: 'Budget decision record exists with evidence pointer',
        invariant_type: 'existence',
    },
    {
        clause_id: 'CL-D1-02',
        requirement_id: 'RQ-D1-02',
        domain: 'D1',
        name: 'Budget Outcome Valid',
        description: 'Budget decision outcome is valid and locatable',
        invariant_type: 'field_semantics',
    },
    {
        clause_id: 'CL-D1-03',
        requirement_id: 'RQ-D1-03',
        domain: 'D1',
        name: 'Budget Deny Gate',
        description: 'Deny/throttle outcome triggers gate enforcement evidence',
        invariant_type: 'gate_invariant',
    },

    // D2: Terminal Lifecycle State
    {
        clause_id: 'CL-D2-01',
        requirement_id: 'RQ-D2-01',
        domain: 'D2',
        name: 'Terminal State Evidence',
        description: 'Terminal lifecycle state evidence exists',
        invariant_type: 'existence',
    },
    {
        clause_id: 'CL-D2-02',
        requirement_id: 'RQ-D2-02',
        domain: 'D2',
        name: 'Terminal State Valid',
        description: 'Terminal state is in allowed set',
        invariant_type: 'field_semantics',
    },
    {
        clause_id: 'CL-D2-03',
        requirement_id: 'RQ-D2-03',
        domain: 'D2',
        name: 'No Post-Terminal Execution',
        description: 'No execution events after terminal state',
        invariant_type: 'gate_invariant',
    },

    // D3: Authorization Decision
    {
        clause_id: 'CL-D3-01',
        requirement_id: 'RQ-D3-01',
        domain: 'D3',
        name: 'Authz Decision Evidence',
        description: 'Authorization decision evidence exists',
        invariant_type: 'existence',
    },
    {
        clause_id: 'CL-D3-02',
        requirement_id: 'RQ-D3-02',
        domain: 'D3',
        name: 'S/R/A Complete',
        description: 'Subject/Resource/Action triple is complete',
        invariant_type: 'field_semantics',
    },
    {
        clause_id: 'CL-D3-03',
        requirement_id: 'RQ-D3-03',
        domain: 'D3',
        name: 'Deny Confirm Gate',
        description: 'Deny outcome triggers confirm gate evidence',
        invariant_type: 'gate_invariant',
    },

    // D4: Termination & Recovery
    {
        clause_id: 'CL-D4-01',
        requirement_id: 'RQ-D4-01',
        domain: 'D4',
        name: 'Termination Evidence',
        description: 'Termination decision evidence exists',
        invariant_type: 'existence',
    },
    {
        clause_id: 'CL-D4-02',
        requirement_id: 'RQ-D4-02',
        domain: 'D4',
        name: 'Termination Reason Valid',
        description: 'Termination reason is in allowed category set',
        invariant_type: 'field_semantics',
    },
    {
        clause_id: 'CL-D4-03',
        requirement_id: 'RQ-D4-03',
        domain: 'D4',
        name: 'Controlled Recovery Only',
        description: 'Post-termination only allows controlled recovery path',
        invariant_type: 'gate_invariant',
    },
];

/**
 * Get clause definitions by domain.
 */
export function getClausesByDomain(domain: 'D1' | 'D2' | 'D3' | 'D4'): ClauseDefinition[] {
    return CLAUSE_DEFINITIONS.filter(c => c.domain === domain);
}

/**
 * Get clause definition by ID.
 */
export function getClauseById(clauseId: string): ClauseDefinition | undefined {
    return CLAUSE_DEFINITIONS.find(c => c.clause_id === clauseId);
}

// =============================================================================
// Clause Result Types
// =============================================================================

export interface ClauseEvidence {
    pointers: import('@/lib/bundles/types').EvidencePointer[];
    resolved: import('@/lib/evidence/resolve').EvidenceRef[];
    resolved_count: number;
    unresolved_count: number;
}

export interface ClauseResult {
    clause_id: string;
    requirement_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string;
    evidence: ClauseEvidence;
    notes: string[];
}

// =============================================================================
// Domain Constants
// =============================================================================

export const DOMAIN_NAMES: Record<'D1' | 'D2' | 'D3' | 'D4', string> = {
    D1: 'Budget Decision Record',
    D2: 'Terminal Lifecycle State',
    D3: 'Authorization Decision',
    D4: 'Termination & Recovery',
};
