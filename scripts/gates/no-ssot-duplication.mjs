#!/usr/bin/env node
/**
 * Gate: No SSOT Duplication (P0-3)
 * 
 * Scans Website and Docs repositories for forbidden SSOT content duplication.
 * Uses category-based regex rules from projection-map.json.
 * 
 * Usage: WEBSITE_ROOT=../MPLP_website DOCS_ROOT=../docs npm run gate:no-ssot-duplication
 * Exit: 0 = PASS, 1 = FAIL
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// =============================================================================
// Configuration
// =============================================================================

const PROJECTION_MAP_PATH = path.join(PROJECT_ROOT, 'export/projection-map.json');
const REPORT_PATH = path.join(PROJECT_ROOT, 'export/gate-reports/no-ssot-duplication.report.json');

// Repo paths from environment
const WEBSITE_ROOT = process.env.WEBSITE_ROOT || path.resolve(PROJECT_ROOT, '../MPLP_website');
const DOCS_ROOT = process.env.DOCS_ROOT || path.resolve(PROJECT_ROOT, '../docs');

// Scan patterns
const WEBSITE_SCAN_PATTERNS = [
    'app/**/*.{tsx,ts,mdx}',
    'components/**/*.{tsx,ts}',
    'lib/**/*.{ts,tsx}',
    'content/**/*.{md,mdx}'
];

const DOCS_SCAN_PATTERNS = [
    'docs/**/*.{md,mdx}',
    'src/**/*.{ts,tsx,js,jsx}'
];

// =============================================================================
// Helpers
// =============================================================================

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesPattern(filename, pattern) {
    // Simple glob pattern matching for *.{ext1,ext2} format
    const extMatch = pattern.match(/\*\*\/\*\.{([^}]+)}/);
    if (extMatch) {
        const exts = extMatch[1].split(',');
        return exts.some(ext => filename.endsWith('.' + ext));
    }
    return false;
}

