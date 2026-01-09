/**
 * GATE-04: Non-endorsement Language Lint
 * 
 * Scans files for forbidden terms that imply certification/endorsement.
 * FAIL if any forbidden term found (not in allow phrase context).
 */

import * as path from 'path';
import { loadYamlStrict } from '../utils/yaml-loader';
import { walkFiles, readTextFileSafe, findAllOccurrences, locateIndex, excerptAt } from './_shared/scan';
import { GateReport, GateFinding, writeGateReport, printSummary, repoRelativePath } from './_shared/report';

interface Lexicon {
    policy_version: string;
    forbidden_terms: string[];
    allow_phrases: string[];
}

function hasAllowContext(windowText: string, allowPhrases: string[]): boolean {
    const lower = windowText.toLowerCase();
    return allowPhrases.some(p => lower.includes(p.toLowerCase()));
}

async function main() {
    const repoRoot = path.resolve(__dirname, '../..');
    const outPath = path.join(repoRoot, 'artifacts/gates/gate-04-language.report.json');

    const lexiconPath = path.join(repoRoot, 'data/policy/forbidden-lexicon.yaml');
    const lexicon = loadYamlStrict<Lexicon>(lexiconPath);

    const files = walkFiles(repoRoot, {
        includeExtensions: ['.ts', '.tsx', '.js', '.jsx', '.md', '.mdx', '.json', '.yaml', '.yml'],
        excludeDirs: ['node_modules', '.next', 'dist', 'coverage', '.git', 'artifacts', 'policy', 'governance', 'schemas', 'invariants'],
        maxFileSizeBytes: 2 * 1024 * 1024,
    });

    const findings: GateFinding[] = [];

    for (const f of files) {
        const content = readTextFileSafe(f);
        if (content === null) continue;

        const lower = content.toLowerCase();

        for (const term of lexicon.forbidden_terms) {
            const t = term.toLowerCase();
            if (!t) continue;

            // fast check
            if (!lower.includes(t)) continue;

            const idxs = findAllOccurrences(lower, t);
            for (const idx of idxs) {
                // context window for allow phrase check
                const ctx = excerptAt(content, idx, 80);
                if (hasAllowContext(ctx, lexicon.allow_phrases)) continue;

                const { line, column } = locateIndex(content, idx);
                findings.push({
                    file: repoRelativePath(repoRoot, f),
                    line,
                    column,
                    match: term,
                    rule: 'FORBIDDEN_TERM',
                    message: 'Forbidden term implies certification/endorsement risk',
                });
            }
        }
    }

    const report: GateReport = {
        gate_id: 'GATE-04',
        gate_name: 'Non-endorsement Language Lint',
        status: findings.length > 0 ? 'FAIL' : 'PASS',
        evaluated_at: new Date().toISOString(),
        findings,
        summary: {
            files_scanned: files.length,
            matches: findings.length,
        },
    };

    writeGateReport(report, outPath);
    printSummary(report);

    process.exit(report.status === 'FAIL' ? 1 : 0);
}

main().catch((e) => {
    console.error('[GATE-04] error:', e);
    process.exit(2);
});
