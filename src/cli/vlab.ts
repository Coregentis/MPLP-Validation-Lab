#!/usr/bin/env tsx
/**
 * Validation Lab CLI - Canonical Entry Point
 * 
 * This is the SINGLE authority for all verification and adjudication operations.
 * All gates, verification, and reverification MUST go through this CLI.
 * 
 * Usage:
 *   vlab verify <pack_path>     - Verify an evidence pack
 *   vlab adjudicate <run_id>    - Adjudicate a run
 *   vlab reverify <release>     - Reverify a historical release
 *   vlab gates                  - Run all gates
 *   vlab export                 - Generate export interface files
 *   vlab identity               - Show verifier identity
 */

import { join, resolve } from 'path';
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { pathToFileURL } from 'url';
import { createHash } from 'crypto';

// =============================================================================
// Constants
// =============================================================================

const VLAB_ROOT = resolve(__dirname, '../..');
const VERIFIER_IDENTITY_PATH = join(VLAB_ROOT, 'verifier/VERIFIER_IDENTITY.json');

// =============================================================================
// Helpers
// =============================================================================

function loadVerifierIdentity(): Record<string, unknown> {
    if (!existsSync(VERIFIER_IDENTITY_PATH)) {
        console.error('❌ VERIFIER_IDENTITY.json not found');
        process.exit(1);
    }
    return JSON.parse(readFileSync(VERIFIER_IDENTITY_PATH, 'utf-8'));
}

function printUsage(): void {
    console.log(`
Validation Lab CLI - Canonical Verifier Entry Point

Usage:
  vlab verify <pack_path>     Verify an evidence pack
  vlab adjudicate <run_id>    Adjudicate a run
  vlab reverify <release>     Reverify a historical release
  vlab gates                  Run all gates
  vlab export                 Generate export interface files
  vlab identity               Show verifier identity

Options:
  --help, -h                  Show this help message
  --version, -v               Show version
`);
}