function walkDir(dir, patterns) {
    const files = [];

    function walk(currentPath) {
        try {
            const entries = fs.readdirSync(currentPath, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);

                // Skip node_modules, .git, .next, dist, etc.
                if (entry.isDirectory()) {
                    const skipDirs = ['node_modules', '.git', '.next', 'dist', 'build', '.turbo', '.vercel'];
                    if (!skipDirs.includes(entry.name)) {
                        walk(fullPath);
                    }
                } else if (entry.isFile()) {
                    // Check if file matches any pattern
                    if (patterns.some(pattern => matchesPattern(entry.name, pattern))) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    walk(dir);
    return files;
}

function isInAllowedPath(filePath, allowPaths, repoRoot) {
    const relativePath = path.relative(repoRoot, filePath);
    for (const pattern of allowPaths) {
        if (pattern.endsWith('/**')) {
            const prefix = pattern.slice(0, -3);
            if (relativePath.startsWith(prefix)) return true;
        } else if (relativePath === pattern || relativePath.startsWith(pattern + '/')) {
            return true;
        }
    }
    return false;
}

function hasContextPhrase(line, contextPhrases) {
    for (const phrase of contextPhrases) {
        if (line.toLowerCase().includes(phrase.toLowerCase())) {
            return true;
        }
    }
    return false;
}

async function scanRepo(repoRoot, scanPatterns, forbiddenRules, allowRules, repoName) {
    console.log(`\n🔍 Scanning ${repoName}...`);
    console.log(`   Root: ${repoRoot}`);

    if (!fs.existsSync(repoRoot)) {
        console.warn(`   ⚠️  Repository not found, skipping`);
        return [];
    }

    const findings = [];

    // Collect all files using custom walker
    const files = walkDir(repoRoot, scanPatterns);

    console.log(`   Found ${files.length} files to scan`);

    // Scan each file
    let scannedCount = 0;
    for (const filePath of files) {
        scannedCount++;
        if (scannedCount % 50 === 0) {
            process.stdout.write(`\r   Progress: ${scannedCount}/${files.length}`);
        }

        // Check if file is in allowed paths
        if (isInAllowedPath(filePath, allowRules.paths || [], repoRoot)) {
            continue;
        }

        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        for (const [category, rule] of Object.entries(forbiddenRules.patterns)) {
            for (const regexPattern of rule.regex || []) {
                const regex = new RegExp(regexPattern, 'gi');

                for (let lineNum = 0; lineNum < lines.length; lineNum++) {
                    const line = lines[lineNum];

                    // Check context phrases (allow)
                    if (hasContextPhrase(line, allowRules.context_phrases || [])) {
                        continue;
                    }

                    const matches = line.matchAll(regex);
                    for (const match of matches) {
                        const excerpt = line.trim().slice(0, 120);
                        findings.push({
                            repo: repoName,
                            file: path.relative(repoRoot, filePath),
                            line: lineNum + 1,
                            category,
                            severity: rule.severity || 'ERROR',
                            pattern: regexPattern,
                            matched_text: match[0],
                            excerpt: excerpt.length < line.trim().length ? excerpt + '...' : excerpt,
                            description: rule.description || ''
                        });
                    }
                }
            }
        }
    }

    console.log(`\r   Progress: ${scannedCount}/${files.length} ✓`);
    return findings;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  No-SSOT-Duplication Gate (P0-3)');
    console.log('═══════════════════════════════════════════════════════════\n');

    try {
        // Load projection map
        if (!fs.existsSync(PROJECTION_MAP_PATH)) {
            console.error(`❌ Projection map not found: ${PROJECTION_MAP_PATH}`);
            process.exit(1);
        }

        const projectionMap = JSON.parse(fs.readFileSync(PROJECTION_MAP_PATH, 'utf-8'));
        console.log(`✓ Loaded projection map v${projectionMap.map_version}\n`);

        // Extract forbidden rules
        const websiteForbidden = projectionMap.forbidden?.website || { patterns: {}, allow: {} };
        const docsForbidden = projectionMap.forbidden?.docs || { patterns: {}, allow: {} };

        console.log(`📋 Forbidden categories:`);
        console.log(`   Website: ${Object.keys(websiteForbidden.patterns).length}`);
        console.log(`   Docs: ${Object.keys(docsForbidden.patterns).length}`);

        // Scan repositories
        const websiteFindings = await scanRepo(WEBSITE_ROOT, WEBSITE_SCAN_PATTERNS, websiteForbidden, websiteForbidden.allow || {}, 'Website');
        const docsFindings = await scanRepo(DOCS_ROOT, DOCS_SCAN_PATTERNS, docsForbidden, docsForbidden.allow || {}, 'Docs');

        const allFindings = [...websiteFindings, ...docsFindings];

        // Classify findings
        const errors = allFindings.filter(f => f.severity === 'ERROR');
        const warnings = allFindings.filter(f => f.severity === 'WARN');

        // Generate report
        const report = {
            gate: 'no-ssot-duplication',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            projection_map_version: projectionMap.map_version,
            scanned_repos: {
                website: { root: WEBSITE_ROOT, exists: fs.existsSync(WEBSITE_ROOT) },
                docs: { root: DOCS_ROOT, exists: fs.existsSync(DOCS_ROOT) }
            },
            summary: {
                total_findings: allFindings.length,
                errors: errors.length,
                warnings: warnings.length
            },
            findings: allFindings
        };

        // Write report
        const reportDir = path.dirname(REPORT_PATH);
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }
        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
        console.log(`\n✓ Report written to: ${path.relative(PROJECT_ROOT, REPORT_PATH)}`);

        // Print summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('  Scan Results:');
        console.log('═══════════════════════════════════════════════════════════\n');

        if (errors.length > 0) {
            console.error(`❌ ERRORS FOUND (${errors.length}):\n`);

            // Group by category
            const errorsByCategory = {};
            for (const error of errors) {
                if (!errorsByCategory[error.category]) {
                    errorsByCategory[error.category] = [];
                }
                errorsByCategory[error.category].push(error);
            }

            for (const [category, items] of Object.entries(errorsByCategory)) {
                console.error(`\n  ${category} (${items.length}):`);
                for (const item of items.slice(0, 5)) { // Show first 5
                    console.error(`    ${item.repo}/${item.file}:${item.line}`);
                    console.error(`      Matched: "${item.matched_text}"`);
                    console.error(`      Context: ${item.excerpt}`);
                }
                if (items.length > 5) {
                    console.error(`    ... and ${items.length - 5} more`);
                }
            }

            console.error(`\n💡 Review full report: ${path.relative(PROJECT_ROOT, REPORT_PATH)}\n`);
        }

        if (warnings.length > 0) {
            console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
            console.log(`   See report for details\n`);
        }

        if (allFindings.length === 0) {
            console.log('✅ No forbidden SSOT duplication detected\n');
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log(`  Gate Status: ${errors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`  Errors: ${errors.length} | Warnings: ${warnings.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        process.exit(errors.length === 0 ? 0 : 1);

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
