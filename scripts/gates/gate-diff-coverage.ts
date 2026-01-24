import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-12: Explainable Diff Coverage
 * Ensures: Every non-equivalent pair has a diff file with pointer-only content
 * Per HP-10.2-07: Diffs must use enumerated note codes, no free text
 */

const PROJECT_ROOT = process.cwd();
const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
const DIFFS_DIR = path.join(PROJECT_ROOT, 'public/_data/cross-verified/diffs');

// Allowed note codes per equivalence-criteria.yaml HP-10.2-07
const ALLOWED_NOTE_CODES = [
    'MISSING_POINTER',
    'VALUE_HASH_MISMATCH',
    'CARDINALITY_MISMATCH',
    'TYPE_MISMATCH',
    'MISSING_ADMISSIBILITY_EVIDENCE',
    'SCENARIO_FAMILY_MISMATCH'
];

// Prohibited content per equivalence-criteria.yaml
const PROHIBITED_PATTERNS = [
    /framework.*(capability|better|worse)/i,
    /compliance/i,
    /recommend/i,
    /certif/i
];

function runGate12() {
    console.log('🛡️  Running VLAB-GATE-12: Explainable Diff Coverage...');

    if (!fs.existsSync(REPORT_PATH)) {
        console.error('❌ Cross-verified report not found. Run compute-equivalence.ts first.');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const matrix = report.equivalence_matrix || [];

    const nonEquivalent = matrix.filter((e: any) => !e.equivalent);
    console.log(`📋 Checking ${nonEquivalent.length} non-equivalent pairs...`);

    let missingDiffs = 0;
    let invalidDiffs = 0;
    let missingDisclaimer = 0;

    for (const pair of nonEquivalent) {
        if (!pair.diff_ref) {
            console.error(`❌ Missing diff_ref for: ${pair.left_run_id} vs ${pair.right_run_id}`);
            missingDiffs++;
            continue;
        }

        const diffPath = path.join(PROJECT_ROOT, 'public/_data/cross-verified', pair.diff_ref);
        if (!fs.existsSync(diffPath)) {
            console.error(`❌ Diff file not found: ${pair.diff_ref}`);
            missingDiffs++;
            continue;
        }

        const diff = JSON.parse(fs.readFileSync(diffPath, 'utf8'));

        // Check disclaimer (HP-10.2-08)
        if (!diff.disclaimer) {
            console.error(`❌ Missing disclaimer in: ${pair.diff_ref}`);
            missingDisclaimer++;
        }

        // Check note codes are valid (HP-10.2-07)
        for (const d of diff.differences || []) {
            if (!ALLOWED_NOTE_CODES.includes(d.note_code)) {
                console.error(`❌ Invalid note_code "${d.note_code}" in: ${pair.diff_ref}`);
                invalidDiffs++;
            }
        }

        // Check for prohibited content (excluding disclaimer field)
        const diffWithoutDisclaimer = { ...diff };
        delete diffWithoutDisclaimer.disclaimer;
        const diffStr = JSON.stringify(diffWithoutDisclaimer);
        for (const pattern of PROHIBITED_PATTERNS) {
            if (pattern.test(diffStr)) {
                console.error(`❌ Prohibited content pattern found in: ${pair.diff_ref}`);
                invalidDiffs++;
                break;
            }
        }
    }

    // Check report-level disclaimer (HP-10.2-08)
    if (!report.disclaimer) {
        console.error('❌ Report missing disclaimer field');
        missingDisclaimer++;
    }

    const totalErrors = missingDiffs + invalidDiffs + missingDisclaimer;
    if (totalErrors > 0) {
        console.error(`\n❌ Gate FAIL: ${totalErrors} issues found.`);
        console.error(`   Missing diffs: ${missingDiffs}`);
        console.error(`   Invalid diffs: ${invalidDiffs}`);
        console.error(`   Missing disclaimers: ${missingDisclaimer}`);
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: All ${nonEquivalent.length} non-equivalent pairs have valid diff files.`);
}

runGate12();
