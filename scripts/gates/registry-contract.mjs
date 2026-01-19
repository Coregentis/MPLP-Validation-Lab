#!/usr/bin/env node
/**
 * PR-8: Registry Contract Gate
 * 
 * CI Gate to verify all registered rulesets satisfy the adjudication contract:
 * 1. Manifest is loadable
 * 2. Adjudicator exists (not null)
 * 3. Adjudicator can execute on a minimal fixture bundle
 * 4. Output is valid RulesetEvalResult
 * 
 * Usage: npm run gate:registry
 * Output: artifacts/registry-contract.report.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Dynamically import registry functions
async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  PR-8: Registry Contract Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-REGISTRY-CONTRACT',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        rulesets: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            errors: []
        }
    };

    try {
        // Import registry module
        const registryPath = path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts');

        // Use tsx to run TypeScript
        const { listRegisteredRulesets, getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );

        // Get all registered rulesets
        console.log('📋 Listing registered rulesets...\n');
        const rulesets = await listRegisteredRulesets();
        results.summary.total = rulesets.length;

        for (const ruleset of rulesets) {
            const rulesetResult = {
                id: ruleset.id,
                manifest_loaded: false,
                adjudicator_exists: false,
                adjudicator_callable: false,
                output_valid: false,
                status: 'FAIL',
                errors: []
            };

            console.log(`\n📦 Testing: ${ruleset.id}`);
            console.log('─'.repeat(40));

            // Test 1: Manifest loaded
            if (ruleset.manifest) {
                rulesetResult.manifest_loaded = true;
                console.log('  ✅ Manifest loaded');
                console.log(`     - Name: ${ruleset.manifest.name}`);
                console.log(`     - Version: ${ruleset.manifest.version}`);
            } else {
                rulesetResult.errors.push('Manifest not loaded');
                console.log('  ❌ Manifest not loaded');
            }

            // Test 2: Adjudicator exists
            if (ruleset.adjudicator) {
                rulesetResult.adjudicator_exists = true;
                console.log('  ✅ Adjudicator exists');
            } else {
                rulesetResult.errors.push('Adjudicator is null');
                console.log('  ❌ Adjudicator is null');
            }

            // Test 3: Adjudicator callable on fixture
            if (ruleset.adjudicator) {
                try {
                    // Create minimal fixture bundle
                    const fixtureBundle = createFixtureBundle(ruleset.id);
                    const evalResult = await ruleset.adjudicator(fixtureBundle);

                    rulesetResult.adjudicator_callable = true;
                    console.log('  ✅ Adjudicator callable');

                    // Test 4: Output is valid RulesetEvalResult
                    if (validateRulesetEvalResult(evalResult)) {
                        rulesetResult.output_valid = true;
                        console.log('  ✅ Output is valid RulesetEvalResult');
                        console.log(`     - Topline: ${evalResult.topline_verdict}`);
                        console.log(`     - Clauses: ${evalResult.clauses.length}`);
                    } else {
                        rulesetResult.errors.push('Output is invalid RulesetEvalResult');
                        console.log('  ❌ Output is invalid RulesetEvalResult');
                    }
                } catch (e) {
                    rulesetResult.errors.push(`Adjudicator threw: ${e.message}`);
                    console.log(`  ❌ Adjudicator threw: ${e.message}`);
                }
            }

            // Determine ruleset status
            if (
                rulesetResult.manifest_loaded &&
                rulesetResult.adjudicator_exists &&
                rulesetResult.adjudicator_callable &&
                rulesetResult.output_valid
            ) {
                rulesetResult.status = 'PASS';
                results.summary.passed++;
            } else {
                rulesetResult.status = 'FAIL';
                results.summary.failed++;
                results.status = 'FAIL';
            }

            results.rulesets.push(rulesetResult);
        }

    } catch (e) {
        results.status = 'ERROR';
        results.summary.errors.push(`Gate execution error: ${e.message}`);
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Calculate duration
    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const reportPath = path.join(artifactsDir, 'registry-contract.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Rulesets: ${results.summary.passed}/${results.summary.total} passed`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Exit with appropriate code
    process.exit(results.status === 'PASS' ? 0 : 1);
}

// Create minimal fixture bundle for testing adjudicator
function createFixtureBundle(rulesetId) {
    const runId = rulesetId === 'ruleset-1.0' ? 'gf-fixture' : 'arb-d1-fixture';

    return {
        run_id: runId,
        verdict: {
            run_id: runId,
            scenario_id: 'fixture-scenario',
            admission: 'ADMISSIBLE',
            gf_verdicts: [],
            domain_verdicts: [],
            topline: 'PASS',
            versions: { protocol: '1.0', schema: '1.0', ruleset: rulesetId },
            evaluated_at: new Date().toISOString(),
            reason_code: null,
        },
        bundle_manifest: {
            run_id: runId,
            pack_root: '.',
            ruleset_ref: rulesetId,
            protocol_pin: '1.0',
            schema_bundle_sha256: 'fixture',
            hash_scope: [],
            reason_code: null,
        },
        integrity_hash_path: null,
        evidence_pointers: { pointers: [] },
        pack: { root: '.', trace: { events: [], raw_path: '' } },
        load_status: {
            b1_verdict: 'ok',
            b2_manifest: 'ok',
            b3_integrity: 'ok',
            b4_pointers: 'ok',
            pack: 'ok',
            b1_was_legacy: false,
        },
        load_errors: [],
    };
}

// Validate RulesetEvalResult structure
function validateRulesetEvalResult(result) {
    if (!result) return false;
    if (typeof result.ruleset_id !== 'string') return false;
    if (typeof result.run_id !== 'string') return false;
    if (typeof result.evaluated_at !== 'string') return false;
    if (typeof result.topline_verdict !== 'string') return false;
    if (!Array.isArray(result.clauses)) return false;
    return true;
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
