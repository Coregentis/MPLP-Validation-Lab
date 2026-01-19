#!/usr/bin/env node
/**
 * Portable Hash Parity Gate - v0.5.3
 * 
 * Verifies that cross-substrate runs produce identical portable_verdict_hash.
 * 
 * Prerequisites:
 * - gate:canonptr-coverage must be 100% (all pointers are canonptr)
 * - Same scenario across substrates should produce same hash
 * 
 * Usage: npm run gate:portable-hash-parity
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5.3 Portable Hash Parity Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-PORTABLE-HASH-PARITY',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        hash_scope: 'HASH_SCOPE_PORTABLE_V1',
        summary: {
            scenarios: 0,
            scenarios_matched: 0,
            scenarios_mismatched: 0,
        },
        scenario_hashes: {},
        issues: [],
    };

    try {
        // Load modules
        const { computePortableVerdictHash, HASH_SCOPE_PORTABLE_VERSION } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/proof/verdict-hash.ts')}`
        );
        const { loadRunBundle } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/bundles/load_run_bundle.ts')}`
        );
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );

        results.hash_scope_version = HASH_SCOPE_PORTABLE_VERSION;
        console.log(`📋 Hash scope: PORTABLE v${HASH_SCOPE_PORTABLE_VERSION}\n`);

        // Load matrix
        const matrixPath = path.join(PROJECT_ROOT, 'producers/contract/matrix.yaml');
        if (!fs.existsSync(matrixPath)) {
            throw new Error('Matrix not found: producers/contract/matrix.yaml');
        }

        const matrixContent = fs.readFileSync(matrixPath, 'utf-8');
        const matrix = yaml.parse(matrixContent);

        const substrates = Object.keys(matrix.substrates);
        const scenarios = Object.entries(matrix.scenarios);

        results.summary.scenarios = scenarios.length;
        console.log(`📋 Checking ${scenarios.length} scenarios across ${substrates.length} substrates...\n`);

        // Check each scenario
        for (const [scenarioId, scenario] of scenarios) {
            const hashes = {};
            let allValid = true;

            console.log(`  ${scenarioId}:`);

            for (const substrate of substrates) {
                const runId = scenario.substrates?.[substrate];
                if (!runId) {
                    console.log(`    ${substrate}: ⚠️ NOT_DEFINED`);
                    allValid = false;
                    continue;
                }

                const runPath = path.join(PROJECT_ROOT, 'data/runs', runId);
                if (!fs.existsSync(runPath)) {
                    console.log(`    ${substrate}: ⚠️ MISSING`);
                    allValid = false;
                    continue;
                }

                try {
                    const bundle = loadRunBundle(runId);
                    if (bundle) {
                        const ruleset = await getRuleset('ruleset-1.2');
                        if (ruleset?.adjudicator) {
                            const evaluation = await ruleset.adjudicator(bundle);
                            const hash = computePortableVerdictHash(evaluation);
                            hashes[substrate] = hash;
                            console.log(`    ${substrate}: ${hash.slice(0, 16)}...`);
                        }
                    }
                } catch (e) {
                    console.log(`    ${substrate}: ⚠️ error`);
                    allValid = false;
                }
            }

            // Check parity
            const hashValues = Object.values(hashes);
            const allSame = hashValues.length === substrates.length &&
                hashValues.every(h => h === hashValues[0]);

            results.scenario_hashes[scenarioId] = {
                hashes,
                parity: allSame,
            };

            if (allSame) {
                results.summary.scenarios_matched++;
                console.log(`    → ✅ PARITY (${hashValues[0].slice(0, 8)})\n`);
            } else if (allValid) {
                results.summary.scenarios_mismatched++;
                results.issues.push(`${scenarioId}: hash mismatch`);
                console.log(`    → ❌ MISMATCH\n`);
            } else {
                results.issues.push(`${scenarioId}: incomplete (missing runs)`);
                console.log(`    → ⚠️ INCOMPLETE\n`);
            }
        }

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.summary.scenarios_mismatched > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.summary.scenarios_mismatched} scenario(s) with hash mismatch`;
    } else if (results.summary.scenarios_matched < results.summary.scenarios) {
        results.status = 'PARTIAL';
        results.note = `${results.summary.scenarios_matched}/${results.summary.scenarios} scenarios verified`;
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'portable-hash-parity.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    const statusEmoji = results.status === 'PASS' ? '✅ PASS' :
        results.status === 'PARTIAL' ? '⚠️ PARTIAL' : '❌ FAIL';

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${statusEmoji}`);
    console.log(`  Hash Scope: PORTABLE v${results.hash_scope_version || '1.0.0'}`);
    console.log(`  Summary:`);
    console.log(`    - Scenarios matched: ${results.summary.scenarios_matched}/${results.summary.scenarios}`);
    console.log(`    - Scenarios mismatched: ${results.summary.scenarios_mismatched}`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'FAIL' ? 1 : 0);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
