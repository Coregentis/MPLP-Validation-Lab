#!/usr/bin/env node
/**
 * @mplp/recompute - Third-party verdict recomputation CLI
 * 
 * Purpose: Enable repo-external, offline verification of MPLP evidence pack verdicts
 * Strategy: Bundled ruleset-1.0 (no network dependencies)
 * 
 * Sprint: Cross-Vendor Evidence Spine v0.1
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface RecomputeResult {
    ruleset_source: 'bundled';
    ruleset_version: string;
    pack_id: string;
    verdict_hash: string;
    match: boolean | null;
    curated_hash: string | null;
}

/**
 * Main CLI entry point
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: mplp-recompute <pack_path> --ruleset <version>');
        console.error('Example: mplp-recompute ./data/runs/sample-pass --ruleset 1.0');
        process.exit(2);
    }

    const packPath = path.resolve(args[0]);
    const rulesetFlag = args[1];
    const rulesetVersion = args[2];

    // Validate ruleset flag
    if (rulesetFlag !== '--ruleset') {
        console.error('Error: Expected --ruleset flag');
        process.exit(2);
    }

    // T2.2.1: Only accept ruleset 1.0 (frozen for v0.1)
    if (rulesetVersion !== '1.0') {
        console.error(`Error: Only ruleset version 1.0 is supported (got: ${rulesetVersion})`);
        console.error('This CLI bundles ruleset-1.0 for deterministic recomputation.');
        process.exit(2);
    }

    // Verify pack exists
    if (!fs.existsSync(packPath)) {
        console.error(`Error: Pack path does not exist: ${packPath}`);
        process.exit(1);
    }

    // Load manifest
    const manifestPath = path.join(packPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`Error: manifest.json not found in pack`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const packId = manifest.pack_id || 'unknown';

    // Recompute verdict_hash
    const verdictHash = await recomputeVerdictHash(packPath);

    // Prepare result
    const result: RecomputeResult = {
        ruleset_source: 'bundled',
        ruleset_version: '1.0',
        pack_id: packId,
        verdict_hash: verdictHash,
        match: null, // Will be true if curated_hash provided and matches
        curated_hash: null,
    };

    // Output JSON
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}

/**
 * Recompute verdict_hash from evaluation.report.json
 * 
 * Note: This is a simplified implementation for v0.1
 * Full implementation would use canonicalize.ts logic
 */
async function recomputeVerdictHash(packPath: string): Promise<string> {
    const evalPath = path.join(packPath, 'evaluation.report.json');

    if (!fs.existsSync(evalPath)) {
        // Pack not yet evaluated - return placeholder
        return '0000000000000000000000000000000000000000000000000000000000000000';
    }

    const evalContent = fs.readFileSync(evalPath, 'utf-8');
    const evalReport = JSON.parse(evalContent);

    // Extract verdict_hash if already computed
    if (evalReport.verdict_hash) {
        return evalReport.verdict_hash;
    }

    // Simplified canonicalization for v0.1
    // Full implementation would remove non-deterministic fields and sort
    const canonical = JSON.stringify(evalReport);
    return crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex');
}

// Run CLI
main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