function printIdentity(): void {
    const identity = loadVerifierIdentity();
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║          VALIDATION LAB VERIFIER IDENTITY                  ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Verifier ID:     ${identity.verifier_id}`);
    console.log(`║  Version:         ${identity.version}`);
    console.log(`║  Ruleset:         ${(identity.ruleset as { version: string }).version}`);
    console.log(`║  Upstream Commit: ${((identity.upstream_pin as { commit: string }).commit as string).slice(0, 12)}...`);
    console.log(`║  Gates:           ${(identity.gates as { range: string }).range} (${(identity.gates as { count: number }).count} gates)`);
    console.log('╚════════════════════════════════════════════════════════════╝');
}

// =============================================================================
// Commands
// =============================================================================

async function cmdVerify(packPath: string): Promise<void> {
    console.log(`\n🔍 Verifying evidence pack: ${packPath}\n`);

    const absolutePath = resolve(packPath);
    if (!existsSync(absolutePath)) {
        console.error(`❌ Pack not found: ${absolutePath}`);
        process.exit(1);
    }

    // Import and run verification
    try {
        const { ingest } = await import('../../lib/engine/ingest');
        const { verify } = await import('../../lib/engine/verify');

        console.log('📦 Ingesting pack...');
        const pack = await ingest(absolutePath);

        console.log('✅ Pack ingested successfully');
        console.log(`   Files: ${pack.file_inventory.length}`);

        console.log('\n🔬 Running verification...');
        const report = await verify(pack);

        console.log('\n📋 Verification Report:');
        console.log(`   Admission Status: ${report.admission_status}`);
        console.log(`   Checks: ${report.checks.length}`);

        const passed = report.checks.filter(c => c.status === 'PASS').length;
        const failed = report.checks.filter(c => c.status === 'FAIL').length;
        const skipped = report.checks.filter(c => c.status === 'SKIP').length;

        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);

        if (report.admission_status === 'ADMISSIBLE') {
            console.log('\n✅ Pack verification PASSED (ADMISSIBLE)');
        } else {
            console.log(`\n❌ Pack verification FAILED (${report.admission_status})`);
            process.exit(1);
        }
    } catch (err) {
        console.error('❌ Verification error:', (err as Error).message);
        process.exit(1);
    }
}

async function cmdAdjudicate(runId: string): Promise<void> {
    if (!runId) {
        console.error('❌ Usage: vlab adjudicate <run_id>');
        console.error('   Example: vlab adjudicate gf-01-smoke');
        process.exit(1);
    }

    try {
        // Dynamic import to avoid circular dependencies
        const { adjudicate } = await import('../../lib/adjudication/adjudicate');
        const result = await adjudicate(runId);

        console.log(`\n📋 Verdict Hash: ${result.verdict.verdict_hash}`);
    } catch (err) {
        console.error('❌ Adjudication error:', (err as Error).message);
        process.exit(1);
    }
}

async function cmdReverify(bundleName: string): Promise<void> {
    console.log(`\n🔄 Reverifying: ${bundleName}\n`);

    // Parse bundle name: "v0.7.2+rev2" -> base="v0.7.2", rev="+rev2"
    // "v0.7.2" -> base="v0.7.2", rev=""
    const revMatch = bundleName.match(/^(.+?)(\+rev\d+)?$/);
    const releaseBase = revMatch?.[1] || bundleName;
    const revSuffix = revMatch?.[2] || '';

    const releasePath = join(VLAB_ROOT, 'releases', releaseBase);
    if (!existsSync(releasePath)) {
        console.error(`❌ Release not found: ${releasePath}`);
        process.exit(1);
    }

    console.log(`   Release: ${releaseBase} (from releases/${releaseBase}/)`);
    if (revSuffix) {
        console.log(`   Revision: ${revSuffix}`);
    }

    const reverifyDir = join(VLAB_ROOT, 'reverification', bundleName);

    // Create reverification directory
    mkdirSync(reverifyDir, { recursive: true });
    console.log(`📁 Created: reverification/${bundleName}/`);

    // Step 1: Generate input.pointer.json
    console.log('\n[1/6] Generating input.pointer.json...');
    const inputPointer = {
        type: 'release-pointer',
        release_version: releaseBase,
        bundle_name: bundleName,
        release_path: `releases/${releaseBase}/`,
        timestamp: new Date().toISOString(),
    };
    writeFileSync(
        join(reverifyDir, 'input.pointer.json'),
        JSON.stringify(inputPointer, null, 2)
    );
    console.log('   ✅ input.pointer.json');

    // Step 2: Copy verifier identity snapshot
    console.log('\n[2/6] Snapshotting verifier.identity.json...');
    const identity = loadVerifierIdentity();
    writeFileSync(
        join(reverifyDir, 'verifier.identity.json'),
        JSON.stringify(identity, null, 2)
    );
    console.log('   ✅ verifier.identity.json');

    // Step 3: Compute verifier fingerprint
    console.log('\n[3/6] Computing verifier.fingerprint.json...');
    const fingerprint = await computeVerifierFingerprint();
    writeFileSync(
        join(reverifyDir, 'verifier.fingerprint.json'),
        JSON.stringify(fingerprint, null, 2)
    );
    console.log('   ✅ verifier.fingerprint.json');
    console.log(`      engine_hash: ${fingerprint.engine_hash.slice(0, 16)}...`);
    console.log(`      gates_hash:  ${fingerprint.gates_hash.slice(0, 16)}...`);

    // Step 4: Run gates and collect report
    console.log('\n[4/6] Running gates...');
    const gateReport = await runGatesForReverification();
    writeFileSync(
        join(reverifyDir, 'gate.report.json'),
        JSON.stringify(gateReport, null, 2)
    );
    console.log(`   ✅ gate.report.json (${gateReport.passed}/${gateReport.total} passed)`);

    // Step 5: Generate verdict
    console.log('\n[5/6] Generating verdict.json...');
    const verdict = {
        reverification_version: '1.0',
        release: releaseBase,
        bundle_name: bundleName,
        release_path: `releases/${releaseBase}/`,
        verified_at: new Date().toISOString(),
        verifier: {
            id: identity.verifier_id,
            version: identity.version,
            fingerprint: fingerprint,
        },
        ruleset_version: (identity.ruleset as { version: string }).version,
        gate_results: {
            total: gateReport.total,
            passed: gateReport.passed,
            failed: gateReport.failed,
            status: gateReport.failed === 0 ? 'ALL_PASS' : 'HAS_FAILURES',
        },
        overall_status: gateReport.failed === 0 ? 'REVERIFIED' : 'REVERIFICATION_INCOMPLETE',
        note: 'Historical release reverified by canonical Validation Lab verifier.',
    };
    writeFileSync(
        join(reverifyDir, 'verdict.json'),
        JSON.stringify(verdict, null, 2)
    );
    console.log(`   ✅ verdict.json (${verdict.overall_status})`);

    // Step 6: Generate sha256sums.txt
    console.log('\n[6/6] Generating sha256sums.txt...');
    const files = ['input.pointer.json', 'verifier.identity.json', 'verifier.fingerprint.json', 'gate.report.json', 'verdict.json'];
    const sums: string[] = [];
    for (const file of files) {
        const content = readFileSync(join(reverifyDir, file));
        const hash = createHash('sha256').update(content).digest('hex');
        sums.push(`${hash}  ${file}`);
    }
    writeFileSync(join(reverifyDir, 'sha256sums.txt'), sums.join('\n') + '\n');
    console.log('   ✅ sha256sums.txt');

    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ Reverification complete for ${bundleName}`);
    console.log('═'.repeat(60));
    console.log(`   Output directory: reverification/${bundleName}/`);
    console.log(`   Status: ${verdict.overall_status}`);
    console.log(`   Gates: ${gateReport.passed}/${gateReport.total} passed`);
}

