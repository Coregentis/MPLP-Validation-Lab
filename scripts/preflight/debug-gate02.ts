/**
 * PF-4 Debug Runner: Print all GATE-02 checks with failures
 * 
 * Usage: npx tsx scripts/preflight/debug-gate02.ts <pack_path>
 */

import path from 'node:path';
import { ingest } from '../../lib/engine/ingest';
import { verify } from '../../lib/engine/verify';

const packPath = process.argv[2];
if (!packPath) {
    console.error('Usage: npx tsx scripts/preflight/debug-gate02.ts <pack_path>');
    process.exit(2);
}

async function main() {
    const abs = path.resolve(packPath);

    console.log('='.repeat(60));
    console.log('PF-4 GATE-02 Debug Runner');
    console.log('='.repeat(60));
    console.log(`\nPack: ${abs}\n`);

    // Ingest pack
    const pack = await ingest(abs);
    console.log(`Pack ID: ${pack.manifest_raw?.pack_id || 'unknown'}\n`);

    // Run verify
    const verifyReport = await verify(pack);

    console.log('='.repeat(60));
    console.log('GATE-02 Verification Results');
    console.log('='.repeat(60));
    console.log(`\nAdmission: ${verifyReport.admission_status}`);

    // Count passes
    const checks = verifyReport.checks || [];
    const passCount = checks.filter((c: any) => c.status === 'PASS').length;
    console.log(`Checks: ${passCount}/${checks.length} PASS\n`);

    // Print all checks
    console.log('Detailed Check Results:');
    console.log('-'.repeat(60));

    for (const check of checks) {
        const status = check.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
        console.log(`\n${status} ${check.id || check.name || 'UNKNOWN_CHECK'}`);

        if (check.status !== 'PASS') {
            console.log(`  Reason: ${check.message || check.reason || 'NO_REASON'}`);
            if (check.details) {
                console.log(`  Details: ${JSON.stringify(check.details, null, 2)}`);
            }
            if (check.taxonomy) {
                console.log(`  Taxonomy: ${check.taxonomy}`);
            }
        }
    }

    // Print blocking failures if any
    if (verifyReport.blocking_failures && verifyReport.blocking_failures.length > 0) {
        console.log('\n' + '='.repeat(60));
        console.log('Blocking Failures:');
        console.log('='.repeat(60));
        for (const failure of verifyReport.blocking_failures) {
            console.log(`\n- ${failure.taxonomy || 'UNKNOWN'}`);
            console.log(`  Message: ${failure.message}`);
            if (failure.pointers && failure.pointers.length > 0) {
                console.log(`  Pointers: ${failure.pointers.map((p: any) => p.artifact_path).join(', ')}`);
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(verifyReport.admission_status === 'ADMISSIBLE' ? '✅ ADMISSIBLE' : '❌ NOT_ADMISSIBLE');
    console.log('='.repeat(60) + '\n');

    process.exit(verifyReport.admission_status === 'ADMISSIBLE' ? 0 : 1);
}

main().catch((e) => {
    console.error('Error:', e);
    process.exit(1);
});
