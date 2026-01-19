/**
 * Recheck Verdict Hash (Read-Only)
 * 
 * Verifies an existing adjudication bundle WITHOUT modifying it.
 * This script:
 * 1. Reads verdict.json from the bundle
 * 2. Recomputes verdict_hash using deterministicHash
 * 3. Compares with the stored hash
 * 
 * GOVERNANCE: This is a READ-ONLY verification tool.
 * It does not write any files or modify the bundle.
 * 
 * Usage: npm run vlab:recheck-hash <run_id>
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { computeDeterministicHash } from '../lib/adjudication/deterministicHash';

const VLAB_ROOT = process.cwd();
const ADJUDICATION_DIR = join(VLAB_ROOT, 'adjudication');

interface Verdict {
    verdict_hash?: string;
    [key: string]: unknown;
}

async function recheckHash(runId: string): Promise<void> {
    console.log(`\n🔍 Recheck Verdict Hash (Read-Only)\n`);
    console.log(`   Run ID: ${runId}`);
    console.log(`   Mode: READ-ONLY (no files modified)\n`);

    // Check bundle exists
    const bundlePath = join(ADJUDICATION_DIR, runId);
    if (!existsSync(bundlePath)) {
        console.error(`❌ Bundle not found: adjudication/${runId}/`);
        process.exit(1);
    }

    // Read verdict.json
    const verdictPath = join(bundlePath, 'verdict.json');
    if (!existsSync(verdictPath)) {
        console.error(`❌ verdict.json not found in bundle`);
        process.exit(1);
    }

    let verdict: Verdict;
    try {
        verdict = JSON.parse(readFileSync(verdictPath, 'utf-8'));
    } catch (err) {
        console.error(`❌ Failed to parse verdict.json: ${(err as Error).message}`);
        process.exit(1);
    }

    const storedHash = verdict.verdict_hash;
    if (!storedHash) {
        console.error(`❌ verdict_hash field missing in verdict.json`);
        process.exit(1);
    }

    // Recompute hash
    console.log(`   Stored hash:     ${storedHash}`);

    const recomputedHash = computeDeterministicHash(verdict);
    console.log(`   Recomputed hash: ${recomputedHash}`);

    // Compare
    if (storedHash === recomputedHash) {
        console.log(`\n✅ MATCH: verdict_hash is deterministic and valid`);
        console.log(`   The same input will always produce the same hash.\n`);
    } else {
        console.log(`\n❌ MISMATCH: verdict_hash does not match recomputation`);
        console.log(`   This may indicate bundle corruption or tampering.\n`);
        process.exit(1);
    }

    // Also check sha256sums if present
    const sha256Path = join(bundlePath, 'sha256sums.txt');
    if (existsSync(sha256Path)) {
        console.log(`📋 To verify file integrity, run:`);
        console.log(`   cd adjudication/${runId} && sha256sum -c sha256sums.txt\n`);
    }
}

// Entry point
const runId = process.argv[2];
if (!runId) {
    console.error('Usage: npm run vlab:recheck-hash <run_id>');
    process.exit(1);
}

recheckHash(runId).catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
