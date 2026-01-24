import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import process from "node:process";
import { execSync } from "node:child_process";
import YAML from "yaml";
import pkg from "fast-glob";
const fg = pkg;

/**
 * generate-projection-manifest.mjs
 * 
 * Generates export/projection-manifest.json with strict R-MAN audit rules:
 * - Deterministic file lists (sorted)
 * - Raw byte sha256 hashing
 * - Hierarchical combined_sha256
 * 
 * v0.1 (v0.7 Elevation)
 */

const ROOT = process.cwd();
const TS_REGISTRY = path.join(ROOT, "governance/registry/TRUTH_SOURCES.yaml");
const OUTPUT_FILE = path.join(ROOT, "export/projection-manifest.json");

function sha256File(absPath) {
    if (!fs.existsSync(absPath)) return null;
    const buf = fs.readFileSync(absPath);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

function sha256Text(text) {
    return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function getCommitSha(dir) {
    try {
        return execSync('git rev-parse HEAD', { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
        return null;
    }
}

function listFilesFromGlob(patternOrPatterns) {
    const patterns = Array.isArray(patternOrPatterns) ? patternOrPatterns : [patternOrPatterns];
    // Expand to files only; normalize separators to forward slashes; dot:false to avoid .git etc.
    const files = fg.sync(patterns, { cwd: ROOT, onlyFiles: true, dot: false });
    files.sort(); // Deterministic ordering
    return files;
}

function buildTruthSourceEntry(id, def) {
    const resolver = def.resolver;
    let files = [];

    if (resolver === "file") {
        files = [def.path];
    } else if (resolver === "file_list") {
        files = (def.paths ?? []).slice();
    } else if (resolver === "glob" || resolver === "directory") {
        // If directory, convert to glob pattern
        const pattern = resolver === "directory" ? `${def.path}/**/*` : def.path;
        files = listFilesFromGlob(pattern);
    } else if (resolver === "module_export") {
        // R-MAN-02: Hash the source file itself
        files = [def.path];
    } else {
        throw new Error(`Unsupported resolver: ${resolver} for truth source ${id}`);
    }

    // Deterministic file hashing
    const fileEntries = files.map(rel => {
        const abs = path.join(ROOT, rel);
        const hash = sha256File(abs);
        if (!hash) {
            throw new Error(`Missing required file for truth source ${id}: ${rel}`);
        }
        return { path: rel, sha256: hash };
    });

    // R-MAN-01: Sort by path before combining
    fileEntries.sort((a, b) => a.path.localeCompare(b.path));

    // R-MAN-03: Aggregate combined hash
    const combinedInput = fileEntries.map(f => `${f.path}\n${f.sha256}\n`).join("");
    const combined_sha256 = sha256Text(combinedInput);

    return {
        id,
        resolver,
        combined_sha256,
        files: fileEntries
    };
}

async function run() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Projection Manifest Generator (v0.1 - R-MAN Strict)');
    console.log('═══════════════════════════════════════════════════════════');

    if (!fs.existsSync(TS_REGISTRY)) {
        console.error('❌ Truth Sources Registry not found:', TS_REGISTRY);
        process.exit(1);
    }

    const tsYaml = YAML.parse(fs.readFileSync(TS_REGISTRY, "utf8"));
    const sourceDefs = tsYaml.sources || {};

    const entries = Object.entries(sourceDefs)
        .filter(([id]) => id !== "ts.projection_manifest") // Avoid circularity
        .map(([id, def]) => buildTruthSourceEntry(id, def))
        .sort((a, b) => a.id.localeCompare(b.id)); // Deterministic source ordering

    // Aggregate manifest hash
    const finalInput = entries.map(e => `${e.id}\n${e.combined_sha256}\n`).join("");
    const combined_sha256 = sha256Text(finalInput);

    // R-MAN-05: Resolve expectations and file counts
    const manifestEntries = entries.map(e => {
        const def = sourceDefs[e.id];
        const expectation = def.expectation || "may_be_empty";
        const fileCount = e.files.length;
        const isEmpty = fileCount === 0;

        if (expectation === "non_empty" && isEmpty) {
            throw new Error(`R-MAN-05 Violation: Truth source ${e.id} is marked non_empty but found 0 files.`);
        }

        return {
            ...e,
            expectation,
            file_count: fileCount,
            empty: isEmpty
        };
    });

    const manifest = {
        manifest_version: "0.1.1", // v0.7.1 update
        generated_at: new Date().toISOString(),
        sealed_release: process.env.SEALED_RELEASE ?? "v0.7.1-rc1",
        repos: {
            lab: {
                commit: process.env.LAB_COMMIT_SHA ?? getCommitSha(ROOT),
                base_url: "https://lab.mplp.io"
            },
            website: {
                commit: process.env.WEBSITE_COMMIT_SHA ?? getCommitSha(path.join(ROOT, "../MPLP_website")),
                base_url: "https://www.mplp.io"
            },
            docs: {
                commit: process.env.DOCS_COMMIT_SHA ?? getCommitSha(path.join(ROOT, "../docs")),
                base_url: "https://docs.mplp.io"
            }
        },
        truth_sources: manifestEntries,
        combined_sha256
    };

    const exportDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    console.log(`\n✅ Manifest generated: ${OUTPUT_FILE}`);
    console.log(`📊 Sources recorded: ${manifest.truth_sources.length}`);
    console.log(`🔗 Combined SHA256: ${combined_sha256}`);
}

run().catch(err => {
    console.error(`\n💥 Generator failed: ${err.message}`);
    process.exit(1);
});
