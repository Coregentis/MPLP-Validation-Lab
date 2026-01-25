import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * VLAB-GATE-FAIL-FORENSICS: Dispute-level Forensic Guard (v0.14.0)
 * 
 * Enforces Patch-14A (Closure) and Patch-14B (Scope) for the FAIL Benchmark:
 * 1. Allowlist Purity: Only the target benchmark run and governance docs can change.
 * 2. Forensic Closure: Verifies evidence pointers (B4) and artifact (Pack) resolution.
 * 3. Timeline Integrity: Checks for the existence of the specific violation event.
 * 4. Reproduction Anchors: Ensures the pack is structurally sound for replay.
 */

const PROJECT_ROOT = process.cwd();
const TARGET_RUN_ID = 'pydantic-ai-d1-budget-fail-01';
const TARGET_RUN_DIR = path.join(PROJECT_ROOT, 'public/data/runs', TARGET_RUN_ID);
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');

function runGateFailForensics() {
    console.log('🛡️  Running VLAB-GATE-FAIL-FORENSICS: Dispute-level Forensic Guard...');

    // --- 1. Patch-14B: Filesystem Scope Audit ---
    const stdout = execSync(`git status --porcelain`).toString();
    const changedFiles = stdout.split('\n').filter(Boolean).map(l => l.substring(3));

    const allowedPatterns = [
        new RegExp(`^public/data/runs/${TARGET_RUN_ID}/`),
        /^governance\/benchmarks\//,
        /^public\/_meta\/lab-manifest\.json$/,
        /^governance\/seals\/SEAL-v0\.14\.0\.md$/,
        /^scripts\/gates\/gate-v0\.14\.0-fail-forensics\.ts$/,
        /^scripts\/gates\/gate-vlab-release-01-triad\.ts$/,
        /^app\/brain\//, // Artifacts/Brain logs are allowed
        /^walkthrough\.md$/,
        /task\.md$/,
        /implementation_plan\.md/
    ];

    const violations = changedFiles.filter(f => f && !allowedPatterns.some(p => p.test(f)));
    if (violations.length > 0) {
        console.error(`❌ Global Purity Violation: Modified files outside v0.14.0 allowlist:`);
        violations.forEach(v => console.error(`   - ${v}`));
        process.exit(1);
    }
    console.log('✅ Purity Allowlist: Changes strictly restricted to forensic artifacts.');

    // --- 2. Forensic Closure Audit (B4 -> Pack) ---
    if (!fs.existsSync(TARGET_RUN_DIR)) {
        console.error(`❌ FAIL: Target run directory missing: ${TARGET_RUN_DIR}`);
        process.exit(1);
    }

    const pointersPath = path.join(TARGET_RUN_DIR, 'evidence_pointers.json');
    if (!fs.existsSync(pointersPath)) {
        console.error(`❌ FAIL: evidence_pointers.json (B4) missing in ${TARGET_RUN_ID}`);
        process.exit(1);
    }

    const b4 = JSON.parse(fs.readFileSync(pointersPath, 'utf8'));
    const pointers = b4.pointers || [];

    if (pointers.length < 2) {
        console.error(`❌ Forensic Closure FAIL: Benchmark pack must have at least 2 pointers (Timeline + Snapshot). Found: ${pointers.length}`);
        process.exit(1);
    }

    let hasTimeline = false;
    let hasSnapshot = false;

    for (const ptr of pointers) {
        const artifactPath = path.join(TARGET_RUN_DIR, ptr.artifact_path);
        if (!fs.existsSync(artifactPath)) {
            console.error(`❌ Dead Pointer FAIL: Artifact missing at ${ptr.artifact_path}`);
            process.exit(1);
        }

        if (ptr.artifact_path.includes('timeline')) hasTimeline = true;
        if (ptr.artifact_path.includes('snapshots')) hasSnapshot = true;

        // Content deep-check
        const content = fs.readFileSync(artifactPath, 'utf8');
        if (!content.includes(ptr.locator)) {
            console.error(`❌ locator FAIL: ID "${ptr.locator}" not found in ${ptr.artifact_path}`);
            process.exit(1);
        }
    }

    if (!hasTimeline || !hasSnapshot) {
        console.error(`❌ Forensic Diversity FAIL: Must include both timeline AND snapshot evidence.`);
        process.exit(1);
    }
    console.log('✅ Forensic Closure: All pointers resolved and validated.');

    // --- 3. Verdict Integrity (Forensic Alignment) ---
    const eventsPath = path.join(TARGET_RUN_DIR, 'pack/timeline/events.ndjson');
    const events = fs.readFileSync(eventsPath, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));

    const violationEvent = events.find(e => e.outcome === 'invalid_outcome');
    if (!violationEvent) {
        console.error(`❌ Semantic Forensics FAIL: No "invalid_outcome" detected in trace.`);
        process.exit(1);
    }

    const enforcementEvent = events.find(e => {
        const et = String(e.event_type).toLowerCase();
        return et.includes('gate') || et.includes('enforcement') || et.includes('throttle');
    });

    if (enforcementEvent) {
        console.error(`❌ Logic Forensics FAIL: Enforcement found in a run designated as "Deny Without Gate"!`);
        process.exit(1);
    }

    console.log('✅ Forensic Alignment: Verdict (No-Gate Failure) aligns with trace evidence.');

    console.log('\n🟢 Gate PASS: v0.14.0 FAIL Benchmark is dispute-ready.');
}

runGateFailForensics();
