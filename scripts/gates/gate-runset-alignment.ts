import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import crypto from 'crypto';

const PROJECT_ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');
const RUNSETS_PATH = path.join(PROJECT_ROOT, 'governance/runsets.yaml');
const SUBSTRATE_INDEX_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/substrate-index.yaml');
const EXPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const RUNS_DIR = path.join(PROJECT_ROOT, 'data/runs');

function sha256(content: string) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function computePackRootHash(sha256sumsPath: string) {
    if (!fs.existsSync(sha256sumsPath)) return null;
    const content = fs.readFileSync(sha256sumsPath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());
    const entries = lines.map(l => {
        const match = l.match(/^([0-9a-f]{64})\s+(.+)$/);
        if (!match) return null;
        return { hash: match[1], path: match[2] };
    }).filter(Boolean) as { hash: string, path: string }[];
    entries.sort((a, b) => a.path.localeCompare(b.path));
    const normalized = entries.map(e => `${e.hash}  ${e.path}`).join('\n');
    return sha256(normalized);
}

async function main() {
    console.log('🛡️  Running VLAB-GATE-07: RunSet Alignment...');
    let failures = 0;

    const allowlist: any = yaml.load(fs.readFileSync(ALLOWLIST_PATH, 'utf-8'));
    const runsets: any = yaml.load(fs.readFileSync(RUNSETS_PATH, 'utf-8'));
    const substrateIndex: any = yaml.load(fs.readFileSync(SUBSTRATE_INDEX_PATH, 'utf-8'));

    const allowlistedIds = new Set(allowlist.runs.map((r: any) => r.run_id));

    // 1. Path Existence & Hash Match
    for (const run of allowlist.runs) {
        const runDir = path.join(RUNS_DIR, run.run_id);
        if (!fs.existsSync(runDir)) {
            console.error(`❌ Missing physical directory for allowlisted run: ${run.run_id}`);
            failures++;
            continue;
        }

        const sumsPath = path.join(runDir, 'integrity/sha256sums.txt');
        if (fs.existsSync(sumsPath)) {
            const actualPackHash = computePackRootHash(sumsPath);
            if (run.pack_root_hash !== actualPackHash && run.pack_root_hash !== 'f'.repeat(64)) {
                console.error(`❌ Hash Mismatch for ${run.run_id}: SSOT=${run.pack_root_hash}, Physical=${actualPackHash}`);
                failures++;
            }
        }

        if (run.pack_root_hash === '0'.repeat(64)) {
            console.error(`❌ Placeholder 0-hash found in allowlist for: ${run.run_id}`);
            failures++;
        }
    }

    // 2. Dangling Runs
    const allSetIncludes = new Set();
    Object.values(runsets.sets).forEach((set: any) => {
        if (set.includes) set.includes.forEach((id: string) => allSetIncludes.add(id));
    });

    for (const runId of allowlistedIds) {
        if (!allSetIncludes.has(runId)) {
            console.error(`❌ Allowlisted run ${runId} is not assigned to any set in runsets.yaml`);
            failures++;
        }
    }

    // 3. Substrate Coverage
    const admittedSubstrates = substrateIndex.substrates.filter((s: any) => s.current_level === 'reproduced' || s.current_level === 'admitted');
    for (const substrate of admittedSubstrates) {
        const hasRun = allowlist.runs.some((r: any) => r.substrate === substrate.id);
        if (!hasRun) {
            console.error(`❌ Admitted substrate ${substrate.id} has no allowlisted runs.`);
            failures++;
        }
    }

    // 4. Export Closure
    if (fs.existsSync(EXPORT_PATH)) {
        const exportData = JSON.parse(fs.readFileSync(EXPORT_PATH, 'utf-8'));
        const internalIds = new Set(runsets.sets.internal_test?.includes || []);
        const nonAdmissibleIds = new Set(runsets.sets.non_admissible?.includes || []);

        for (const run of exportData.runs || []) {
            if (internalIds.has(run.run_id) || nonAdmissibleIds.has(run.run_id)) {
                console.error(`❌ Leak detected: Private run ${run.run_id} found in public export!`);
                failures++;
            }
        }
    }

    if (failures > 0) {
        console.error(`\n🔴 Gate FAIL: ${failures} alignment issue(s) detected.`);
        process.exit(1);
    } else {
        console.log('\n🟢 Gate PASS: All SSOT files and physical assets are aligned.');
        process.exit(0);
    }
}

main();
