/**
 * Coverage Claim Gate (P0-4) - Hotfix PR-03.1
 *
 * Verifies that all claims (covered/supported/claim_level/E-B/E-S) have artifact pointers.
 * Implements "No Claim Without Artifact" rule.
 *
 * Governance: COVERAGE_GOVERNANCE_ADDENDUM.md Section 1
 *
 * Usage: npm run gate:coverage-claim
 *
 * Environment:
 *   REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM=1  - Enable E-S → signed_proof_ref requirement
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

const REASONS = {
    CLAIM_MISSING_ARTIFACT_REF: "CLAIM-MISSING-ARTIFACT-REF",
    ES_CLAIM_MISSING_SIGNED_PROOF: "CLAIM-ES-MISSING-SIGNED-PROOF",
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

// Toggle: only enable if P0-1 verification concludes E-S claim is NOT gated elsewhere
const REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM = process.env.REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM === "1";

// Claim surface paths
const coverageDir = path.join(ROOT, "adjudication/matrix");
const substrateIndexPath = path.join(ROOT, "data/curated-runs/substrate-index.yaml");
const exportCuratedPath = path.join(ROOT, "export/curated-runs.json");

/**
 * Check if a claim node has at least one valid artifact pointer
 */
function hasArtifactRef(claim) {
    // Acceptable pointers
    return !!(
        claim.run_id ||
        (Array.isArray(claim.run_ids) && claim.run_ids.length > 0) ||
        (Array.isArray(claim.runs) && claim.runs.length > 0) ||
        claim.repro_ref ||
        claim.proof_ref ||
        claim.signed_proof_ref ||
        claim.adjudication_ref ||
        // Matrix files use 'anchors' object with path references
        (claim.anchors && Object.keys(claim.anchors).length > 0)
    );
}

/**
 * Validate a single claim node
 */
function validateClaim(claim, location) {
    // Check artifact reference exists
    if (!hasArtifactRef(claim)) {
        fail(REASONS.CLAIM_MISSING_ARTIFACT_REF, {
            location,
            claim: JSON.stringify(claim).slice(0, 200),
        });
    }

    // Check E-S claim has signed proof (if enabled)
    if (REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM) {
        const strength = claim.strength ?? claim.evidence_strength;
        if (strength === "E-S" && !claim.signed_proof_ref) {
            fail(REASONS.ES_CLAIM_MISSING_SIGNED_PROOF, {
                location,
                claim: JSON.stringify(claim).slice(0, 200),
            });
        }
    }
}

/**
 * Check if a node represents a substantive claim that needs artifact reference
 * Only returns true for nodes with explicit claim indicators
 */
function isSubstantiveClaim(node, key) {
    if (!node || typeof node !== "object") return false;

    // These fields indicate substantive claims that need artifact refs
    const hasClaimIndicator = (
        // Coverage matrix: status field with implemented/partial values
        (node.status === "implemented" || node.status === "partial") ||
        // Evidence strength claims
        (node.implemented === true && (node.anchors || node.name)) ||
        // Substrate index claims
        node.substrate_claim_level !== undefined ||
        node.current_level !== undefined ||
        node.claim_level !== undefined
    );

    // Skip non-claims: version, authority, metadata, boundary statements
    const isMetadata = (
        key === "version" ||
        key === "authority" ||
        key === "scenario_id" ||
        key === "last_updated" ||
        key === "non_endorsement_boundary" ||
        key === "determinism_boundary" ||
        key === "gaps" ||
        key === "planned_artifacts"
    );

    return hasClaimIndicator && !isMetadata;
}

// ============================================================================
// A) Scan Coverage Matrix YAML files
// ============================================================================

function scanCoverageMatrix() {
    if (!fs.existsSync(coverageDir)) {
        console.warn(`[INFO] Coverage directory not found: ${coverageDir}`);
        return { files: 0, claims: 0 };
    }

    const files = fs.readdirSync(coverageDir).filter(f =>
        f.endsWith(".yaml") || f.endsWith(".yml")
    );

    let claims = 0;

    for (const f of files) {
        const filePath = path.join(coverageDir, f);
        const doc = readYaml(filePath);

        function walk(node, jsonPath, parentKey = null) {
            if (!node || typeof node !== "object") return;

            if (Array.isArray(node)) {
                node.forEach((item, i) => walk(item, `${jsonPath}[${i}]`, null));
                return;
            }

            // Check if this node is a substantive claim
            if (isSubstantiveClaim(node, parentKey)) {
                claims += 1;
                validateClaim(node, `${filePath}:${jsonPath}`);
            }

            for (const [key, value] of Object.entries(node)) {
                walk(value, `${jsonPath}.${key}`, key);
            }
        }

        walk(doc, "$", null);
    }

    return { files: files.length, claims };
}

// ============================================================================
// B) Scan Substrate Index
// ============================================================================

function scanSubstrateIndex() {
    if (!fs.existsSync(substrateIndexPath)) {
        console.warn(`[WARN] Substrate index not found: ${substrateIndexPath}`);
        return { claims: 0 };
    }

    const idx = readYaml(substrateIndexPath);
    const substrates = idx.substrates ?? idx ?? [];

    let claims = 0;

    for (const s of substrates) {
        if (!s || typeof s !== "object") continue;

        // Substrate itself is a claim if it has claim_level
        const hasClaimLevel = s.current_level || s.substrate_claim_level || s.claim_level;

        if (hasClaimLevel) {
            claims += 1;
            // Substrate claim is satisfied by having runs array
            if (!hasArtifactRef(s)) {
                fail(REASONS.CLAIM_MISSING_ARTIFACT_REF, {
                    location: `${substrateIndexPath}:substrate.${s.id}`,
                    substrate_id: s.id,
                });
            }
        }
    }

    return { claims };
}

// ============================================================================
// C) Scan Export Contract
// ============================================================================

function scanExport() {
    if (!fs.existsSync(exportCuratedPath)) {
        console.warn(`[WARN] Export file not found: ${exportCuratedPath}`);
        return { claims: 0 };
    }

    const exp = readJson(exportCuratedPath);
    const runs = exp.runs ?? [];

    let claims = 0;

    // Each run entry with claim_level is a claim
    for (const run of runs) {
        if (!run || typeof run !== "object") continue;

        const hasClaimLevel = run.substrate_claim_level || run.claim_level;

        if (hasClaimLevel) {
            claims += 1;
            // Run claims are satisfied by having run_id
            if (!run.run_id) {
                fail(REASONS.CLAIM_MISSING_ARTIFACT_REF, {
                    location: `${exportCuratedPath}:runs`,
                    run: JSON.stringify(run).slice(0, 200),
                });
            }
        }
    }

    return { claims };
}

// ============================================================================
// Execute
// ============================================================================

const matrixResult = scanCoverageMatrix();
const indexResult = scanSubstrateIndex();
const exportResult = scanExport();

ok({
    coverage_matrix: matrixResult,
    substrate_index: indexResult,
    export: exportResult,
    total_claims_verified: matrixResult.claims + indexResult.claims + exportResult.claims,
    es_claim_gating_enabled: REQUIRE_SIGNED_PROOF_FOR_ES_CLAIM,
});
