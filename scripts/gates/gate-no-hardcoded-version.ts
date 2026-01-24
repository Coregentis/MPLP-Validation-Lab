import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-17: Prohibit Hardcoded site-v0.x Version Strings
 * 
 * Scans all TSX files in app/ for forbidden hardcoded version patterns.
 * Prevents regression of V-01 type issues.
 */

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, 'app');

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
    /site-v0\.\d+/g,      // site-v0.5, site-v0.10, etc.
    /rel-lab-0\.\d+/g,    // rel-lab-0.5, etc.
];

// Allowlist paths (regex patterns for paths to skip)
const ALLOWLIST_PATHS = [
    /releases\/archive/,
];

function isAllowlisted(filePath: string): boolean {
    return ALLOWLIST_PATHS.some(pattern => pattern.test(filePath));
}

async function scanFile(filePath: string): Promise<{ file: string; line: number; match: string }[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations: { file: string; line: number; match: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
        for (const pattern of FORBIDDEN_PATTERNS) {
            const matches = lines[i].match(pattern);
            if (matches) {
                violations.push({
                    file: path.relative(PROJECT_ROOT, filePath),
                    line: i + 1,
                    match: matches[0],
                });
            }
        }
    }

    return violations;
}

async function findTsxFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== 'node_modules') {
            files.push(...await findTsxFiles(fullPath));
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
            files.push(fullPath);
        }
    }

    return files;
}

async function runGate17() {
    console.log('🛡️  Running VLAB-GATE-17: Prohibit Hardcoded Version Strings...');

    const files = await findTsxFiles(APP_DIR);
    const allViolations: { file: string; line: number; match: string }[] = [];

    for (const file of files) {
        if (!isAllowlisted(file)) {
            const violations = await scanFile(file);
            allViolations.push(...violations);
        }
    }

    if (allViolations.length > 0) {
        console.error(`\n❌ Gate FAIL: ${allViolations.length} forbidden version strings found:`);
        for (const v of allViolations) {
            console.error(`   - ${v.file}:${v.line} → "${v.match}"`);
        }
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: No forbidden version strings found in ${files.length} files.`);
}

runGate17();
