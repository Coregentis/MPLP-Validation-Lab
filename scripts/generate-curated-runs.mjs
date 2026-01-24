#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');
const ADJUDICATION_INDEX_PATH = path.join(PROJECT_ROOT, 'export/adjudication-index.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const RUNSETS_PATH = path.join(PROJECT_ROOT, 'governance/runsets.yaml');

async function main() {
    // 1. Read allowlist
    const allowlistContent = fs.readFileSync(ALLOWLIST_PATH, 'utf-8');
    const parsed = yaml.load(allowlistContent);
    let runs = parsed.runs || [];

    // 2. Load runsets for filtering
    const runsets = yaml.load(fs.readFileSync(RUNSETS_PATH, 'utf-8'));
    const internalIds = new Set([
        ...(runsets.sets.internal_test?.includes || []),
        ...(runsets.sets.non_admissible?.includes || [])
    ]);

    // 3. Load adjudications
    let adjudicationMap = new Map();
    if (fs.existsSync(ADJUDICATION_INDEX_PATH)) {
        const adjIndex = JSON.parse(fs.readFileSync(ADJUDICATION_INDEX_PATH, 'utf-8'));
        for (const adj of adjIndex.adjudications || []) {
            adjudicationMap.set(adj.run_id, adj);
        }
    }

    // 4. Enrich & Filter
    const enrichedRuns = runs
        .filter((r) => !internalIds.has(r.run_id))
        .map((run) => ({
            ...run,
            adjudication_status: adjudicationMap.get(run.run_id)?.overall_status || 'NOT_ADJUDICATED'
        }));

    // 5. Build Artifact
    const artifact = {
        ssot: { generated_at: new Date().toISOString() },
        runs: enrichedRuns.sort((a, b) => a.run_id.localeCompare(b.run_id))
    };

    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2));
    console.log(`✅ Generated public export with ${enrichedRuns.length} runs`);
}

main().catch(console.error);
