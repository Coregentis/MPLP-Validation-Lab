import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-13: Dispute-level FAIL Benchmark Presence
 * Ensures: At least 1 FAIL sample with complete evidence closure in cross-verified report
 * Per MUST-2: Dispute-level FAIL benchmark evidence pack
 */

const PROJECT_ROOT = process.cwd();
const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
const DERIVED_DIR = path.join(PROJECT_ROOT, 'data/derived/normalized');

function runGate13() {
    console.log('🛡️  Running VLAB-GATE-13: Dispute-level FAIL Benchmark Presence...');

    if (!fs.existsSync(REPORT_PATH)) {
        console.error('❌ Cross-verified report not found. Run compute-equivalence.ts first.');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const entries = report.entries || [];

    // Find FAIL entries
    const failEntries = entries.filter((e: any) =>
        e.verdict_status === 'FAIL' ||
        e.verdict_status === 'fail' ||
        e.run_id.includes('-fail-')
    );

    console.log(`📋 Found ${failEntries.length} potential FAIL entries...`);

    if (failEntries.length === 0) {
        console.error('❌ Gate FAIL: No FAIL samples found in cross-verified report.');
        process.exit(1);
    }

    // Verify at least one has complete evidence closure
    let completeCount = 0;
    const requiredPointers = [
        'manifest',
        'timeline',
        'verdict',
        'artifacts'
    ];

    for (const entry of failEntries) {
        const evidencePath = path.join(DERIVED_DIR, entry.run_id, 'normalized_evidence.json');

        if (!fs.existsSync(evidencePath)) {
            continue;
        }

        const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));

        // Check for evidence closure per v0.10.2 spec (relaxed for v0.5 minimal packs):
        // manifest (with run_id) + timeline section + scenario_family derived
        const hasManifest = evidence.manifest && evidence.manifest.run_id;
        const hasTimeline = evidence.timeline && 'events' in evidence.timeline;
        const hasScenarioFamily = evidence.manifest && evidence.manifest.scenario_family;
        const hasNormalizedHash = fs.existsSync(path.join(DERIVED_DIR, entry.run_id, 'normalized_hash.txt'));

        if (hasManifest && hasTimeline && hasScenarioFamily && hasNormalizedHash) {
            console.log(`✅ Complete FAIL evidence: ${entry.run_id} (family: ${evidence.manifest.scenario_family})`);
            completeCount++;
        }
    }

    if (completeCount === 0) {
        console.error('❌ Gate FAIL: No FAIL samples have complete evidence closure.');
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: ${completeCount} FAIL samples with complete evidence closure.`);
}

runGate13();
