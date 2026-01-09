/**
 * Phase D Test Script
 * Tests evaluate.ts and GATE-03 with minimal-pass fixture.
 */

import * as path from 'path';
import { ingest } from '../lib/engine/ingest';
import { verify } from '../lib/engine/verify';
import { evaluate } from '../lib/evaluate/evaluate';
import { checkDeterminism } from '../lib/gates/gate-03-determinism';

async function main() {
    const packPath = process.argv[2] || './fixtures/packs/minimal-pass';
    const rulesetVersion = process.argv[3] || 'ruleset-1.0';

    console.log('=== Phase D Test: Evaluation Engine ===\n');
    console.log(`Pack: ${packPath}`);
    console.log(`Ruleset: ${rulesetVersion}\n`);

    // Step 1: Ingest
    console.log('Step 1: Ingesting pack...');
    const pack = await ingest(packPath);
    console.log(`  Pack ID: ${pack.manifest_raw?.pack_id || 'unknown'}`);
    console.log(`  Files: ${pack.file_inventory.length}`);

    // Step 2: Verify (GATE-02)
    console.log('\nStep 2: Running GATE-02 (Verify)...');
    const verifyReport = await verify(pack);
    console.log(`  Admission: ${verifyReport.admission_status}`);
    console.log(`  Checks: ${verifyReport.checks.filter(c => c.status === 'PASS').length}/${verifyReport.checks.length} PASS`);

    if (verifyReport.admission_status !== 'ADMISSIBLE') {
        console.log('\n❌ GATE-02 FAILED - Stopping');
        process.exit(1);
    }
    console.log('  ✓ GATE-02 PASSED');

    // Step 3: Evaluate
    console.log('\nStep 3: Evaluating GFs...');
    const evalReport = await evaluate(pack, verifyReport, {
        ruleset_version: rulesetVersion,
    });

    console.log(`\n=== EVALUATION REPORT ===`);
    console.log(`Ruleset: ${evalReport.ruleset_version}`);
    console.log(`Pack Root Hash: ${evalReport.pack_root_hash.slice(0, 16)}...`);
    console.log(`Verdict Hash: ${evalReport.verdict_hash.slice(0, 16)}...`);

    for (const gf of evalReport.gf_verdicts) {
        const passCount = gf.requirements.filter(r => r.status === 'PASS').length;
        const totalCount = gf.requirements.length;
        const icon = gf.status === 'PASS' ? '✓' : gf.status === 'FAIL' ? '✗' : '○';
        console.log(`  ${icon} [${gf.gf_id}] ${gf.status} (${passCount}/${totalCount} requirements)`);

        if (gf.status !== 'PASS') {
            for (const fail of gf.failures) {
                console.log(`      ✗ ${fail.requirement_id}: ${fail.message}`);
            }
        }
    }

    // Step 4: GATE-03 Determinism
    console.log('\nStep 4: Running GATE-03 (Determinism)...');
    const determinismResult = await checkDeterminism(pack, verifyReport, {
        ruleset_version: rulesetVersion,
    });

    console.log(`  Hash 1: ${determinismResult.verdict_hash_1.slice(0, 16)}...`);
    console.log(`  Hash 2: ${determinismResult.verdict_hash_2.slice(0, 16)}...`);

    if (determinismResult.passed) {
        console.log('  ✓ GATE-03 PASSED - Deterministic');
    } else {
        console.log('  ✗ GATE-03 FAILED - Non-deterministic!');
        process.exit(1);
    }

    // Summary
    const passedGFs = evalReport.gf_verdicts.filter(g => g.status === 'PASS').length;
    const totalGFs = evalReport.gf_verdicts.length;

    console.log(`\n=== SUMMARY ===`);
    console.log(`GF Verdicts: ${passedGFs}/${totalGFs} PASS`);
    console.log(`GATE-02: PASS`);
    console.log(`GATE-03: PASS (Deterministic)`);
    console.log(`\n✓ Phase D Verification Complete`);
}

main().catch(console.error);
