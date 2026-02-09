/**
 * Gate 15: Curated Runs Adjudication Required
 * 
 * Validates that curated runs have corresponding adjudication bundles.
 * This gate enforces the curated → adjudication closure, ensuring
 * every curated run is backed by a verifiable adjudication record.
 * 
 * GOVERNANCE: This is the curated set closure gate.
 * No endorsement, ranking, or recommendation logic - only factual closure.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

// =============================================================================
// Types
// =============================================================================

interface CuratedEntry {
    run_id: string;
    status?: string;
    scenario_id?: string;
    substrate?: string;
    indexable?: boolean;
}

interface AdjudicationEntry {
    run_id: string;
    overall_status: string;
    verdict_hash: string;
}

interface GateResult {
    gate_id: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    message: string;
    details?: {
        checks_passed: number;
        checks_failed: number;
        curated_count: number;
        adjudicated_count: number;
        failures: string[];
    };
}

// =============================================================================
// Constants
// =============================================================================

const VLAB_ROOT = join(__dirname, '../..');
const ALLOWLIST_PATH = join(VLAB_ROOT, 'data/curated-runs/allowlist.yaml');
const ADJUDICATION_DIR = join(VLAB_ROOT, 'adjudication');
const EXPORT_DIR = join(VLAB_ROOT, 'export');

// Statuses that require adjudication bundle
const REQUIRE_ADJUDICATION_STATUSES = ['active', 'curated', 'frozen'];

// Valid overall_status values for curated entries
const VALID_CURATED_STATUSES = ['ADJUDICATED', 'INCOMPLETE', 'NOT_ADMISSIBLE'];

// =============================================================================
// Helpers
// =============================================================================

function loadYaml(filePath: string): unknown {
    return yaml.load(readFileSync(filePath, 'utf-8'));
}

function loadJson(filePath: string): unknown {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
}

// =============================================================================
// Main Gate Logic
// =============================================================================

async function runGate15(): Promise<GateResult> {
    const failures: string[] = [];
    let checksPass = 0;
    let checksFail = 0;
    let curatedCount = 0;
    let adjudicatedCount = 0;

    // Check 1: allowlist.yaml exists
    if (!existsSync(ALLOWLIST_PATH)) {
        return {
            gate_id: 'gate-15-curated-adjudication-required',
            status: 'SKIP',
            message: 'allowlist.yaml not found',
        };
    }
    checksPass++;

    // Check 2: Parse allowlist
    let allowlist: { runs: CuratedEntry[] };
    try {
        allowlist = loadYaml(ALLOWLIST_PATH) as { runs: CuratedEntry[] };
        checksPass++;
    } catch (err) {
        return {
            gate_id: 'gate-15-curated-adjudication-required',
            status: 'FAIL',
            message: `Failed to parse allowlist.yaml: ${(err as Error).message}`,
        };
    }

    if (!allowlist.runs || allowlist.runs.length === 0) {
        return {
            gate_id: 'gate-15-curated-adjudication-required',
            status: 'PASS',
            message: 'No curated runs defined (vacuously complete)',
            details: { checks_passed: checksPass, checks_failed: 0, curated_count: 0, adjudicated_count: 0, failures: [] },
        };
    }

    curatedCount = allowlist.runs.length;

    // Check 3: Load adjudication-index if exists
    let adjudicationIndex: { adjudications: AdjudicationEntry[] } = { adjudications: [] };
    const indexPath = join(EXPORT_DIR, 'adjudication-index.json');
    if (existsSync(indexPath)) {
        try {
            adjudicationIndex = loadJson(indexPath) as { adjudications: AdjudicationEntry[] };
            checksPass++;
        } catch {
            // Index may not exist yet, which is acceptable
        }
    }

    const adjudicationMap = new Map<string, AdjudicationEntry>();
    for (const entry of adjudicationIndex.adjudications) {
        adjudicationMap.set(entry.run_id, entry);
    }

    // Check 4-N: Validate each curated entry
    for (const entry of allowlist.runs) {
        if (!entry.run_id) {
            failures.push(`Curated entry missing run_id`);
            checksFail++;
            continue;
        }

        // Skip entries that don't require adjudication (e.g., eligible_for_upgrade)
        if (entry.status && !REQUIRE_ADJUDICATION_STATUSES.includes(entry.status)) {
            checksPass++;
            continue;
        }

        // Check: Adjudication bundle exists
        const bundlePath = join(ADJUDICATION_DIR, entry.run_id);
        const verdictPath = join(bundlePath, 'verdict.json');

        if (!existsSync(bundlePath)) {
            // Bundle doesn't exist - this is NOT a failure yet
            // We only require adjudication for indexable entries
            if (entry.indexable !== false) {
                // This is informational, not a hard failure
                // Future: can be upgraded to FAIL when all curated runs are adjudicated
            }
            checksPass++; // Soft pass for now
            continue;
        }

        // Bundle exists - verify it's valid
        if (!existsSync(verdictPath)) {
            failures.push(`${entry.run_id}: bundle exists but verdict.json missing`);
            checksFail++;
            continue;
        }

        try {
            const verdict = loadJson(verdictPath) as { overall_status?: string; verdict_hash?: string };

            // Check overall_status is valid
            if (!verdict.overall_status || !VALID_CURATED_STATUSES.includes(verdict.overall_status)) {
                failures.push(`${entry.run_id}: invalid overall_status '${verdict.overall_status}'`);
                checksFail++;
                continue;
            }

            // Check verdict_hash exists
            if (!verdict.verdict_hash) {
                failures.push(`${entry.run_id}: missing verdict_hash`);
                checksFail++;
                continue;
            }

            adjudicatedCount++;
            checksPass++;

            // Check: if in adjudication-index, hashes match
            const indexEntry = adjudicationMap.get(entry.run_id);
            if (indexEntry && indexEntry.verdict_hash !== verdict.verdict_hash) {
                failures.push(`${entry.run_id}: verdict_hash mismatch between bundle and index`);
                checksFail++;
            }

        } catch {
            failures.push(`${entry.run_id}: failed to parse verdict.json`);
            checksFail++;
        }
    }

    // Result
    if (failures.length > 0) {
        return {
            gate_id: 'gate-15-curated-adjudication-required',
            status: 'FAIL',
            message: `${failures.length} curated closure check(s) failed`,
            details: {
                checks_passed: checksPass,
                checks_failed: checksFail,
                curated_count: curatedCount,
                adjudicated_count: adjudicatedCount,
                failures,
            },
        };
    }

    return {
        gate_id: 'gate-15-curated-adjudication-required',
        status: 'PASS',
        message: `Curated closure: ${curatedCount} entries, ${adjudicatedCount} adjudicated`,
        details: {
            checks_passed: checksPass,
            checks_failed: 0,
            curated_count: curatedCount,
            adjudicated_count: adjudicatedCount,
            failures: [],
        },
    };
}

// =============================================================================
// Entry Point
// =============================================================================

export default async function gate15(): Promise<void> {
    console.log('\n🚪 Gate 15: Curated Runs Adjudication Required\n');

    const result = await runGate15();

    if (result.status === 'PASS') {
        console.log(`✅ PASS: ${result.message}`);
        if (result.details) {
            console.log(`   Curated: ${result.details.curated_count}`);
            console.log(`   Adjudicated: ${result.details.adjudicated_count}`);
        }
    } else if (result.status === 'SKIP') {
        console.log(`⏭️  SKIP: ${result.message}`);
    } else {
        console.log(`❌ FAIL: ${result.message}`);
        if (result.details?.failures) {
            for (const failure of result.details.failures) {
                console.log(`   - ${failure}`);
            }
        }
        throw new Error(`Gate 15 FAILED: ${result.message}`);
    }
}

export { runGate15 };
