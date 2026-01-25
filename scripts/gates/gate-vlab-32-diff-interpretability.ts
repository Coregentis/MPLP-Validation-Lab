import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-32: Ruleset Diff Interpretability
 * Ensures: Every ruleset diff report contains a mandatory semantic summary (note).
 * Per MUST-3: Ruleset-diff interpretability reports.
 */

const PROJECT_ROOT = process.cwd();
const DIFF_EXPORT_DIR = path.join(PROJECT_ROOT, 'export/ruleset-diff');

function runGate32() {
    console.log('🛡️  Running VLAB-GATE-32: Ruleset Diff Interpretability...');

    if (!fs.existsSync(DIFF_EXPORT_DIR)) {
        console.warn('⚠️ No ruleset diff export directory found. Skipping check if no diffs generated.');
        return;
    }

    const diffDirs = fs.readdirSync(DIFF_EXPORT_DIR, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    if (diffDirs.length === 0) {
        console.log('📋 No diff reports found to audit.');
        return;
    }

    console.log(`📋 Auditing ${diffDirs.length} diff reports for interpretability summaries...`);

    let failureCount = 0;

    for (const diffId of diffDirs) {
        const reportPath = path.join(DIFF_EXPORT_DIR, diffId, 'diff.enhanced.json');
        const legacyPath = path.join(DIFF_EXPORT_DIR, diffId, 'diff.json');

        let report;
        if (fs.existsSync(reportPath)) {
            report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        } else if (fs.existsSync(legacyPath)) {
            report = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
        } else {
            continue;
        }

        // Check for interpretability summary
        const hasSummaryNote = report.summary && report.summary.note && report.summary.note.trim().length > 10;
        const hasClauseNote = report.clause_delta && report.clause_delta.note && report.clause_delta.note.trim().length > 10;

        if (hasSummaryNote || hasClauseNote) {
            console.log(`✅ ${diffId}: PASS (Summary provided)`);
        } else {
            console.error(`❌ ${diffId}: FAIL (Missing mandatory semantic summary/note)`);
            failureCount++;
        }
    }

    if (failureCount > 0) {
        console.error(`\n❌ Gate FAIL: ${failureCount} report(s) lack interpretability summaries.`);
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: All audited diff reports contain semantic summaries.');
}

runGate32();
