#!/usr/bin/env node
/**
 * Gate: Post-Task Association (P0-SOP-HARDEN-02)
 * 
 * Enforces SOP-VLAB-PROJ-SYNC-01 requirement:
 * Every PR must include a Task Completion Report in governance/reports/task-completion/
 * 
 * Usage: npm run gate:post-task-association
 * Exit: 0 = PASS (report found), 1 = FAIL (no report)
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_DIR = 'governance/reports/task-completion';
const TEMPLATE_PATH = 'governance/templates/TASK-COMPLETION-REPORT-TEMPLATE.md';

console.log('═══════════════════════════════════════════════════════════');
console.log('  Post-Task Association Gate (SOP-VLAB-PROJ-SYNC-01)');
console.log('═══════════════════════════════════════════════════════════\n');

// Function to get changed files
function getChangedFiles() {
    try {
        // Try GitHub Actions environment first
        const baseRef = process.env.GITHUB_BASE_REF || 'main';
        const headRef = process.env.GITHUB_HEAD_REF || 'HEAD';

        console.log(`📋 Checking PR changes...`);
        console.log(`   Base: ${baseRef}`);
        console.log(`   Head: ${headRef}\n`);

        // Get changed files in PR
        let diffCommand;
        if (process.env.GITHUB_ACTIONS) {
            // In GitHub Actions
            diffCommand = `git diff --name-only origin/${baseRef}...${headRef}`;
        } else {
            // Local development - compare with main branch
            diffCommand = `git diff --name-only main...HEAD`;
        }

        const output = execSync(diffCommand, { encoding: 'utf-8' });
        const files = output.trim().split('\n').filter(f => f.length > 0);

        return files;
    } catch (error) {
        // If git diff fails, check if we're in a PR context at all
        if (!process.env.GITHUB_ACTIONS) {
            console.log('ℹ️  Not in GitHub Actions context - checking for report files existence...\n');
            // In local dev, just check if report directory has files
            try {
                const reportFiles = fs.readdirSync(REPORT_DIR);
                return reportFiles.map(f => path.join(REPORT_DIR, f));
            } catch {
                return [];
            }
        }

        console.error(`❌ Error getting changed files: ${error.message}`);
        return [];
    }
}

// Main gate logic
function main() {
    const changedFiles = getChangedFiles();

    console.log(`🔍 Changed files: ${changedFiles.length}`);

    // Find task completion reports in changed files
    const reportPattern = new RegExp(`^${REPORT_DIR}/`);
    const reportFiles = changedFiles.filter(f => reportPattern.test(f));

    console.log(`📄 Task completion reports found: ${reportFiles.length}\n`);

    if (reportFiles.length > 0) {
        console.log('✅ Task Completion Report(s) included:\n');
        reportFiles.forEach(f => {
            console.log(`   - ${f}`);
        });
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  Gate Status: ✅ PASS');
        console.log('  SOP Compliance: Task completion report present');
        console.log('═══════════════════════════════════════════════════════════\n');
        process.exit(0);
    } else {
        console.error('❌ No Task Completion Report found in PR changes.\n');
        console.error('📋 SOP-VLAB-PROJ-SYNC-01 requires a Task Completion Report for all PRs.\n');
        console.error('To fix:');
        console.error(`   1. Copy template: ${TEMPLATE_PATH}`);
        console.error(`   2. Fill in the 9 required sections`);
        console.error(`   3. Save to: ${REPORT_DIR}/<task-id>.md`);
        console.error(`   4. Add to PR: git add ${REPORT_DIR}/<task-id>.md\n`);
        console.error('See SOP: governance/sop/SOP-VLAB-PROJ-SYNC-01.md\n');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('  Gate Status: ❌ FAIL');
        console.error('  SOP Compliance: Missing task completion report');
        console.error('═══════════════════════════════════════════════════════════\n');
        process.exit(1);
    }
}

main();
