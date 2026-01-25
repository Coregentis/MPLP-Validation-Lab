import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { adjudicate } from '../lib/adjudication/adjudicate';

/**
 * derive:shadow
 * 
 * v0.11 Shadow Adjudication Pipeline
 * Executes dual-ruleset adjudication against a locked input set.
 */

const PROJECT_ROOT = process.cwd();
const SHADOW_INPUT_PATH = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs/shadow-input.json');
const SAMPLE_SET_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const DIFFPACKS_BASE_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');
const DERIVED_SHADOW_BASE_DIR = path.join(PROJECT_ROOT, 'data/derived/shadow');

function getFileHash(filePath: string): string {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
    const args = process.argv.slice(2);
    const fromIndex = args.indexOf('--from');
    const toIndex = args.indexOf('--to');

    if (fromIndex === -1 || toIndex === -1 || !args[fromIndex + 1] || !args[toIndex + 1]) {
        console.error('Usage: npx tsx scripts/derive-shadow.ts --from <ruleset-x> --to <ruleset-y>');
        process.exit(1);
    }

    const rulesetFrom = args[fromIndex + 1];
    const rulesetTo = args[toIndex + 1];
    const diffId = `${rulesetFrom}__${rulesetTo}`;

    console.log(`🚀 Starting Shadow Adjudication: ${diffId}`);

    // 1. Validate Shadow Input SSOT
    if (!fs.existsSync(SHADOW_INPUT_PATH)) {
        console.error(`❌ Shadow input SSOT missing: ${SHADOW_INPUT_PATH}`);
        process.exit(1);
    }
    const shadowInput = JSON.parse(fs.readFileSync(SHADOW_INPUT_PATH, 'utf8'));

    if (shadowInput.ruleset_from !== rulesetFrom || shadowInput.ruleset_to !== rulesetTo) {
        console.error(`❌ Ruleset mismatch! CLI: ${rulesetFrom}->${rulesetTo}, SSOT: ${shadowInput.ruleset_from}->${shadowInput.ruleset_to}`);
        process.exit(1);
    }

    const shadowInputHash = getFileHash(SHADOW_INPUT_PATH);
    console.log(`✅ Shadow Input Locked: ${shadowInputHash.substring(0, 16)}...`);

    // 2. Load Sample Set
    if (!fs.existsSync(SAMPLE_SET_PATH)) {
        console.error(`❌ Sample set missing: ${SAMPLE_SET_PATH}`);
        process.exit(1);
    }
    const sampleSetManifest = JSON.parse(fs.readFileSync(SAMPLE_SET_PATH, 'utf8'));
    const sampleSetManifestHash = getFileHash(SAMPLE_SET_PATH);

    if (sampleSetManifestHash !== shadowInput.sample_set_manifest_sha256) {
        console.error(`❌ Sample set hash mismatch! Expected: ${shadowInput.sample_set_manifest_sha256}`);
        process.exit(1);
    }

    const runs = sampleSetManifest.runs || [];
    console.log(`📦 Adjudicating ${runs.length} runs...`);

    // 3. Execution Loop
    const deltas: any[] = [];
    let verdictFlips = 0;
    let totalEquivalenceRuns = 0;
    let equivalenceMatchesFrom = 0;
    let equivalenceMatchesTo = 0;

    for (const run of runs) {
        const runId = run.run_id;
        console.log(`\n🔹 Processing ${runId}...`);

        // Adjudicate FROM
        // NOTE: We wrap in try-catch to allow partial completion if one run fails
        try {
            const resFrom = await adjudicate(runId, { ruleset_version: rulesetFrom });
            const resTo = await adjudicate(runId, { ruleset_version: rulesetTo });

            const delta = {
                run_id: runId,
                scenario_family: run.scenario_family || 'unknown',
                substrate: run.substrate || 'unknown',
                verdict_from: resFrom.verdict.overall_status,
                verdict_to: resTo.verdict.overall_status,
                hash_from: resFrom.verdict.verdict_hash,
                hash_to: resTo.verdict.verdict_hash,
                changed: resFrom.verdict.verdict_hash !== resTo.verdict.verdict_hash
            };

            if (resFrom.verdict.overall_status !== resTo.verdict.overall_status) {
                verdictFlips++;
            }

            // Simple Equivalence Mock (since real equivalence needs more complex logic)
            // For now we just track if verdict hash is stable
            totalEquivalenceRuns++;
            if (delta.verdict_from === 'ADJUDICATED') equivalenceMatchesFrom++;
            if (delta.verdict_to === 'ADJUDICATED') equivalenceMatchesTo++;

            deltas.push(delta);
        } catch (e) {
            console.error(`❌ Failed to adjudicate ${runId}:`, (e as Error).message);
        }
    }

    // 4. Calculate Final Metrics
    const fromRate = totalEquivalenceRuns > 0 ? (equivalenceMatchesFrom / totalEquivalenceRuns) : 0;
    const toRate = totalEquivalenceRuns > 0 ? (equivalenceMatchesTo / totalEquivalenceRuns) : 0;

    const summary = {
        diff_id: diffId,
        generated_at: new Date().toISOString(),
        input_integrity: {
            shadow_input_sha256: shadowInputHash,
            sample_set_sha256: sampleSetManifestHash
        },
        metrics: {
            total_runs: runs.length,
            verdict_flips: verdictFlips,
            equivalence_shift: {
                from_rate: parseFloat(fromRate.toFixed(4)),
                to_rate: parseFloat(toRate.toFixed(4)),
                delta: parseFloat((toRate - fromRate).toFixed(4))
            }
        }
    };

    // 5. Write Outputs
    const derivedDir = path.join(DERIVED_SHADOW_BASE_DIR, diffId);
    const publicDir = path.join(DIFFPACKS_BASE_DIR, diffId);
    fs.mkdirSync(derivedDir, { recursive: true });
    fs.mkdirSync(publicDir, { recursive: true });

    const summaryPath = path.join(derivedDir, 'shadow-summary.json');
    const deltasPath = path.join(derivedDir, 'shadow-deltas.json');

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    fs.writeFileSync(deltasPath, JSON.stringify(deltas, null, 2));
    fs.writeFileSync(path.join(publicDir, 'shadow-summary.json'), JSON.stringify(summary, null, 2));

    const summaryHash = getFileHash(summaryPath);
    const deltasHash = getFileHash(deltasPath);

    // 6. Update DiffPack
    const diffpackPath = path.join(publicDir, 'diffpack.json');
    if (fs.existsSync(diffpackPath)) {
        const diffpack = JSON.parse(fs.readFileSync(diffpackPath, 'utf8'));
        diffpack.metrics = summary.metrics;
        diffpack.integrity = {
            shadow_summary_sha256: summaryHash,
            shadow_deltas_sha256: deltasHash
        };
        fs.writeFileSync(diffpackPath, JSON.stringify(diffpack, null, 4));
        console.log(`\n✅ Updated diffpack.json at ${diffpackPath}`);
    }

    console.log(`\n📊 Shadow Adjudication Complete`);
    console.log(`   Verdict Flips: ${verdictFlips}`);
    console.log(`   Equivalence: ${summary.metrics.equivalence_shift.from_rate} -> ${summary.metrics.equivalence_shift.to_rate}`);
    console.log(`   Summary Hash: ${summaryHash.substring(0, 16)}...`);
}

main().catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
});
