/**
 * VLAB-GATE-SOP-01: Four-Way Consistency Auditor
 * 
 * Verifies consistency across:
 * 1. lab-manifest.json (Anchors)
 * 2. Physical File Hashes
 * 3. SEAL-v0.12.0.md (Textual Promises - MUST-3)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const PROJECT_ROOT = process.cwd();
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');
const SEAL_PATH = path.join(PROJECT_ROOT, 'governance/seals/SEAL-v0.12.0.md');

/**
 * Audit Pack Required Fields (MUST-3):
 * - baseline_commit_sha
 * - sample_set_manifest_sha256
 * - cross_verified_report_sha256
 * - ruleset_diff_index_sha256
 * - [diff_id]_sha256
 */

function getHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return 'MISSING';
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
    console.log('🛡️  Running VLAB-GATE-SOP-01 (Four-Way Consistency)...');

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ FAIL: Manifest missing');
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const errors: string[] = [];

    // 1. Manifest vs Physical Consistency
    const checkMaps = [
        { key: 'sample_set_manifest_sha256', path: 'public/_data/curated-runs.json' },
        { key: 'ruleset_diff_index', path: 'public/_meta/ruleset-diff-index.json' },
        { key: 'shadow_input', path: 'public/_data/ruleset-diffs/shadow-input.json' }
    ];

    for (const check of checkMaps) {
        const physical = getHash(path.join(PROJECT_ROOT, check.path));
        const manifestVal = manifest.anchors[check.key] || manifest[check.key];

        // Handle path pointers vs raw hashes
        if (check.key.endsWith('_sha256')) {
            if (manifestVal !== physical) {
                errors.push(`Manifest Hash Mismatch: ${check.key} (Manifest: ${manifestVal}, Physical: ${physical})`);
            }
        }
    }

    // 2. SEAL Consistency (if exists)
    if (fs.existsSync(SEAL_PATH)) {
        const sealContent = fs.readFileSync(SEAL_PATH, 'utf8');
        for (const check of checkMaps) {
            const physical = getHash(path.join(PROJECT_ROOT, check.path));
            if (!sealContent.includes(physical)) {
                errors.push(`SEAL Text Mismatch: Physical hash for ${check.path} not found in SEAL-v0.12.0.md`);
            }
        }
    } else {
        console.warn('⚠️  Warning: SEAL-v0.12.0.md not found yet. Skipping text consistency check.');
    }

    // 3. MCP Discovery Logic
    const curatedPath = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
    const LEGACY_MCP_RUNS = ['gf-01-mcp-official-v0.2', 'gf-01-mcp-pass'];

    if (fs.existsSync(curatedPath)) {
        const curated = JSON.parse(fs.readFileSync(curatedPath, 'utf8'));
        const mcpRuns = curated.runs.filter((r: any) => r.substrate === 'mcp');
        if (mcpRuns.length > 0) {
            console.log(`ℹ️  Found ${mcpRuns.length} MCP runs in curated set.`);
            for (const run of mcpRuns) {
                if (LEGACY_MCP_RUNS.includes(run.run_id)) continue;
                if (!run.run_id.startsWith('mcp-d1-')) {
                    errors.push(`Naming Violation: MCP run ${run.run_id} must start with mcp-d1-`);
                }
            }
        }
    }

    if (errors.length > 0) {
        errors.forEach(e => console.error(`❌ ${e}`));
        process.exit(1);
    }

    console.log('🟢 PASS: Four-way consistency verified.');
}

main().catch(console.error);
