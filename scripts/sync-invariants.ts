/**
 * sync-invariants.ts
 * 
 * Syncs invariants from upstream MPLP-Protocol repository based on UPSTREAM_BASELINE.yaml
 * 
 * GOVERNANCE: This script MUST only read from the pinned commit in UPSTREAM_BASELINE.yaml
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { createHash } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const yaml = require('js-yaml');

interface UpstreamBaseline {
    upstream: {
        repo: string;
        repo_local_path: string;
        commit: string;
        tag?: string;
        protocol_version: string;
        baseline_created: string;
    };
    synced_paths: Array<{
        source: string;
        target: string;
    }>;
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
        pinned_at: string;
    };
    sync: {
        schemas: {
            source_path: string;
            target_path: string;
            files: SyncedFile[];
        };
        invariants: {
            source_path: string;
            target_path: string;
            files: SyncedFile[];
        };
    };
    integrity: {
        schemas_bundle_sha256: string;
        invariants_bundle_sha256: string;
        report_sha256: string;
    };
    generated_at: string;
}

function sha256(content: Buffer | string): string {
    return createHash('sha256').update(content).digest('hex');
}

function calculateBundleHash(files: SyncedFile[]): string {
    const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
    const combined = sorted.map(f => `${f.path}:${f.sha256}`).join('\n');
    return sha256(combined);
}

function syncFile(sourcePath: string, targetPath: string): SyncedFile | null {
    if (!existsSync(sourcePath)) {
        console.warn(`  ⚠ Source not found: ${sourcePath}`);
        return null;
    }

    const content = readFileSync(sourcePath);
    const hash = sha256(content);

    const targetDir = dirname(targetPath);
    if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
    }

    writeFileSync(targetPath, content);

    return {
        path: basename(targetPath),
        sha256: hash,
        bytes: content.length,
    };
}

function syncDirectory(sourceDir: string, targetDir: string): SyncedFile[] {
    const files: SyncedFile[] = [];

    if (!existsSync(sourceDir)) {
        console.warn(`  ⚠ Source directory not found: ${sourceDir}`);
        return files;
    }

    if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
    }

    const entries = readdirSync(sourceDir);

    for (const entry of entries) {
        const sourcePath = join(sourceDir, entry);
        const targetPath = join(targetDir, entry);
        const stat = statSync(sourcePath);

        if (stat.isFile() && (entry.endsWith('.yaml') || entry.endsWith('.yml') || entry.endsWith('.json'))) {
            const synced = syncFile(sourcePath, targetPath);
            if (synced) {
                synced.path = entry;
                files.push(synced);
                console.log(`  ✓ ${entry}`);
            }
        } else if (stat.isDirectory()) {
            const subFiles = syncDirectory(sourcePath, targetPath);
            for (const f of subFiles) {
                f.path = `${entry}/${f.path}`;
                files.push(f);
            }
        }
    }

    return files;
}

async function main() {
    console.log('=== Validation Lab Invariants Sync ===\n');

    const baselinePath = join(process.cwd(), 'UPSTREAM_BASELINE.yaml');
    if (!existsSync(baselinePath)) {
        console.error('❌ UPSTREAM_BASELINE.yaml not found');
        process.exit(1);
    }

    const baseline = yaml.load(readFileSync(baselinePath, 'utf-8')) as UpstreamBaseline;
    console.log(`Upstream: ${baseline.upstream.repo}`);
    console.log(`Commit: ${baseline.upstream.commit}\n`);

    const upstreamPath = join(process.cwd(), baseline.upstream.repo_local_path);
    if (!existsSync(upstreamPath)) {
        console.error(`❌ Upstream repo not found at: ${upstreamPath}`);
        process.exit(1);
    }

    // Sync invariants
    console.log('Syncing invariants...');
    const invariantsSource = join(upstreamPath, 'tests/golden/invariants');
    const invariantsTarget = join(process.cwd(), 'lib/invariants');
    const invariantFiles = syncDirectory(invariantsSource, invariantsTarget);
    console.log(`  → ${invariantFiles.length} invariant files synced\n`);

    // Load existing report
    const reportPath = join(process.cwd(), 'SYNC_REPORT.json');
    if (!existsSync(reportPath)) {
        console.error('❌ SYNC_REPORT.json not found. Run sync:schemas first.');
        process.exit(1);
    }

    const report: SyncReport = JSON.parse(readFileSync(reportPath, 'utf-8'));

    // Update invariants in report
    report.sync.invariants = {
        source_path: 'tests/golden/invariants',
        target_path: 'lib/invariants',
        files: invariantFiles,
    };
    report.integrity.invariants_bundle_sha256 = calculateBundleHash(invariantFiles);
    report.generated_at = new Date().toISOString();

    // Recalculate report hash
    const reportForHash = { ...report, integrity: { ...report.integrity, report_sha256: '' } };
    report.integrity.report_sha256 = sha256(JSON.stringify(reportForHash, null, 2));

    // Write updated report
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Report updated: SYNC_REPORT.json`);
    console.log(`  invariants_bundle_sha256: ${report.integrity.invariants_bundle_sha256.slice(0, 16)}...`);
    console.log(`  report_sha256: ${report.integrity.report_sha256.slice(0, 16)}...`);

    console.log('\n✅ Invariants sync complete');
}

main().catch(err => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
});
