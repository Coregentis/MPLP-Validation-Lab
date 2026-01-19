#!/usr/bin/env node
/**
 * Secret Hygiene Gate - v0.5.5
 * 
 * Scans repository for private key material that should NOT be committed.
 * 
 * Detects:
 * - BEGIN PRIVATE KEY / END PRIVATE KEY
 * - Ed25519 private key patterns (PKCS#8 base64)
 * - .env files with key material
 * - Common secret file patterns
 * 
 * Usage: npm run gate:secret-hygiene
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Patterns to detect private key material
const PRIVATE_KEY_PATTERNS = [
    /-----BEGIN\s+(EC\s+)?PRIVATE KEY-----/,
    /-----BEGIN\s+OPENSSH\s+PRIVATE KEY-----/,
    /private_key_ed25519["']?\s*[:=]\s*["']/i,
    /SIGNING_PRIVATE_KEY\s*=\s*["']MC[A-Za-z0-9+/=]{60,}/,
    /MC4CAQAwBQYDK2VwBCIEI[A-Za-z0-9+/=]{40,}/,  // Ed25519 PKCS#8 pattern
];

// Files/directories to exclude from scanning
const EXCLUDE_PATTERNS = [
    'node_modules',
    '.git',
    'dist',
    '.next',
    'artifacts',
    '*.log',
    'package-lock.json',
];

// Files to explicitly check (even if normally excluded)
const ALWAYS_CHECK_FILES = [
    '.env',
    '.env.local',
    '.env.production',
    '*.key',
    '*_secret*',
    '*_private*',
];

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5.5 Secret Hygiene Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-SECRET-HYGIENE',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        summary: {
            files_scanned: 0,
            violations: 0,
        },
        violations: [],
    };

    try {
        // Get list of tracked files using git
        let filesToScan = [];
        try {
            const gitOutput = execSync('git ls-files', {
                cwd: PROJECT_ROOT,
                encoding: 'utf-8'
            });
            filesToScan = gitOutput.trim().split('\n').filter(f => f);
        } catch (e) {
            // Fallback to scanning all files
            console.log('⚠️ Not a git repository, scanning all files...\n');
            filesToScan = scanDirectory(PROJECT_ROOT);
        }

        console.log(`📋 Scanning ${filesToScan.length} files for private key material...\n`);

        for (const relPath of filesToScan) {
            // Skip excluded patterns
            if (EXCLUDE_PATTERNS.some(p => {
                if (p.includes('*')) {
                    const regex = new RegExp(p.replace(/\*/g, '.*'));
                    return regex.test(relPath);
                }
                return relPath.includes(p);
            })) {
                continue;
            }

            const absPath = path.join(PROJECT_ROOT, relPath);
            if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
                continue;
            }

            results.summary.files_scanned++;

            try {
                const content = fs.readFileSync(absPath, 'utf-8');

                for (const pattern of PRIVATE_KEY_PATTERNS) {
                    const match = content.match(pattern);
                    if (match) {
                        results.violations.push({
                            file: relPath,
                            pattern: pattern.toString(),
                            match: match[0].slice(0, 50) + (match[0].length > 50 ? '...' : ''),
                        });
                        console.log(`  ❌ ${relPath}`);
                        console.log(`     Pattern: ${pattern.toString().slice(0, 40)}...`);
                        console.log(`     Match: ${match[0].slice(0, 30)}...\n`);
                    }
                }
            } catch (e) {
                // Skip binary files
            }
        }

        results.summary.violations = results.violations.length;

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.summary.violations > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.summary.violations} private key violation(s) found`;
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'secret-hygiene.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    const statusEmoji = results.status === 'PASS' ? '✅ PASS' : '❌ FAIL';

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${statusEmoji}`);
    console.log(`  Summary:`);
    console.log(`    - Files scanned: ${results.summary.files_scanned}`);
    console.log(`    - Violations: ${results.summary.violations}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'PASS' ? 0 : 1);
}

function scanDirectory(dir, relativeTo = dir) {
    const files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relPath = path.relative(relativeTo, fullPath);
        if (entry.isDirectory()) {
            if (!EXCLUDE_PATTERNS.includes(entry.name)) {
                files.push(...scanDirectory(fullPath, relativeTo));
            }
        } else {
            files.push(relPath);
        }
    }
    return files;
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
