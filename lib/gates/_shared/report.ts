/**
 * Gate Report Utilities
 * 
 * Unified Gate Report structure, path sanitization, file writing.
 */

import * as fs from 'fs';
import * as path from 'path';

export type GateStatus = 'PASS' | 'FAIL' | 'SKIP';

export interface GateFinding {
    file: string;      // repo-relative, posix
    line: number;      // 1-based
    column: number;    // 1-based
    match: string;
    rule: string;
    message: string;
}

export interface GateReport {
    gate_id: string;
    gate_name: string;
    status: GateStatus;
    evaluated_at: string;
    findings: GateFinding[];
    summary: {
        files_scanned: number;
        matches: number;
        note?: string;
    };
}

export function toPosix(p: string): string {
    return p.split(path.sep).join('/');
}

export function repoRelativePath(repoRoot: string, filePath: string): string {
    const rel = path.relative(repoRoot, filePath);
    // Ensure no absolute path leaks
    return toPosix(rel.startsWith('..') ? rel.replace(/^\.\.[/\\]?/, '') : rel);
}

export function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

export function writeGateReport(report: GateReport, outPath: string): void {
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8');
}

export function printSummary(report: GateReport, maxFindings = 5): void {
    const { gate_id, gate_name, status, summary, findings } = report;
    const header = `[${gate_id}] ${gate_name}: ${status} (files=${summary.files_scanned}, matches=${summary.matches})`;
    console.log(header);

    if (status === 'FAIL') {
        const top = findings.slice(0, maxFindings);
        for (const f of top) {
            console.log(` - ${f.file}:${f.line}:${f.column} [${f.rule}] ${f.message} (match="${f.match}")`);
        }
        if (findings.length > maxFindings) {
            console.log(` ... and ${findings.length - maxFindings} more`);
        }
    }

    if (summary.note) {
        console.log(`   Note: ${summary.note}`);
    }
}
