/**
 * © 2026 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * Validation Lab — Verdict Types
 * 
 * GOVERNANCE: This file is governed by VLAB-DGB-01.
 * All types MUST align with governance contracts.
 */

// =============================================================================
// VERDICT STATUS
// =============================================================================

/**
 * Verdict status for Golden Flow evaluation.
 * 
 * - PASS: Evidence satisfies all requirements for this GF
 * - FAIL: Evidence violates one or more requirements (evidence exists but rules violated)
 * - NOT_EVALUATED: Cannot determine; evidence is missing or insufficient
 * - NOT_ADMISSIBLE: Evidence pack failed admission checks (integrity/security/version)
 */
export type VerdictStatus =
    | 'PASS'
    | 'FAIL'
    | 'NOT_EVALUATED'
    | 'NOT_ADMISSIBLE';

// =============================================================================
// ADMISSION STATUS
// =============================================================================

/**
 * Admission status for Evidence Pack.
 * Aligned with admission-criteria-v1.0.md contract.
 * 
 * - ADMISSIBLE: All admission checks passed, proceed to GF evaluation
 * - NOT_ADMISSIBLE: Blocking check failed, no GF verdict produced
 * - PARTIALLY_ADMISSIBLE: Subset of GF requirements satisfiable
 */
export type AdmissionStatus =
    | 'ADMISSIBLE'
    | 'NOT_ADMISSIBLE'
    | 'PARTIALLY_ADMISSIBLE';

// =============================================================================
// GOLDEN FLOW IDENTIFIERS
// =============================================================================

/**
 * Golden Flow identifiers.
 * These are the lifecycle invariants being evaluated, NOT scenario names.
 * See TERMINOLOGY_MAPPING.md for distinction.
 */
export type GoldenFlowId =
    | 'GF-01'   // Single Agent Lifecycle
    | 'GF-02'   // Multi-Agent Coordination
    | 'GF-03'   // Human-in-the-Loop Gating
    | 'GF-04'   // Drift Detection & Recovery
    | 'GF-05';  // External Tool Integration

// =============================================================================
// EVIDENCE POINTER
// =============================================================================

/**
 * Evidence Pointer — references a specific location in evidence pack.
 * Every verdict MUST include pointers to support reproducibility.
 */
export interface EvidencePointer {
    /** Path to artifact within evidence pack (e.g., "context.json") */
    artifact_path: string;

    /** SHA-256 hash of the artifact file */
    content_hash: string;

    /** Location within artifact (JSON pointer, line range, or event index) */
    locator: string;

    /** Requirement ID this pointer supports (e.g., "gf-01-r01") */
    requirement_id: string;

    /** Short descriptive note (optional, for audit clarity) */
    note?: string;
}

// =============================================================================
// REQUIREMENT COVERAGE
// =============================================================================

/**
 * Coverage report for requirements evaluation.
 */
export interface RequirementCoverage {
    /** Total requirements in ruleset for this GF */
    total: number;

    /** Requirements that passed */
    passed: number;

    /** Requirements that failed (evidence exists but rule violated) */
    failed: number;

    /** Requirements that could not be evaluated (missing evidence) */
    not_evaluated: number;
}

// =============================================================================
// GOLDEN FLOW VERDICT
// =============================================================================

/**
 * Verdict for a single Golden Flow.
 */
export interface GoldenFlowVerdict {
    /** Golden Flow being evaluated (NOT scenario name) */
    gf_id: GoldenFlowId;

    /** Verdict status */
    status: VerdictStatus;

    /** Evidence pointers supporting this verdict */
    pointers: EvidencePointer[];

    /** Failure reasons (required if status is FAIL or NOT_EVALUATED) */
    failure_reasons?: import('./taxonomy').FailureTaxonomy[];

    /** Requirement coverage report */
    coverage: RequirementCoverage;
}

// =============================================================================
// RUN VERDICT
// =============================================================================

/**
 * Complete verdict for an evaluation run.
 */
export interface RunVerdict {
    /** Unique run identifier */
    run_id: string;

    /** Scenario/flow used as input */
    scenario_id: string;

    /** Admission status */
    admission: AdmissionStatus;

    /** Admission failure details (if NOT_ADMISSIBLE) */
    admission_failure?: AdmissionFailure;

    /** GF verdicts (only present if ADMISSIBLE or PARTIALLY_ADMISSIBLE) */
    gf_verdicts?: GoldenFlowVerdict[];

    /** Version information */
    versions: {
        protocol: string;   // e.g., "1.0.0"
        schema: string;     // e.g., "1.0.0"
        ruleset: string;    // e.g., "1.0"
    };

    /** Evaluation timestamp */
    evaluated_at: string;  // ISO 8601

    /** Determinism hash (same evidence + ruleset = same hash) */
    determinism_hash: string;
}

// =============================================================================
// ADMISSION FAILURE
// =============================================================================

/**
 * Admission failure response.
 */
export interface AdmissionFailure {
    /** Status is always NOT_ADMISSIBLE */
    status: 'NOT_ADMISSIBLE';

    /** Timestamp of admission check */
    timestamp: string;

    /** Number of checks performed before failure */
    checks_performed: number;

    /** Number of checks that passed */
    checks_passed: number;

    /** List of failed checks */
    failures: AdmissionCheckFailure[];
}

/**
 * Single admission check failure.
 */
export interface AdmissionCheckFailure {
    /** Check identifier (e.g., "INTEGRITY_HASH") */
    check_id: string;

    /** Failure taxonomy code */
    taxonomy: import('./taxonomy').FailureTaxonomy;

    /** Human-readable message */
    message: string;

    /** Evidence pointer if applicable */
    pointer?: EvidencePointer;
}
