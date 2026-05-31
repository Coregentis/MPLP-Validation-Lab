#!/usr/bin/env node
/**
 * Validates the vendored MPLP Protocol Public Manifest without network access.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../..");
const MANIFEST_PATH = path.join(ROOT, "lib", "data", "mplp-public-manifest.json");
const CHECKSUM_PATH = path.join(ROOT, "lib", "data", "mplp-public-manifest.sha256");

const REQUIRED_FIELDS = [
    "manifest_id",
    "manifest_version",
    "generated_at",
    "protocol_name",
    "protocol_full_name",
    "protocol_version",
    "protocol_release_tag",
    "protocol_commit_sha",
    "copyright_holder",
    "trademark_notice",
    "license",
    "canonical_repository",
    "future_repository_target",
    "docs_url",
    "website_url",
    "schema_manifest",
    "sdk_packages",
    "pypi_packages",
    "validation_lab_pointer",
    "validation_lab_boundary",
    "website_boundary",
    "release_status",
    "forbidden_claims",
    "non_certification_notice",
    "package_replacement_status",
    "repo_migration_status",
];

const DIRECT_PROMOTIONAL_CLAIMS = [
    "MPLP-certified",
    "certified by MPLP",
    "officially endorsed by MPLP",
    "regulator approved",
];

function fail(message) {
    console.error(`[protocol-manifest] FAIL: ${message}`);
    process.exit(1);
}

function assert(condition, message) {
    if (!condition) {
        fail(message);
    }
}

function relative(file) {
    return path.relative(ROOT, file);
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (error) {
        fail(`Cannot parse JSON at ${relative(file)}: ${error.message}`);
    }
}

function hasOwn(object, field) {
    return Object.prototype.hasOwnProperty.call(object, field);
}

assert(fs.existsSync(MANIFEST_PATH), "Vendored manifest is missing.");
assert(fs.existsSync(CHECKSUM_PATH), "Vendored manifest checksum is missing.");

const manifestBytes = fs.readFileSync(MANIFEST_PATH);
const manifest = readJson(MANIFEST_PATH);
const checksumLine = fs.readFileSync(CHECKSUM_PATH, "utf8").trim();
const expectedHash = checksumLine.split(/\s+/)[0];
const actualHash = crypto.createHash("sha256").update(manifestBytes).digest("hex");

assert(/^[0-9a-f]{64}$/.test(expectedHash), "Checksum file must start with a sha256 hash.");
assert(actualHash === expectedHash, "Vendored manifest checksum does not match.");

for (const field of REQUIRED_FIELDS) {
    assert(hasOwn(manifest, field), `Missing required field: ${field}`);
}

assert(manifest.protocol_name === "MPLP", "protocol_name must be MPLP.");
assert(manifest.protocol_full_name === "Multi-Agent Lifecycle Protocol", "protocol_full_name mismatch.");
assert(/^[0-9]+\.[0-9]+\.[0-9]+$/.test(manifest.protocol_version), "protocol_version must be semver-like.");
assert(/^[0-9a-f]{40}$/.test(manifest.protocol_commit_sha), "protocol_commit_sha must be a 40-character sha.");
assert(manifest.copyright_holder === "Jearon Wong", "copyright_holder must be Jearon Wong.");
assert(manifest.license === "Apache-2.0", "license must remain Apache-2.0.");
assert(
    manifest.canonical_repository === "https://github.com/Coregentis/MPLP-Protocol",
    "canonical_repository must remain Coregentis/MPLP-Protocol."
);

assert(
    manifest.future_repository_target === "https://github.com/Multi-Agent-Lifecycle-Protocol/MPLP-Protocol",
    "future_repository_target must remain the reserved future Protocol target."
);
assert(manifest.repo_migration_status?.status === "reserved_future_org_not_migrated", "repo migration status must remain deferred.");
assert(manifest.repo_migration_status?.current_org === "Coregentis", "current_org must remain Coregentis.");
assert(manifest.repo_migration_status?.future_org === "Multi-Agent-Lifecycle-Protocol", "future_org mismatch.");
assert(manifest.repo_migration_status?.migration_now === false, "repo migration must remain disabled.");
assert(manifest.repo_migration_status?.remotes_changed === false, "remotes_changed must be false.");
assert(manifest.repo_migration_status?.package_repository_urls_changed === false, "package_repository_urls_changed must be false.");
assert(manifest.package_replacement_status?.status === "planned_not_published", "package replacement must remain planned_not_published.");
assert(manifest.package_replacement_status?.package_actions_executed === false, "package actions must remain false.");

const boundary = manifest.validation_lab_boundary || {};
assert(boundary.non_certifying === true, "validation_lab_boundary.non_certifying must be true.");
assert(boundary.no_certification === true, "validation_lab_boundary.no_certification must be true.");
assert(boundary.no_endorsement === true, "validation_lab_boundary.no_endorsement must be true.");
assert(boundary.no_regulator_approval === true, "validation_lab_boundary.no_regulator_approval must be true.");
assert(boundary.no_protocol_truth_override === true, "validation_lab_boundary.no_protocol_truth_override must be true.");
assert(boundary.no_runtime_authority === true, "validation_lab_boundary.no_runtime_authority must be true.");
assert(boundary.no_sdk_authority === true, "validation_lab_boundary.no_sdk_authority must be true.");

assert(Array.isArray(manifest.forbidden_claims), "forbidden_claims must be an array.");
const forbiddenClaims = manifest.forbidden_claims.join("\n");
const forbiddenClaimsLower = forbiddenClaims.toLowerCase();
assert(forbiddenClaimsLower.includes("certified"), "forbidden_claims must include certification boundary.");
assert(forbiddenClaimsLower.includes("endorsed"), "forbidden_claims must include endorsement boundary.");
assert(forbiddenClaimsLower.includes("regulator approved"), "forbidden_claims must include regulator approval boundary.");

for (const claim of DIRECT_PROMOTIONAL_CLAIMS) {
    assert(
        !manifest.forbidden_claims.includes(claim),
        `forbidden_claims must use boundary wording, not direct promotional phrase: ${claim}`
    );
}

const notice = String(manifest.non_certification_notice || "").toLowerCase();
assert(notice.includes("evidence-based"), "non_certification_notice must preserve evidence-based wording.");
assert(notice.includes("non-certifying"), "non_certification_notice must preserve non-certifying wording.");
assert(notice.includes("endorsement"), "non_certification_notice must preserve no-endorsement boundary.");
assert(notice.includes("regulator approval"), "non_certification_notice must preserve no-regulator-approval boundary.");
assert(notice.includes("runtime authority"), "non_certification_notice must preserve no-runtime-authority boundary.");
assert(notice.includes("sdk authority"), "non_certification_notice must preserve no-SDK-authority boundary.");
assert(notice.includes("protocol authority"), "non_certification_notice must preserve no-protocol-authority boundary.");

console.log(`[protocol-manifest] checksum: ${actualHash}`);
console.log("[protocol-manifest] PASS: vendored manifest validated without network access.");

