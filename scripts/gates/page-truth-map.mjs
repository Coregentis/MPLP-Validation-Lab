#!/usr/bin/env node
/**
 * PTM Gate: Page Truth Map Verification
 * 
 * Verifies v0.4 Page Truth Map:
 * 1. All declared truth sources exist and are loadable
 * 2. All rulesets are registered and have adjudicators
 * 3. All sample runs are in curated allowlist and adjudicable
 * 
 * Usage: npm run gate:ptm
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.4 Page Truth Map Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-PTM-0.4',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        checks: {
            ptm_loaded: false,
            truth_sources_exist: [],
            rulesets_loadable: [],
            sample_runs_valid: [],
        },
        issues: [],
    };

    try {
        // 1. Load PTM
        const ptmPath = path.join(PROJECT_ROOT, 'governance/page-truth/ptm-0.4.yaml');
        if (!fs.existsSync(ptmPath)) {
            throw new Error('PTM file not found: governance/page-truth/ptm-0.4.yaml');
        }
        const ptmContent = fs.readFileSync(ptmPath, 'utf-8');
        const ptm = yaml.parse(ptmContent);
        results.checks.ptm_loaded = true;
        console.log(`📋 Loaded PTM v${ptm.version}\n`);

        // 2. Check truth sources for each route
        console.log('🔍 Checking route truth sources...\n');
        for (const route of ptm.routes) {
            console.log(`  Route: ${route.route}`);
            const sources = route.truth_sources;

            // Check allowlist
            if (sources.allowlist) {
                const allowlistPath = path.join(PROJECT_ROOT, sources.allowlist);
                const exists = fs.existsSync(allowlistPath);
                results.checks.truth_sources_exist.push({
                    route: route.route,
                    source: sources.allowlist,
                    exists,
                });
                if (!exists) {
                    results.issues.push(`Missing: ${sources.allowlist}`);
                    console.log(`    ❌ allowlist: ${sources.allowlist} (MISSING)`);
                } else {
                    console.log(`    ✅ allowlist: ${sources.allowlist}`);
                }
            }

            // Check run_bundle
            if (sources.run_bundle) {
                const bundlePath = path.join(PROJECT_ROOT, sources.run_bundle);
                const exists = fs.existsSync(bundlePath);
                results.checks.truth_sources_exist.push({
                    route: route.route,
                    source: sources.run_bundle,
                    exists,
                });
                if (!exists) {
                    results.issues.push(`Missing: ${sources.run_bundle}`);
                    console.log(`    ❌ run_bundle: ${sources.run_bundle} (MISSING)`);
                } else {
                    console.log(`    ✅ run_bundle: ${sources.run_bundle}`);
                }
            }

            // Check generated_data
            if (sources.generated_data) {
                const dataPath = path.join(PROJECT_ROOT, sources.generated_data);
                const exists = fs.existsSync(dataPath);
                results.checks.truth_sources_exist.push({
                    route: route.route,
                    source: sources.generated_data,
                    exists,
                });
                if (!exists) {
                    results.issues.push(`Missing: ${sources.generated_data}`);
                    console.log(`    ❌ generated_data: ${sources.generated_data} (MISSING)`);
                } else {
                    console.log(`    ✅ generated_data: ${sources.generated_data}`);
                }
            }
        }

        // 3. Check rulesets
        console.log('\n🔍 Checking rulesets...\n');
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );

        for (const rs of ptm.rulesets_required) {
            console.log(`  Ruleset: ${rs.id}`);

            // Check manifest exists
            const manifestPath = path.join(PROJECT_ROOT, rs.manifest);
            const manifestExists = fs.existsSync(manifestPath);

            // Check adjudicator exists
            const adjudicatorPath = path.join(PROJECT_ROOT, rs.adjudicator);
            const adjudicatorExists = fs.existsSync(adjudicatorPath);

            // Check registry loadable
            const ruleset = await getRuleset(rs.id);
            const registryLoadable = ruleset !== null && ruleset.adjudicator !== null;

            results.checks.rulesets_loadable.push({
                id: rs.id,
                manifest_exists: manifestExists,
                adjudicator_exists: adjudicatorExists,
                registry_loadable: registryLoadable,
            });

            if (!manifestExists) {
                results.issues.push(`Ruleset ${rs.id}: manifest missing`);
                console.log(`    ❌ manifest: ${rs.manifest} (MISSING)`);
            } else {
                console.log(`    ✅ manifest: ${rs.manifest}`);
            }

            if (!adjudicatorExists) {
                results.issues.push(`Ruleset ${rs.id}: adjudicator missing`);
                console.log(`    ❌ adjudicator: ${rs.adjudicator} (MISSING)`);
            } else {
                console.log(`    ✅ adjudicator: ${rs.adjudicator}`);
            }

            if (!registryLoadable) {
                results.issues.push(`Ruleset ${rs.id}: not loadable from registry`);
                console.log(`    ❌ registry: NOT_LOADABLE`);
            } else {
                console.log(`    ✅ registry: loadable with adjudicator`);
            }
        }

        // 4. Check UI test samples
        console.log('\n🔍 Checking UI test sample runs...\n');
        const { getCuratedRuns } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/curated/load-curated-runs.ts')}`
        );
        const curatedData = getCuratedRuns();
        const curatedRunIds = new Set(curatedData.runs.map(r => r.run_id));

        for (const [key, runId] of Object.entries(ptm.ui_test_samples)) {
            const inAllowlist = curatedRunIds.has(runId);
            const bundleExists = fs.existsSync(path.join(PROJECT_ROOT, 'data/runs', runId));

            results.checks.sample_runs_valid.push({
                key,
                run_id: runId,
                in_allowlist: inAllowlist,
                bundle_exists: bundleExists,
            });

            if (!inAllowlist) {
                results.issues.push(`Sample ${key}: ${runId} not in allowlist`);
                console.log(`  ❌ ${key}: ${runId} (NOT_IN_ALLOWLIST)`);
            } else if (!bundleExists) {
                results.issues.push(`Sample ${key}: ${runId} bundle missing`);
                console.log(`  ❌ ${key}: ${runId} (BUNDLE_MISSING)`);
            } else {
                console.log(`  ✅ ${key}: ${runId}`);
            }
        }

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.issues.length > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.issues.length} truth source issue(s) detected`;
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'ptm-0.4.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  PTM Loaded: ${results.checks.ptm_loaded ? 'Yes' : 'No'}`);
    console.log(`  Routes Checked: ${results.checks.truth_sources_exist.length}`);
    console.log(`  Rulesets Checked: ${results.checks.rulesets_loadable.length}`);
    console.log(`  Sample Runs Checked: ${results.checks.sample_runs_valid.length}`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'PASS' ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
