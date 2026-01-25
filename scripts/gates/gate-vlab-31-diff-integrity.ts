import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-31: Cross-Verified Diff Integrity
 * Ensures: All diff_ref pointers in the cross-verified report exist as files.
 * Prevents 404s in the Evidence Gallery and Report Viewer.
 */

const PROJECT_ROOT = process.cwd();
const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
const CROSS_VERIFIED_DIR = path.join(PROJECT_ROOT, 'public/_data/cross-verified');

function runGate31() {
    console.log('🛡️  Running VLAB-GATE-31: Cross-Verified Diff Integrity...');

    if (!fs.existsSync(REPORT_PATH)) {
        console.error('❌ Cross-verified report not found.');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const matrix = report.equivalence_matrix || [];

    console.log(`📋 Checking ${matrix.length} diff references...`);

    let missingCount = 0;
    let checkedCount = 0;

    for (const item of matrix) {
        if (!item.diff_ref) {
            console.warn(`⚠️ Entry missing diff_ref: ${item.left_run_id} <-> ${item.right_run_id}`);
            continue;
        }

        const fullPath = path.join(CROSS_VERIFIED_DIR, item.diff_ref);

        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Missing diff file: ${item.diff_ref} (at ${fullPath})`);
            missingCount++;
        }

        checkedCount++;
    }

    if (missingCount > 0) {
        console.error(`❌ Gate FAIL: ${missingCount} diff references are broken.`);
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: All ${checkedCount} diff references are valid.`);
}

runGate31();
