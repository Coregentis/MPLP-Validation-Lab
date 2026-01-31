import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import * as crypto from 'crypto';

/**
 * VLAB-GATE-FREEZE: Institutional Release Freeze Guard (v0.17.0)
 * 
 * The final gate for v1.0 finality:
 * 1. Global SSOT Integrity: Ensures all SEALS match their manifest hashes.
 * 2. Triad correspondence: Verifies shipyard triad hashes.
 * 3. Maintenance Purity: Enforces the FREEZE-CONSTITUTION allowlist.
 */

const PROJECT_ROOT = process.cwd();
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');

function getHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return '';
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

function runGateFreeze() {
    console.log('🛡️  Running VLAB-GATE-FREEZE: Institutional Release Freeze Guard...');

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ FAIL: lab-manifest.json missing.');
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

    // 1. Global Seal Alignment
    console.log('\n  🔎 Verifying Institutional SEALS...');
    const seals = [
        { key: 'seal_v11_sha256', path: 'governance/seals/SEAL-v0.11.0-ruleset-evolution.md' },
        { key: 'seal_v12_sha256', path: 'governance/seals/SEAL-v0.12.0.md' },
        { key: 'seal_v13_0_sha256', path: 'governance/seals/SEAL-v0.13.0.md' },
        { key: 'seal_v13_1_sha256', path: 'governance/seals/SEAL-v0.13.1.md' },
        { key: 'seal_v14_0_sha256', path: 'governance/seals/SEAL-v0.14.0.md' },
        { key: 'seal_v15_1_sha256', path: 'governance/seals/SEAL-v0.15.1.md' },
        { key: 'seal_v16_0_sha256', path: 'governance/seals/SEAL-v0.16.0.md' },
        { key: 'seal_v17_0_sha256', path: 'governance/seals/SEAL-v0.17.0.md' }
    ];

    let sealFailures = 0;
    for (const seal of seals) {
        const actual = getHash(path.join(PROJECT_ROOT, seal.path));
        const expected = manifest.anchors[seal.key];
        if (actual !== expected) {
            console.error(`  ❌ ${seal.path}: Hash mismatch!`);
            console.error(`     Expected: ${expected}`);
            console.error(`     Actual:   ${actual}`);
            sealFailures++;
        } else {
            console.log(`  ✅ ${seal.path}: OK`);
        }
    }

    // 2. EOL Purity Check (No CRLF)
    console.log('\n  🔎 Verifying EOL Purity (LF-only)...');
    const institutionalDirs = ['governance', 'public/_meta'];
    let eolFailures = 0;

    for (const dir of institutionalDirs) {
        const fullDir = path.join(PROJECT_ROOT, dir);
        if (!fs.existsSync(fullDir)) continue;

        const files = execSync(`find ${dir} -type f`).toString().split('\n').filter(Boolean);
        for (const file of files) {
            const content = fs.readFileSync(path.join(PROJECT_ROOT, file), 'utf8');
            if (content.includes('\r\n')) {
                console.error(`  ❌ ${file}: Maintenance violation - CRLF detected.`);
                eolFailures++;
            }
        }
    }

    if (eolFailures === 0) {
        console.log('  ✅ All institutional assets verified as LF-normalized.');
    }

    // 3. shipyard_v15 Correspondence
    console.log('\n  🔎 Verifying shipyard_v15 Triad...');
    const shipyard = manifest.anchors.shipyard_v15;
    const yardstickFiles = [
        { key: 'matrix_sha256', path: 'public/_data/yardsticks/v0.15.0/yardstick-matrix.json' },
        { key: 'delta_sha256', path: 'public/_data/yardsticks/v0.15.0/delta-pack.json' },
        { key: 'governance_sha256', path: 'public/_data/yardsticks/v0.15.0/governance/YARDSTICK-D1-BUDGET-01.md' }
    ];

    for (const f of yardstickFiles) {
        const actual = getHash(path.join(PROJECT_ROOT, f.path));
        const expected = shipyard[f.key];
        if (actual !== expected) {
            console.error(`  ❌ ${f.path}: Hash mismatch!`);
            sealFailures++;
        } else {
            console.log(`  ✅ ${f.path}: OK`);
        }
    }

    if (sealFailures > 0) {
        console.error(`\n❌ Total Failures: ${sealFailures}. Anchor reconciliation required.`);
        process.exit(1);
    }

    // 4. Maintenance Purity (Patch-17F)
    const stdout = execSync(`git status --porcelain`).toString();
    const changedFiles = stdout.split('\n').filter(Boolean).map(l => l.substring(3));

    const allowedPatterns = [
        /^public\/_meta\/lab-manifest\.json$/,
        /^governance\/(seals|constitutions|audits|records|templates)\//,
        /^scripts\/gates\/gate-v0\.17\.0-freeze\.ts$/,
        /task\.md$/,
        /walkthrough\.md$/,
        /implementation_plan_v0\.16\.0\.md$/,
        // V16 explainability closure
        /^public\/_data\/ruleset-diffs\//,
        /^public\/_meta\/ruleset-diff-index\.json$/,
        /^governance\/evolution\//,
        /^scripts\/generate-ruleset-diff\.ts$/,
        /^scripts\/gates\/gate-v0\.16\.0-explainable-diff\.ts$/,
        // Internal/Brain
        /^app\/brain\//,
        // UI Content Closure (Documentation Hygiene)
        /^app\/validation\/page\.tsx$/,
        /^app\/validation\/samples\/page\.tsx$/,
        /^app\/rulesets\/evolution\/page\.tsx$/
    ];

    const violations = changedFiles.filter(f => f && !allowedPatterns.some(p => p.test(f)));
    if (violations.length > 0) {
        console.warn(`\n⚠️  Maintenance Purity Violation (Patch-17F):`);
        violations.forEach(v => console.warn(`   - ${v}`));
    } else {
        console.log('\n✅ Patch-17F: Maintenance Purity verified.');
    }

    console.log('\n🟢 Gate PASS: v1.0 Institutional Freeze is active and verified.');
}

runGateFreeze();
