/**
 * Validation Lab Engine Types
 * 
 * Core type definitions for evidence pack verification.
 * Aligned with:
 * - evidence-pack-contract-v1.0.md
 * - ruleset-contract-v1.0.md
 * - pointer-contract-v1.0.md
 */

import { AdmissionStatus, VerdictStatus, EvidencePointer } from '../verdict/types';
import { FailureTaxonomy } from '../verdict/taxonomy';

// =============================================================================
// Pack Handle (from ingest.ts)
// =============================================================================

/**
 * Represents an ingested evidence pack ready for verification.
 */
export interface PackHandle {
    /** Absolute path to pack root directory */
    root_path: string;

    /** List of all files in pack (relative paths) */
    file_inventory: string[];

    /** Total size in bytes */
    total_size_bytes: number;

    /** Detected EPC layout version */
    layout_version: string;

    /** Raw manifest.json content (if exists) */
    manifest_raw?: PackManifest;

    /** Whether pack was extracted from zip */
    from_zip: boolean;
}

/**
 * Pack manifest structure per EPC v1.0
 */
export interface PackManifest {
    pack_version: string;
    pack_id: string;
    created_at: string;
    generator: {
        name: string;
        version: string;
        fingerprint: string;
    };
    protocol_version: string;
    scenario_id: string;
    artifacts_included: string[];
    compatibility?: {
        min_ruleset_version: string;
        max_ruleset_version: string;
    };
}

// =============================================================================
// Verification Report (from verify.ts)
// =============================================================================

/**
 * Result of a single verification check.
 */
export interface CheckResult {
    /** Check identifier */
    check_id: string;

    /** Human-readable check name */
    name: string;

    /** Check category */
    category: CheckCategory;

    /** Result status */
    status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';

    /** Human-readable message */
    message: string;

    /** If FAIL, the taxonomy code */
    taxonomy?: FailureTaxonomy;

    /** If FAIL, evidence pointers */
    pointers?: EvidencePointer[];

    /** Execution time in ms */
    duration_ms: number;
}

export type CheckCategory =
    | 'ADMISSION_SECURITY'
    | 'ADMISSION_STRUCTURE'
    | 'INTEGRITY'
    | 'MANIFEST'
    | 'VERSION_BINDING'
    | 'TIMELINE';

/**
 * A blocking failure that prevents admission.
 */
export interface BlockingFailure {
    check_id: string;
    taxonomy: FailureTaxonomy;
    message: string;
    pointers: EvidencePointer[];
}

/**
 * Computed hashes for audit trail.
 */
export interface ComputedHashes {
    /** SHA-256 of normalized sha256sums.txt */
    pack_root_hash: string;

    /** SHA-256 of manifest.json */
    manifest_hash: string;

    /** SHA-256 of this report (computed after serialization) */
    report_hash?: string;

    /** Schema bundle hash from SYNC_REPORT */
    schemas_bundle_hash: string;

    /** Invariants bundle hash from SYNC_REPORT */
    invariants_bundle_hash: string;
}

/**
 * The complete verification report.
 */
export interface VerificationReport {
    /** Report version */
    report_version: '1.0';

    /** Timestamp of verification */
    verified_at: string;

    /** Pack identifier */
    pack_id: string;

    /** Pack path that was verified */
    pack_path: string;

    /** Final admission status */
    admission_status: AdmissionStatus;

    /** All checks performed */
    checks: CheckResult[];

    /** Blocking failures (if any) */
    blocking_failures: BlockingFailure[];

    /** Computed hashes for audit */
    hashes: ComputedHashes;

    /** Ruleset used for version binding */
    ruleset_version: string;

    /** Protocol version from pack */
    protocol_version?: string;

    /** Total verification time in ms */
    total_duration_ms: number;
}

// =============================================================================
// Ingest Options
// =============================================================================

export interface IngestOptions {
    /** Allow zip extraction (default: true) */
    allow_zip?: boolean;

    /** Temporary directory for zip extraction */
    temp_dir?: string;

    /** Skip file inventory (for large packs) */
    skip_inventory?: boolean;
}

// =============================================================================
// Verify Options
// =============================================================================

export interface VerifyOptions {
    /** Ruleset version to use (default: 'ruleset-1.0') */
    ruleset_version?: string;

    /** Path to SYNC_REPORT.json */
    sync_report_path?: string;

    /** Strict mode: fail on any WARN */
    strict?: boolean;

    /** Skip specific checks */
    skip_checks?: string[];
}

// =============================================================================
// Constants (from EPC v1.0)
// =============================================================================

export const EPC_CONSTANTS = {
    MAX_PACK_SIZE_BYTES: 50 * 1024 * 1024, // 50 MB
    MAX_FILE_COUNT: 1000,
    ALLOWED_EXTENSIONS: ['.json', '.ndjson', '.yaml', '.yml', '.txt', '.sha256'],
    REQUIRED_FILES: ['manifest.json', 'integrity/sha256sums.txt', 'integrity/pack.sha256'],
    REQUIRED_DIRS: ['artifacts', 'timeline', 'integrity'],
} as const;
