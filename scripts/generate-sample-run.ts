/**
 * Generate Sample Run
 * 
 * Runs the engine against a fixture pack and saves reports to data/runs/{run_id}/
 * 
 * Usage:
 *   npx tsx scripts/generate-sample-run.ts <pack_path> <run_id>
 * 
 * Example:
 *   npx tsx scripts/generate-sample-run.ts ./fixtures/packs/minimal-pass sample-pass
 */

import * as fs from 'fs';
import * as path from 'path';
import { ingest } from '../lib/engine/ingest';
import { verify } from '../lib/engine/verify';
import { evaluate } from '../lib/evaluate/evaluate';

async function main() {
    const packPath = process.argv[2];
    const runId = process.argv[3];
    const rulesetVersion = process.argv[4] || 'ruleset-1.0';

    if (!packPath || !runId) {
        console.error('Usage: npx tsx scripts/generate-sample-run.ts <pack_path> <run_id> [ruleset_version]');
        process.exit(1);
    }

    console.log('=== Generate Sample Run ===\n');
    console.log(`Pack: ${packPath}`);
    console.log(`Run ID: ${runId}`);
    console.log(`Ruleset: ${rulesetVersion}\n`);

    // Output directory
    const outDir = path.resolve(process.cwd(), 'data/runs', runId);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    // Step 1: Ingest
    console.log('Step 1: Ingesting pack...');
    const pack = await ingest(packPath);
    console.log(`  Pack ID: ${pack.manifest_raw?.pack_id || 'unknown'}`);
    console.log(`  Files: ${pack.file_inventory.length}`);

    // Save manifest (if exists in pack)
    const manifestSrcPath = path.join(pack.root_path, 'manifest.yaml');
    const manifestDstPath = path.join(outDir, 'manifest.yaml');
    if (fs.existsSync(manifestSrcPath)) {
        fs.copyFileSync(manifestSrcPath, manifestDstPath);
        console.log('  Copied manifest.yaml');
    }

    // Save sha256sums (if exists)
    const sumsSrcPath = path.join(pack.root_path, 'sha256sums.txt');
    const sumsDstPath = path.join(outDir, 'sha256sums.txt');
    if (fs.existsSync(sumsSrcPath)) {
        fs.copyFileSync(sumsSrcPath, sumsDstPath);
        console.log('  Copied sha256sums.txt');
    }

    // Step 2: Verify
    console.log('\nStep 2: Running verify...');
    const verifyReport = await verify(pack);
    console.log(`  Admission: ${verifyReport.admission_status}`);

    // Save verify report
    const verifyPath = path.join(outDir, 'verify.report.json');
    fs.writeFileSync(verifyPath, JSON.stringify(verifyReport, null, 2));
    console.log(`  Saved verify.report.json`);

    // Step 3: Evaluate (only if admissible)
    if (verifyReport.admission_status === 'ADMISSIBLE') {
        console.log('\nStep 3: Running evaluate...');
        const evalReport = await evaluate(pack, verifyReport, {
            ruleset_version: rulesetVersion,
        });

        // Save evaluation report
        const evalPath = path.join(outDir, 'evaluation.report.json');
        fs.writeFileSync(evalPath, JSON.stringify(evalReport, null, 2));
        console.log(`  Saved evaluation.report.json`);

        // Summary
        const passedGFs = evalReport.gf_verdicts.filter(g => g.status === 'PASS').length;
        const totalGFs = evalReport.gf_verdicts.length;
        console.log(`\n=== SUMMARY ===`);
        console.log(`Admission: ${verifyReport.admission_status}`);
        console.log(`GF Verdicts: ${passedGFs}/${totalGFs} PASS`);
        console.log(`Verdict Hash: ${evalReport.verdict_hash.slice(0, 32)}...`);
    } else {
        console.log(`\n=== SUMMARY ===`);
        console.log(`Admission: ${verifyReport.admission_status}`);
        console.log('Evaluation skipped (not admissible)');
    }

    console.log(`\n✓ Sample run saved to: ${outDir}`);
}

main().catch((e) => {
    console.error('Error:', e);
    process.exit(1);
});
