#!/usr/bin/env tsx
/**
 * LINT SUMMARY AUDIT
 * 
 * Runs ESLint and generates a summary of debt (errors/warnings) without failing.
 * Used for Seal Attributes when running in 'tolerant' mode.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface LintMessage {
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
}

interface LintResult {
    filePath: string;
    messages: LintMessage[];
    errorCount: number;
    warningCount: number;
}

const OUTPUT_PATH = path.join(process.cwd(), 'reports', 'lint-audit.json');
const REPORT_DIR = path.dirname(OUTPUT_PATH);

if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
}

console.log('🔍 [Lint Audit] Assessing code debt...');

try {
    // Run eslint with json formatter. We expect it might fail (exit 1) if there are errors, 
    // so we wrap in try/catch to capture output.
    execSync('npx eslint . --format json --output-file reports/lint-raw.json', { stdio: 'ignore' });
} catch (e) {
    // Ignore exit code 1 from eslint
}

if (!fs.existsSync('reports/lint-raw.json')) {
    console.error('❌ Failed to generate lint report');
    process.exit(1);
}

const raw: LintResult[] = JSON.parse(fs.readFileSync('reports/lint-raw.json', 'utf8'));
const summary = {
    total_files: raw.length,
    files_with_issues: 0,
    total_errors: 0,
    total_warnings: 0,
    top_rules: {} as Record<string, number>,
    timestamp: new Date().toISOString()
};

raw.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
        summary.files_with_issues++;
        summary.total_errors += file.errorCount;
        summary.total_warnings += file.warningCount;

        file.messages.forEach(msg => {
            if (msg.ruleId) {
                summary.top_rules[msg.ruleId] = (summary.top_rules[msg.ruleId] || 0) + 1;
            }
        });
    }
});

// Sort top rules
const sortedRules = Object.entries(summary.top_rules)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

const finalReport = {
    ...summary,
    top_rules: sortedRules
};

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalReport, null, 2));

console.log(`✅ [Lint Audit] Complete.`);
console.log(`   Files with Issues: ${summary.files_with_issues}`);
console.log(`   Errors: ${summary.total_errors}`);
console.log(`   Warnings: ${summary.total_warnings}`);
console.log(`   Report: ${OUTPUT_PATH}`);

// Always pass - this is an audit, not a gate
process.exit(0);
