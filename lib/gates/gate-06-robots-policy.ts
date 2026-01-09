/**
 * GATE-06: Robots/Noindex Policy
 * 
 * Ensures Run Detail pages default to noindex.
 * FAIL if policy misconfigured or run detail page lacks noindex.
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadYamlStrict } from '../utils/yaml-loader';
import { GateReport, GateFinding, writeGateReport, printSummary, repoRelativePath } from './_shared/report';

interface CurationPolicy {
    policy_version: string;
    default_run_detail_robots: string;
    curated_runs: Array<{ run_id: string; robots?: string }>;
}

function findRunDetailCandidates(repoRoot: string): string[] {
    const candidates = [
        // Next.js App Router
        'app/runs/[run_id]/page.tsx',
        'app/runs/[runId]/page.tsx',
        'src/app/runs/[run_id]/page.tsx',
        'src/app/runs/[runId]/page.tsx',
        // Pages Router
        'pages/runs/[run_id].tsx',
        'pages/runs/[runId].tsx',
        'src/pages/runs/[run_id].tsx',
        'src/pages/runs/[runId].tsx',
    ];

    return candidates
        .map((p) => path.join(repoRoot, p))
        .filter((abs) => fs.existsSync(abs));
}

function contentHasNoindex(content: string): boolean {
    const c = content.toLowerCase();
    const patterns: RegExp[] = [
        /noindex/,
        /robots\s*:\s*["']noindex/,
        /index\s*:\s*false/,
        /name\s*=\s*["']robots["']\s+content\s*=\s*["'][^"']*noindex/i,
    ];
    return patterns.some((r) => r.test(c));
}

async function main() {
    const repoRoot = path.resolve(__dirname, '../..');
    const outPath = path.join(repoRoot, 'artifacts/gates/gate-06-robots-policy.report.json');

    const policyPath = path.join(repoRoot, 'data/policy/curation.yaml');
    const policy = loadYamlStrict<CurationPolicy>(policyPath);

    const findings: GateFinding[] = [];

    // Check policy file
    if (!policy.default_run_detail_robots?.toLowerCase().includes('noindex')) {
        findings.push({
            file: repoRelativePath(repoRoot, policyPath),
            line: 1,
            column: 1,
            match: String(policy.default_run_detail_robots ?? ''),
            rule: 'DEFAULT_ROBOTS_MUST_NOINDEX',
            message: 'default_run_detail_robots must include noindex',
        });
    }

    const pages = findRunDetailCandidates(repoRoot);

    if (pages.length === 0) {
        // Run detail page not found yet — only check policy
        const report: GateReport = {
            gate_id: 'GATE-06',
            gate_name: 'Robots/Noindex Policy',
            status: findings.length > 0 ? 'FAIL' : 'PASS',
            evaluated_at: new Date().toISOString(),
            findings,
            summary: {
                files_scanned: 0,
                matches: findings.length,
                note: 'Run detail page not found yet; policy file checked only',
            },
        };

        writeGateReport(report, outPath);
        printSummary(report);
        process.exit(report.status === 'FAIL' ? 1 : 0);
    }

    // Check actual run detail pages
    for (const p of pages) {
        const content = fs.readFileSync(p, 'utf-8');
        if (!contentHasNoindex(content)) {
            findings.push({
                file: repoRelativePath(repoRoot, p),
                line: 1,
                column: 1,
                match: 'missing noindex',
                rule: 'RUN_DETAIL_NOINDEX_REQUIRED',
                message: 'Run detail page must set robots noindex by default',
            });
        }
    }

    const report: GateReport = {
        gate_id: 'GATE-06',
        gate_name: 'Robots/Noindex Policy',
        status: findings.length > 0 ? 'FAIL' : 'PASS',
        evaluated_at: new Date().toISOString(),
        findings,
        summary: {
            files_scanned: pages.length,
            matches: findings.length,
        },
    };

    writeGateReport(report, outPath);
    printSummary(report);

    process.exit(report.status === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
    console.error('[GATE-06] error:', e);
    process.exit(2);
});
