#!/usr/bin/env node
/**
 * PR-9: Curated Runs Closure Gate
 * 
 * CI Gate to verify all allowlisted runs can be deterministically adjudicated:
 * 1. loadRunBundle() succeeds (or has clear error)
 * 2. effectiveRulesetRef can be determined
 * 3. registry.getRuleset() returns non-null with adjudicator
 * 4. adjudicator returns RulesetEvalResult
 * 5. Non-PASS verdicts have reason_code
 * 
 * Usage: npm run gate:curated-runs
 * Output: artifacts/curated-runs-closure.report.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  PR-9: Curated Runs Closure Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-CURATED-RUNS-CLOSURE',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        runs: [],
        summary: {
            total: 0,
            adjudicated: 0,
            passed: 0,
            failed: 0,
            not_evaluated: 0,
            missing_reason_code: 0,
            load_errors: 0,
            ruleset_errors: 0,
        }
    };

    try {
        // Import required modules
        const { getCuratedRuns } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/curated/load-curated-runs.ts')}`
        );
        const { loadRunBundle } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/bundles/load_run_bundle.ts')}`
        );
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );
        const { isArbitrationPack } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/ruleset-1.1/applicability.ts')}`
        );

        // Load curated runs
        console.log('📋 Loading curated runs...\n');
        const curatedData = getCuratedRuns();
        const runs = curatedData.runs || [];
        results.summary.total = runs.length;

        console.log(`Found ${runs.length} curated runs\n`);

        for (const runMeta of runs) {
            const runResult = {
                run_id: runMeta.run_id,
                bundle_loaded: false,
                ruleset_ref: null,
                adjudicator_available: false,
                adjudicated: false,
                topline_verdict: null,
                reason_code: null,
                has_reason_code: false,
                status: 'ERROR',
                errors: [],
            };

            console.log(`📦 ${runMeta.run_id}`);

            // Step 1: Load bundle
            let bundle;
            try {
                bundle = loadRunBundle(runMeta.run_id);
                runResult.bundle_loaded = true;
            } catch (e) {
                runResult.errors.push(`Load failed: ${e.message}`);
                results.summary.load_errors++;
                console.log(`   ❌ Load failed: ${e.message}`);
                results.runs.push(runResult);
                continue;
            }

            // Step 2: Determine effective ruleset ref
            const rulesetRef = bundle.bundle_manifest?.ruleset_ref;
            const isArb = isArbitrationPack(runMeta.run_id);
            const effectiveRef = rulesetRef || (isArb ? 'ruleset-1.1' : 'ruleset-1.0');
            runResult.ruleset_ref = effectiveRef;

            // Step 3: Get ruleset from registry
            const ruleset = await getRuleset(effectiveRef);
            if (!ruleset || !ruleset.adjudicator) {
                runResult.errors.push(`Ruleset ${effectiveRef} unavailable or no adjudicator`);
                results.summary.ruleset_errors++;
                console.log(`   ⚠️  Ruleset unavailable: ${effectiveRef}`);
                results.runs.push(runResult);
                continue;
            }
            runResult.adjudicator_available = true;

            // Step 4: Adjudicate
            try {
                const evalResult = await ruleset.adjudicator(bundle);
                runResult.adjudicated = true;
                runResult.topline_verdict = evalResult.topline_verdict;
                runResult.reason_code = evalResult.reason_code || null;
                results.summary.adjudicated++;

                // Count by verdict
                if (evalResult.topline_verdict === 'PASS') {
                    results.summary.passed++;
                    runResult.status = 'PASS';
                    console.log(`   ✅ PASS`);
                } else if (evalResult.topline_verdict === 'FAIL') {
                    results.summary.failed++;
                    runResult.status = 'FAIL';

                    // Check for reason code
                    const hasToplineReason = !!evalResult.reason_code;
                    const hasClauseReason = evalResult.clauses.some(c => c.reason_code);
                    runResult.has_reason_code = hasToplineReason || hasClauseReason;

                    if (!runResult.has_reason_code) {
                        results.summary.missing_reason_code++;
                        console.log(`   ❌ FAIL (MISSING REASON CODE)`);
                    } else {
                        console.log(`   ❌ FAIL (${evalResult.reason_code || 'clause-level reason'})`);
                    }
                } else {
                    results.summary.not_evaluated++;
                    runResult.status = evalResult.topline_verdict;

                    // Check for reason code on non-PASS
                    const hasToplineReason = !!evalResult.reason_code;
                    const hasClauseReason = evalResult.clauses.some(c => c.reason_code);
                    runResult.has_reason_code = hasToplineReason || hasClauseReason;

                    if (!runResult.has_reason_code) {
                        results.summary.missing_reason_code++;
                    }
                    console.log(`   ⚠️  ${evalResult.topline_verdict}`);
                }

            } catch (e) {
                runResult.errors.push(`Adjudication failed: ${e.message}`);
                console.log(`   ❌ Adjudication error: ${e.message}`);
            }

            results.runs.push(runResult);
        }

    } catch (e) {
        results.status = 'ERROR';
        results.summary.errors = [`Gate execution error: ${e.message}`];
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine gate status
    // Gate fails if: missing_reason_code > 0 (silent failures not allowed)
    if (results.summary.missing_reason_code > 0) {
        results.status = 'FAIL';
        results.failure_reason = 'Non-PASS verdicts without reason_code violate closure contract';
    } else if (results.summary.load_errors > 0 || results.summary.ruleset_errors > 0) {
        results.status = 'FAIL';
        results.failure_reason = 'Bundle load or ruleset errors detected';
    }

    // Calculate duration
    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const reportPath = path.join(artifactsDir, 'curated-runs-closure.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log('  Summary:');
    console.log(`    - Total runs: ${results.summary.total}`);
    console.log(`    - Adjudicated: ${results.summary.adjudicated}`);
    console.log(`    - PASS: ${results.summary.passed}`);
    console.log(`    - FAIL: ${results.summary.failed}`);
    console.log(`    - NOT_EVALUATED: ${results.summary.not_evaluated}`);
    console.log(`    - Missing reason_code: ${results.summary.missing_reason_code}`);
    console.log(`    - Load errors: ${results.summary.load_errors}`);
    console.log(`    - Ruleset errors: ${results.summary.ruleset_errors}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Exit with appropriate code
    process.exit(results.status === 'PASS' ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
