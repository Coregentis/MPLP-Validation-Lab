/**
 * Gate 12: Export Consistency
 * 
 * Validates that the export interface is complete and consistent:
 * 1. export/manifest.json exists and has valid structure
 * 2. All files referenced in manifest exist
 * 3. sha256sums.txt matches actual file hashes
 * 4. release-index canonical bundles match Gate-11 selection
 * 
 * GOVERNANCE: This gate enforces export interface contract.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { selectCanonicalBundle } from '../reverification/selectCanonicalBundle';

// =============================================================================
// Types
// =============================================================================

interface ExportManifest {
    export_version: string;
    generated_at: string;
    verifier: {
        id: string;
        version: string;
        identity_path: string;
    };
    files: {
        release_index: string;
        ruleset_index: string;
        curated_runs: string;
        verdict_index: string;
        sha256sums: string;
    };
    stats: {
        releases: number;
        rulesets: number;
        curated_runs: number;
        verdicts: number;
        reverified_count: number;
    };
}

interface ReleaseIndexEntry {
    version: string;
    canonical_bundle: string | null;
    canonical_verdict_path: string | null;
}

interface GateResult {
    gate_id: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    details?: {
        checks_passed: number;
        checks_failed: number;
        failures: string[];
    };
}

// =============================================================================
// Helpers
// =============================================================================

function hashFile(filePath: string): string {
    const content = readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

// =============================================================================
// Main Gate Logic
// =============================================================================

async function runGate12(): Promise<GateResult> {
    const VLAB_ROOT = join(__dirname, '../..');
    const EXPORT_DIR = join(VLAB_ROOT, 'export');
    const MANIFEST_PATH = join(EXPORT_DIR, 'manifest.json');
    const REVERIFICATION_DIR = join(VLAB_ROOT, 'reverification');

    const failures: string[] = [];
    let checksPass = 0;
    let checksFail = 0;

    // Check 1: manifest.json exists
    if (!existsSync(MANIFEST_PATH)) {
        return {
            gate_id: 'gate-12-export-consistency',
            status: 'FAIL',
            message: 'export/manifest.json not found',
        };
    }
    checksPass++;

    // Check 2: manifest.json has valid structure
    let manifest: ExportManifest;
    try {
        manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));

        const requiredFields = ['export_version', 'generated_at', 'verifier', 'files', 'stats'];
        for (const field of requiredFields) {
            if (!(field in manifest)) {
                failures.push(`manifest missing required field: ${field}`);
                checksFail++;
            } else {
                checksPass++;
            }
        }
    } catch (err) {
        return {
            gate_id: 'gate-12-export-consistency',
            status: 'FAIL',
            message: `Failed to parse manifest.json: ${(err as Error).message}`,
        };
    }

    // Check 3: All referenced files exist
    const filesToCheck = [
        manifest.files.release_index,
        manifest.files.ruleset_index,
        manifest.files.curated_runs,
        manifest.files.verdict_index,
        manifest.files.sha256sums,
    ];

    for (const relPath of filesToCheck) {
        const absPath = join(VLAB_ROOT, relPath);
        if (!existsSync(absPath)) {
            failures.push(`Referenced file not found: ${relPath}`);
            checksFail++;
        } else {
            checksPass++;
        }
    }

    // Check 4: sha256sums.txt matches actual files
    const sha256sumsPath = join(VLAB_ROOT, manifest.files.sha256sums);
    if (existsSync(sha256sumsPath)) {
        const sumsContent = readFileSync(sha256sumsPath, 'utf-8');
        const lines = sumsContent.trim().split('\n');

        for (const line of lines) {
            const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
            if (!match) continue;

            const [, expectedHash, fileName] = match;
            const filePath = join(EXPORT_DIR, fileName);

            if (!existsSync(filePath)) {
                failures.push(`File in sha256sums not found: ${fileName}`);
                checksFail++;
                continue;
            }

            const actualHash = hashFile(filePath);
            if (actualHash !== expectedHash) {
                failures.push(`Hash mismatch for ${fileName}: expected ${expectedHash.slice(0, 16)}..., got ${actualHash.slice(0, 16)}...`);
                checksFail++;
            } else {
                checksPass++;
            }
        }
    }

    // Check 5: release-index canonical bundles match Gate-11 selection
    const releaseIndexPath = join(VLAB_ROOT, manifest.files.release_index);
    if (existsSync(releaseIndexPath)) {
        try {
            const releaseIndex = JSON.parse(readFileSync(releaseIndexPath, 'utf-8')) as { releases: ReleaseIndexEntry[] };

            for (const release of releaseIndex.releases) {
                if (!release.canonical_bundle) continue;

                // Use SSOT canonical bundle selection
                const canonical = selectCanonicalBundle(REVERIFICATION_DIR, release.version);
                const ssotBundle = canonical?.bundleName ?? null;

                if (ssotBundle && ssotBundle !== release.canonical_bundle) {
                    failures.push(`Canonical bundle mismatch for ${release.version}: export has ${release.canonical_bundle}, SSOT expects ${ssotBundle}`);
                    checksFail++;
                } else if (ssotBundle) {
                    checksPass++;
                }
            }
        } catch (err) {
            failures.push(`Failed to parse release-index.json: ${(err as Error).message}`);
            checksFail++;
        }
    }

    // Result
    if (failures.length > 0) {
        return {
            gate_id: 'gate-12-export-consistency',
            status: 'FAIL',
            message: `${failures.length} export consistency check(s) failed`,
            details: {
                checks_passed: checksPass,
                checks_failed: checksFail,
                failures,
            },
        };
    }

    return {
        gate_id: 'gate-12-export-consistency',
        status: 'PASS',
        message: `All ${checksPass} export consistency checks passed`,
        details: {
            checks_passed: checksPass,
            checks_failed: 0,
            failures: [],
        },
    };
}

// =============================================================================
// Entry Point
// =============================================================================

export default async function gate12(): Promise<void> {
    console.log('\n🚪 Gate 12: Export Consistency\n');

    const result = await runGate12();

    if (result.status === 'PASS') {
        console.log(`✅ PASS: ${result.message}`);
    } else if (result.status === 'SKIP') {
        console.log(`⏭️  SKIP: ${result.message}`);
    } else {
        console.log(`❌ FAIL: ${result.message}`);
        if (result.details?.failures) {
            for (const failure of result.details.failures) {
                console.log(`   - ${failure}`);
            }
        }
        throw new Error(`Gate 12 FAILED: ${result.message}`);
    }
}

export { runGate12 };
