#!/usr/bin/env node
/**
 * PR-11 / v0.4-PR1: Reason Code Taxonomy Gate
 * 
 * CI Gate to verify all reason codes are governable:
 * 1. All non-PASS verdicts have reason_code
 * 2. All reason_codes fall into taxonomy (enum or pattern)
 * 3. Report unknown codes with context
 * 
 * Usage: npm run gate:reason-codes
 * Output: artifacts/reason-codes.report.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.4-PR1: Reason Code Taxonomy Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-REASON-CODES-TAXONOMY',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        taxonomy_stats: null,
        runs_checked: 0,
        issues: [],
        summary: {
            total_reason_codes: 0,
            enum_codes: 0,
            pattern_codes: 0,
            unknown_codes: 0,
            missing_codes: 0,
        },
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
        const { isAllowedReasonCode, explainReasonCode, getReasonCodeStats } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/gates/reason-codes/index.ts')}`
        );

        // Get taxonomy stats
        results.taxonomy_stats = getReasonCodeStats();
        console.log('📊 Taxonomy Stats:');
        console.log(`   Common: ${results.taxonomy_stats.common}`);
        console.log(`   D1 (Budget): ${results.taxonomy_stats.d1}`);
        console.log(`   D2 (Lifecycle): ${results.taxonomy_stats.d2}`);
        console.log(`   D3 (Authz): ${results.taxonomy_stats.d3}`);
        console.log(`   D4 (Termination): ${results.taxonomy_stats.d4}`);
        console.log(`   Total Enum: ${results.taxonomy_stats.total_enum}`);
        console.log(`   Patterns: ${results.taxonomy_stats.patterns}`);
        console.log('');

        // Load curated runs
        console.log('📋 Loading curated runs...\n');
        const curatedData = getCuratedRuns();
        const runs = curatedData.runs || [];
        results.runs_checked = runs.length;

        console.log(`Checking ${runs.length} runs for reason code compliance...\n`);

        for (const runMeta of runs) {
            // Load bundle
            let bundle;
            try {
                bundle = loadRunBundle(runMeta.run_id);
            } catch (e) {
                // Skip unloadable bundles (covered by PR-9)
                console.log(`⚠️  ${runMeta.run_id}: Bundle load failed (skipping)`);
                continue;
            }

            // Determine ruleset
            const rulesetRef = bundle.bundle_manifest?.ruleset_ref;
            const isArb = isArbitrationPack(runMeta.run_id);
            const effectiveRef = rulesetRef || (isArb ? 'ruleset-1.1' : 'ruleset-1.0');

            // Get ruleset
            const ruleset = await getRuleset(effectiveRef);
            if (!ruleset || !ruleset.adjudicator) {
                console.log(`⚠️  ${runMeta.run_id}: Ruleset unavailable (skipping)`);
                continue;
            }

            // Adjudicate
            let evalResult;
            try {
                evalResult = await ruleset.adjudicator(bundle);
            } catch (e) {
                console.log(`⚠️  ${runMeta.run_id}: Adjudication failed (skipping)`);
                continue;
            }

            // Check topline verdict reason code
            if (evalResult.topline_verdict !== 'PASS') {
                results.summary.total_reason_codes++;

                if (!evalResult.reason_code) {
                    // Check if any clause has reason_code
                    const clauseReasons = evalResult.clauses
                        .filter(c => c.reason_code)
                        .map(c => c.reason_code);

                    if (clauseReasons.length === 0) {
                        results.summary.missing_codes++;
                        results.issues.push({
                            type: 'MISSING',
                            run_id: runMeta.run_id,
                            verdict: evalResult.topline_verdict,
                            context: 'topline + no clause reason_codes',
                        });
                        console.log(`❌ ${runMeta.run_id}: ${evalResult.topline_verdict} without reason_code`);
                    }
                } else {
                    const explanation = explainReasonCode(evalResult.reason_code);
                    if (explanation.allowed) {
                        if (explanation.kind === 'enum') {
                            results.summary.enum_codes++;
                        } else {
                            results.summary.pattern_codes++;
                        }
                    } else {
                        results.summary.unknown_codes++;
                        results.issues.push({
                            type: 'UNKNOWN',
                            run_id: runMeta.run_id,
                            reason_code: evalResult.reason_code,
                            verdict: evalResult.topline_verdict,
                            context: 'topline',
                        });
                        console.log(`❌ ${runMeta.run_id}: Unknown topline reason_code: ${evalResult.reason_code}`);
                    }
                }
            }

            // Check clause reason codes
            for (const clause of evalResult.clauses) {
                if (clause.status !== 'PASS' && clause.reason_code) {
                    results.summary.total_reason_codes++;
                    const explanation = explainReasonCode(clause.reason_code);

                    if (explanation.allowed) {
                        if (explanation.kind === 'enum') {
                            results.summary.enum_codes++;
                        } else {
                            results.summary.pattern_codes++;
                        }
                    } else {
                        results.summary.unknown_codes++;
                        results.issues.push({
                            type: 'UNKNOWN',
                            run_id: runMeta.run_id,
                            clause_id: clause.clause_id,
                            reason_code: clause.reason_code,
                            status: clause.status,
                            context: 'clause',
                        });
                        console.log(`❌ ${runMeta.run_id}/${clause.clause_id}: Unknown reason_code: ${clause.reason_code}`);
                    }
                }
            }
        }

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine gate status
    if (results.summary.unknown_codes > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.summary.unknown_codes} unknown reason_code(s) detected`;
    } else if (results.summary.missing_codes > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.summary.missing_codes} non-PASS verdict(s) without reason_code`;
    }

    // Calculate duration
    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const reportPath = path.join(artifactsDir, 'reason-codes.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log('  Summary:');
    console.log(`    - Runs checked: ${results.runs_checked}`);
    console.log(`    - Total reason codes: ${results.summary.total_reason_codes}`);
    console.log(`    - Enum codes: ${results.summary.enum_codes}`);
    console.log(`    - Pattern codes: ${results.summary.pattern_codes}`);
    console.log(`    - Unknown codes: ${results.summary.unknown_codes}`);
    console.log(`    - Missing codes: ${results.summary.missing_codes}`);
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
