#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const ALLOWLIST_PATH = 'data/curated-runs/allowlist.yaml';
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
        generated_at: new Date().toISOString(),
        git_commit: gitCommit
    },
    runs: runs.sort((a, b) => a.run_id.localeCompare(b.run_id))
};

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_PATH);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write artifact
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2), 'utf-8');

console.log(`✅ Generated ${OUTPUT_PATH}`);
console.log(`   Runs: ${artifact.runs.length}`);
console.log(`   Commit: ${gitCommit}`);
