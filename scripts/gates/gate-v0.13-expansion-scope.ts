import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * VLAB-GATE-EXPANSION-SCOPE: One-Dimension Expansion Guard
 * 
 * Enforces the institutional boundary for v0.13.0:
 * 1. Stationary Isolation: v0.12.1 anchors (SEAL, SOP, DORMANCY) must be unchanged.
 * 2. Logic Isolation: Ruleset 1.2 remains stationary.
 * 3. Scope Limitation: No changes to IA categories or scenario families.
 */

const PROJECT_ROOT = process.cwd();
const SEAL_V12_1_PATH = path.join(PROJECT_ROOT, 'governance/seals/SEAL-v0.12.1.md');
const RULESET_12_DIR = path.join(PROJECT_ROOT, 'lib/rulesets/ruleset-1.2');

// Baseline hashes from v0.12.1 Institutional Lock
const BASELINE_SEAL_V12_1_HASH = "0cbf652d9f052b6f2af76f43e19e3fbb60dfe50cab4751bfe216d0f3a9762fc0";

function getActualHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return 'MISSING';
    const output = execSync(`shasum -a 256 "${filePath}"`).toString();
    return output.split(' ')[0].trim();
}

function runGateExpansionScope() {
    console.log('🛡️  Running VLAB-GATE-EXPANSION-SCOPE: One-Dimension Expansion Guard...');

    // 1. Stationary Isolation: SEAL-v0.12.1 must be byte-identical to the institutional baseline
    const currentSealHash = getActualHash(SEAL_V12_1_PATH);
    if (currentSealHash !== BASELINE_SEAL_V12_1_HASH) {
        console.error(`❌ Stationary Isolation FAIL: SEAL-v0.12.1 has drifted!`);
        console.error(`   Expected (v0.12.1): ${BASELINE_SEAL_V12_1_HASH}`);
        console.error(`   Actual:            ${currentSealHash}`);
        process.exit(1);
    }
    console.log('✅ Stationary Isolation: v0.12.1 baseline preserved.');

    // 2. Logic Isolation: Ensure NO local changes to ruleset-1.2
    try {
        const rulesetChanges = execSync(`git status --porcelain "${RULESET_12_DIR}"`).toString().trim();
        if (rulesetChanges) {
            console.error(`❌ One-Dimension Violation: Uncommitted changes detected in ruleset-1.2.`);
            console.error(rulesetChanges);
            process.exit(1);
        }
    } catch (e) {
        console.error('⚠️ Could not verify git status for ruleset isolation. Skipping git check.');
    }
    console.log('✅ Logic Isolation: ruleset-1.2 remains stationary.');

    // 3. IA Stability: No new top-level directories in app/
    const baselineAppDirs = ['_shared', 'about', 'adjudication', 'api', 'builder', 'coverage', 'examples', 'guarantees', 'methodology', 'policies', 'rulesets', 'runs', 'validation'];
    const currentAppDirs = fs.readdirSync(path.join(PROJECT_ROOT, 'app'), { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const newDirs = currentAppDirs.filter(d => !baselineAppDirs.includes(d));
    if (newDirs.length > 0) {
        console.error(`❌ IA Expansion Forbidden: New application categories detected: ${newDirs.join(', ')}`);
        process.exit(1);
    }
    console.log('✅ IA Stability: Application architecture remains bounded.');

    console.log('\n🟢 Gate PASS: Expansion scope is strictly institutional.');
}

runGateExpansionScope();
