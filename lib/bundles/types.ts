/**
 * RunBundle Types — Internal SSOT
 * 
 * All downstream code (UI, Gate, Evaluator) ONLY sees these types.
 * Legacy format mapping happens ONLY in normalize.ts.
 * 
 * IMPORTANT: This is the SINGLE source of truth for RunBundle types.
 * Do NOT define duplicate types elsewhere.
 */

// =============================================================================
// Load Status
// =============================================================================

export interface LoadStatus {
    b1_verdict: 'ok' | 'missing' | 'invalid';
    b2_manifest: 'ok' | 'missing' | 'invalid';
    b3_integrity: 'ok' | 'missing' | 'invalid';
    b4_pointers: 'ok' | 'missing' | 'invalid';
    pack: 'ok' | 'missing' | 'partial';
    /** True if B1 was mapped from legacy format */
    b1_was_legacy: boolean;
}

export interface LoadError {
    artifact: 'B1' | 'B2' | 'B3' | 'B4' | 'pack';
    code: string;
    message: string;
    path?: string;
}

// =============================================================================
// Bundle Manifest (B2)
// =============================================================================

export interface BundleManifest {
    run_id: string;
    pack_root: string;
    ruleset_ref: string;
    protocol_pin: string;
    schema_bundle_sha256: string;
    hash_scope: string[];
    reason_code: string | null;
    scenario_meta?: ScenarioMeta;
}

export interface ScenarioMeta {
    privileged_action?: boolean;
    termination_case?: boolean;
}

// =============================================================================
// Evidence Pointers (B4)
// =============================================================================

export interface EvidencePointers {
    pointers: EvidencePointer[];
}

export interface EvidencePointer {
    requirement_id: string;
    artifact_path: string;
    locator: string;
    status: 'PRESENT' | 'ABSENT' | 'NOT_EVALUATED';
}

// =============================================================================
// NormalizedVerdict (B1) — The Only Internal Structure
// =============================================================================

/**
 * THE ONLY VERDICT STRUCTURE seen by evaluator/gate/UI.
 * Legacy disk format is mapped to this at load time.
 */
export interface NormalizedVerdict {
    run_id: string;
    scenario_id: string;
    admission: 'ADMISSIBLE' | 'NOT_ADMISSIBLE' | 'UNKNOWN';

    // GoldenFlow verdicts (from legacy/ruleset-1.0)
    gf_verdicts: GoldenFlowVerdict[];

    // Domain verdicts (from ruleset-1.1+)
    domain_verdicts: DomainVerdict[];

    // Unified topline (PASS | FAIL | NOT_ADMISSIBLE | ...)
    topline: string;

    // Version pins
    versions: {
        protocol: string;
        schema: string;
        ruleset: string;
    };

    evaluated_at: string;

    // Reason code (for non-PASS, from bundle.manifest or derived)
    reason_code: string | null;
}

export interface GoldenFlowVerdict {
    gf_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    coverage: { total: number; passed: number; failed: number; not_evaluated: number };
    pointers: Array<{
        artifact_path: string;
        locator: string;
        requirement_id: string;
        content_hash?: string;
    }>;
}

export interface DomainVerdict {
    domain: 'D1' | 'D2' | 'D3' | 'D4';
    clause_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string;
    evidence_refs?: Array<{ pointer: EvidencePointer; resolved: 'event' | 'snapshot' | 'none' }>;
}

// =============================================================================
// Pack Structure
// =============================================================================

export interface Pack {
    root: string;
    trace?: TraceData;
    snapshots?: SnapshotData[];
}

export interface TraceData {
    events: Event[];
    raw_path: string;
}

export interface Event {
    event_id: string;
    event_type: string;
    timestamp: string;
    [key: string]: unknown;  // Domain-specific fields
}

export interface SnapshotData {
    snapshot_id: string;
    path: string;
    data: Record<string, unknown>;
}

// =============================================================================
// RunBundle (Main Structure)
// =============================================================================

export interface RunBundle {
    run_id: string;

    // ABMC Four-piece set (B1 is always NormalizedVerdict internally)
    verdict: NormalizedVerdict | null;      // B1 - ALWAYS normalized, never legacy
    bundle_manifest: BundleManifest | null; // B2
    integrity_hash_path: string | null;     // B3 path
    evidence_pointers: EvidencePointers | null; // B4

    // Pack contents
    pack: Pack | null;

    // Loading metadata
    load_status: LoadStatus;
    load_errors: LoadError[];

    // Ruleset reference (from B2 or legacy manifest)
    ruleset_ref?: string;
}
