/**
 * Test script for Engine verification
 */

import { ingest } from '../lib/engine/ingest';
import { verify } from '../lib/engine/verify';

async function main() {
    const packPath = process.argv[2] || './fixtures/packs/minimal-pass';

    console.log('=== VALIDATION LAB ENGINE TEST ===\n');
    console.log(`Pack: ${packPath}\n`);

    try {
        // Step 1: Ingest
        console.log('Step 1: Ingesting pack...');
        const pack = await ingest(packPath);
        console.log(`  Files: ${pack.file_inventory.length}`);
        console.log(`  Size: ${(pack.total_size_bytes / 1024).toFixed(2)} KB`);
        console.log(`  Layout: ${pack.layout_version}`);
        console.log(`  Pack ID: ${pack.manifest_raw?.pack_id || 'unknown'}`);
        console.log('');

        // Step 2: Verify
        console.log('Step 2: Verifying pack...');
        const report = await verify(pack);

        console.log(`\n=== VERIFICATION REPORT ===`);
        console.log(`Pack ID: ${report.pack_id}`);
        console.log(`Admission: ${report.admission_status}`);
        console.log(`Duration: ${report.total_duration_ms}ms`);
        console.log('');

        // Show checks
        console.log('Checks:');
        for (const check of report.checks) {
            const icon = check.status === 'PASS' ? '✓' :
                check.status === 'FAIL' ? '✗' :
                    check.status === 'WARN' ? '⚠' : '○';
            console.log(`  ${icon} [${check.check_id}] ${check.name}: ${check.status}`);
            if (check.status !== 'PASS') {
                console.log(`      ${check.message}`);
            }
        }

        // Show blocking failures
        if (report.blocking_failures.length > 0) {
            console.log('\nBlocking Failures:');
            for (const failure of report.blocking_failures) {
                console.log(`  ✗ ${failure.taxonomy}: ${failure.message}`);
            }
        }

        // Summary
        const passCount = report.checks.filter(c => c.status === 'PASS').length;
        const failCount = report.checks.filter(c => c.status === 'FAIL').length;
        console.log(`\nSummary: ${passCount} PASS, ${failCount} FAIL`);
        console.log(`\n=== ${report.admission_status} ===`);

        // Exit code
        process.exit(report.admission_status === 'ADMISSIBLE' ? 0 : 1);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

main();
