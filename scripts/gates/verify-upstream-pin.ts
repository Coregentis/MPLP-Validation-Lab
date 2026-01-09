/**
 * VLAB-GATE-00: Upstream Pin Verification
 * 
 * Verifies that:
 * 1. UPSTREAM_BASELINE.yaml exists with valid commit
 * 2. SYNC_REPORT.json exists and references same commit
 * 3. Synced files exist and hashes match
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const yaml = require('js-yaml');

interface UpstreamBaseline {
    upstream: {
        repo: string;
        commit: string;
    };
}

interface SyncedFile {
    path: string;
    sha256: string;
    bytes: number;
}

interface SyncReport {
    upstream: {
        repo: string;
        commit: string;
    };
    sync: {
        schemas: { files: SyncedFile[] };
        invariants?: { files: SyncedFile[] };
    };
    integrity: {
        schemas_bundle_sha256: string;
        invariants_bundle_sha256?: string;
        report_sha256: string;
    };
}

function sha256(content: Buffer | string): string {
    return createHash('sha256').update(content).digest('hex');
}

function verifyFileHash(targetDir: string, file: SyncedFile): boolean {
    const filePath = join(targetDir, file.path);
    if (!existsSync(filePath)) {
        console.error(`    ❌ File missing: ${file.path}`);
        return false;
    }

    const content = readFileSync(filePath);
    const actualHash = sha256(content);

    if (actualHash !== file.sha256) {
        console.error(`    ❌ Hash mismatch: ${file.path}`);
        console.error(`       Expected: ${file.sha256.slice(0, 16)}...`);
        console.error(`       Actual:   ${actualHash.slice(0, 16)}...`);
        return false;
    }

    return true;
}

async function main() {
    console.log('=== VLAB-GATE-00: Upstream Pin Verification ===\n');

    let passed = true;

    // Check 1: Baseline exists
    console.log('Check 1: UPSTREAM_BASELINE.yaml exists');
    const baselinePath = join(process.cwd(), 'UPSTREAM_BASELINE.yaml');
    if (!existsSync(baselinePath)) {
        console.error('  ❌ FAIL: UPSTREAM_BASELINE.yaml not found');
        process.exit(1);
    }
    console.log('  ✓ PASS\n');

    const baseline = yaml.load(readFileSync(baselinePath, 'utf-8')) as UpstreamBaseline;

    // Check 2: Commit SHA valid
    console.log('Check 2: Commit SHA valid');
    if (!baseline.upstream.commit || baseline.upstream.commit.length !== 40) {
        console.error('  ❌ FAIL: Invalid commit SHA (must be 40 chars)');
        passed = false;
    } else {
        console.log(`  ✓ PASS: ${baseline.upstream.commit.slice(0, 8)}...`);
    }
    console.log();

    // Check 3: SYNC_REPORT.json exists
    console.log('Check 3: SYNC_REPORT.json exists');
    const reportPath = join(process.cwd(), 'SYNC_REPORT.json');
    if (!existsSync(reportPath)) {
        console.error('  ❌ FAIL: SYNC_REPORT.json not found');
        console.error('  → Run: pnpm sync:all');
        process.exit(1);
    }
    console.log('  ✓ PASS\n');

    const report: SyncReport = JSON.parse(readFileSync(reportPath, 'utf-8'));

    // Check 4: Commit match
    console.log('Check 4: Report commit matches baseline');
    if (report.upstream.commit !== baseline.upstream.commit) {
        console.error('  ❌ FAIL: Commit mismatch');
        console.error(`     Baseline: ${baseline.upstream.commit.slice(0, 8)}...`);
        console.error(`     Report:   ${report.upstream.commit.slice(0, 8)}...`);
        passed = false;
    } else {
        console.log('  ✓ PASS\n');
    }

    // Check 5: Schema files hash verification
    console.log('Check 5: Schema files integrity');
    const schemasDir = join(process.cwd(), 'lib/schemas');
    let schemasPassed = true;
    for (const file of report.sync.schemas.files) {
        if (!verifyFileHash(schemasDir, file)) {
            schemasPassed = false;
        }
    }
    if (schemasPassed) {
        console.log(`  ✓ PASS: ${report.sync.schemas.files.length} files verified`);
    } else {
        passed = false;
    }
    console.log();

    // Check 6: Invariant files hash verification (if present)
    if (report.sync.invariants) {
        console.log('Check 6: Invariant files integrity');
        const invariantsDir = join(process.cwd(), 'lib/invariants');
        let invariantsPassed = true;
        for (const file of report.sync.invariants.files) {
            if (!verifyFileHash(invariantsDir, file)) {
                invariantsPassed = false;
            }
        }
        if (invariantsPassed) {
            console.log(`  ✓ PASS: ${report.sync.invariants.files.length} files verified`);
        } else {
            passed = false;
        }
        console.log();
    }

    // Final verdict
    console.log('=== GATE-00 VERDICT ===');
    if (passed) {
        console.log('✅ PASS: Upstream pin verified');
        console.log(`   Commit: ${baseline.upstream.commit}`);
        console.log(`   Report SHA: ${report.integrity.report_sha256.slice(0, 16)}...`);
        process.exit(0);
    } else {
        console.log('❌ FAIL: Verification failed');
        process.exit(1);
    }
}

main().catch(err => {
    console.error('❌ GATE-00 ERROR:', err);
    process.exit(1);
});
