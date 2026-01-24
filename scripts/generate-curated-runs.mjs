#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const ALLOWLIST_PATH = 'data/curated-runs/allowlist.yaml';
const ADJUDICATION_INDEX_PATH = 'export/adjudication-index.json';
const OUTPUT_PATH = 'public/_data/curated-runs.json';

// Read allowlist
const allowlistContent = fs.readFileSync(ALLOWLIST_PATH, 'utf-8');
const parsed = yaml.load(allowlistContent);

// Support both { runs: [...] } and direct array
let runs;
if (Array.isArray(parsed)) {
    runs = parsed;
} else if (parsed && Array.isArray(parsed.runs)) {
    runs = parsed.runs;
} else {
    throw new Error(
        `Invalid allowlist format at ${ALLOWLIST_PATH}: ` +
        `expected 'runs' array or top-level array, got ${typeof parsed}`
    );
}

// Validate runs
if (runs.length === 0) {
    console.warn('Warning: allowlist contains 0 runs');
}

// Load adjudication index to enrich runs with adjudication status
let adjudicationMap = new Map();
if (fs.existsSync(ADJUDICATION_INDEX_PATH)) {
    try {
        const adjIndex = JSON.parse(fs.readFileSync(ADJUDICATION_INDEX_PATH, 'utf-8'));
        // Load runsets for filtering
        const runsetsPath = path.join(PROJECT_ROOT, 'governance/runsets.yaml');
        const runsets = yaml.load(fs.readFileSync(runsetsPath, 'utf-8'));
        const internalIds = new Set([
            ...(runsets.sets.internal_test?.includes || []),
            ...(runsets.sets.non_admissible?.includes || [])
        ]);

        // Filter adjudications based on runsets
        const eligibleAdjudications = (adjIndex.adjudications || []).filter(adj => !internalIds.has(adj.run_id));

        for (const adj of eligibleAdjudications) {
            adjudicationMap.set(adj.run_id, {
                status: adj.overall_status,
                verdict_hash: adj.verdict_hash,
                admission_status: adj.admission_status
            });
        }
        console.log(`📊 Loaded ${adjudicationMap.size} adjudication bundles`);
    } catch (e) {
        console.warn(`Warning: Could not load adjudication index: ${e.message}`);
    }
}

// Define project root
const PROJECT_ROOT = process.cwd();

// Load runsets for filtering
const runsetsPath = path.join(PROJECT_ROOT, 'governance/runsets.yaml');
const runsets = yaml.load(fs.readFileSync(runsetsPath, 'utf-8'));
const internalIds = new Set([
    ...(runsets.sets.internal_test?.includes || []),
    ...(runsets.sets.non_admissible?.includes || [])
]);

// Enrich runs with adjudication status
const enrichedRuns = runs
    .filter(run => !internalIds.has(run.run_id))
    .map(run => {
        const adj = adjudicationMap.get(run.run_id);
        if (adj) {
            return {
                ...run,
                adjudication_status: adj.status,
                adjudication_verdict_hash: adj.verdict_hash,
                adjudication_admission_status: adj.admission_status
            };
        }
        return {
            ...run,
            adjudication_status: 'NOT_ADJUDICATED',
            adjudication_verdict_hash: null,
            adjudication_admission_status: null
        };
    });

// Get git commit (fallback to 'unknown' if not in git context)
let gitCommit = 'unknown';
try {
    gitCommit = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch (e) {
    console.warn('Could not get git commit, using "unknown"');
}

// Generate artifact
const artifact = {
    ssot: {
        source: ALLOWLIST_PATH,
        adjudication_source: ADJUDICATION_INDEX_PATH,
        generated_at: new Date().toISOString(),
        git_commit: gitCommit
    },
    runs: enrichedRuns.sort((a, b) => a.run_id.localeCompare(b.run_id))
};

// Count adjudicated
const adjudicatedCount = enrichedRuns.filter(r => r.adjudication_status === 'ADJUDICATED').length;

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write artifact
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2), 'utf-8');

console.log(`✅ Generated ${OUTPUT_PATH}`);
console.log(`   Runs: ${artifact.runs.length}`);
console.log(`   Adjudicated: ${adjudicatedCount}`);
console.log(`   Commit: ${gitCommit}`);
