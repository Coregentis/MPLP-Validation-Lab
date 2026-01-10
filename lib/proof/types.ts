/**
 * Adjudication Proof Types
 * 
 * Defines the structure for unsigned portable proofs.
 * These proofs enable offline verification and audit archival.
 * 
 * CRITICAL: This is NOT certification. Proofs represent
 * "verdict under ruleset X" with deterministic reproducibility.
 */

/**
 * Adjudication Proof - Portable, verifiable verdict record
 */
export interface AdjudicationProof {
    /** Proof format version */
    proof_version: '1.0';

    /** Run identifier */
    run_id: string;

    /** ISO timestamp of proof generation */
    generated_at: string;

    /** Pack metadata from manifest */
    pack: {
        pack_id: string;
        protocol_version: string;
    };

    /** Ruleset used for evaluation */
    ruleset: {
        version: string;
        schema_bundle_version?: string;
    };

    /** Admission result */
    admission: {
        status: 'ADMISSIBLE' | 'NOT_ADMISSIBLE' | 'PARTIALLY_ADMISSIBLE';
        blocking_failures_count: number;
    };

    /** Evaluation summary (only if admissible) */
    evaluation?: {
        verdict_hash: string;
        gf_summary: {
            total: number;
            pass: number;
            fail: number;
            skip: number;
        };
    };

    /** Integrity references (hashes for verification) */
    integrity: {
        /** SHA256 of verify.report.json */
        verify_report_hash: string;
        /** SHA256 of evaluation.report.json (if present) */
        evaluation_report_hash?: string;
        /** SHA256 of manifest file */
        manifest_hash: string;
        /** Reference to sha256sums.txt hash */
        checksums_hash?: string;
    };

    /** Non-certification disclaimer (required) */
    disclaimer: string;
}

/** Standard disclaimer text for proofs */
export const PROOF_DISCLAIMER =
    'This is an evidence-based verdict under a versioned ruleset. ' +
    'Non-certification. Non-endorsement. ' +
    'Third parties may independently verify by re-running the evaluation.';