// =============================================================================
// Reverification Helpers
// =============================================================================

function hashFile(filePath: string): string {
    if (!existsSync(filePath)) return 'FILE_NOT_FOUND';
    const content = readFileSync(filePath);
    return createHash('sha256').update(content).digest('hex');
}

function hashDirectory(dirPath: string): string {
    if (!existsSync(dirPath)) return 'DIR_NOT_FOUND';
    const { readdirSync, statSync } = require('fs');
    const files: string[] = [];

    function walk(dir: string, prefix = '') {
        const entries = readdirSync(dir);
        for (const entry of entries) {
            const fullPath = join(dir, entry);
            const relPath = prefix ? `${prefix}/${entry}` : entry;
            if (statSync(fullPath).isDirectory()) {
                walk(fullPath, relPath);
            } else {
                files.push(relPath);
            }
        }
    }
    walk(dirPath);
    files.sort();

    const combinedHash = createHash('sha256');
    for (const file of files) {
        const content = readFileSync(join(dirPath, file));
        combinedHash.update(file);
        combinedHash.update(createHash('sha256').update(content).digest('hex'));
    }
    return combinedHash.digest('hex');
}

async function computeVerifierFingerprint(): Promise<Record<string, string>> {
    return {
        engine_hash: hashFile(join(VLAB_ROOT, 'lib/engine/verify.ts')),
        ingest_hash: hashFile(join(VLAB_ROOT, 'lib/engine/ingest.ts')),
        evaluate_hash: hashFile(join(VLAB_ROOT, 'lib/evaluate/evaluate.ts')),
        gates_hash: hashDirectory(join(VLAB_ROOT, 'lib/gates')),
        ruleset_hash: hashDirectory(join(VLAB_ROOT, 'data/rulesets/ruleset-1.0')),
        computed_at: new Date().toISOString(),
    };
}

interface GateReport {
    total: number;
    passed: number;
    failed: number;
    results: Array<{ id: string; name: string; status: string; message?: string }>;
}

async function runGatesForReverification(): Promise<GateReport> {
    const { spawnSync } = require('child_process');

    // Reverification gates: public surface + release-specific only
    // Gate-08 (curated-immutability) is repo-hygiene, not release-specific
    const gates = [
        { id: '04', name: 'language', path: 'lib/gates/gate-04-language.ts' },
        { id: '05', name: 'no-exec-hosting', path: 'lib/gates/gate-05-no-exec-hosting.ts' },
        { id: '06', name: 'robots-policy', path: 'lib/gates/gate-06-robots-policy.ts' },
        { id: '07', name: 'pii-leak', path: 'lib/gates/gate-07-pii-leak.ts' },
        // Gate-08 excluded: curated-immutability is repo-level hygiene, not release-specific
        { id: '09', name: 'ssot-projection', path: 'lib/gates/gate-09-ssot-projection.ts' },
        { id: '10', name: 'curated-invariants', path: 'lib/gates/gate-10-curated-invariants.ts' },
    ];

    const results: GateReport['results'] = [];
    let passed = 0;
    let failed = 0;

    for (const gate of gates) {
        const gatePath = join(VLAB_ROOT, gate.path);
        if (!existsSync(gatePath)) {
            results.push({ id: gate.id, name: gate.name, status: 'SKIP', message: 'File not found' });
            continue;
        }

        // Run gate in isolated subprocess to capture process.exit
        const result = spawnSync('npx', ['tsx', gatePath], {
            cwd: VLAB_ROOT,
            encoding: 'utf-8',
            timeout: 60000, // 60 second timeout
        });

        if (result.status === 0) {
            results.push({ id: gate.id, name: gate.name, status: 'PASS' });
            passed++;
        } else {
            const message = result.stderr?.slice(0, 200) || result.stdout?.slice(0, 200) || `Exit code: ${result.status}`;
            results.push({ id: gate.id, name: gate.name, status: 'FAIL', message });
            failed++;
        }
    }

    return { total: gates.length, passed, failed, results };
}

