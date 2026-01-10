/**
 * GATE-07: PII/Path Leak Lint
 * 
 * Scans output files (reports, proofs) for absolute paths and PII patterns.
 * Blocks external output containing environment fingerprints.
 * 
 * P0-2/P0-5: Systematic prevention of path leaks.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Configuration
// =============================================================================

const GATE_ID = 'GATE-07';
const GATE_NAME = 'PII/Path Leak Lint';

/** Directories to scan for output files */
const SCAN_DIRS = [
    'data/runs',
    'artifacts',
];

/** File patterns to check */
const FILE_PATTERNS = [
    '*.report.json',
    '*.proof.json',
];

/** Forbidden patterns - absolute paths and JS artifacts */
const FORBIDDEN_PATTERNS = [
    /\/Users\/[^"'\s]+/g,           // macOS home dir
    /\/home\/[^"'\s]+/g,            // Linux home dir
    /C:\\Users\\[^"'\s]+/gi,        // Windows home dir
    /: undefined/g,                  // JS undefined leak in output
    /: "undefined"/g,               // Quoted undefined
];

/** Pattern descriptions for reporting */
const PATTERN_DESCRIPTIONS = [
    '/Users/ (macOS absolute path)',
    '/home/ (Linux absolute path)',
    'C:\\Users\\ (Windows absolute path)',
    'undefined (JS artifact leak)',
    '"undefined" (quoted JS artifact)',
];

// =============================================================================
// Gate Implementation
// =============================================================================

interface Match {
    file: string;
    line: number;
    pattern: string;
    content: string;
}

function scanFile(filePath: string): Match[] {
    const matches: Match[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        for (let p = 0; p < FORBIDDEN_PATTERNS.length; p++) {
            const pattern = FORBIDDEN_PATTERNS[p];
            // Reset lastIndex for global regex
            pattern.lastIndex = 0;
            if (pattern.test(line)) {
                matches.push({
                    file: filePath,
                    line: i + 1,
                    pattern: PATTERN_DESCRIPTIONS[p],
                    content: line.trim().substring(0, 100),
                });
            }
        }
    }

    return matches;
}

function findFiles(dir: string, patterns: string[]): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) {
        return results;
    }

    const walkDir = (currentPath: string) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            if (entry.isDirectory()) {
                walkDir(fullPath);
            } else if (entry.isFile()) {
                // Check if file matches any pattern
                for (const pattern of patterns) {
                    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
                    if (regex.test(entry.name)) {
                        results.push(fullPath);
                        break;
                    }
                }
            }
        }
    };

    walkDir(dir);
    return results;
}

function runGate(): { passed: boolean; matches: Match[]; fileCount: number } {
    const allMatches: Match[] = [];
    let fileCount = 0;

    for (const dir of SCAN_DIRS) {
        const fullDir = path.join(process.cwd(), dir);
        const files = findFiles(fullDir, FILE_PATTERNS);
        fileCount += files.length;

        for (const file of files) {
            const matches = scanFile(file);
            allMatches.push(...matches);
        }
    }

    return {
        passed: allMatches.length === 0,
        matches: allMatches,
        fileCount,
    };
}

// =============================================================================
// Main
// =============================================================================

const result = runGate();

if (result.passed) {
    console.log(`[${GATE_ID}] ${GATE_NAME}: PASS (files=${result.fileCount}, matches=0)`);
    console.log(`   Note: scanDirs: ${SCAN_DIRS.join(', ')}`);
    process.exit(0);
} else {
    console.error(`[${GATE_ID}] ${GATE_NAME}: FAIL (files=${result.fileCount}, matches=${result.matches.length})`);
    console.error('');
    for (const match of result.matches) {
        console.error(`  ${match.file}:${match.line}`);
        console.error(`    Pattern: ${match.pattern}`);
        console.error(`    Content: ${match.content}`);
        console.error('');
    }
    process.exit(1);
}
