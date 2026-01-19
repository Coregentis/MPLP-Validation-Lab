#!/usr/bin/env node
/**
 * RunSet Consistency Gate - v0.5 Hardening
 * 
 * Verifies that all run sets are consistent:
 * 1. All declared runs have packs
 * 2. Set counts match declarations
 * 3. Set relationships are correct (curated vs cross_substrate vs test_vectors)
 * 
 * Usage: npm run gate:runset-consistency
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5 RunSet Consistency Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-RUNSET-CONSISTENCY',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        sets: {},
        issues: [],
    };

    try {
        // Load runsets registry
        const runsetPath = path.join(PROJECT_ROOT, 'governance/runsets.yaml');
        if (!fs.existsSync(runsetPath)) {
            throw new Error('RunSet registry not found: governance/runsets.yaml');
        }

        const runsetContent = fs.readFileSync(runsetPath, 'utf-8');
        const runsets = yaml.parse(runsetContent);

        // Check curated set
        console.log('📋 Checking curated runs...');
        const curatedSet = runsets.sets.curated;
        let curatedFound = 0;
        let curatedMissing = [];

        for (const runId of curatedSet.includes) {
            const runPath = path.join(PROJECT_ROOT, 'data/runs', runId);
            if (fs.existsSync(runPath)) {
                curatedFound++;
            } else {
                curatedMissing.push(runId);
            }
        }

        results.sets.curated = {
            declared: curatedSet.count,
            listed: curatedSet.includes.length,
            found: curatedFound,
            missing: curatedMissing,
        };

        if (curatedFound === curatedSet.count) {
            console.log(`   ✅ curated: ${curatedFound}/${curatedSet.count}`);
        } else {
            console.log(`   ❌ curated: ${curatedFound}/${curatedSet.count} (missing: ${curatedMissing.length})`);
            results.issues.push(`curated: ${curatedMissing.length} missing runs`);
        }

        // Check cross_substrate set
        console.log('📋 Checking cross_substrate runs...');
        const crossSet = runsets.sets.cross_substrate;
        let crossFound = 0;
        let crossMissing = [];

        for (const runId of crossSet.includes) {
            const runPath = path.join(PROJECT_ROOT, 'data/runs', runId);
            if (fs.existsSync(runPath)) {
                crossFound++;
            } else {
                crossMissing.push(runId);
            }
        }

        results.sets.cross_substrate = {
            declared: crossSet.count,
            listed: crossSet.includes.length,
            found: crossFound,
            missing: crossMissing,
            substrates: crossSet.substrates,
            scenarios: crossSet.scenarios,
        };

        if (crossFound === crossSet.count) {
            console.log(`   ✅ cross_substrate: ${crossFound}/${crossSet.count} (${crossSet.substrates.length} substrates × ${crossSet.scenarios} scenarios)`);
        } else {
            console.log(`   ❌ cross_substrate: ${crossFound}/${crossSet.count} (missing: ${crossMissing.length})`);
            results.issues.push(`cross_substrate: ${crossMissing.length} missing runs`);
        }

        // Verify disjoint relationship
        console.log('📋 Verifying set relationships...');
        const curatedIds = new Set(curatedSet.includes);
        const crossIds = new Set(crossSet.includes);
        const intersection = [...curatedIds].filter(x => crossIds.has(x));

        if (intersection.length === 0) {
            console.log('   ✅ curated ∩ cross_substrate = ∅ (disjoint)');
        } else {
            console.log(`   ❌ curated ∩ cross_substrate = ${intersection.length} (should be disjoint)`);
            results.issues.push(`Sets overlap: ${intersection.join(', ')}`);
        }

        // Summary
        results.sets.totals = {
            curated: curatedFound,
            cross_substrate: crossFound,
            declared_curated: curatedSet.count,
            declared_cross_substrate: crossSet.count,
        };

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.issues.length > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.issues.length} consistency issue(s)`;
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'runset-consistency.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Summary:`);
    console.log(`    - curated: ${results.sets.curated?.found}/${results.sets.curated?.declared}`);
    console.log(`    - cross_substrate: ${results.sets.cross_substrate?.found}/${results.sets.cross_substrate?.declared}`);
    console.log(`    - Relationship: ${results.issues.length === 0 ? 'disjoint ✓' : 'issues detected'}`);
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
