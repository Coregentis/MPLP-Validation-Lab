import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-30: FAIL Benchmark Disclosure Integrity
 * Ensures: 
 * 1. At least 1 FAIL sample is identified in the cross-verified report.
 * 2. That sample has a corresponding 'Dispute-grade' benchmark file in public/_data/benchmarks/
 * 3. The benchmark file contains: verdict, evidence_closure, and timeline.
 */

const PROJECT_ROOT = process.cwd();
const REPORT_PATH = path.join(PROJECT_ROOT, 'public/_data/cross-verified/v0.10.2-report.json');
const BENCHMARKS_DIR = path.join(PROJECT_ROOT, 'public/_data/benchmarks');

function runGate30() {
    console.log('🛡️  Running VLAB-GATE-30: FAIL Benchmark Disclosure Integrity...');

    if (!fs.existsSync(REPORT_PATH)) {
        console.error('❌ Cross-verified report not found.');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const entries = report.entries || [];

    // Find FAIL entries
    const failEntries = entries.filter((e: any) => e.verdict_status === 'FAIL');

    if (failEntries.length === 0) {
        console.error('❌ Gate FAIL: No entries with "verdict_status": "FAIL" found in report.');
        process.exit(1);
    }

    console.log(`📋 Found ${failEntries.length} FAIL entries in report. Checking benchmark closure...`);

    let validBenchmarkCount = 0;

    for (const entry of failEntries) {
        // We match by run_id (mapped to a file or found in benchmarks directory)
        // For simplicity, we check if ANY benchmark file in the directory matches this run_id
        const benchmarkFiles = fs.readdirSync(BENCHMARKS_DIR);

        for (const file of benchmarkFiles) {
            const content = JSON.parse(fs.readFileSync(path.join(BENCHMARKS_DIR, file), 'utf8'));

            if (content.run_id === entry.run_id) {
                console.log(`🔍 Found benchmark for ${entry.run_id} in ${file}`);

                // Validate structural integrity (Dispute-grade)
                const hasVerdict = content.verdict && content.verdict.status === 'FAIL';
                const hasClosure = content.evidence_closure && content.evidence_closure.manifest_hash;
                const hasTimeline = content.dispute_grade_artifacts && Array.isArray(content.dispute_grade_artifacts.timeline);

                if (hasVerdict && hasClosure && hasTimeline) {
                    console.log(`✅ Dispute-grade closure verified for ${entry.run_id}`);
                    validBenchmarkCount++;
                } else {
                    console.warn(`⚠️ Benchmark ${file} exists but lacks full dispute-grade closure.`);
                }
            }
        }
    }

    if (validBenchmarkCount === 0) {
        console.error('❌ Gate FAIL: No FAIL entries have a valid dispute-grade benchmark artifact.');
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: ${validBenchmarkCount} FAIL benchmark(s) verified with evidence closure.`);
}

runGate30();
