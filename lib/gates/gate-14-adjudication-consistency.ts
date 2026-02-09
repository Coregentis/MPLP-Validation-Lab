/**
 * Gate 14: Adjudication Consistency
 * 
 * Validates that the adjudication-index and all referenced bundles are:
 * 1. Structurally complete (7 files per bundle)
 * 2. Integrity sealed (sha256sums match)
 * 3. Deterministically consistent (verdict_hash reproducible)
 * 
 * GOVERNANCE: This gate enforces the adjudication contract.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import { computeDeterministicHash } from '../adjudication/deterministicHash';

// =============================================================================
// Types
// =============================================================================

interface AdjudicationEntry {
    run_id: string;
    bundle_path: string;
    verdict_path: string;
    verdict_hash: string;
    overall_status: string;
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

const VLAB_ROOT = join(__dirname, '../..');
const EXPORT_DIR = join(VLAB_ROOT, 'export');

const REQUIRED_BUNDLE_FILES = [
    'input.pointer.json',
    'verifier.identity.json',
    'verifier.fingerprint.json',
    'verify.report.json',
    'evaluate.report.json',
    'verdict.json',
    'sha256sums.txt',
];

const VALID_OVERALL_STATUSES = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];

function hashFile(filePath: string): string {
    const content = readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function loadJson(filePath: string): unknown {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
}

// =============================================================================
// Main Gate Logic
// =============================================================================

async function runGate14(): Promise<GateResult> {
    const failures: string[] = [];
    let checksPass = 0;
    let checksFail = 0;

    // Check 1: adjudication-index.json exists in export
    const indexPath = join(EXPORT_DIR, 'adjudication-index.json');
    if (!existsSync(indexPath)) {
        return {
            gate_id: 'gate-14-adjudication-consistency',
            status: 'SKIP',
            message: 'export/adjudication-index.json not found (no adjudications to verify)',
        };
    }
    checksPass++;

    // Check 2: adjudication-index.json is valid JSON
    let adjudicationIndex: { adjudications: AdjudicationEntry[] };
    try {
        adjudicationIndex = loadJson(indexPath) as { adjudications: AdjudicationEntry[] };
        checksPass++;
    } catch (err) {
        return {
            gate_id: 'gate-14-adjudication-consistency',
            status: 'FAIL',
            message: `Failed to parse adjudication-index.json: ${(err as Error).message}`,
        };
    }

    if (!adjudicationIndex.adjudications || adjudicationIndex.adjudications.length === 0) {
        return {
            gate_id: 'gate-14-adjudication-consistency',
            status: 'PASS',
            message: 'No adjudications in index (vacuously consistent)',
            details: { checks_passed: checksPass, checks_failed: 0, failures: [] },
        };
    }

    // Check 3-N: Validate each adjudication bundle
    for (const entry of adjudicationIndex.adjudications) {
        const bundlePath = join(VLAB_ROOT, entry.bundle_path.replace(/\/$/, ''));

        // Check: Bundle directory exists
        if (!existsSync(bundlePath)) {
            failures.push(`${entry.run_id}: bundle directory not found`);
            checksFail++;
            continue;
        }
        checksPass++;

        // Check: All 7 required files exist
        for (const file of REQUIRED_BUNDLE_FILES) {
            const filePath = join(bundlePath, file);
            if (!existsSync(filePath)) {
                failures.push(`${entry.run_id}: missing ${file}`);
                checksFail++;
            } else {
                checksPass++;
            }
        }

        // Check: sha256sums.txt matches actual file hashes
        const sha256sumsPath = join(bundlePath, 'sha256sums.txt');
        if (existsSync(sha256sumsPath)) {
            const sumsContent = readFileSync(sha256sumsPath, 'utf-8');
            const lines = sumsContent.trim().split('\n');

            for (const line of lines) {
                const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
                if (!match) continue;

                const [, expectedHash, fileName] = match;
                const filePath = join(bundlePath, fileName);

                if (existsSync(filePath)) {
                    const actualHash = hashFile(filePath);
                    if (actualHash !== expectedHash) {
                        failures.push(`${entry.run_id}: hash mismatch for ${fileName}`);
                        checksFail++;
                    } else {
                        checksPass++;
                    }
                }
            }
        }

        // Check: verdict.json verdict_hash is deterministically reproducible
        const verdictPath = join(bundlePath, 'verdict.json');
        if (existsSync(verdictPath)) {
            try {
                const verdict = loadJson(verdictPath) as {
                    verdict_hash?: string;
                    overall_status?: string;
                };

                // Verify overall_status is valid
                if (verdict.overall_status && !VALID_OVERALL_STATUSES.includes(verdict.overall_status)) {
                    failures.push(`${entry.run_id}: invalid overall_status '${verdict.overall_status}'`);
                    checksFail++;
                } else {
                    checksPass++;
                }

                // Verify verdict_hash matches what we recompute
                if (verdict.verdict_hash) {
                    // Load full verdict and exclude hash fields for recomputation
                    const fullVerdict = loadJson(verdictPath) as Record<string, unknown>;
                    delete fullVerdict.verdict_hash;
                    delete fullVerdict._meta;

                    const recomputedHash = computeDeterministicHash(fullVerdict);

                    if (recomputedHash !== verdict.verdict_hash) {
                        failures.push(`${entry.run_id}: verdict_hash mismatch (stored vs recomputed)`);
                        checksFail++;
                    } else {
                        checksPass++;
                    }
                }

                // Verify index entry matches bundle
                if (entry.verdict_hash && verdict.verdict_hash !== entry.verdict_hash) {
                    failures.push(`${entry.run_id}: index verdict_hash doesn't match bundle`);
                    checksFail++;
                } else {
                    checksPass++;
                }

            } catch {
                failures.push(`${entry.run_id}: failed to parse verdict.json`);
                checksFail++;
            }
        }
    }

    // Result
    if (failures.length > 0) {
        return {
            gate_id: 'gate-14-adjudication-consistency',
            status: 'FAIL',
            message: `${failures.length} adjudication consistency check(s) failed`,
            details: {
                checks_passed: checksPass,
                checks_failed: checksFail,
                failures,
            },
        };
    }

    return {
        gate_id: 'gate-14-adjudication-consistency',
        status: 'PASS',
        message: `All ${checksPass} adjudication consistency checks passed`,
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

export default async function gate14(): Promise<void> {
    console.log('\n🚪 Gate 14: Adjudication Consistency\n');

    const result = await runGate14();

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
        throw new Error(`Gate 14 FAILED: ${result.message}`);
    }
}

export { runGate14 };
