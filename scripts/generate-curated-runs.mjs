#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import crypto from 'crypto';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');
const ADJUDICATION_INDEX_PATH = path.join(PROJECT_ROOT, 'export/adjudication-index.json');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'public/_data/curated-runs.json');
const RUNSETS_PATH = path.join(PROJECT_ROOT, 'governance/runsets.yaml');
const HASH_FIELDS = [
    'pack_root_hash',
    'verdict_hash',
    'verify_report_hash',
    'evaluation_report_hash',
];

function loadExistingArtifact() {
    if (!fs.existsSync(OUTPUT_PATH)) {
        return { generatedAt: null, runsById: new Map() };
    }

    try {
        const artifact = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8'));
        return {
            generatedAt: artifact.ssot?.generated_at || null,
            runsById: new Map((artifact.runs || []).map((run) => [run.run_id, run])),
        };
    } catch {
        return { generatedAt: null, runsById: new Map() };
    }
}

function stableGeneratedAt(existingGeneratedAt) {
    if (existingGeneratedAt) return existingGeneratedAt;
    if (process.env.SOURCE_DATE_EPOCH) {
        return new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString();
    }
    return new Date().toISOString();
}

function stableFieldValue(run, previousRun, field, computeValue) {
    const PLACEHOLDER = 'f'.repeat(64);
    if (run[field] && run[field] !== PLACEHOLDER) {
        return run[field];
    }
    if (previousRun && Object.prototype.hasOwnProperty.call(previousRun, field)) {
        return previousRun[field];
    }
    return computeValue();
}

/**
 * Compute hash for entire run pack directory
 */
function computePackHash(runId) {
    const runDir = path.join(PROJECT_ROOT, 'data/runs', runId);
    if (!fs.existsSync(runDir)) return null;

    try {
        const output = execSync(
            `find "${runDir}" -type f -exec shasum -a 256 {} \\; | sort | shasum -a 256`,
            { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
        );
        return output.split(' ')[0];
    } catch {
        return null;
    }
}

/**
 * Compute SHA-256 hash of a single file
 */
function computeFileHash(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const content = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch {
        return null;
    }
}

async function main() {
    // 1. Read allowlist
    const allowlistContent = fs.readFileSync(ALLOWLIST_PATH, 'utf-8');
    const parsed = yaml.load(allowlistContent);
    let runs = parsed.runs || [];
    const existingArtifact = loadExistingArtifact();

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

    // 4. Enrich & Filter with hash computation
    console.log('🔐 Computing missing hashes...');
    const enrichedRuns = runs
        .filter((r) => !internalIds.has(r.run_id))
        .map((run) => {
            const runDir = path.join(PROJECT_ROOT, 'data/runs', run.run_id);
            const previousRun = existingArtifact.runsById.get(run.run_id);

            const hashValues = Object.fromEntries(HASH_FIELDS.map((field) => {
                const computeValue = () => {
                    if (field === 'pack_root_hash') return computePackHash(run.run_id);
                    if (field === 'verdict_hash') return computeFileHash(path.join(runDir, 'verdict.json'));
                    if (field === 'verify_report_hash') return computeFileHash(path.join(runDir, 'verify-report.json'));
                    return computeFileHash(path.join(runDir, 'evaluation-report.json'));
                };
                return [field, stableFieldValue(run, previousRun, field, computeValue)];
            }));

            return {
                ...run,
                ...hashValues,
                adjudication_status: adjudicationMap.get(run.run_id)?.overall_status || 'NOT_ADJUDICATED'
            };
        });

    // 5. Build Artifact
    const artifact = {
        ssot: { generated_at: stableGeneratedAt(existingArtifact.generatedAt) },
        runs: enrichedRuns.sort((a, b) => a.run_id.localeCompare(b.run_id))
    };

    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(artifact, null, 2));
    console.log(`✅ Generated public export with ${enrichedRuns.length} runs`);
}

main().catch(console.error);
