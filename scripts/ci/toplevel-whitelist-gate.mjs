#!/usr/bin/env node
/**
 * G-TOP-01 — Top-level Directory Whitelist Gate
 * 
 * Validates that only approved directories exist at repository root,
 * preventing orphan directories and uncontrolled growth.
 * 
 * Rules:
 * 1. Only whitelisted directories allowed at root
 * 2. New directories must be registered in README or governance docs
 * 3. Temporary files (.gitmsg.*, etc.) are not allowed
 * 
 * Usage: node scripts/ci/toplevel-whitelist-gate.mjs
 * 
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (unauthorized directories/files found)
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

// Approved top-level directories
const DIRECTORY_WHITELIST = [
    // Core application
    'app',
    'components',
    'lib',
    'public',
    'src',

    // Data sources
    'data',
    'content',
    'export',
    'fixtures',
    'schemas',
    'test-vectors',

    // Governance & releases
    'audit',
    'governance',
    'releases',
    'adjudication',
    'plans',
    'reverification',
    'reports',

    // Tools & utilities
    'runners',
    'scripts',
    'tools',
    'verifier',
    'packages',

    // Documentation
    'docs',
    'examples',
    'inventory',
    'producers',
    'artifacts',  // Curated artifacts
    'tests',      // Test suites

    // Build artifacts (ignored but allowed)
    '.next',
    'node_modules',
    'test-results',

    // Git
    '.git',
    '.github',
];

// Approved top-level files (pattern matching)
const FILE_PATTERNS = [
    /^\.gitignore$/,
    /^\.gitattributes$/,
    /^\.DS_Store$/,
    /^\.env\.?.*$/,
    /^\.eslint.*$/,
    /^LICENSE$/,
    /^README\.md$/,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^pnpm-lock\.yaml$/,
    /^tsconfig\.json$/,
    /^tsconfig\..*\.json$/,
    /^next\.config\..*$/,
    /^next-env\.d\.ts$/,
    /^tailwind\.config\..*$/,
    /^postcss\.config\..*$/,
    /^vitest\.config\..*$/,
    /^playwright\.config\..*$/,
    /^eslint\.config\..*$/,
    /^SYNC_REPORT\.json$/,
    /^UPSTREAM_BASELINE\.yaml$/,
];

// Explicitly forbidden patterns
const FORBIDDEN_PATTERNS = [
    /^\.gitmsg\..*$/,  // Temp git message files
];

function main() {
    console.log('📁 G-TOP-01 — Top-level Directory Whitelist Gate\n');

    let failures = [];
    let passes = [];
    let warnings = [];

    const entries = fs.readdirSync(ROOT);

    for (const entry of entries) {
        const fullPath = path.join(ROOT, entry);
        const isDir = fs.statSync(fullPath).isDirectory();

        // Check forbidden patterns first
        for (const pattern of FORBIDDEN_PATTERNS) {
            if (pattern.test(entry)) {
                failures.push({
                    entry,
                    type: isDir ? 'directory' : 'file',
                    reason: 'Forbidden pattern (temp file)'
                });
                continue;
            }
        }

        if (isDir) {
            // Check directory whitelist
            if (DIRECTORY_WHITELIST.includes(entry)) {
                passes.push(`Directory: ${entry}`);
            } else {
                failures.push({
                    entry,
                    type: 'directory',
                    reason: 'Not in directory whitelist'
                });
            }
        } else {
            // Check file patterns
            const matched = FILE_PATTERNS.some(p => p.test(entry));
            if (matched) {
                passes.push(`File: ${entry}`);
            } else {
                // Unknown file - warning only (not failure)
                warnings.push({
                    entry,
                    type: 'file',
                    reason: 'Unknown file pattern'
                });
            }
        }
    }

    // Report
    console.log('---');
    console.log(`✅ Whitelisted: ${passes.length}`);

    if (warnings.length > 0) {
        console.log(`\n⚠️  WARNINGS: ${warnings.length}`);
        warnings.forEach(w => console.log(`   [${w.type}] ${w.entry} — ${w.reason}`));
    }

    if (failures.length > 0) {
        console.log(`\n❌ FAIL: ${failures.length}`);
        failures.forEach(f => console.log(`   [${f.type}] ${f.entry} — ${f.reason}`));
        console.log(`\n❌ Gate FAILED: Unauthorized entries at repository root`);
        process.exit(1);
    }

    console.log(`\n✅ Gate PASSED: Top-level structure verified`);
    process.exit(0);
}

main();
