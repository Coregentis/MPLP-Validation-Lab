/**
 * © 2026 Bangshi Beijing Network Technology Limited Company
 * Licensed under the Apache License, Version 2.0.
 *
 * Validation Lab — Failure Taxonomy
 * 
 * GOVERNANCE: This file is governed by VLAB-DGB-01.
 * All taxonomy codes MUST align with admission-criteria-v1.0.md.
 */

/**
 * Failure Taxonomy — categorizes all possible failure reasons.
 * 
 * Taxonomy only describes evidence gaps or rule violations.
 * It MUST NOT provide implementation advice or suggest fixes.
 */
export enum FailureTaxonomy {
    // =========================================================================
    // EVIDENCE CONTENT ISSUES
    // =========================================================================

    /** Confirm gate evidence missing */
    MISSING_EVIDENCE_CONFIRM_GATE = 'MISSING_EVIDENCE_CONFIRM_GATE',

    /** Snapshot diff evidence missing */
    MISSING_EVIDENCE_SNAPSHOT_DIFF = 'MISSING_EVIDENCE_SNAPSHOT_DIFF',

    /** Context evidence missing */
    MISSING_EVIDENCE_CONTEXT = 'MISSING_EVIDENCE_CONTEXT',

    /** Plan evidence missing */
    MISSING_EVIDENCE_PLAN = 'MISSING_EVIDENCE_PLAN',

    /** Trace evidence missing */
    MISSING_EVIDENCE_TRACE = 'MISSING_EVIDENCE_TRACE',

    /** Timeline incomplete or invalid structure */
    TIMELINE_INCOMPLETE_OR_INVALID = 'TIMELINE_INCOMPLETE_OR_INVALID',

    /** Manifest missing or invalid */
    MANIFEST_INVALID_OR_INCOMPLETE = 'MANIFEST_INVALID_OR_INCOMPLETE',

    /** Evidence pointer cannot be resolved */
    POINTER_UNRESOLVABLE = 'POINTER_UNRESOLVABLE',

    /** Evidence exists but violates invariant rule */
    INVARIANT_VIOLATION = 'INVARIANT_VIOLATION',

    /** Schema validation failed */
    SCHEMA_VALIDATION_FAILED = 'SCHEMA_VALIDATION_FAILED',

    /** Cross-reference mismatch (e.g., plan.context_id != context.context_id) */
    CROSS_REFERENCE_MISMATCH = 'CROSS_REFERENCE_MISMATCH',

    // =========================================================================
    // INTEGRITY ISSUES
    // =========================================================================

    /** Declared hash does not match computed hash */
    INTEGRITY_HASH_MISMATCH = 'INTEGRITY_HASH_MISMATCH',

    /** Protocol or schema version not compatible */
    VERSION_INCOMPATIBLE = 'VERSION_INCOMPATIBLE',

    // =========================================================================
    // SECURITY ISSUES (B5)
    // =========================================================================

    /** General security rejection */
    EVIDENCE_PACK_SECURITY_REJECTED = 'EVIDENCE_PACK_SECURITY_REJECTED',

    /** Pack or file exceeds size limit */
    EVIDENCE_PACK_SIZE_EXCEEDED = 'EVIDENCE_PACK_SIZE_EXCEEDED',

    /** File type not in whitelist */
    EVIDENCE_PACK_INVALID_FILE_TYPE = 'EVIDENCE_PACK_INVALID_FILE_TYPE',

    /** Path traversal attack detected (../ or absolute path) */
    EVIDENCE_PACK_PATH_TRAVERSAL = 'EVIDENCE_PACK_PATH_TRAVERSAL',

    /** Executable or prohibited content detected */
    EVIDENCE_PACK_PROHIBITED_CONTENT = 'EVIDENCE_PACK_PROHIBITED_CONTENT',

    // =========================================================================
    // ADMISSION ISSUES (Phase C)
    // =========================================================================

    /** Pack exceeds file count or size limit */
    PACK_TOO_LARGE = 'PACK_TOO_LARGE',

    /** Disallowed file type/extension */
    DISALLOWED_FILE_TYPE = 'DISALLOWED_FILE_TYPE',

    /** Path traversal detected */
    PATH_TRAVERSAL_DETECTED = 'PATH_TRAVERSAL_DETECTED',

    /** Required artifact missing */
    REQUIRED_ARTIFACT_MISSING = 'REQUIRED_ARTIFACT_MISSING',

    /** Manifest parse failed */
    MANIFEST_PARSE_FAILED = 'MANIFEST_PARSE_FAILED',

    // =========================================================================
    // VERSION BINDING ISSUES (Phase C)
    // =========================================================================

    /** Version binding failed */
    VERSION_BINDING_FAILED = 'VERSION_BINDING_FAILED',

