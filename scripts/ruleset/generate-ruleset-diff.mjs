#!/usr/bin/env node
/**
 * Ruleset Diff Generator (MUST-3

)
 * 
 * v0.8 (frozen): Generates diff.json and index.json (immutable, hash-locked)
 * v0.9+ (enhanced): Generates diff.enhanced.json and index.enhanced.json (parallel files)
 * 
 * Usage: 
 *   v0.8 mode: node scripts/ruleset/generate-ruleset-diff.mjs --from ruleset-1.0 --to ruleset-1.1
 *   v0.9 enhanced: node scripts/ruleset/generate-ruleset-diff.mjs --enhanced --explain-profile eh-1 --from ruleset-1.0 --to ruleset-1.1
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// ============================================================================
// FREEZE GUARD (v0.8 Protection)
// ============================================================================
const FROZEN_V08_FILES = ['index.json', 'diff.json'];

function validateOutputPath(outputPath, mode) {
    const isFrozen = FROZEN_V08_FILES.some(frozen =>
        outputPath.endsWith(frozen) && !outputPath.includes('.enhanced') && mode !== 'repro-pack'
    );

    if (isFrozen) {
        throw new Error(
            `🔒 FROZEN: v0.8 artifact "${outputPath}" is immutable.\n` +
            `   To generate enhanced artifacts, use: --enhanced flag\n` +
            `   v0.8 hashes are locked in CAPABILITY-SEAL.v0.8.0.md`
        );
    }

    if (mode === 'repro-pack') {
        const ok = outputPath.endsWith('repro-pack.json') || outputPath.endsWith('index.repro.json');
        if (!ok) {
            throw new Error(`🔒 FROZEN: repro-pack mode may only write repro-pack.json or index.repro.json. Got: ${outputPath}`);
        }
    }
}

// ============================================================================
// BANNED WORD LINTER (Semantic Boundary Enforcement)
// ============================================================================
const BANNED_WORDS = new RegExp(
    '\\b(certified?|certification|endorsed?|endorsement|endorsing|' +
    'ranked?|ranking|scored?|scoring|compliant?|compliance|' +
    'recommended?|recommendation|blacklist(ed)?|whitelist(ed)?|' +
    'better|worse|best|worst|superior|inferior|' +
    'stricter|weaker|stronger|tighter|looser|' +
    'safer|secure[dr]?|mature[dr]?|maturity|' +
    'approved?|approval|accredited?|accreditation)\\b',
    'i'
);

function lintExplanation(explanation, context = {}) {
    const match = explanation.match(BANNED_WORDS);
    if (match) {
        throw new Error(
            `❌ BANNED WORD detected: "${match[0]}" in explanation\n` +
            `   Context: ${JSON.stringify(context)}\n` +
            `   Explanation: ${explanation}\n` +
            `   Reason: Evaluative/certification language violates non-endorsement boundary`
        );
    }
}

// ============================================================================
// TEMPLATE eh-1 (Deterministic Explanation)
// ============================================================================
function generateExplanationEH1(changeData) {
    const {
        changeType = 'OTHER_STRUCTURAL_CHANGE',
        field = 'unknown_field',
        beforeValue = 'N/A',
        afterValue = 'N/A',
        domain = 'unknown_domain',
        clauseId = 'unknown_clause',
        impactSurface = 'unknown_surface'
    } = changeData;

    const explanation =
        `[What changed]: ${field} value changed from "${beforeValue}" to "${afterValue}". ` +
        `[Where applies]: ${domain}/${clauseId}. ` +
        `[Evidence impact]: Affects ${impactSurface} validation. ` +
        `[Verify]: Compare YAML files in data/rulesets/.`;

    // Lint before returning
    lintExplanation(explanation, { domain, clauseId, changeType });

    return explanation;
}

// ============================================================================
// HELPER: SHA256
// ============================================================================
import crypto from 'crypto';

function sha256File(filePath) {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buf).digest('hex');
}

function assertNoBannedWords(text, where) {
    if (!text) return;
    if (BANNED_WORDS.test(text)) {
        throw new Error(`❌ Forbidden evaluative language detected in ${where}: ${text}`);
    }
}

// ============================================================================
// CLI ARGUMENT PARSING
// ============================================================================
const args = process.argv.slice(2);
const fromIndex = args.indexOf('--from');
const toIndex = args.indexOf('--to');
const enhancedMode = args.includes('--enhanced');
const reproPack = args.includes('--repro-pack');
const explainProfileIndex = args.indexOf('--explain-profile');
const reproProfileIndex = args.indexOf('--repro-profile');
const explainProfile = explainProfileIndex !== -1 ? args[explainProfileIndex + 1] : 'eh-1';
const reproProfile = reproProfileIndex !== -1 ? args[reproProfileIndex + 1] : 'rp-1';

if (fromIndex === -1 || toIndex === -1) {
    console.error('Usage: node generate-ruleset-diff.mjs --from ruleset-1.0 --to ruleset-1.1 [--enhanced] [--explain-profile eh-1] [--repro-pack] [--repro-profile rp-1]');
    process.exit(1);
}

const fromVersion = args[fromIndex + 1];
const toVersion = args[toIndex + 1];

const fromPath = path.join(PROJECT_ROOT, 'data/rulesets', fromVersion);
const toPath = path.join(PROJECT_ROOT, 'data/rulesets', toVersion);

const modeLabel = reproPack ? '(Repro Pack Mode)' : enhancedMode ? '(Enhanced Mode)' : '(v0.8 Mode)';
console.log(`\n═══════════════════════════════════════════════════════════`);
console.log(`  MUST-3 Ruleset Diff Generator ${modeLabel}`);
console.log(`═══════════════════════════════════════════════════════════\n`);
console.log(`From: ${fromVersion}`);
console.log(`To:   ${toVersion}`);
if (enhancedMode) {
    console.log(`Template: ${explainProfile}\n`);
} else if (reproPack) {
    console.log(`Repro Profile: ${reproProfile}\n`);
} else {
    console.log();
}

// Verify paths exist
if (!fs.existsSync(fromPath)) {
    console.error(`❌ Error: ${fromPath} does not exist`);
    process.exit(1);
}

if (!fs.existsSync(toPath)) {
    console.error(`❌ Error: ${toPath} does not exist`);
    process.exit(1);
}

// Compute root hashes (reproducible)
function computeRootHash(rulesetPath) {
    try {
        const cmd = `find ${rulesetPath} -type f \\( -name "*.yaml" -o -name "*.json" \\) | sort | shasum -a 256`;
        const output = execSync(cmd, { cwd: PROJECT_ROOT, encoding: 'utf-8' });
        return output.trim().split(' ')[0];
    } catch (error) {
        console.error(`❌ Error computing hash for ${rulesetPath}: ${error.message}`);
        return 'ERROR';
    }
}

const fromHash = computeRootHash(fromPath);
const toHash = computeRootHash(toPath);

console.log(`From hash: ${fromHash}`);
console.log(`To hash:   ${toHash}\n`);

// ============================================================================
// REPRO PACK MODE (Early exit)
// ============================================================================
if (reproPack) {
    generateReproPackRp1({
        fromVersion,
        toVersion,
        fromPath,
        toPath,
        fromHash,
        toHash,
        reproProfile
    });
    process.exit(0);
}

// ============================================================================
// DIFF REPORT GENERATION
// ============================================================================
const diffId = `${fromVersion}_to_${toVersion}`;
const outputDir = path.join(PROJECT_ROOT, 'export/ruleset-diff', diffId);
fs.mkdirSync(outputDir, { recursive: true });

if (enhancedMode) {
    // v0.9+ Enhanced Mode
    const enhancedReport = {
        diff_version: "1.1-enhanced",
        explanation_profile: {
            mode: "deterministic-template",
            template_version: explainProfile
        },
        generated_at: new Date().toISOString(),
        from: {
            ruleset_version: fromVersion,
            path: `data/rulesets/${fromVersion}`,
            root_hash_sha256: fromHash
        },
        to: {
            ruleset_version: toVersion,
            path: `data/rulesets/${toVersion}`,
            root_hash_sha256: toHash
        },
        domain_delta: {
            "D1": { added_count: 0, removed_count: 0, modified_count: 0, impacted_clause_ids: [], impacted_requirement_ids: [] },
            "D2": { added_count: 0, removed_count: 0, modified_count: 0, impacted_clause_ids: [], impacted_requirement_ids: [] },
            "D3": { added_count: 0, removed_count: 0, modified_count: 0, impacted_clause_ids: [], impacted_requirement_ids: [] },
            "D4": { added_count: 0, removed_count: 0, modified_count: 0, impacted_clause_ids: [], impacted_requirement_ids: [] }
        },
        scope: {
            domains: ["D1", "D2", "D3", "D4"],
            notes: "Enhanced diff with change_type classification and impact_surface mapping."
        },
        summary: {
            breaking_changes: 0,
            non_breaking_changes: 0,
            added: 0,
            removed: 0,
            modified: 0,
            note: `Generated with template ${explainProfile} for deterministic explanations`
        },
        clause_delta: {
            added: [],
            removed: [],
            modified: [],
            note: "Clause-level diff requires full ruleset parser (enhanced schema ready)"
        },
        requirement_delta: {
            added: [],
            removed: [],
            modified: [],
            note: "Requirement-level diff requires structured extraction (enhanced schema ready)"
        },
        non_endorsement_boundary: [
            "This enhanced diff report explains ruleset evolution with deterministic templates.",
            "It MUST NOT be interpreted as certification, endorsement, or ranking of any framework/vendor.",
            "change_type and impact_surface fields describe structural changes, not framework quality."
        ],
        reproducibility: {
            command: `node scripts/ruleset/generate-ruleset-diff.mjs --enhanced --explain-profile ${explainProfile} --from ${fromVersion} --to ${toVersion}`,
            hash_computation: `find data/rulesets/<version> -type f \\( -name "*.yaml" -o -name "*.json" \\) | sort | shasum -a 256`,
            template_version: explainProfile
        }
    };

    const outputFile = path.join(outputDir, 'diff.enhanced.json');
    validateOutputPath(outputFile); // Freeze guard check
    fs.writeFileSync(outputFile, JSON.stringify(enhancedReport, null, 2));

    console.log(`✅ Enhanced diff report generated:`);
    console.log(`   ${path.relative(PROJECT_ROOT, outputFile)}\n`);

    // Update enhanced index
    updateEnhancedIndex(enhancedReport, diffId);

} else {
    // v0.8 Mode (Original - kept for backward compatibility, but frozen)
    console.error(`⚠️  WARNING: v0.8 mode writes to frozen artifacts.`);
    console.error(`   This should only be used for initial setup.`);
    console.error(`   For new diffs, use: --enhanced flag\n`);

    const diffReport = {
        diff_version: "1.0.0",
        generated_at: new Date().toISOString(),
        from: {
            ruleset_version: fromVersion,
            path: `data/rulesets/${fromVersion}`,
            root_hash_sha256: fromHash
        },
        to: {
            ruleset_version: toVersion,
            path: `data/rulesets/${toVersion}`,
            root_hash_sha256: toHash
        },
        scope: {
            domains: ["D1", "D2", "D3", "D4"],
            notes: "Diff is about requirement text and clause mapping, not about framework quality."
        },
        summary: {
            breaking_changes: 0,
            non_breaking_changes: 0,
            added: 0,
            removed: 0,
            modified: 0,
            note: "Detailed clause-by-clause diff requires full ruleset parser (deferred to future enhancement)"
        },
        clause_delta: {
            added: [],
            removed: [],
            modified: [],
            note: "Clause-level diff not yet implemented; requires YAML parsing and clause ID tracking"
        },
        requirement_delta: {
            added: [],
            removed: [],
            modified: [],
            note: "Requirement-level diff not yet implemented; requires structured requirement extraction"
        },
        non_endorsement_boundary: [
            "This diff report explains ruleset evolution only.",
            "It MUST NOT be interpreted as certification, endorsement, or ranking of any framework/vendor.",
            "Changes to rulesets reflect governance decisions about evidence requirements, not substrate quality."
        ],
        reproducibility: {
            command: `node scripts/ruleset/generate-ruleset-diff.mjs --from ${fromVersion} --to ${toVersion}`,
            hash_computation: `find data/rulesets/<version> -type f \\( -name "*.yaml" -o -name "*.json" \\) | sort | shasum -a 256`
        }
    };

    const outputFile = path.join(outputDir, 'diff.json');
    validateOutputPath(outputFile); // This will throw in freeze mode
    fs.writeFileSync(outputFile, JSON.stringify(diffReport, null, 2));

    console.log(`✅ Diff report generated:`);
    console.log(`   ${path.relative(PROJECT_ROOT, outputFile)}\n`);

    // Update v0.8 index
    updateIndex(diffReport, diffId);
}

// ============================================================================
// INDEX UPDATE FUNCTIONS
// ============================================================================
function updateEnhancedIndex(report, diffId) {
    const indexPath = path.join(PROJECT_ROOT, 'export/ruleset-diff/index.enhanced.json');

    let index = {
        index_version: "1.1-enhanced",
        enhanced_mode: true,
        template_version: explainProfile,
        generated_at: new Date().toISOString(),
        diffs: []
    };

    if (fs.existsSync(indexPath)) {
        const existing = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        index.diffs = existing.diffs || [];
    }

    // Remove existing entry for this diff (if any)
    index.diffs = index.diffs.filter(d => d.diff_id !== diffId);

    // Add new entry
    index.diffs.push({
        diff_id: diffId,
        from: report.from.ruleset_version,
        to: report.to.ruleset_version,
        from_hash: report.from.root_hash_sha256,
        to_hash: report.to.root_hash_sha256,
        path: `export/ruleset-diff/${diffId}/diff.enhanced.json`,
        generated_at: report.generated_at,
        template_version: explainProfile
    });

    // Sort by from/to version
    index.diffs.sort((a, b) => {
        if (a.from < b.from) return -1;
        if (a.from > b.from) return 1;
        if (a.to < b.to) return -1;
        if (a.to > b.to) return 1;
        return 0;
    });

    index.generated_at = new Date().toISOString();

    validateOutputPath(indexPath); // Freeze guard
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`✅ Enhanced index updated:`);
    console.log(`   export/ruleset-diff/index.enhanced.json\n`);
}

function updateIndex(report, diffId) {
    const indexPath = path.join(PROJECT_ROOT, 'export/ruleset-diff/index.json');

    let index = {
        index_version: "1.0.0",
        generated_at: new Date().toISOString(),
        diffs: []
    };

    if (fs.existsSync(indexPath)) {
        const existing = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        index.diffs = existing.diffs || [];
    }

    // Remove existing entry for this diff (if any)
    index.diffs = index.diffs.filter(d => d.diff_id !== diffId);

    // Add new entry
    index.diffs.push({
        diff_id: diffId,
        from: report.from.ruleset_version,
        to: report.to.ruleset_version,
        from_hash: report.from.root_hash_sha256,
        to_hash: report.to.root_hash_sha256,
        path: `export/ruleset-diff/${diffId}/diff.json`,
        generated_at: report.generated_at
    });

    // Sort by from/to version
    index.diffs.sort((a, b) => {
        if (a.from < b.from) return -1;
        if (a.from > b.from) return 1;
        if (a.to < b.to) return -1;
        if (a.to > b.to) return 1;
        return 0;
    });

    index.generated_at = new Date().toISOString();

    validateOutputPath(indexPath); // This will throw in v0.9
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`✅ Index updated:`);
    console.log(`   export/ruleset-diff/index.json\n`);
}

console.log(`═══════════════════════════════════════════════════════════`);
console.log(`  Diff Generation Complete`);
console.log(`═══════════════════════════════════════════════════════════\n`);

// ============================================================================
// REPRO PACK GENERATOR (rp-1)
// ============================================================================
function generateReproPackRp1({ fromVersion, toVersion, fromPath, toPath, fromHash, toHash, reproProfile }) {
    if (reproProfile !== 'rp-1') {
        throw new Error(`Unsupported repro profile: ${reproProfile}. Only rp-1 is supported.`);
    }

    const diffId = `${fromVersion}_to_${toVersion}`;
    const outDir = path.join(PROJECT_ROOT, 'export/ruleset-diff', diffId);

    // Manifest paths
    const fromManifest = path.join(PROJECT_ROOT, 'data/rulesets', fromVersion, 'manifest.yaml');
    const toManifest = path.join(PROJECT_ROOT, 'data/rulesets', toVersion, 'manifest.yaml');

    const fromManifestSha = sha256File(fromManifest);
    const toManifestSha = sha256File(toManifest);

    // v0.8 frozen artifacts
    const v08IndexPath = path.join(PROJECT_ROOT, 'export/ruleset-diff/index.json');
    const v08DiffPath = path.join(outDir, 'diff.json');

    const v08IndexSha = sha256File(v08IndexPath);
    const v08DiffSha = sha256File(v08DiffPath);

    // v0.9 enhanced artifacts (optional)
    const v09IndexEnhancedPath = path.join(PROJECT_ROOT, 'export/ruleset-diff/index.enhanced.json');
    const v09DiffEnhancedPath = path.join(outDir, 'diff.enhanced.json');

    const hasEnhanced = fs.existsSync(v09IndexEnhancedPath) && fs.existsSync(v09DiffEnhancedPath);
    const v09IndexEnhancedSha = hasEnhanced ? sha256File(v09IndexEnhancedPath) : null;
    const v09DiffEnhancedSha = hasEnhanced ? sha256File(v09DiffEnhancedPath) : null;

    const boundaryText = 'Repro packs provide deterministic reproduction steps and hashes only. They do not certify or rank frameworks, vendors, or substrates.';
    assertNoBannedWords(boundaryText, 'repro-pack boundary');

    const reproPack = {
        repro_pack_version: 'rp-1',
        diff_id: diffId,
        from: fromVersion,
        to: toVersion,
        inputs: {
            from_manifest_sha256: fromManifestSha,
            to_manifest_sha256: toManifestSha
        },
        artifacts: {
            v0_8_frozen: {
                index_json_sha256: v08IndexSha,
                diff_json_sha256: v08DiffSha
            },
            v0_9_enhanced: hasEnhanced ? {
                index_enhanced_json_sha256: v09IndexEnhancedSha,
                diff_enhanced_json_sha256: v09DiffEnhancedSha
            } : null
        },
        commands: {
            verify_inputs: [
                `shasum -a 256 data/rulesets/${fromVersion}/manifest.yaml`,
                `shasum -a 256 data/rulesets/${toVersion}/manifest.yaml`
            ],
            generate_enhanced_diff: [
                `node scripts/ruleset/generate-ruleset-diff.mjs --enhanced --explain-profile eh-1 --from ${fromVersion} --to ${toVersion}`
            ],
            generate_repro_pack: [
                `node scripts/ruleset/generate-ruleset-diff.mjs --repro-pack --repro-profile rp-1 --from ${fromVersion} --to ${toVersion}`
            ],
            verify_exports: [
                'shasum -a 256 export/ruleset-diff/index.json',
                `shasum -a 256 export/ruleset-diff/${diffId}/diff.json`,
                hasEnhanced ? 'shasum -a 256 export/ruleset-diff/index.enhanced.json' : null,
                hasEnhanced ? `shasum -a 256 export/ruleset-diff/${diffId}/diff.enhanced.json` : null,
                `shasum -a 256 export/ruleset-diff/${diffId}/repro-pack.json`
            ].filter(Boolean)
        },
        boundary: {
            non_endorsement: boundaryText
        }
    };

    const reproPackPath = path.join(outDir, 'repro-pack.json');
    validateOutputPath(reproPackPath, 'repro-pack');
    fs.writeFileSync(reproPackPath, JSON.stringify(reproPack, null, 2));

    console.log(`✅ Repro pack generated:`);
    console.log(`   ${path.relative(PROJECT_ROOT, reproPackPath)}\n`);

    // Update index.repro.json
    const indexReproPath = path.join(PROJECT_ROOT, 'export/ruleset-diff/index.repro.json');
    validateOutputPath(indexReproPath, 'repro-pack');

    const reproPackSha = sha256File(reproPackPath);

    let indexRepro;
    if (fs.existsSync(indexReproPath)) {
        indexRepro = JSON.parse(fs.readFileSync(indexReproPath, 'utf-8'));
    } else {
        indexRepro = {
            index_repro_version: 'rp-1',
            template_version: 'rp-1',
            diffs: []
        };
    }

    // Upsert entry
    const relPath = `export/ruleset-diff/${diffId}/repro-pack.json`;
    const existingIdx = indexRepro.diffs.findIndex(x => x.diff_id === diffId);
    const entry = {
        diff_id: diffId,
        repro_pack_sha256: reproPackSha,
        path: relPath
    };

    if (existingIdx >= 0) {
        indexRepro.diffs[existingIdx] = entry;
    } else {
        indexRepro.diffs.push(entry);
    }

    // Deterministic ordering
    indexRepro.diffs.sort((a, b) => a.diff_id.localeCompare(b.diff_id));

    fs.writeFileSync(indexReproPath, JSON.stringify(indexRepro, null, 2));
    console.log(`✅ Index repro updated:`);
    console.log(`   export/ruleset-diff/index.repro.json\n`);

    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`  Repro Pack Generation Complete`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
}
