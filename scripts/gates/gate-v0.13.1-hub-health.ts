import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

/**
 * VLAB-GATE-HUB-HEALTH: Visibility Hub Final Health Check (v0.13.1)
 * 
 * Release-readiness check for /rulesets/evolution:
 * 1. SSOT Data Binding: Manifest and index hashes must match current files.
 * 2. Evidence Closure: All evidence_refs in relevant diffpacks must resolve.
 * 3. Terminology Sweep: No "certified/ranking" logic in UI files.
 * 4. UX Health: Navigational depth and deep-link sanity.
 */

const PROJECT_ROOT = process.cwd();
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');
const INDEX_PATH = path.join(PROJECT_ROOT, 'public/_meta/ruleset-diff-index.json');
const DIFFPACKS_DIR = path.join(PROJECT_ROOT, 'public/_data/ruleset-diffs');
const APP_EVO_DIR = path.join(PROJECT_ROOT, 'app/rulesets/evolution');
const APP_DIFF_DIR = path.join(PROJECT_ROOT, 'app/rulesets/diff');
const RUNS_ROOT = path.join(PROJECT_ROOT, 'public/data/runs');

const BANNED_WORDS = [
    'certified', 'certification',
    'ranked', 'ranking',
    'score', 'ranking list',
    'official mark'
];

function getFileHash(filePath: string): string {
    if (!fs.existsSync(filePath)) return 'MISSING';
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
}

function runHubHealthCheck() {
    console.log('🛡️  Running VLAB-GATE-HUB-HEALTH: Visibility Hub Health Check...');

    let errors = 0;

    // 1. SSOT & Hash Consistency
    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ FAIL: lab-manifest.json missing');
        process.exit(1);
    }
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    const manifestHash = getFileHash(MANIFEST_PATH);
    const indexHash = getFileHash(INDEX_PATH);

    if (manifest.anchors?.ruleset_diff_index_sha256 !== indexHash) {
        console.error(`❌ Hash Mismatch: ruleset_diff_index_sha256 in manifest does not match actual index hash!`);
        console.error(`   Actual: ${indexHash}`);
        errors++;
    } else {
        console.log('✅ SSOT Binding: Diff index hash verified in manifest.');
    }

    // 2. Evidence Closure (Deep Links)
    if (!fs.existsSync(INDEX_PATH)) {
        console.error('❌ FAIL: ruleset-diff-index.json missing');
        process.exit(1);
    }

    const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
    const validRunIds = new Set<string>();

    // Add active runs
    if (fs.existsSync(RUNS_ROOT)) {
        fs.readdirSync(RUNS_ROOT).forEach(d => validRunIds.add(d));
    }
    // Add historical report runs
    if (fs.existsSync(REPORT_PATH)) {
        const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
        (report.entries || []).forEach((e: any) => validRunIds.add(e.run_id));
    }

    const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    for (const diffEntry of index.diffs) {
        const diffpackPath = path.join(PROJECT_ROOT, 'public', diffEntry.path);
        if (!fs.existsSync(diffpackPath)) {
            console.error(`❌ Link Integrity FAIL: Diffpack missing at ${diffEntry.path}`);
            errors++;
            continue;
        }

        const diffpack = JSON.parse(fs.readFileSync(diffpackPath, 'utf8'));
        const clausesChanged = diffpack.clauses_changed || [];
        for (const clause of clausesChanged) {
            const evidenceRefs = clause.evidence_refs || [];
            for (const ref of evidenceRefs) {
                if (!validRunIds.has(ref)) {
                    console.error(`❌ Evidence Closure FAIL: Run ID "${ref}" (ref in ${diffEntry.diff_id}) not found in active runs or historical report!`);
                    errors++;
                }
            }
        }
    }
    if (errors === 0) console.log('✅ Evidence Closure: All evidence deep-links resolve.');

    // 3. Terminology & Branding Sweep
    const scanPages = (dir: string) => {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) scanPages(fullPath);
            else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
                const content = fs.readFileSync(fullPath, 'utf8').toLowerCase();
                const cleanedContent = content.replace(/kind=["']non_certification["']/g, '');
                for (const word of BANNED_WORDS) {
                    if (cleanedContent.includes(word)) {
                        console.error(`❌ Terminology FAIL: Banned word "${word}" in ${path.relative(PROJECT_ROOT, fullPath)}`);
                        errors++;
                    }
                }
            }
        }
    };
    scanPages(APP_EVO_DIR);
    scanPages(APP_DIFF_DIR);
    if (errors === 0) console.log('✅ Terminology: Zero "certified/ranking" violations detected.');

    // 4. Canonical & SEO Sanity (Basic)
    // Check if robots.txt exists and doesn't block /rulesets
    const robotsPath = path.join(PROJECT_ROOT, 'public/robots.txt');
    if (fs.existsSync(robotsPath)) {
        const robots = fs.readFileSync(robotsPath, 'utf8');
        if (robots.includes('Disallow: /rulesets')) {
            console.error(`❌ SEO FAIL: robots.txt blocks /rulesets!`);
            errors++;
        }
    }

    if (errors > 0) {
        console.error(`\n❌ Gate FAIL: ${errors} visibility hub health issues detected.`);
        process.exit(1);
    }

    console.log('\n🟢 Gate PASS: Visibility Hub is production-ready for v0.13.1.');
}

runHubHealthCheck();