    // =========================================================================
    // TIMELINE ISSUES (Phase C)
    // =========================================================================

    /** Timeline parse failed */
    TIMELINE_PARSE_FAILED = 'TIMELINE_PARSE_FAILED',

    /** Timeline is not in total order */
    TIMELINE_NOT_TOTALLY_ORDERED = 'TIMELINE_NOT_TOTALLY_ORDERED',
}

/**
 * Taxonomy category for grouping.
 */
export type TaxonomyCategory =
    | 'EVIDENCE_CONTENT'
    | 'INTEGRITY'
    | 'SECURITY';

/**
 * Get category for a taxonomy code.
 */
export function getTaxonomyCategory(taxonomy: FailureTaxonomy): TaxonomyCategory {
    if (taxonomy.startsWith('EVIDENCE_PACK_')) {
        return 'SECURITY';
    }
    if (taxonomy.startsWith('INTEGRITY_') || taxonomy === FailureTaxonomy.VERSION_INCOMPATIBLE) {
        return 'INTEGRITY';
    }
    return 'EVIDENCE_CONTENT';
}

/**
 * Human-readable description for each taxonomy code.
 * Use for display purposes only.
 */
export const TAXONOMY_DESCRIPTIONS: Record<FailureTaxonomy, string> = {
    [FailureTaxonomy.MISSING_EVIDENCE_CONFIRM_GATE]:
        'Confirm gate evidence is missing from the evidence pack',
    [FailureTaxonomy.MISSING_EVIDENCE_SNAPSHOT_DIFF]:
        'Snapshot diff evidence is missing from the evidence pack',
    [FailureTaxonomy.MISSING_EVIDENCE_CONTEXT]:
        'Context artifact is missing from the evidence pack',
    [FailureTaxonomy.MISSING_EVIDENCE_PLAN]:
        'Plan artifact is missing from the evidence pack',
    [FailureTaxonomy.MISSING_EVIDENCE_TRACE]:
        'Trace artifact is missing from the evidence pack',
    [FailureTaxonomy.TIMELINE_INCOMPLETE_OR_INVALID]:
        'Timeline events are incomplete or have invalid structure',
    [FailureTaxonomy.MANIFEST_INVALID_OR_INCOMPLETE]:
        'Manifest is missing, invalid, or incomplete',
    [FailureTaxonomy.POINTER_UNRESOLVABLE]:
        'Evidence pointer cannot be resolved to actual content',
    [FailureTaxonomy.INVARIANT_VIOLATION]:
        'Evidence exists but violates a lifecycle invariant rule',
    [FailureTaxonomy.SCHEMA_VALIDATION_FAILED]:
        'Artifact failed JSON Schema validation',
    [FailureTaxonomy.CROSS_REFERENCE_MISMATCH]:
        'Cross-reference between artifacts does not match',
    [FailureTaxonomy.INTEGRITY_HASH_MISMATCH]:
        'Computed hash does not match declared hash in manifest',
    [FailureTaxonomy.VERSION_INCOMPATIBLE]:
        'Protocol or schema version is not compatible with this ruleset',
    [FailureTaxonomy.EVIDENCE_PACK_SECURITY_REJECTED]:
        'Evidence pack rejected due to security policy',
    [FailureTaxonomy.EVIDENCE_PACK_SIZE_EXCEEDED]:
        'Evidence pack or file exceeds allowed size limit',
    [FailureTaxonomy.EVIDENCE_PACK_INVALID_FILE_TYPE]:
        'File type is not in the allowed whitelist',
    [FailureTaxonomy.EVIDENCE_PACK_PATH_TRAVERSAL]:
        'Path traversal attempt detected in archive',
    [FailureTaxonomy.EVIDENCE_PACK_PROHIBITED_CONTENT]:
        'Prohibited content detected (executable, node_modules, etc.)',
    // Phase C additions
    [FailureTaxonomy.PACK_TOO_LARGE]:
        'Pack exceeds file count or size limit',
    [FailureTaxonomy.DISALLOWED_FILE_TYPE]:
        'File type/extension is not allowed',
    [FailureTaxonomy.PATH_TRAVERSAL_DETECTED]:
        'Path traversal pattern detected in file paths',
    [FailureTaxonomy.REQUIRED_ARTIFACT_MISSING]:
        'Required artifact or directory is missing',
    [FailureTaxonomy.MANIFEST_PARSE_FAILED]:
        'Manifest.json could not be parsed',
    [FailureTaxonomy.VERSION_BINDING_FAILED]:
        'Version binding verification failed',
    [FailureTaxonomy.TIMELINE_PARSE_FAILED]:
        'Timeline events.ndjson could not be parsed',
    [FailureTaxonomy.TIMELINE_NOT_TOTALLY_ORDERED]:
        'Timeline events are not in total order (timestamp + event_id)',
};
