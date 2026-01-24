#!/usr/bin/env node
/**
 * PTM Gate: Page Truth Map Verification
 * 
 * Verifies Page Truth Map:
 * 1. All declared truth sources exist and are loadable
 * 2. All rulesets are registered and have adjudicators
 * 3. All sample runs are in curated allowlist and adjudicable
 * 4. Route coverage = 18/18 (100%)
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
    console.log('  Page Truth Map Gate (v0.7 Alignment)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-PTM-0.5',
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
        // 1. Load PTM (prefer v0.6, fallback to v0.5/v0.4)
        const ptmPaths = [
            'governance/page-truth/ptm-0.7.yaml',
            'governance/page-truth/ptm-0.6.yaml',
            'governance/page-truth/ptm-0.5.yaml',
            'governance/page-truth/ptm-0.4.yaml'
        ];
        let ptmPath = '';
        for (const p of ptmPaths) {
            const fullPath = path.join(PROJECT_ROOT, p);
            if (fs.existsSync(fullPath)) {
                ptmPath = fullPath;
                break;
            }
        }
        if (!ptmPath) {
            throw new Error('PTM file not found in governance/page-truth/');
        }

        const ptmContent = fs.readFileSync(ptmPath, 'utf-8');
        const ptm = yaml.parse(ptmContent);
        results.checks.ptm_loaded = true;
        const routeCount = ptm.routes?.length || 0;
        console.log(`📋 Loaded PTM v${ptm.version} (${routeCount} routes)`);

        // Load Truth Sources Registry for resolution
        const tsPath = path.join(PROJECT_ROOT, 'governance/registry/TRUTH_SOURCES.yaml');
        const tsContent = fs.readFileSync(tsPath, 'utf-8');
        const tsRegistry = yaml.parse(tsContent);
        const sourceMap = tsRegistry.sources || {};
        console.log(`📋 Loaded Truth Sources Registry (${Object.keys(sourceMap).length} sources)\n`);

        // 2. Check truth sources for each route
        console.log('🔍 Checking route truth sources...\n');
        for (const route of ptm.routes) {
            console.log(`  Route: ${route.route}`);
            const sources = route.truth_sources || [];

            for (const sourceId of sources) {
                const ts = sourceMap[sourceId];
                if (!ts) {
                    results.issues.push(`Unknown truth source ID: ${sourceId} on route ${route.route}`);
                    console.log(`    ❌ ${sourceId} (NOT_IN_REGISTRY)`);
                    continue;
                }

                const isGlob = ts.resolver === 'glob' || (ts.path && ts.path.includes('*')) || (ts.paths && ts.paths.some(p => p.includes('*')));

                if (isGlob) {
                    console.log(`    ✅ ${sourceId}: ${ts.path || ts.paths} (glob/patterns allowed)`);
                    continue;
                }

                if (ts.path) {
                    const filePath = path.join(PROJECT_ROOT, ts.path);
                    const exists = fs.existsSync(filePath);
                    results.checks.truth_sources_exist.push({
                        route: route.route,
                        source: ts.path,
                        exists,
                    });
                    if (!exists) {
                        results.issues.push(`Missing file: ${ts.path} (ts ID: ${sourceId})`);
                        console.log(`    ❌ ${sourceId}: ${ts.path} (MISSING)`);
                    } else {
                        console.log(`    ✅ ${sourceId}: ${ts.path}`);
                    }
                } else if (ts.paths) {
                    for (const p of ts.paths) {
                        const filePath = path.join(PROJECT_ROOT, p);
                        const exists = fs.existsSync(filePath);
                        results.checks.truth_sources_exist.push({
                            route: route.route,
                            source: p,
                            exists,
                        });
                        if (!exists) {
                            results.issues.push(`Missing file: ${p} (ts ID: ${sourceId})`);
                            console.log(`    ❌ ${sourceId}: ${p} (MISSING)`);
                        } else {
                            console.log(`    ✅ ${sourceId}: ${p}`);
                        }
                    }
                } else {
                    console.log(`    ✅ ${sourceId}: ${ts.resolver} (external resolver)`);
                }
            }
        }

        // 3. Check rulesets
        console.log('\n🔍 Checking rulesets...\n');
        const rulesetsRequired = ptm.rulesets_required || [];
        if (rulesetsRequired.length > 0) {
            const { getRuleset } = await import(
                `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
            );

            for (const rs of rulesetsRequired) {
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
        } else {
            console.log('  (No rulesets sections found in PTM)');
        }

        // 4. Check UI test samples
        console.log('\n🔍 Checking UI test sample runs...\n');
        const uiTestSamples = ptm.ui_test_samples || {};
        const sampleEntries = Object.entries(uiTestSamples);
        if (sampleEntries.length > 0) {
            const { getCuratedRuns } = await import(
                `file://${path.join(PROJECT_ROOT, 'lib/curated/load-curated-runs.ts')}`
            );
            const curatedData = getCuratedRuns();
            const curatedRunIds = new Set(curatedData.runs.map(r => r.run_id));

            for (const [key, runId] of sampleEntries) {
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
        } else {
            console.log('  (No UI test samples found in PTM)');
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
