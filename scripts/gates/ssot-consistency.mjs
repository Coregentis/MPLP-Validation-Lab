/**
 * SSOT Consistency Gate (P0-6) - Hotfix PR-03.1
 *
 * Verifies that claim surfaces (substrate-index, export, runsets) are consistent.
 * Prevents claim surface drift between related SSOT files.
 *
 * Governance: COVERAGE_GOVERNANCE_ADDENDUM.md Section 2
 *
 * Usage: npm run gate:ssot-consistency
 *
 * Modes:
 *   STRICT_SUBSTRATE_MATCH=1  - Fail if substrate in index has no runs in export
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const REASONS = {
    SUBSTRATE_ID_MISMATCH: "SSOT-SUBSTRATE-ID-MISMATCH",
    CLAIM_LEVEL_MISMATCH: "SSOT-CLAIM-LEVEL-MISMATCH",
    RUN_REF_MISSING: "SSOT-RUN-REF-MISSING",
    RUN_DIR_MISSING: "SSOT-RUN-DIR-MISSING",
};

function readYaml(filePath) {
    return YAML.parse(fs.readFileSync(filePath, "utf8"));
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fail(reason, details) {
    console.error(JSON.stringify({ ok: false, reason, details }, null, 2));
    process.exit(1);
}

function ok(details) {
    console.log(JSON.stringify({ ok: true, details }, null, 2));
    process.exit(0);
}

const ROOT = process.cwd();

// Strict mode: fail if substrate in index has no runs in export
// Default to false for backward compatibility, enable in CI
const STRICT_SUBSTRATE_MATCH = process.env.STRICT_SUBSTRATE_MATCH === "1";

// SSOT file paths
const substrateIndexPath = path.join(ROOT, "data/curated-runs/substrate-index.yaml");
const exportCuratedPath = path.join(ROOT, "export/curated-runs.json");
const runsetsPath = path.join(ROOT, "governance/runsets.yaml");
const runsRoot = path.join(ROOT, "data/runs");

// Check if files exist
if (!fs.existsSync(substrateIndexPath)) {
    fail(REASONS.RUN_REF_MISSING, { file: substrateIndexPath, error: "substrate-index.yaml not found" });
}
if (!fs.existsSync(exportCuratedPath)) {
    fail(REASONS.RUN_REF_MISSING, { file: exportCuratedPath, error: "curated-runs.json not found" });
}
if (!fs.existsSync(runsetsPath)) {
    fail(REASONS.RUN_REF_MISSING, { file: runsetsPath, error: "runsets.yaml not found" });
}

const substrateIndex = readYaml(substrateIndexPath);
const exportCurated = readJson(exportCuratedPath);
const runsets = readYaml(runsetsPath);

// ============================================================================
// A) Build substrate maps from both sources
// ============================================================================

// From substrate-index.yaml: substrates[] with id, current_level, runs[]
function extractIndexSubstrates(data) {
    const substrates = data?.substrates ?? data ?? [];
    const map = new Map();
    for (const s of substrates) {
        if (s?.id) {
            map.set(s.id, {
                id: s.id,
                claim_level: s.current_level ?? s.substrate_claim_level ?? s.claim_level,
                run_ids: (s.runs ?? []).map(r => r.run_id).filter(Boolean),
                tier: s.tier,
                type: s.type,
            });
        }
    }
    return map;
}

// From export/curated-runs.json: runs[] with substrate field
// Aggregate by substrate to get claim levels and run counts
function extractExportSubstrates(data) {
    const runs = data?.runs ?? [];
    const map = new Map();

    for (const run of runs) {
        if (!run?.substrate) continue;

        const substrateId = run.substrate;
        if (!map.has(substrateId)) {
            map.set(substrateId, {
                id: substrateId,
                claim_levels: new Set(),
                run_ids: [],
            });
        }

        const entry = map.get(substrateId);
        entry.run_ids.push(run.run_id);

        if (run.substrate_claim_level) {
            entry.claim_levels.add(run.substrate_claim_level);
        }
    }

    return map;
}

const idxMap = extractIndexSubstrates(substrateIndex);
const expMap = extractExportSubstrates(exportCurated);

// ============================================================================
// B) Verify substrate consistency (index ↔ export)
// ============================================================================

const missingInExport = [];
const claimMismatches = [];

for (const [id, idxEntry] of idxMap.entries()) {
    const expEntry = expMap.get(id);

    // Check if substrate exists in export
    if (!expEntry || expEntry.run_ids.length === 0) {
        if (STRICT_SUBSTRATE_MATCH) {
            // In strict mode, fail on missing substrates
            fail(REASONS.SUBSTRATE_ID_MISMATCH, {
                substrate_id: id,
                error: "substrate in index has no runs in export",
                index_has_runs: idxEntry.run_ids.length,
            });
        } else {
            // Non-strict: warn but continue
            missingInExport.push(id);
            console.warn(`[WARN] Substrate '${id}' in substrate-index has no runs in export`);
        }
        continue;
    }

    // Check claim level consistency
    // Index has one claim_level, export may have multiple (from different runs)
    const idxLevel = idxEntry.claim_level;
    if (idxLevel && expEntry.claim_levels.size > 0) {
        // At least one run should have matching claim level
        if (!expEntry.claim_levels.has(idxLevel)) {
            claimMismatches.push({
                substrate_id: id,
                index_level: idxLevel,
                export_levels: Array.from(expEntry.claim_levels),
            });
        }
    }
}

// Fail on claim mismatches
if (claimMismatches.length > 0) {
    fail(REASONS.CLAIM_LEVEL_MISMATCH, {
        mismatches: claimMismatches,
        total: claimMismatches.length,
    });
}

// ============================================================================
// C) Verify run ID references exist (runsets.yaml + substrate-index ↔ data/runs/)
// ============================================================================

function collectRunIds(obj, acc = new Set()) {
    if (!obj || typeof obj !== "object") return acc;

    if (Array.isArray(obj)) {
        return acc;
    }

    for (const [key, value] of Object.entries(obj)) {
        // Skip known non-run-id fields
        if (key === "substrates" || key === "count" || key === "description" || key === "scenarios" || key === "source") {
            continue;
        }

        // Collect run_id fields
        if (key === "run_id" && typeof value === "string") {
            acc.add(value);
        }
        // Collect from includes arrays (contains actual run IDs in runsets.yaml)
        if (key === "includes" && Array.isArray(value)) {
            for (const runId of value) {
                if (typeof runId === "string") {
                    acc.add(runId);
                }
            }
        }
        // Recurse into nested objects only (not arrays)
        if (value && typeof value === "object" && !Array.isArray(value)) {
            collectRunIds(value, acc);
        }
    }
    return acc;
}

// Collect run IDs from runsets
const runsetRunIds = collectRunIds(runsets?.sets ?? runsets);

// Also collect run IDs from substrate-index runs arrays
for (const [, entry] of idxMap.entries()) {
    for (const runId of entry.run_ids) {
        runsetRunIds.add(runId);
    }
}

// Verify each referenced run directory exists
const missingRuns = [];
for (const runId of runsetRunIds) {
    const runDir = path.join(runsRoot, runId);
    if (!fs.existsSync(runDir)) {
        missingRuns.push(runId);
    }
}

if (missingRuns.length > 0) {
    fail(REASONS.RUN_DIR_MISSING, {
        missing_runs: missingRuns,
        runs_root: runsRoot,
        total_missing: missingRuns.length,
    });
}

// ============================================================================
// Success
// ============================================================================

ok({
    checked_substrates: idxMap.size,
    substrates_in_export: expMap.size,
    substrates_missing_in_export: missingInExport.length,
    checked_run_ids: runsetRunIds.size,
    runs_verified: runsetRunIds.size,
    strict_mode: STRICT_SUBSTRATE_MATCH,
});
