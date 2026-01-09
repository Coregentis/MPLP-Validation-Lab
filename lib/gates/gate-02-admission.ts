/**
 * Phase D: GATE-02 Admission Gate
 * 
 * Ensures pack passes admission before evaluation.
 * NOT_ADMISSIBLE → no evaluation allowed.
 */

import { ingest } from '../engine/ingest';
import { verify } from '../engine/verify';
import { PackHandle, VerifyOptions, VerificationReport } from '../engine/types';

// =============================================================================
// Types
// =============================================================================

export interface Gate02Result {
    passed: boolean;
    pack?: PackHandle;
    report: VerificationReport;
    message: string;
}

export interface Gate02Options extends VerifyOptions {
    /** Pack source (directory or zip path) */
    pack_source: string;
}

// =============================================================================
// GATE-02: Admission Gate
// =============================================================================

/**
 * GATE-02: Run admission checks on an evidence pack.
 * Returns pack and verify report only if ADMISSIBLE.
 */
export async function runGate02(options: Gate02Options): Promise<Gate02Result> {
    // Step 1: Ingest
    let pack: PackHandle;
    try {
        pack = await ingest(options.pack_source);
    } catch (e) {
        return {
            passed: false,
            report: createErrorReport(options.pack_source, 'Ingest failed'),
            message: `Ingest failed: ${e instanceof Error ? e.message : String(e)}`,
        };
    }

    // Step 2: Verify
    const report = await verify(pack, options);

    // Step 3: Check admission
    if (report.admission_status !== 'ADMISSIBLE') {
        return {
            passed: false,
            pack,
            report,
            message: `Admission failed: ${report.blocking_failures.length} blocking failures`,
        };
    }

    return {
        passed: true,
        pack,
        report,
        message: 'Admission passed',
    };
}

// =============================================================================
// Helpers
// =============================================================================

function createErrorReport(packPath: string, error: string): VerificationReport {
    return {
        report_version: '1.0',
        verified_at: new Date().toISOString(),
        pack_id: 'unknown',
        pack_path: packPath,
        admission_status: 'NOT_ADMISSIBLE',
        checks: [],
        blocking_failures: [{
            check_id: 'GATE-02',
            taxonomy: 'ADMISSION_FAILED' as never,
            message: error,
            pointers: [],
        }],
        hashes: {
            pack_root_hash: '',
            manifest_hash: '',
            schemas_bundle_hash: '',
            invariants_bundle_hash: '',
        },
        ruleset_version: 'unknown',
        total_duration_ms: 0,
    };
}
