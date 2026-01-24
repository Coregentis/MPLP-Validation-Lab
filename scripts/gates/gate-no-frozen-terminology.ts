import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-19: Prohibit "Frozen" Terminology in UI
 * 
 * Lab governance uses "Sealed" not "Frozen".
 * This gate prevents terminology drift.
 * 
 * Note: "frozen" in lowercase is allowed in technical contexts like
 * "frozen rulesets" or "freeze tag", but UI-visible "{version} Frozen"
 * patterns are forbidden.
 */

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, 'app');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');

// Forbidden patterns (UI-visible Frozen with version context)
const FORBIDDEN_PATTERNS = [
    /\{[^}]*\}\s*Frozen/g,           // {version} Frozen
    /v0\.\d+(\.\d+)?\s+Frozen/g,     // v0.10.2 Frozen
    /site-v\d+\.\d+\s+Frozen/g,      // site-v0.5 Frozen
    /rel-lab-\d+\.\d+\s+Frozen/g,    // rel-lab-0.5 Frozen
];

// Allowlist paths (regex patterns for paths to skip)
const ALLOWLIST_PATHS = [
    /\/_components\/VerdictPanel\.tsx$/,  // Technical terminology
    /\/governance\//,                       // Governance docs
];

// Allowlist content patterns (legitimate uses of "frozen")
const ALLOWLIST_CONTENT = [
    /TERMINOLOGY.*FROZEN/i,           // Documentation comments
    /frozen.*ruleset/i,               // Technical term
    /frozen.*rules/i,                 // Technical term
    /Frozen\s+at\s+{/,               // "Frozen at {freezeTag}" is OK
];

function isAllowlisted(filePath: string): boolean {
    return ALLOWLIST_PATHS.some(pattern => pattern.test(filePath));
}

function isAllowlistedContent(line: string): boolean {
    return ALLOWLIST_CONTENT.some(pattern => pattern.test(line));
}

async function scanFile(filePath: string): Promise<{ file: string; line: number; match: string }[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const violations: { file: string; line: number; match: string }[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Skip allowlisted content
        if (isAllowlistedContent(line)) continue;

        for (const pattern of FORBIDDEN_PATTERNS) {
            const matches = line.match(pattern);
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

    if (!fs.existsSync(dir)) return files;

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

async function runGate19() {
    console.log('🛡️  Running VLAB-GATE-19: Prohibit "Frozen" Terminology in UI...');

    const appFiles = await findTsxFiles(APP_DIR);
    const componentFiles = await findTsxFiles(COMPONENTS_DIR);
    const allFiles = [...appFiles, ...componentFiles];

    const allViolations: { file: string; line: number; match: string }[] = [];

    for (const file of allFiles) {
        if (!isAllowlisted(file)) {
            const violations = await scanFile(file);
            allViolations.push(...violations);
        }
    }

    if (allViolations.length > 0) {
        console.error(`\n❌ Gate FAIL: ${allViolations.length} forbidden "Frozen" patterns found:`);
        for (const v of allViolations) {
            console.error(`   - ${v.file}:${v.line} → "${v.match}"`);
        }
        console.error('\n💡 Use "Sealed" instead of "Frozen" for Lab governance terminology.');
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: No forbidden "Frozen" patterns found in ${allFiles.length} files.`);
}

runGate19();
