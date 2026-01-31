/**
 * sync-schemas.ts
 * 
 * Syncs schemas from upstream MPLP-Protocol repository based on UPSTREAM_BASELINE.yaml
 * 
 * GOVERNANCE: This script MUST only read from the pinned commit in UPSTREAM_BASELINE.yaml
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { createHash } from 'crypto';
 
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
        invariants?: {
            source_path: string;
            target_path: string;
            files: SyncedFile[];
        };
    };
    integrity: {
        schemas_bundle_sha256: string;
        invariants_bundle_sha256?: string;
        report_sha256: string;
    };
    generated_at: string;
}

function sha256(content: Buffer | string): string {
    return createHash('sha256').update(content).digest('hex');
}

function calculateBundleHash(files: SyncedFile[]): string {
    // Sort by path for determinism
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

    // Ensure target directory exists
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

    // Ensure target directory exists
    if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
    }

    const entries = readdirSync(sourceDir);

    for (const entry of entries) {
        const sourcePath = join(sourceDir, entry);
        const targetPath = join(targetDir, entry);
        const stat = statSync(sourcePath);

        if (stat.isFile() && (entry.endsWith('.json') || entry.endsWith('.yaml') || entry.endsWith('.yml'))) {
            const synced = syncFile(sourcePath, targetPath);
            if (synced) {
                synced.path = entry; // Use relative path
                files.push(synced);
                console.log(`  ✓ ${entry}`);
            }
        } else if (stat.isDirectory()) {
            // Recursively sync subdirectories
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
    console.log('=== Validation Lab Schema Sync ===\n');

    // Read baseline
    const baselinePath = join(process.cwd(), 'UPSTREAM_BASELINE.yaml');
    if (!existsSync(baselinePath)) {
        console.error('❌ UPSTREAM_BASELINE.yaml not found');
        process.exit(1);
    }

    const baseline = yaml.load(readFileSync(baselinePath, 'utf-8')) as UpstreamBaseline;
    console.log(`Upstream: ${baseline.upstream.repo}`);
    console.log(`Commit: ${baseline.upstream.commit}`);
    console.log(`Protocol: ${baseline.upstream.protocol_version}\n`);

    // Resolve upstream path
    const upstreamPath = join(process.cwd(), baseline.upstream.repo_local_path);
    if (!existsSync(upstreamPath)) {
        console.error(`❌ Upstream repo not found at: ${upstreamPath}`);
        process.exit(1);
    }

    // Sync schemas
    console.log('Syncing schemas...');
    const schemasSource = join(upstreamPath, 'schemas/v2');
    const schemasTarget = join(process.cwd(), 'lib/schemas');
    const schemaFiles = syncDirectory(schemasSource, schemasTarget);
    console.log(`  → ${schemaFiles.length} schema files synced\n`);

    // Initialize report (will be completed by sync-invariants or loaded if exists)
    const existingReportPath = join(process.cwd(), 'SYNC_REPORT.json');
    let report: SyncReport;

    if (existsSync(existingReportPath)) {
        report = JSON.parse(readFileSync(existingReportPath, 'utf-8'));
    } else {
        report = {
            upstream: {
                repo: baseline.upstream.repo,
                commit: baseline.upstream.commit,
                pinned_at: baseline.upstream.baseline_created,
            },
            sync: {
                schemas: {
                    source_path: 'schemas/v2',
                    target_path: 'lib/schemas',
                    files: [],
                },
            },
            integrity: {
                schemas_bundle_sha256: '',
                report_sha256: '',
            },
            generated_at: new Date().toISOString(),
        };
    }

    // Update schemas in report
    report.sync.schemas.files = schemaFiles;
    report.integrity.schemas_bundle_sha256 = calculateBundleHash(schemaFiles);
    report.generated_at = new Date().toISOString();

    // Calculate final report hash (excluding report_sha256 field)
    const reportForHash = { ...report, integrity: { ...report.integrity, report_sha256: '' } };
    report.integrity.report_sha256 = sha256(JSON.stringify(reportForHash, null, 2));

    // Write report
    writeFileSync(existingReportPath, JSON.stringify(report, null, 2));
    console.log(`Report written to SYNC_REPORT.json`);
    console.log(`  schemas_bundle_sha256: ${report.integrity.schemas_bundle_sha256.slice(0, 16)}...`);
    console.log(`  report_sha256: ${report.integrity.report_sha256.slice(0, 16)}...`);

    console.log('\n✅ Schema sync complete');
}

main().catch(err => {
    console.error('❌ Sync failed:', err);
    process.exit(1);
});