async function cmdGates(): Promise<void> {
    console.log('\n🚪 Running all gates...\n');

    const identity = loadVerifierIdentity();
    const gateRange = (identity.gates as { range: string }).range;
    console.log(`   Gate range: ${gateRange}`);

    // Run gates sequentially
    const gates = [
        { id: '02', name: 'admission', path: 'lib/gates/gate-02-admission.ts' },
        { id: '03', name: 'determinism', path: 'lib/gates/gate-03-determinism.ts' },
        { id: '04', name: 'language', path: 'lib/gates/gate-04-language.ts' },
        { id: '05', name: 'no-exec-hosting', path: 'lib/gates/gate-05-no-exec-hosting.ts' },
        { id: '06', name: 'robots-policy', path: 'lib/gates/gate-06-robots-policy.ts' },
        { id: '07', name: 'pii-leak', path: 'lib/gates/gate-07-pii-leak.ts' },
        { id: '08', name: 'curated-immutability', path: 'lib/gates/gate-08-curated-immutability.ts' },
        { id: '09', name: 'ssot-projection', path: 'lib/gates/gate-09-ssot-projection.ts' },
        { id: '10', name: 'curated-invariants', path: 'lib/gates/gate-10-curated-invariants.ts' },
        { id: '11', name: 'reverify-required', path: 'lib/gates/gate-11-reverify-required.ts' },
    ];

    let passed = 0;
    let failed = 0;

    for (const gate of gates) {
        const gatePath = join(VLAB_ROOT, gate.path);
        if (!existsSync(gatePath)) {
            console.log(`   ⏭️  Gate ${gate.id} (${gate.name}): SKIP (not found)`);
            continue;
        }

        try {
            // Use pathToFileURL for ESM compatibility
            const gateUrl = pathToFileURL(gatePath).href;
            const gateModule = await import(gateUrl);
            if (typeof gateModule.default === 'function') {
                await gateModule.default();
            } else if (typeof gateModule.run === 'function') {
                await gateModule.run();
            }
            console.log(`   ✅ Gate ${gate.id} (${gate.name}): PASS`);
            passed++;
        } catch (err) {
            console.log(`   ❌ Gate ${gate.id} (${gate.name}): FAIL - ${(err as Error).message}`);
            failed++;
        }
    }

    console.log('\n📊 Gates Summary:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);

    if (failed > 0) {
        process.exit(1);
    }
}

async function cmdExport(): Promise<void> {
    console.log('\n📤 Generating export interface...\n');

    const { spawnSync } = require('child_process');
    const scriptPath = join(VLAB_ROOT, 'scripts/generate-export.ts');

    if (!existsSync(scriptPath)) {
        console.error('❌ scripts/generate-export.ts not found');
        process.exit(1);
    }

    // Run export generator
    const result = spawnSync('npx', ['tsx', scriptPath], {
        cwd: VLAB_ROOT,
        encoding: 'utf-8',
        stdio: 'inherit', // Pass through stdout/stderr
        timeout: 60000,
    });

    if (result.status !== 0) {
        console.error('❌ Export generation failed');
        process.exit(1);
    }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printUsage();
        return;
    }

    if (args.includes('--version') || args.includes('-v')) {
        const identity = loadVerifierIdentity();
        console.log(`vlab ${identity.version}`);
        return;
    }

    const command = args[0];

    switch (command) {
        case 'verify':
            if (!args[1]) {
                console.error('❌ Missing pack path');
                process.exit(1);
            }
            await cmdVerify(args[1]);
            break;

        case 'adjudicate':
            if (!args[1]) {
                console.error('❌ Missing run ID');
                process.exit(1);
            }
            await cmdAdjudicate(args[1]);
            break;

        case 'reverify':
            if (!args[1]) {
                console.error('❌ Missing release version');
                process.exit(1);
            }
            await cmdReverify(args[1]);
            break;

        case 'gates':
            await cmdGates();
            break;

        case 'export':
            await cmdExport();
            break;

        case 'identity':
            printIdentity();
            break;

        default:
            console.error(`❌ Unknown command: ${command}`);
            printUsage();
            process.exit(1);
    }
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
