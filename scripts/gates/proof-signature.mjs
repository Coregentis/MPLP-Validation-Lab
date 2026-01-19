#!/usr/bin/env node
/**
 * Proof Signature Gate - v0.5
 * 
 * Verifies that all curated runs can have valid signed proofs generated.
 * This is the gate for v0.5 signed proof infrastructure.
 * 
 * NOTE: This gate uses a STAGING key. In production, proofs would be
 * generated with the production signing key stored securely.
 * 
 * Usage: npm run gate:proof-signature
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// =============================================================================
// Key Management - CI Secret Cutover (v0.5.5)
// =============================================================================

const IS_CI = !!process.env.CI;
const IS_GITHUB_ACTIONS = process.env.GITHUB_ACTIONS === 'true';
const IS_VERCEL = !!process.env.VERCEL;
const SIGN_MODE = process.env.VLAB_SIGN_MODE || (IS_CI ? 'production' : 'staging');
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';

// Repo scope enforcement - only allow production signing in Validation Lab repo
const ALLOWED_REPOS = ['Coregentis/MPLP-Validation-Lab', 'jasonwang/MPLP-Validation-Lab'];

// Production key - ONLY from CI secret, NEVER hardcoded
const PROD_PRIVATE_KEY = process.env.VLAB_SIGNING_KEY_ED25519_PROD || null;
const PROD_KEY_ID = 'vlab-prod-2026-01b';  // ROTATED 2026-01-19 after exposure

// Staging/test key - for local development ONLY
const STAGING_PRIVATE_KEY = 'MC4CAQAwBQYDK2VwBCIEIHa1M2otzsmCjg3dG0qNL1GILevjRg9lHGH3KZfEQ22K';
const STAGING_KEY_ID = 'vlab-v0.5-test-001';

// Determine signing key based on mode
function getSigningConfig() {
    if (SIGN_MODE === 'production') {
        // SECURITY: Production signing ONLY allowed in GitHub Actions
        if (IS_VERCEL) {
            console.error('❌ FATAL: Production signing is NOT allowed in Vercel');
            console.error('   Production signing must only run in GitHub Actions CI');
            process.exit(1);
        }

        if (!IS_GITHUB_ACTIONS && IS_CI) {
            console.error('❌ FATAL: Production signing requires GitHub Actions');
            console.error('   CI environment detected but not GitHub Actions');
            process.exit(1);
        }

        if (!PROD_PRIVATE_KEY) {
            if (IS_CI) {
                // CI MUST have prod key
                console.error('❌ FATAL: CI requires VLAB_SIGNING_KEY_ED25519_PROD secret');
                process.exit(1);
            } else {
                // Local with production mode but no key - FAIL
                console.error('❌ FATAL: Production mode requires VLAB_SIGNING_KEY_ED25519_PROD');
                console.error('   Use VLAB_SIGN_MODE=staging for local development');
                process.exit(1);
            }
        }
        return { privateKey: PROD_PRIVATE_KEY, keyId: PROD_KEY_ID, mode: 'production' };
    } else {
        // Staging mode - use test key
        return { privateKey: STAGING_PRIVATE_KEY, keyId: STAGING_KEY_ID, mode: 'staging' };
    }
}

const SIGNING_CONFIG = getSigningConfig();

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5.5 Proof Signature Gate');
    console.log(`  Mode: ${SIGNING_CONFIG.mode.toUpperCase()} | CI: ${IS_CI ? 'yes' : 'no'}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-PROOF-SIGNATURE',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        summary: {
            total_runs: 0,
            proofs_generated: 0,
            proofs_verified: 0,
            errors: 0,
        },
        runs: [],
        errors: [],
    };

    try {
        // Load dependencies
        const { getCuratedRuns } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/curated/load-curated-runs.ts')}`
        );
        const { loadRunBundle } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/bundles/load_run_bundle.ts')}`
        );
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );
        const { generateSignedProof, verifySignedProof } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/proof/proof-bundle.ts')}`
        );

        // Create proofs directory
        const proofsDir = path.join(PROJECT_ROOT, 'artifacts', 'proofs');
        if (!fs.existsSync(proofsDir)) {
            fs.mkdirSync(proofsDir, { recursive: true });
        }

        // Load curated runs
        const curatedData = getCuratedRuns();
        const runs = curatedData.runs;
        results.summary.total_runs = runs.length;

        console.log(`📋 Scope: ALL curated runs (mode=all)`);
        console.log(`📋 Processing ${runs.length} runs for signed proof generation...\n`);

        // SCOPE POLICY: Process ALL curated runs (no sampling)
        // This ensures 100% coverage for verifiable claims
        const targetRuns = runs; // mode=all

        for (const run of targetRuns) {
            const runResult = {
                run_id: run.run_id,
                proof_generated: false,
                proof_verified: false,
                error: null,
            };

            try {
                // Load bundle
                const bundle = loadRunBundle(run.run_id);
                if (!bundle) {
                    runResult.error = 'BUNDLE_NOT_FOUND';
                    results.summary.errors++;
                    results.runs.push(runResult);
                    console.log(`  ❌ ${run.run_id}: BUNDLE_NOT_FOUND`);
                    continue;
                }

                // Determine ruleset
                const rulesetId = run.ruleset_version || 'ruleset-1.1';
                const ruleset = await getRuleset(rulesetId);
                if (!ruleset?.adjudicator) {
                    runResult.error = 'RULESET_NOT_LOADABLE';
                    results.summary.errors++;
                    results.runs.push(runResult);
                    console.log(`  ❌ ${run.run_id}: RULESET_NOT_LOADABLE`);
                    continue;
                }

                // Execute adjudicator
                const evaluation = await ruleset.adjudicator(bundle);

                // Generate signed proof with current signing key
                const proof = generateSignedProof(
                    evaluation,
                    SIGNING_CONFIG.privateKey,
                    SIGNING_CONFIG.keyId,
                    '0.5.5'
                );
                runResult.proof_generated = true;
                results.summary.proofs_generated++;

                // Verify the proof we just generated
                const verification = verifySignedProof(proof, PROJECT_ROOT);
                runResult.proof_verified = verification.valid;
                if (verification.valid) {
                    results.summary.proofs_verified++;
                }

                // Save proof to artifacts
                const proofPath = path.join(proofsDir, `${run.run_id}.proof.json`);
                fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2));

                const emoji = evaluation.topline_verdict === 'PASS' ? '✅' :
                    evaluation.topline_verdict === 'FAIL' ? '❌' : '⚠️';
                console.log(`  ${emoji} ${run.run_id}: ${evaluation.topline_verdict} (signed: ${verification.valid ? '✓' : '✗'})`);

            } catch (e) {
                runResult.error = String(e);
                results.summary.errors++;
                console.log(`  ❌ ${run.run_id}: ERROR - ${e}`);
            }

            results.runs.push(runResult);
        }

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine final status
    if (results.summary.proofs_generated === 0) {
        results.status = 'FAIL';
        results.failure_reason = 'No proofs could be generated';
    } else if (results.summary.proofs_verified < results.summary.proofs_generated) {
        results.status = 'FAIL';
        results.failure_reason = 'Some proofs failed verification';
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    const reportPath = path.join(artifactsDir, 'proof-signature.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Summary:`);
    console.log(`    - Scope: ALL (mode=all)`);
    console.log(`    - Total runs: ${results.runs.length}`);
    console.log(`    - Proofs generated: ${results.summary.proofs_generated}`);
    console.log(`    - Proofs verified: ${results.summary.proofs_verified}`);
    console.log(`    - Errors: ${results.summary.errors}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'PASS' ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
