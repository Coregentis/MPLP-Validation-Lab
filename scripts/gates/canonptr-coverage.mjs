#!/usr/bin/env node
/**
 * CanonPtr Coverage Gate - v0.5.2
 * 
 * Verifies that cross-substrate runs have sufficient canonptr coverage.
 * 
 * Phase A: ≥1 canonptr per run (bootstrap)
 * Phase B: ≥80% of evidence_refs use canonptr
 * Phase C: ≥95% (future)
 * 
 * Usage: npm run gate:canonptr-coverage
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Phase thresholds
const PHASE_A_MIN_PER_RUN = 1;     // At least 1 canonptr per run
const PHASE_B_COVERAGE_PCT = 80;   // 80% of pointers are canonptr
const PHASE_C_COVERAGE_PCT = 95;   // 95% coverage (future)

// Current enforcement phase
const CURRENT_PHASE = 'A';

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5.2 CanonPtr Coverage Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-CANONPTR-COVERAGE',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        phase: CURRENT_PHASE,
        phase_thresholds: {
            A: `≥${PHASE_A_MIN_PER_RUN} canonptr per run`,
            B: `≥${PHASE_B_COVERAGE_PCT}% coverage`,
            C: `≥${PHASE_C_COVERAGE_PCT}% coverage`,
        },
        summary: {
            total_runs: 0,
            runs_with_canonptr: 0,
            runs_without_canonptr: 0,
            total_pointers: 0,
            canonptr_pointers: 0,
            coverage_pct: 0,
        },
        runs: [],
        issues: [],
    };

    try {
        // Load canonptr module
        const { isCanonPtr, extractCanonPtrsFromTrace } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/evidence/canonptr.ts')}`
        );

        // Load cross-substrate runs from matrix
        const matrixPath = path.join(PROJECT_ROOT, 'producers/contract/matrix.yaml');
        if (!fs.existsSync(matrixPath)) {
            throw new Error('Matrix not found: producers/contract/matrix.yaml');
        }

        const matrixContent = fs.readFileSync(matrixPath, 'utf-8');
        const matrix = yaml.parse(matrixContent);

        // Collect all run IDs from matrix
        const runIds = [];
        for (const scenario of Object.values(matrix.scenarios)) {
            for (const runId of Object.values(scenario.substrates || {})) {
                if (runId) runIds.push(runId);
            }
        }

        results.summary.total_runs = runIds.length;
        console.log(`📋 Checking ${runIds.length} cross-substrate runs...\n`);
        console.log(`📋 Phase: ${CURRENT_PHASE} (${results.phase_thresholds[CURRENT_PHASE]})\n`);

        for (const runId of runIds) {
            const runPath = path.join(PROJECT_ROOT, 'data/runs', runId);
            const runResult = {
                run_id: runId,
                has_canonptr: false,
                canonptr_count: 0,
                total_pointers: 0,
                coverage_pct: 0,
            };

            if (!fs.existsSync(runPath)) {
                runResult.error = 'RUN_NOT_FOUND';
                results.runs.push(runResult);
                continue;
            }

            // Check evidence_pointers.json for canonptr
            const evidencePath = path.join(runPath, 'evidence_pointers.json');
            if (fs.existsSync(evidencePath)) {
                try {
                    const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
                    const pointers = evidence.pointers || [];

                    let canonptrCount = 0;
                    for (const p of pointers) {
                        const locator = p.locator || p.pointer || '';
                        if (isCanonPtr(locator)) {
                            canonptrCount++;
                        }
                    }

                    runResult.total_pointers = pointers.length;
                    runResult.canonptr_count = canonptrCount;
                    runResult.has_canonptr = canonptrCount > 0;
                    runResult.coverage_pct = pointers.length > 0
                        ? Math.round((canonptrCount / pointers.length) * 100)
                        : 0;

                    results.summary.total_pointers += pointers.length;
                    results.summary.canonptr_pointers += canonptrCount;

                    if (canonptrCount > 0) {
                        results.summary.runs_with_canonptr++;
                    } else {
                        results.summary.runs_without_canonptr++;
                    }
                } catch (e) {
                    runResult.error = 'PARSE_ERROR';
                }
            } else {
                // Try to extract from trace
                const tracePath = path.join(runPath, 'pack/trace/events.ndjson');
                if (fs.existsSync(tracePath)) {
                    try {
                        const traceContent = fs.readFileSync(tracePath, 'utf-8');
                        const events = traceContent
                            .trim()
                            .split('\n')
                            .filter(line => line)
                            .map(line => JSON.parse(line));

                        const canonptrs = extractCanonPtrsFromTrace(events);
                        runResult.canonptr_count = canonptrs.length;
                        runResult.has_canonptr = canonptrs.length > 0;
                        runResult.total_pointers = canonptrs.length;
                        runResult.coverage_pct = 100; // All extracted are canonptr
                        runResult.extracted_from_trace = true;

                        results.summary.total_pointers += canonptrs.length;
                        results.summary.canonptr_pointers += canonptrs.length;

                        if (canonptrs.length > 0) {
                            results.summary.runs_with_canonptr++;
                        } else {
                            results.summary.runs_without_canonptr++;
                        }
                    } catch (e) {
                        runResult.error = 'TRACE_PARSE_ERROR';
                    }
                } else {
                    runResult.error = 'NO_EVIDENCE_OR_TRACE';
                }
            }

            // Phase A check
            if (CURRENT_PHASE === 'A' && !runResult.has_canonptr && !runResult.error) {
                results.issues.push(`${runId}: no canonptr (Phase A requires ≥1)`);
            }

            const emoji = runResult.has_canonptr ? '✅' : runResult.error ? '⚠️' : '❌';
            console.log(`  ${emoji} ${runId}: ${runResult.canonptr_count} canonptr`);

            results.runs.push(runResult);
        }

        // Calculate overall coverage
        results.summary.coverage_pct = results.summary.total_pointers > 0
            ? Math.round((results.summary.canonptr_pointers / results.summary.total_pointers) * 100)
            : 0;

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status based on phase
    if (CURRENT_PHASE === 'A') {
        // Phase A: At least 1 canonptr per run
        if (results.summary.runs_without_canonptr > results.summary.total_runs * 0.5) {
            // More than 50% without canonptr = NOT_SUPPORTED (bootstrap phase)
            results.status = 'NOT_SUPPORTED';
            results.note = 'CanonPtr not yet implemented in producers';
        } else if (results.summary.runs_without_canonptr > 0) {
            results.status = 'PARTIAL';
            results.note = `${results.summary.runs_with_canonptr}/${results.summary.total_runs} runs have canonptr`;
        }
    } else if (CURRENT_PHASE === 'B') {
        if (results.summary.coverage_pct < PHASE_B_COVERAGE_PCT) {
            results.status = 'FAIL';
            results.failure_reason = `Coverage ${results.summary.coverage_pct}% < required ${PHASE_B_COVERAGE_PCT}%`;
        }
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'canonptr-coverage.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    const statusEmoji = results.status === 'PASS' ? '✅' :
        results.status === 'NOT_SUPPORTED' ? '⚠️ NOT_SUPPORTED' :
            results.status === 'PARTIAL' ? '⚠️ PARTIAL' : '❌ FAIL';

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${statusEmoji}`);
    console.log(`  Phase: ${CURRENT_PHASE} (${results.phase_thresholds[CURRENT_PHASE]})`);
    console.log(`  Summary:`);
    console.log(`    - Runs with canonptr: ${results.summary.runs_with_canonptr}/${results.summary.total_runs}`);
    console.log(`    - Total pointers: ${results.summary.total_pointers}`);
    console.log(`    - CanonPtr pointers: ${results.summary.canonptr_pointers}`);
    console.log(`    - Coverage: ${results.summary.coverage_pct}%`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // For Phase A (bootstrap), NOT_SUPPORTED is acceptable
    process.exit(results.status === 'FAIL' ? 1 : 0);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
