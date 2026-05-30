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

import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPORT_DIR = 'governance/reports/task-completion';
const TEMPLATE_PATH = 'governance/templates/TASK-COMPLETION-REPORT-TEMPLATE.md';

console.log('═══════════════════════════════════════════════════════════');
console.log('  Post-Task Association Gate (SOP-VLAB-PROJ-SYNC-01)');
console.log('═══════════════════════════════════════════════════════════\n');

function git(args) {
    return execFileSync('git', args, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function gitSucceeds(args) {
    try {
        git(args);
        return true;
    } catch {
        return false;
    }
}

function fetchRef(remoteRef, localRef) {
    try {
        git(['fetch', '--no-tags', '--prune', 'origin', `+${remoteRef}:${localRef}`]);
        return true;
    } catch (error) {
        console.warn(`⚠️  Could not fetch ${remoteRef} -> ${localRef}`);
        console.warn(`   ${error.message}`);
        return false;
    }
}

function refExists(ref) {
    return gitSucceeds(['cat-file', '-e', `${ref}^{commit}`]);
}

function readPullRequestPayload() {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath || !fs.existsSync(eventPath)) {
        return null;
    }

    try {
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));
        return event.pull_request || null;
    } catch (error) {
        console.warn(`⚠️  Could not parse GitHub event payload: ${error.message}`);
        return null;
    }
}

function filesFromDiff(base, head) {
    if (!refExists(base)) {
        throw new Error(`Base ref is not available: ${base}`);
    }
    if (!refExists(head)) {
        throw new Error(`Head ref is not available: ${head}`);
    }

    const output = git(['diff', '--name-only', `${base}...${head}`]);
    return output.trim().split('\n').filter(f => f.length > 0);
}

function tryDiffAttempts(attempts) {
    const errors = [];

    for (const attempt of attempts) {
        const { base, head, label } = attempt;
        try {
            console.log(`   Trying ${label}: ${base}...${head}`);
            return filesFromDiff(base, head);
        } catch (error) {
            errors.push(`${label}: ${error.message}`);
        }
    }

    throw new Error([
        'Unable to compute changed files from any candidate diff range.',
        'The Post-Task Association Gate remains strict: unresolved refs are not treated as zero changed files.',
        'Attempts:',
        ...errors.map(error => `  - ${error}`)
    ].join('\n'));
}

function buildPullRequestDiffAttempts(pullRequest) {
    const attempts = [];
    const baseRef = pullRequest?.base?.ref || process.env.GITHUB_BASE_REF || 'main';
    const headRef = pullRequest?.head?.ref || process.env.GITHUB_HEAD_REF || 'HEAD';
    const baseSha = pullRequest?.base?.sha;
    const headSha = pullRequest?.head?.sha;
    const prNumber = pullRequest?.number;
    const baseRepo = pullRequest?.base?.repo?.full_name;
    const headRepo = pullRequest?.head?.repo?.full_name;
    const headIsSameRepo = baseRepo && headRepo && baseRepo === headRepo;

    fetchRef(`refs/heads/${baseRef}`, `refs/remotes/origin/${baseRef}`);

    if (headRef && headRef !== 'HEAD' && headIsSameRepo) {
        fetchRef(`refs/heads/${headRef}`, `refs/remotes/origin/${headRef}`);
    }

    if (prNumber) {
        fetchRef(`refs/pull/${prNumber}/head`, `refs/remotes/origin/pr/${prNumber}/head`);
    }

    if (baseSha && headSha) {
        attempts.push({ base: baseSha, head: headSha, label: 'pull_request base/head SHA' });
    }

    if (baseSha && prNumber) {
        attempts.push({ base: baseSha, head: `refs/remotes/origin/pr/${prNumber}/head`, label: 'pull_request base SHA to fetched PR head' });
    }

    if (baseSha) {
        attempts.push({ base: baseSha, head: 'HEAD', label: 'pull_request base SHA to checkout HEAD' });
    }

    if (headRef && headRef !== 'HEAD' && headIsSameRepo) {
        attempts.push({ base: `refs/remotes/origin/${baseRef}`, head: `refs/remotes/origin/${headRef}`, label: 'fetched origin base/head refs' });
    }

    attempts.push({ base: `refs/remotes/origin/${baseRef}`, head: 'HEAD', label: 'fetched origin base to checkout HEAD' });

    return { attempts, baseRef, headRef };
}

function buildLocalDiffAttempts() {
    const baseRef = process.env.GITHUB_BASE_REF || 'main';
    const headRef = process.env.GITHUB_HEAD_REF || 'HEAD';

    fetchRef(`refs/heads/${baseRef}`, `refs/remotes/origin/${baseRef}`);

    return {
        baseRef,
        headRef,
        attempts: [
            { base: `refs/remotes/origin/${baseRef}`, head: 'HEAD', label: 'fetched origin base to checkout HEAD' },
            { base: `origin/${baseRef}`, head: 'HEAD', label: 'origin base to checkout HEAD' },
            { base: baseRef, head: 'HEAD', label: 'local base branch to checkout HEAD' }
        ]
    };
}

// Function to get changed files
function getChangedFiles() {
    const pullRequest = readPullRequestPayload();
    const diffPlan = pullRequest ? buildPullRequestDiffAttempts(pullRequest) : buildLocalDiffAttempts();

    console.log(`📋 Checking PR changes...`);
    console.log(`   Base: ${diffPlan.baseRef}`);
    console.log(`   Head: ${diffPlan.headRef}`);
    console.log(`   Source: ${pullRequest ? 'GitHub pull_request payload' : 'local/CI fallback'}\n`);

    return tryDiffAttempts(diffPlan.attempts);
}

// Main gate logic
function main() {
    let changedFiles;
    try {
        changedFiles = getChangedFiles();
    } catch (error) {
        console.error('❌ Error getting changed files.');
        console.error(error.message);
        console.error('\n═══════════════════════════════════════════════════════════');
        console.error('  Gate Status: ❌ FAIL');
        console.error('  SOP Compliance: Unable to resolve changed files');
        console.error('═══════════════════════════════════════════════════════════\n');
        process.exit(1);
    }

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
