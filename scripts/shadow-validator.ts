#!/usr/bin/env tsx
/**
 * Shadow Validator - v0.4 Independent Adjudication CLI
 * 
 * Provides independent local adjudication of evidence packs.
 * Used by gate:shadow-parity to verify Lab ≡ local recomputation.
 * 
 * Usage:
 *   npx tsx scripts/shadow-validator.ts <run_id>
 *   npm run shadow:validate -- <run_id>
 * 
 * Output (JSON):
 *   { run_id, ruleset_id, verdict_hash, evaluation: RulesetEvalResult }
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Dynamic imports for lib modules
async function main() {
    const runId = process.argv[2];

    if (!runId) {
        console.error('Usage: shadow-validator.ts <run_id>');
        process.exit(1);
    }

    try {
        // Load dependencies
        const { loadRunBundle } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/bundles/load_run_bundle.ts')}`
        );
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/rulesets/registry.ts')}`
        );
        const { computeVerdictHash } = await import(
            `file://${path.join(PROJECT_ROOT, 'lib/proof/verdict-hash.ts')}`
        );

        // Step 1: Load run bundle
        const bundle = loadRunBundle(runId);
        if (!bundle) {
            outputError(runId, 'BUNDLE_NOT_FOUND', `Run bundle not found: ${runId}`);
            process.exit(1);
        }

        // Step 2: Determine effective ruleset
        const effectiveRuleset = determineEffectiveRuleset(runId, bundle);
        if (!effectiveRuleset) {
            outputError(runId, 'RULESET_NOT_DETERMINED', 'Could not determine applicable ruleset');
            process.exit(1);
        }

        // Step 3: Get ruleset from registry
        const ruleset = await getRuleset(effectiveRuleset);
        if (!ruleset || !ruleset.adjudicator) {
            outputError(runId, 'RULESET_NOT_LOADABLE', `Ruleset not loadable: ${effectiveRuleset}`);
            process.exit(1);
        }

        // Step 4: Execute adjudicator
        const evaluation = await ruleset.adjudicator(bundle);

        // Step 5: Compute verdict hash
        const verdictHash = computeVerdictHash(evaluation);

        // Step 6: Output result
        const result = {
            run_id: runId,
            ruleset_id: effectiveRuleset,
            verdict_hash: verdictHash,
            topline_verdict: evaluation.topline_verdict,
            reason_code: evaluation.reason_code ?? null,
            clause_count: evaluation.clauses.length,
            evaluation,
        };

        console.log(JSON.stringify(result, null, 2));

        // Optional: Write to artifacts
        const artifactsDir = path.join(PROJECT_ROOT, 'artifacts', 'shadow');
        if (!fs.existsSync(artifactsDir)) {
            fs.mkdirSync(artifactsDir, { recursive: true });
        }
        fs.writeFileSync(
            path.join(artifactsDir, `${runId}.json`),
            JSON.stringify(result, null, 2)
        );

    } catch (error) {
        outputError(runId, 'EXECUTION_ERROR', String(error));
        process.exit(1);
    }
}

/**
 * Determine the effective ruleset for a run.
 * 
 * Priority:
 * 1. bundle_manifest.ruleset_ref (explicit declaration)
 * 2. Run ID pattern-based inference (SSOT fallback)
 */
function determineEffectiveRuleset(
    runId: string,
    bundle: { manifest?: { ruleset_ref?: string } }
): string | null {
    // Priority 1: Explicit declaration in manifest
    const manifestRuleset = bundle.manifest?.ruleset_ref;
    if (manifestRuleset) {
        return manifestRuleset;
    }

    // Priority 2: Pattern-based inference (must match curated-runs-closure logic)
    if (runId.endsWith('-v0.4')) {
        return 'ruleset-1.2';
    }
    if (runId.startsWith('arb-') && runId.endsWith('-v0.3')) {
        return 'ruleset-1.1';
    }
    if (runId.startsWith('arb-')) {
        // Default arb- to ruleset-1.1 (v0.3 baseline)
        return 'ruleset-1.1';
    }
    if (runId.startsWith('gf-') || runId.startsWith('admission-')) {
        return 'ruleset-1.0';
    }

    return null;
}

/**
 * Output error in JSON format for CI parsing.
 */
function outputError(runId: string, code: string, message: string) {
    console.log(JSON.stringify({
        run_id: runId,
        error: true,
        error_code: code,
        error_message: message,
    }, null, 2));
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
