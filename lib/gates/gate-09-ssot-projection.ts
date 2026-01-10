#!/usr/bin/env node
/**
 * GATE-09: SSOT Projection Guard
 * 
 * Prevents hash hardcoding in UI/docs by scanning for:
 * - verdict_hash / pack_root_hash field assignments with 64-hex values
 * - Raw 64-hex literals in non-allowlisted files
 * 
 * Allowlisted paths: allowlist.yaml, curated-runs.json, governance/preflight
 */

import fs from 'fs';
import path from 'path';

interface Gate09Result {
    passed: boolean;
    filesScanned: number;
    matches: Match[];
}

interface Match {
    file: string;
    line: number;
    content: string;
    term: string;
}

const SCAN_DIRS = ['app', 'components', 'lib', 'docs'];
const EXCLUDE_DIRS = ['node_modules', '.next', 'dist', 'coverage', '.git'];
const ALLOWLIST_PATHS = [
    'data/curated-runs/allowlist.yaml',
    'public/_data/curated-runs.json',
    'phase-3-seal.md',
    'governance/preflight'
];

const FORBIDDEN_PATTERNS = [
    { term: 'verdict_hash:', pattern: /verdict_hash:\s*["']?[a-f0-9]{64}/ },
    { term: 'pack_root_hash:', pattern: /pack_root_hash:\s*["']?[a-f0-9]{64}/ },
    { term: '64-hex-literal', pattern: /\b[a-f0-9]{64}\b/ }
];

function runGate09(): Gate09Result {
    const matches: Match[] = [];
    let filesScanned = 0;

    for (const dir of SCAN_DIRS) {
        if (!fs.existsSync(dir)) continue;
        scanDirectory(dir, matches);
    }

    function scanDirectory(dirPath: string, matches: Match[]) {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                if (!EXCLUDE_DIRS.includes(entry.name)) {
                    scanDirectory(fullPath, matches);
                }
            } else if (entry.isFile()) {
                // Check if in allowlist
                if (ALLOWLIST_PATHS.some(allowed => fullPath.includes(allowed))) {
                    continue;
                }

                // Scan file
                if (fullPath.match(/\.(ts|tsx|js|jsx|md|mdx)$/)) {
                    filesScanned++;
                    scanFile(fullPath, matches);
                }
            }
        }
    }

    function scanFile(filePath: string, matches: Match[]) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
            for (const { term, pattern } of FORBIDDEN_PATTERNS) {
                if (pattern.test(line)) {
                    matches.push({
                        file: filePath,
                        line: index + 1,
                        content: line.trim().slice(0, 100),
                        term
                    });
                }
            }
        });
    }

    return {
        passed: matches.length === 0,
        filesScanned,
        matches: matches.slice(0, 20)
    };
}

// CLI
if (require.main === module) {
    const result = runGate09();

    console.log('='.repeat(60));
    console.log('GATE-09: SSOT Projection Guard');
    console.log('='.repeat(60));
    console.log(`\nFiles scanned: ${result.filesScanned}`);

    if (result.passed) {
        console.log('\n✅ GATE-09 PASSED (no hash hardcoding detected)');
        process.exit(0);
    } else {
        console.log(`\n❌ GATE-09 FAILED (${result.matches.length} violations)\n`);

        for (const match of result.matches) {
            console.log(`  - ${match.file}:${match.line} [${match.term}]`);
            console.log(`    ${match.content}`);
        }

        console.log('\nFix: Remove hardcoded hashes; read from curated-runs.json artifact.');
        process.exit(1);
    }
}

export { runGate09 };
