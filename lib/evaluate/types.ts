/**
 * Phase D: Evaluation Engine Types
 * 
 * Types for GF (Golden Flow) requirement evaluation.
 * Separate from Admission types to maintain clear semantic boundaries.
 */

import { EvidencePointer } from '../verdict/types';
import { FailureTaxonomy } from '../verdict/taxonomy';

// =============================================================================
// Status Types (Semantic Separation per User HARD-01)
// =============================================================================

/**
 * Requirement-level evaluation status
 */
export type RequirementStatus = 'PASS' | 'FAIL' | 'NOT_EVALUATED';

/**
 * Golden Flow-level evaluation status
 */
export type GFStatus = 'PASS' | 'FAIL' | 'NOT_EVALUATED';

// =============================================================================
// Failure Types (Semantic Separation per User HARD-02)
// =============================================================================

/**
 * Evaluation failure record (distinct from Admission's BlockingFailure)
 * Used for GF/requirement level failures, not admission blocking.
 */
export interface EvaluationFailure {
    /** Failure taxonomy code */
    taxonomy: FailureTaxonomy;

    /** Normalized message (no absolute paths, no stack traces) */
    message: string;

    /** Evidence pointers for audit trail */
    pointers: EvidencePointer[];

    /** Associated requirement ID (optional) */
    requirement_id?: string;
}

// =============================================================================
// Verdict Types
// =============================================================================

/**
 * Verdict for a single requirement within a Golden Flow
 */
export interface RequirementVerdict {
    /** Requirement ID (e.g., "gf-01-r01") */
    requirement_id: string;

    /** Evaluation status */
    status: RequirementStatus;

    /** Evidence pointers (required for FAIL/NOT_EVALUATED) */
    pointers: EvidencePointer[];

    /** Human-readable result message */
    message: string;

    /** Failure taxonomy (only for FAIL) */
    taxonomy?: FailureTaxonomy;
}

/**
 * Verdict for a Golden Flow (aggregates requirements)
 */
export interface GFVerdict {
    /** Golden Flow ID (e.g., "gf-01") */
    gf_id: string;

    /** Overall GF status */
    status: GFStatus;

    /** Individual requirement verdicts */
    requirements: RequirementVerdict[];

    /** Aggregated failures (EvaluationFailure, not BlockingFailure) */
    failures: EvaluationFailure[];
}

// =============================================================================
// Evaluation Report
// =============================================================================

/**
 * Full evaluation report (deterministic - no timestamps in hash computation)
 */
export interface EvaluationReport {
    /** Report format version */
    report_version: '1.0';

    /** Ruleset version used for evaluation */
    ruleset_version: string;

    /** Evidence pack ID */
    pack_id: string;

    /** Pack root hash (from verify stage, same source) */
    pack_root_hash: string;

    /** Protocol version (must match ruleset) */
    protocol_version: string;

    /** Golden Flow verdicts */
    gf_verdicts: GFVerdict[];

    /** Deterministic verdict hash (excludes timestamps/durations) */
    verdict_hash: string;

    // --- Non-deterministic fields (excluded from verdict_hash) ---

    /** Evaluation timestamp (excluded from verdict_hash) */
    evaluated_at?: string;

    /** Total evaluation duration (excluded from verdict_hash) */
    total_duration_ms?: number;
}

// =============================================================================
// Evaluation Options
// =============================================================================

/**
 * Options for evaluation
 */
export interface EvaluateOptions {
    /** Ruleset version to use (e.g., "ruleset-1.0") */
    ruleset_version: string;

    /** Base path for rulesets (default: data/rulesets) */
    rulesets_base_path?: string;

    /** GF IDs to evaluate (default: all from ruleset manifest) */
    gf_filter?: string[];

    /** Strict mode: unknown fields = FAIL (default: true) */
    strict?: boolean;
}

// =============================================================================
// Ruleset Types
// =============================================================================

/**
 * Ruleset manifest (loaded from manifest.yaml)
 */
export interface RulesetManifest {
    id: string;
    version: string;
    name: string;
    status: 'active' | 'deprecated';
    protocol: {
        version: string;
        upstream_commit: string;
        schemas_bundle_sha256: string;
        invariants_bundle_sha256: string;
    };
    golden_flows: string[];
    created_at?: string;
}

/**
 * Evidence requirement type
 */
export type EvidenceType = 'file' | 'json_pointer' | 'ndjson_line' | 'cross_ref';

/**
 * Evidence requirement definition
 */
export interface EvidenceRequirement {
    /** Evidence type */
    type: EvidenceType;

    /** Artifact path relative to pack root */
    artifact: string;

    /** Locator within artifact (for json_pointer/ndjson_line) */
    locator?: string;
}

/**
 * Requirement definition (from gf-*.yaml)
 */
export interface RequirementDefinition {
    /** Requirement ID (e.g., "gf-01-r01") */
    id: string;

    /** Human-readable description */
    description: string;

    /** Severity level */
    severity: 'required' | 'recommended' | 'optional';

    /** Evidence requirement */
    evidence: EvidenceRequirement;

    /** Optional source references */
    sources?: {
        schema_ref?: string;
        invariant_ref?: string;
    };
}

/**
 * Golden Flow definition (from gf-*.yaml)
 */
export interface GFDefinition {
    /** GF ID (must match filename) */
    gf_id: string;

    /** Human-readable name */
    name: string;

    /** Requirement definitions */
    requirements: RequirementDefinition[];
}

// =============================================================================
// Ruleset Validation (per User HARD-03)
// =============================================================================

/**
 * RULESET_INVALID taxonomy codes for ruleset closure validation
 */
export const RULESET_VALIDATION_ERRORS = {
    MISSING_GF_FILE: 'manifest.golden_flows declares GF but requirements file missing',
    UNDECLARED_GF_FILE: 'requirements file exists but not declared in manifest.golden_flows',
    GF_ID_MISMATCH: 'gf_id in file does not match filename',
    MANIFEST_PARSE_ERROR: 'manifest.yaml parse error (including duplicate keys)',
    REQUIREMENTS_PARSE_ERROR: 'requirements file parse error',
} as const;

export type RulesetValidationError = keyof typeof RULESET_VALIDATION_ERRORS;
