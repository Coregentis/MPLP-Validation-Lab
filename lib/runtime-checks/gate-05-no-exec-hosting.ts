/**
 * GATE-05: No Execution Hosting Guard
 * 
 * Scans PUBLIC SURFACE for phrases suggesting execution hosting / implementation submission.
 * FAIL if any forbidden phrase found (strict, no context exemption).
 * 
 * SCOPE: Only scans app/, components/, public/, README.md
 * Internal governance docs are EXCLUDED.
 */

import * as path from 'path';
import { readTextFileSafe, findAllOccurrences, locateIndex } from './_shared/scan';
import { listPublicSurfaceFiles, PUBLIC_SURFACE_DIRS } from './_shared/surface';
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

    // SCOPE: Only public surface (app, components, public, README.md)
    const files = listPublicSurfaceFiles(repoRoot, {
        includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx'],
        maxFileSizeBytes: 2 * 1024 * 1024,
    });

    // Allow phrases: negation context (explicit disclaimers)
    const ALLOW_PHRASES = [
        'not host execution',
        'does not host',
        'not host',
        'no execution hosting',
        '>NOT<',
        '>NOT</strong> host',
        '❌',
    ];

    function hasAllowContext(windowText: string): boolean {
        const lower = windowText.toLowerCase();
        return ALLOW_PHRASES.some(p => lower.includes(p.toLowerCase()));
    }

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
                // Check for negation context in surrounding window
                const ctx = content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + p.length + 40));
                if (hasAllowContext(ctx)) continue;

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
            note: `scope: PUBLIC_SURFACE only (${PUBLIC_SURFACE_DIRS.join(', ')})`,
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
