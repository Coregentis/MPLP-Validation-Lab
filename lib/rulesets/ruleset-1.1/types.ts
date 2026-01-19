/**
 * Ruleset-1.1 Types
 * 
 * Types specific to the four-domain clause evaluation.
 * Uses SSOT types from lib/bundles/types.ts where applicable.
 */

import type { EvidencePointer, Event } from '@/lib/bundles/types';
import type { EvidenceRef } from '@/lib/evidence/resolve';

// =============================================================================
// Clause Result (per-clause output)
// =============================================================================

export interface ClauseResult {
    clause_id: string;
    requirement_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    reason_code?: string;
    evidence: ClauseEvidence;
    notes: string[];
}

export interface ClauseEvidence {
    pointers: EvidencePointer[];
    resolved: EvidenceRef[];
    /** Number of pointers that resolved successfully */
    resolved_count: number;
    /** Number of pointers that failed to resolve */
    unresolved_count: number;
}

// =============================================================================
// Domain Verdict (per-domain grouping)
// =============================================================================

export type DomainId = 'D1' | 'D2' | 'D3' | 'D4';

export interface DomainVerdictResult {
    domain: DomainId;
    domain_name: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    clauses: ClauseResult[];
}

// =============================================================================
// Ruleset-1.1 Verdict (adjudicator output)
// =============================================================================

export interface Ruleset11Verdict {
    ruleset_id: 'ruleset-1.1';
    run_id: string;
    evaluated_at: string;
    topline: 'PASS' | 'FAIL';
    domain_verdicts: DomainVerdictResult[];
    clause_results: ClauseResult[];
    /** First failing reason_code for non-PASS topline */
    reason_code: string | null;
}

// =============================================================================
// Clause Definitions
// =============================================================================

export interface ClauseDefinition {
    clause_id: string;
    requirement_id: string;
    domain: DomainId;
    domain_name: string;
    description: string;
}

export const CLAUSE_DEFINITIONS: ClauseDefinition[] = [
    {
        clause_id: 'CL-D1-01',
        requirement_id: 'RQ-D1-01',
        domain: 'D1',
        domain_name: 'Budget Decision Record',
        description: 'Run must include at least one locatable budget/resource governance decision event with outcome.',
    },
    {
        clause_id: 'CL-D2-01',
        requirement_id: 'RQ-D2-01',
        domain: 'D2',
        domain_name: 'Terminal Lifecycle State',
        description: 'Run must include terminal state transition event (SUCCESS/FAILURE/CANCELLED) or snapshot indicating terminal state.',
    },
    {
        clause_id: 'CL-D3-01',
        requirement_id: 'RQ-D3-01',
        domain: 'D3',
        domain_name: 'Authorization Decision',
        description: 'Run must include authorization decision event with outcome (ALLOW/DENY) for privileged actions.',
    },
    {
        clause_id: 'CL-D4-01',
        requirement_id: 'RQ-D4-01',
        domain: 'D4',
        domain_name: 'Termination Decision',
        description: 'Run must include termination decision event if agent was terminated.',
    },
];

// =============================================================================
// Domain Metadata
// =============================================================================

export const DOMAIN_NAMES: Record<DomainId, string> = {
    D1: 'Budget Decision Record',
    D2: 'Terminal Lifecycle State',
    D3: 'Authorization Decision',
    D4: 'Termination Decision',
};
