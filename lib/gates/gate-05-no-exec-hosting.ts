/**
 * GATE-05: No Execution Hosting Guard
 * 
 * Scans for phrases suggesting execution hosting / implementation submission.
 * FAIL if any forbidden phrase found (strict, no context exemption).
 */

import * as path from 'path';
import { walkFiles, readTextFileSafe, findAllOccurrences, locateIndex } from './_shared/scan';
import { GateReport, GateFinding, writeGateReport, printSummary, repoRelativePath } from './_shared/report';

const FORBIDDEN_PHRASES = [
    'upload your implementation',
    'submit your implementation',
    'submit code',
    'submit repo',
    'run your agents here',
    'execute on our servers',
    'hosted runner',
    'online runner',
    'sandbox execution',
    'we run it for you',
    'we execute your workflow',
    'upload implementation',
    'host execution',
];

async function main() {
    const repoRoot = path.resolve(__dirname, '../..');
    const outPath = path.join(repoRoot, 'artifacts/gates/gate-05-no-exec-hosting.report.json');

    // Scan app/pages/content/README only - where UI text lives
    const excludeDirs = ['node_modules', '.next', 'dist', 'coverage', '.git', 'artifacts', 'gates'];

    const files = walkFiles(repoRoot, {
        includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx'],
        excludeDirs,
        maxFileSizeBytes: 2 * 1024 * 1024,
    });

    const findings: GateFinding[] = [];

    for (const f of files) {
        const content = readTextFileSafe(f);
        if (content === null) continue;

        const lower = content.toLowerCase();

        for (const phrase of FORBIDDEN_PHRASES) {
            const p = phrase.toLowerCase();
            if (!lower.includes(p)) continue;

            const idxs = findAllOccurrences(lower, p);
            for (const idx of idxs) {
                const { line, column } = locateIndex(content, idx);
                findings.push({
                    file: repoRelativePath(repoRoot, f),
                    line,
                    column,
                    match: phrase,
                    rule: 'NO_EXEC_HOSTING',
                    message: 'Forbidden phrase suggests execution hosting / implementation submission',
                });
            }
        }
    }

    const report: GateReport = {
        gate_id: 'GATE-05',
        gate_name: 'No Execution Hosting Guard',
        status: findings.length > 0 ? 'FAIL' : 'PASS',
        evaluated_at: new Date().toISOString(),
        findings,
        summary: {
            files_scanned: files.length,
            matches: findings.length,
            note: `excludeDirs: ${excludeDirs.join(', ')}`,
        },
    };

    writeGateReport(report, outPath);
    printSummary(report);

    process.exit(report.status === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
    console.error('[GATE-05] error:', e);
    process.exit(2);
});
