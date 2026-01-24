import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * VLAB-GATE-14: UI Mapping Exposure
 * 
 * P0 deliverable: Ensures all indexable runs have complete mapping refs.
 * 
 * Rules:
 * 1. public/_data/run-mapping-index.json must exist and be parseable
 * 2. All indexable runs must have entries with complete refs
 * 3. MappingProjectionPanel must contain mandatory disclaimer
 */

const PROJECT_ROOT = process.cwd();
const INDEX_PATH = path.join(PROJECT_ROOT, 'public/_data/run-mapping-index.json');
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');
const PANEL_PATH = path.join(PROJECT_ROOT, 'app/runs/_components/MappingProjectionPanel.tsx');

// Mandatory disclaimer text (must appear in panel)
const MANDATORY_DISCLAIMER = 'Mappings describe evidence projection only; they do not describe framework capability.';

// Required refs for each run
const REQUIRED_REFS = [
    'fingerprint_ref',
    'fieldmap_ref',
    'normalization_spec_ref',
    'hash_scope_ref',
    'equivalence_criteria_ref'
];

interface MappingEntry {
    run_id: string;
    substrate: string;
    fingerprint_ref: string;
    fieldmap_ref: string;
    normalization_spec_ref: string;
    hash_scope_ref: string;
    equivalence_criteria_ref: string;
}

function runGate14() {
    console.log('🛡️  Running VLAB-GATE-14: UI Mapping Exposure...');

    let failures: string[] = [];

    // Rule 1: Index must exist and be parseable
    if (!fs.existsSync(INDEX_PATH)) {
        console.error('❌ Rule 1 FAIL: run-mapping-index.json not found');
        console.error('   Run: node scripts/generate-run-mapping-index.mjs');
        process.exit(1);
    }

    let index: { runs: MappingEntry[] };
    try {
        index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
    } catch (e) {
        console.error('❌ Rule 1 FAIL: run-mapping-index.json is not valid JSON');
        process.exit(1);
    }

    console.log(`📋 Index contains ${index.runs.length} runs`);

    // Rule 2: All indexable runs must have complete entries
    const allowlist = yaml.load(fs.readFileSync(ALLOWLIST_PATH, 'utf8')) as any;
    const indexableRuns = (allowlist.runs || []).filter((r: any) => r.indexable);

    console.log(`📋 Checking ${indexableRuns.length} indexable runs...`);

    const indexMap = new Map<string, MappingEntry>();
    for (const entry of index.runs) {
        indexMap.set(entry.run_id, entry);
    }

    for (const run of indexableRuns) {
        const entry = indexMap.get(run.run_id);

        if (!entry) {
            failures.push(`Missing entry: ${run.run_id}`);
            continue;
        }

        for (const ref of REQUIRED_REFS) {
            if (!entry[ref as keyof MappingEntry]) {
                failures.push(`Empty ref ${ref}: ${run.run_id}`);
            }
        }
    }

    // Rule 3: Panel must contain mandatory disclaimer
    if (!fs.existsSync(PANEL_PATH)) {
        failures.push('MappingProjectionPanel.tsx not found');
    } else {
        const panelContent = fs.readFileSync(PANEL_PATH, 'utf8');
        if (!panelContent.includes(MANDATORY_DISCLAIMER)) {
            failures.push('MappingProjectionPanel missing mandatory disclaimer');
        }
    }

    // Report results
    if (failures.length > 0) {
        console.error(`\n❌ Gate FAIL: ${failures.length} issues found:`);
        for (const fail of failures) {
            console.error(`   - ${fail}`);
        }
        process.exit(1);
    }

    console.log(`\n🟢 Gate PASS: All ${indexableRuns.length} indexable runs have complete mapping refs.`);
}

runGate14();
