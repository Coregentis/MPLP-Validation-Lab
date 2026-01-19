#!/usr/bin/env node
import { getCuratedRuns } from '../curated/load-curated-runs';
import fs from 'fs';
import path from 'path';

interface Gate10Result {
    passed: boolean;
    checks: number;
    failures: string[];
}

function runGate10(): Gate10Result {
    const failures: string[] = [];
    let checks = 0;

    // Check 1: Artifact exists and has 3 runs
    try {
        const data = getCuratedRuns();
        checks++;

        if (data.runs.length !== 3) {
            failures.push(`Expected 3 runs, got ${data.runs.length}`);
        }
    } catch (e) {
        failures.push(`Failed to load curated runs: ${e instanceof Error ? e.message : String(e)}`);
        return { passed: false, checks, failures };
    }

    // Check 2: Required run_ids exist
    const data = getCuratedRuns();
    checks++;

    const requiredIds = ['gf-01-a2a-pass', 'gf-01-langchain-pass', 'gf-01-mcp-pass'];
    const actualIds = data.runs.map(r => r.run_id);

    for (const id of requiredIds) {
        if (!actualIds.includes(id)) {
            failures.push(`Missing required run_id: ${id}`);
        }
    }

    // Check 3: All hashes are valid 64-char hex
    checks++;
    const hexPattern = /^[0-9a-f]{64}$/;

    for (const run of data.runs) {
        if (!hexPattern.test(run.verdict_hash)) {
            failures.push(`${run.run_id}: invalid verdict_hash format`);
        }
        if (!hexPattern.test(run.pack_root_hash)) {
            failures.push(`${run.run_id}: invalid pack_root_hash format`);
        }
    }

    // Check 4: No SSOT direct usage or YAML parsing in UI layer
    checks++;

    const UI_DIRS = ['app', 'components'];
    const ALLOWLISTED_MENTIONS = new Set([
        'lib/curated/ssot.ts', // Allowed to mention SSOT path by design
    ]);

    for (const dir of UI_DIRS) {
        if (!fs.existsSync(dir)) continue;

        const files = getAllFiles(dir).filter(f => /\.(ts|tsx|js|jsx|md|mdx)$/.test(f));
        for (const abs of files) {
            const rel = path.relative(process.cwd(), abs).split(path.sep).join('/');
            if (ALLOWLISTED_MENTIONS.has(rel)) continue;

            const content = fs.readFileSync(abs, 'utf-8');

            // Drift signal 1: UI references SSOT directly
            if (content.includes('data/curated-runs/allowlist.yaml') || content.includes('allowlist.yaml')) {
                failures.push(`${rel}: references allowlist.yaml (must read curated-runs.json artifact)`);
            }

            // Drift signal 2: YAML parsing in UI layer (forbidden capability)
            if (content.includes('js-yaml') || content.includes('yaml.load(')) {
                failures.push(`${rel}: YAML parsing detected in UI layer`);
            }
        }
    }

    return { passed: failures.length === 0, checks, failures };
}

function getAllFiles(dir: string): string[] {
    const out: string[] = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && !e.name.startsWith('.') && e.name !== 'node_modules') {
            out.push(...getAllFiles(p));
        } else if (e.isFile()) {
            out.push(p);
        }
    }
    return out;
}

// CLI
if (require.main === module) {
    const result = runGate10();

    console.log('='.repeat(60));
    console.log('GATE-10: Curated Runs Invariants');
    console.log('='.repeat(60));
    console.log(`\nChecks performed: ${result.checks}`);

    if (result.passed) {
        console.log('\n✅ GATE-10 PASSED');
        process.exit(0);
    } else {
        console.log(`\n❌ GATE-10 FAILED (${result.failures.length} failures)\n`);
        for (const failure of result.failures) {
            console.log(`  - ${failure}`);
        }
        process.exit(1);
    }
}

export { runGate10 };
