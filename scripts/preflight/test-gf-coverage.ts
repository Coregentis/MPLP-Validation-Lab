/**
 * Phase 0.5 Preflight: GF Coverage Test
 * 
 * Tests ruleset-1.0 behavior for GF-02~05 when only GF-01 artifacts present.
 * Uses existing evaluation reports to avoid re-running evaluation.
 */

import * as fs from 'fs';
import * as path from 'path';

const SAMPLE_PACK_PATH = process.argv[2] || 'data/runs/sample-pass';

interface GFStatus {
    gf_id: string;
    status: string;
    has_requirements: boolean;
}

async function runPreflightTest(packPath: string): Promise<void> {
    console.log('='.repeat(60));
    console.log('Phase 0.5 Preflight: GF Coverage Test');
    console.log('='.repeat(60));
    console.log(`\nAnalyzing pack: ${packPath}\n`);

    // Read evaluation report  
    const evalReportPath = path.join(packPath, 'evaluation.report.json');

    if (!fs.existsSync(evalReportPath)) {
        console.error(`❌ evaluation.report.json not found at ${evalReportPath}`);
        console.error('   Run evaluation first: npx tsx scripts/test-evaluate.ts ' + path.basename(packPath));
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(evalReportPath, 'utf-8'));

    if (!report.gf_verdicts) {
        console.error('❌ No GF verdicts in evaluation report');
        process.exit(1);
    }

    // Analyze GF verdicts
    const gfStatuses: GFStatus[] = report.gf_verdicts.map((v: any) => ({
        gf_id: v.gf_id,
        status: v.status,
        has_requirements: v.requirements?.length > 0
    }));

    // Display results
    console.log('GF Verdict Summary:');
    console.log('-'.repeat(60));

    for (const gf of gfStatuses) {
        const statusIcon = gf.status === 'PASS' ? '✅' :
            gf.status === 'FAIL' ? '❌' :
                gf.status === 'NOT_EVALUATED' ? '⏭️' : '⚠️';

        console.log(`${statusIcon} ${gf.gf_id.toUpperCase().padEnd(10)} ${gf.status.padEnd(15)} (${gf.has_requirements ? 'has requirements' : 'no requirements'})`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Preflight Analysis:');
    console.log('='.repeat(60));

    // Check GF-01 (must be PASS for GF-01 spine)
    const gf01 = gfStatuses.find(g => g.gf_id === 'gf-01');
    if (!gf01 || gf01.status !== 'PASS') {
        console.error('⚠️  WARNING: GF-01 is not PASS. This pack may not be suitable for preflight.');
    } else {
        console.log('✅ GF-01: PASS (as expected for GF-01 spine)');
    }

    // Check GF-02~05
    const others = gfStatuses.filter(g => g.gf_id !== 'gf-01');

    console.log('\nGF-02~05 Behavior:');
    for (const gf of others) {
        console.log(`   ${gf.gf_id.toUpperCase()}: ${gf.status}`);
    }

    // Verdict
    console.log('\n' + '='.repeat(60));
    console.log('Conclusion:');
    console.log('='.repeat(60));

    const allOthersNotEvaluated = others.every(g => g.status === 'NOT_EVALUATED' || g.status === 'SKIP');
    const someOthersFail = others.some(g => g.status === 'FAIL');

    if (allOthersNotEvaluated) {
        console.log('✅ SAFE TO PROCEED: GF-02~05 are NOT_EVALUATED/SKIP when artifacts absent.');
        console.log('   v0.1 can focus on GF-01 spine without triggering FAIL states.');
        console.log('\n   ✓ Cross-substrate packs only need GF-01 artifacts (context + plan + trace)');
        console.log('   ✓ UI will show GF-02~05 as NOT_EVALUATED (no strength claim drift)');
    } else if (someOthersFail) {
        console.log('⚠️  CAUTION: Some GF-02~05 show FAIL when artifacts absent.');
        console.log('   v0.1 cross-substrate packs have two options:');
        console.log('   A) Include artifacts for FAIL flows (expanding scope beyond GF-01)');
        console.log('   B) Accept FAIL and ensure UI clearly indicates:');
        console.log('      - FAIL = "required artifacts missing" (not "incorrect behavior")');
        console.log('      - v0.1 scope is GF-01 spine only (presence-level)');
    } else {
        console.log('✅ Mixed behavior: Some GF-02~05 FAIL, some NOT_EVALUATED.');
        console.log('   Ensure UI distinguishes FAIL vs NOT_EVALUATED semantics.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('Next Steps:');
    console.log('='.repeat(60));
    console.log('1. Generate preflight report: governance/preflight/ruleset-1.0-gf-coverage.md');
    console.log('2. Proceed to Phase 1 if conclusion is SAFE TO PROCEED\n');
}

// Run test
const packPath = path.resolve(process.cwd(), SAMPLE_PACK_PATH);

if (!fs.existsSync(packPath)) {
    console.error(`❌ Pack not found: ${packPath}`);
    process.exit(1);
}

runPreflightTest(packPath).catch(err => {
    console.error('❌ Preflight test failed:', err);
    process.exit(1);
});
