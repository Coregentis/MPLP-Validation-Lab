#!/usr/bin/env tsx
/**
 * vlab-verify-proof - v0.5 Proof Verification CLI
 * 
 * Verifies a signed proof bundle against the verifier identity.
 * Third parties can use this to independently verify proofs.
 * 
 * Usage:
 *   npx tsx scripts/vlab-verify-proof.ts <proof.json>
 *   npm run vlab:verify-proof -- <proof.json>
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
    const proofPath = process.argv[2];

    if (!proofPath) {
        console.log('MPLP Validation Lab - Proof Verifier v0.5\n');
        console.log('Usage: vlab-verify-proof.ts <proof.json>\n');
        console.log('Options:');
        console.log('  --help     Show this help');
        console.log('  --version  Show version\n');
        console.log('Example:');
        console.log('  npx tsx scripts/vlab-verify-proof.ts artifacts/proofs/arb-d1-budget-pass.proof.json');
        process.exit(0);
    }

    if (proofPath === '--version') {
        console.log('vlab-verify-proof v0.5.0');
        process.exit(0);
    }

    try {
        // Load proof file
        const absoluteProofPath = path.isAbsolute(proofPath)
            ? proofPath
            : path.join(process.cwd(), proofPath);

        if (!fs.existsSync(absoluteProofPath)) {
            console.error(`❌ Proof file not found: ${absoluteProofPath}`);
            process.exit(1);
        }

        const proofContent = fs.readFileSync(absoluteProofPath, 'utf-8');
        const proof = JSON.parse(proofContent);

        console.log('═══════════════════════════════════════════════════════════');
        console.log('  MPLP Validation Lab - Proof Verification');
        console.log('═══════════════════════════════════════════════════════════\n');

        console.log(`📄 Proof file: ${proofPath}`);
        console.log(`📋 Run ID: ${proof.payload?.run_id || 'N/A'}`);
        console.log(`📋 Ruleset: ${proof.payload?.ruleset_id || 'N/A'}`);
        console.log(`📋 Verdict: ${proof.payload?.topline_verdict || 'N/A'}`);
        console.log(`📋 Verdict Hash: ${proof.payload?.verdict_hash?.slice(0, 16)}...`);
        console.log(`📋 Signed at: ${proof.signature?.signed_at || 'N/A'}`);
        console.log(`📋 Key ID: ${proof.signature?.key_id || 'N/A'}\n`);

        // Load verifier identity
        const { verifySignedProof } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/proof/proof-bundle.ts')}`
        );

        const result = verifySignedProof(proof, PROJECT_ROOT);

        console.log('🔍 Verification Checks:');
        console.log(`   Signature valid:    ${result.checks.signature_valid ? '✅' : '❌'}`);
        console.log(`   Key ID valid:       ${result.checks.key_id_valid ? '✅' : '❌'}`);
        console.log(`   Identity valid:     ${result.checks.identity_valid ? '✅' : '❌'}`);
        console.log(`   Hash recomputable:  ${result.checks.hash_recomputable ? '✅' : '❌'}`);

        if (result.errors.length > 0) {
            console.log('\n⚠️ Errors:');
            for (const error of result.errors) {
                console.log(`   - ${error}`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        if (result.valid) {
            console.log('  ✅ VERIFICATION PASSED');
            console.log('  This proof is cryptographically valid and can be trusted.');
        } else {
            console.log('  ❌ VERIFICATION FAILED');
            console.log('  This proof could not be verified. Do not trust this result.');
        }
        console.log('═══════════════════════════════════════════════════════════\n');

        // Output JSON for programmatic use
        const output = {
            proof_file: proofPath,
            run_id: proof.payload?.run_id,
            ruleset_id: proof.payload?.ruleset_id,
            topline_verdict: proof.payload?.topline_verdict,
            verdict_hash: proof.payload?.verdict_hash,
            verification: result,
        };

        // Write verification result
        const resultPath = absoluteProofPath.replace('.json', '.verification.json');
        fs.writeFileSync(resultPath, JSON.stringify(output, null, 2));
        console.log(`📝 Verification result saved to: ${resultPath}`);

        process.exit(result.valid ? 0 : 1);

    } catch (e) {
        console.error(`❌ Error verifying proof: ${e}`);
        process.exit(1);
    }
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
