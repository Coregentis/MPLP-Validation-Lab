/**
 * generate-run-mapping-index.mjs
 * 
 * P0 deliverable: Generate public/_data/run-mapping-index.json
 * Maps each indexable run to its SSOT refs (fingerprint, fieldmap, normalization, hash-scope, equivalence)
 * 
 * Input SSOTs:
 * - data/curated-runs/allowlist.yaml (run → substrate/fingerprint_ref/fieldmap_ref)
 * - Fixed global refs for normalization/hash-scope/equivalence
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Fixed global SSOT refs
const GLOBAL_REFS = {
    normalization_spec_ref: 'governance/mappings/normalization-spec.yaml',
    hash_scope_ref: 'governance/mappings/hash-scope.yaml',
    equivalence_criteria_ref: 'governance/mappings/equivalence-criteria.yaml'
};

function main() {
    console.log('📋 Generating run-mapping-index.json...');

    // Load allowlist
    const allowlistPath = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');
    const allowlistContent = fs.readFileSync(allowlistPath, 'utf8');
    const allowlist = yaml.load(allowlistContent);

    const runs = [];

    for (const run of allowlist.runs || []) {
        // Only include indexable runs (consistent with v0.10 public boundary)
        if (!run.indexable) continue;

        const substrate = run.substrate || extractSubstrate(run.run_id);

        runs.push({
            run_id: run.run_id,
            substrate: substrate,
            fingerprint_ref: run.substrate_fingerprint_ref || `governance/substrates/${substrate}/fingerprint.yaml`,
            fieldmap_ref: run.fieldmap_ref || `governance/mappings/fieldmap/${substrate}.yaml`,
            ...GLOBAL_REFS
        });
    }

    const index = {
        version: '1.0.0',
        generated_at: new Date().toISOString(),
        total_runs: runs.length,
        runs
    };

    // Write output
    const outputPath = path.join(PROJECT_ROOT, 'public/_data/run-mapping-index.json');
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

    console.log(`✅ Generated ${runs.length} run mappings to ${outputPath}`);
}

/**
 * Extract substrate from run_id pattern
 * e.g., v05-d1-langgraph-pass-budget-allow → langgraph
 */
function extractSubstrate(runId) {
    // Pattern: v05-d1-langgraph-pass-budget-allow
    const match = runId.match(/v0\d+-(d[1-4])-([a-z]+)-/i);
    if (match) return match[2];

    // Pattern: arb-d1-budget-pass-fixture-v0.3
    if (runId.startsWith('arb-')) return 'fixture';

    // Pattern: gf-01-a2a-fail
    const gfMatch = runId.match(/gf-\d+-([a-z0-9]+)-/i);
    if (gfMatch) return gfMatch[1];

    return 'unknown';
}

main();
