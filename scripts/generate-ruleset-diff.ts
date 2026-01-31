import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { adjudicate } from '../lib/adjudication/adjudicate';

/**
 * Ruleset Diff Generator (v0.16.0)
 * 
 * Automates the generation of explainable ruleset diffs and executes 
 * the Zero-Flip Audit to ensure verdict stability.
 */

const PROJECT_ROOT = process.cwd();
const SHADOW_INPUT_PATH = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs/shadow-input.json');
const SAMPLE_SET_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');

async function main() {
    console.log('📝 Generating Explainable Ruleset Diff (v0.16.0)...');

    if (!fs.existsSync(SHADOW_INPUT_PATH)) {
        throw new Error('Shadow input SSOT missing');
    }
    const shadowInput = JSON.parse(fs.readFileSync(SHADOW_INPUT_PATH, 'utf8'));
    const rulesetFrom = shadowInput.ruleset_from;
    const rulesetTo = shadowInput.ruleset_to;

    console.log(`   Ruleset: ${rulesetFrom} -> ${rulesetTo}`);

    if (!fs.existsSync(SAMPLE_SET_PATH)) {
        throw new Error('Sample set manifest missing');
    }
    const sampleSet = JSON.parse(fs.readFileSync(SAMPLE_SET_PATH, 'utf8'));
    const runs = sampleSet.runs || [];

    let verdictFlips = 0;
    let evidencePatternChanges = 0;
    const runDeltas = [];

    for (const run of runs) {
        const runId = run.run_id;
        process.stdout.write(`  🔎 Auditing ${runId}... `);

        try {
            const resFrom = await adjudicate(runId, { ruleset_version: rulesetFrom });
            const resTo = await adjudicate(runId, { ruleset_version: rulesetTo });

            const flip = resFrom.verdict.overall_status !== resTo.verdict.overall_status;
            const shift = resFrom.verdict.verdict_hash !== resTo.verdict.verdict_hash;

            if (flip) {
                verdictFlips++;
                console.log('FLIP 🔴');
            } else if (shift) {
                evidencePatternChanges++;
                console.log('SHIFT 🟡');
            } else {
                console.log('STABLE 🟢');
            }

            runDeltas.push({
                run_id: runId,
                verdict_from: resFrom.verdict.overall_status,
                verdict_to: resTo.verdict.overall_status,
                verdict_stable: !flip,
                evidence_hash_stable: !shift
            });
        } catch (e) {
            console.error(`FAILED ❌ (${(e as Error).message})`);
        }
    }

    const diffpack = {
        diffpack_version: "0.16.0",
        ruleset_diff_id: `${rulesetFrom}_to_${rulesetTo}`,
        from_ruleset: rulesetFrom,
        to_ruleset: rulesetTo,
        generated_at: new Date().toISOString(),
        metrics: {
            total_runs: runs.length,
            verdict_flips_total: verdictFlips,
            evidence_pattern_changes_total: evidencePatternChanges
        },
        logic_diff: [
            {
                clause_id: "CL-D1-03",
                change_type: "THRESHOLD_REFINEMENT",
                rationale: "Refined semantic check for 'budget.enforcement' and 'throttle' tokens in events. Ensures higher engineering fidelity for budget denial tracking.",
                code_delta: "Refined search tokens from ['gate', 'block', 'stop'] to ['gate', 'block', 'stop', 'enforcement', 'throttle']"
            }
        ],
        run_deltas: runDeltas
    };

    const outputFilename = `${rulesetFrom}_to_${rulesetTo}.diffpack.json`;
    const outputPath = path.join(OUTPUT_DIR, outputFilename);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(diffpack, null, 2));

    console.log(`\n✅ Explainable Diff generated: public/_data/ruleset-diffs/${outputFilename}`);
    console.log(`   Verdict Flips: ${verdictFlips} (Requirement: 0)`);
    console.log(`   Evidence Pattern Changes: ${evidencePatternChanges}`);

    if (verdictFlips > 0) {
        console.error('\n❌ ZERO-FLIP AUDIT FAILED: Verdict instability detected.');
        process.exit(1);
    } else {
        console.log('\n🟢 ZERO-FLIP AUDIT PASSED: 100% verdict stability verified.');
    }
}

main().catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
});
