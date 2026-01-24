import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import YAML from "yaml";
import pkg from "fast-glob";
const fg = pkg;

/**
 * gate:projection-manifest
 * 
 * Verifies the integrity of export/projection-manifest.json by:
 * 1. Re-calculating all hashes from the current filesystem state (R-MAN Strict)
 * 2. Comparing the re-calculated manifest against the one on disk.
 * 
 * v0.1 (v0.7 Elevation)
 */

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "export/projection-manifest.json");
const TS_REGISTRY = path.join(ROOT, "governance/registry/TRUTH_SOURCES.yaml");

function sha256File(absPath) {
    if (!fs.existsSync(absPath)) return null;
    const buf = fs.readFileSync(absPath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

function sha256Text(text) {
    return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function buildTruthSourceEntry(id, def) {
    const resolver = def.resolver;
    let files = [];

    if (resolver === "file") {
        files = [def.path];
    } else if (resolver === "file_list") {
        files = (def.paths ?? []).slice();
    } else if (resolver === "glob" || resolver === "directory") {
        const pattern = resolver === "directory" ? `${def.path}/**/*` : def.path;
        files = fg.sync([pattern], { cwd: ROOT, onlyFiles: true, dot: false });
        files.sort();
    } else if (resolver === "module_export") {
        files = [def.path];
    } else {
        throw new Error(`Unsupported resolver: ${resolver}`);
    }

    const fileEntries = files.map(rel => ({
        path: rel,
        sha256: sha256File(path.join(ROOT, rel))
    })).sort((a, b) => a.path.localeCompare(b.path));

    const combinedInput = fileEntries.map(f => `${f.path}\n${f.sha256}\n`).join("");
    return {
        id,
        combined_sha256: sha256Text(combinedInput),
        files: fileEntries
    };
}

async function run() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Projection Manifest Gate (v0.1 - R-MAN Strict)');
    console.log('═══════════════════════════════════════════════════════════');

    if (!fs.existsSync(MANIFEST_PATH)) {
        console.error('❌ Manifest not found. Run generate-projection-manifest.mjs first.');
        process.exit(1);
    }

    const diskManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    const tsYaml = YAML.parse(fs.readFileSync(TS_REGISTRY, "utf8"));
    const sourceDefs = tsYaml.sources || {};

    let violations = 0;

    // 1. Re-calculate entries based on Registry
    const currentEntries = Object.entries(sourceDefs)
        .filter(([id]) => id !== "ts.projection_manifest") // Match generator skip
        .map(([id, def]) => buildTruthSourceEntry(id, def))
        .sort((a, b) => a.id.localeCompare(b.id));

    const finalInput = currentEntries.map(e => `${e.id}\n${e.combined_sha256}\n`).join("");
    const recalculated_sha256 = sha256Text(finalInput);

    // R-MAN-05: Verification expectations
    const verificationResults = currentEntries.map(e => {
        const def = sourceDefs[e.id];
        const expectation = def.expectation || "may_be_empty";
        const fileCount = e.files.length;
        const isEmpty = fileCount === 0;

        return { ...e, expectation, fileCount, isEmpty };
    });

    // 2. Compare against Disk
    console.log(`🔍 Verifying Combined SHA256 hierarchy...`);
    if (recalculated_sha256 !== diskManifest.combined_sha256) {
        console.error(`❌ Manifest Hash Mismatch!`);
        console.error(`   Disk: ${diskManifest.combined_sha256}`);
        console.error(`   Calc: ${recalculated_sha256}`);
        violations++;
    } else {
        console.log(`   ✅ Combined SHA256 is correct`);
    }

    // 3. Detail Check (Source by Source)
    for (const entry of verificationResults) {
        const diskEntry = diskManifest.truth_sources.find(e => e.id === entry.id);
        if (!diskEntry) {
            console.error(`❌ Source missing in Disk Manifest: ${entry.id}`);
            violations++;
            continue;
        }

        // Check Hash
        if (entry.combined_sha256 !== diskEntry.combined_sha256) {
            console.error(`❌ Source Hash Mismatch: ${entry.id}`);
            console.error(`   Disk: ${diskEntry.combined_sha256}`);
            console.error(`   Calc: ${entry.combined_sha256}`);
            violations++;
        }

        // R-MAN-05: Expectation check
        if (entry.expectation === "non_empty" && entry.isEmpty) {
            console.error(`❌ R-MAN-05 Violation: ${entry.id} is marked non_empty but found 0 files.`);
            violations++;
        }
    }

    // 4. Repro Anchor Validation (Strict Mode Only - skipped for now)

    if (violations > 0) {
        console.log(`\n❌ Gate Status: FAIL (${violations} violations)`);
        process.exit(1);
    } else {
        console.log(`\n✅ Gate Status: PASS`);
    }
}

run().catch(err => {
    console.error(`\n💥 Gate failed: ${err.message}`);
    process.exit(1);
});
