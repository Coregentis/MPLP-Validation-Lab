import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import YAML from "yaml";

/**
 * gate:projection-sanity
 * 
 * Verifies UI projection consistency against SSOT (Essential Three):
 * 1. Curated Run ID set parity
 * 2. Substrate set parity
 * 3. Ruleset registry/manifest parity
 * 
 * v0.1 (v0.7 Elevation)
 */

const ROOT = process.cwd();
const EXPORT_CURATED = path.join(ROOT, "export/curated-runs.json");
const UI_CURATED = path.join(ROOT, "public/_data/curated-runs.json");
const RULESET_REGISTRY = path.join(ROOT, "lib/rulesets/registry.ts");

function getRulesetFolders() {
    const rulesetPath = path.join(ROOT, "data/rulesets");
    return fs.readdirSync(rulesetPath)
        .filter(f => fs.statSync(path.join(rulesetPath, f)).isDirectory())
        .filter(f => fs.existsSync(path.join(rulesetPath, f, "manifest.yaml")));
}

async function run() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Projection Sanity Gate (v0.1 - Essential Three)');
    console.log('═══════════════════════════════════════════════════════════');

    if (!fs.existsSync(EXPORT_CURATED) || !fs.existsSync(UI_CURATED)) {
        console.error('❌ Data files missing (run generate:curated first).');
        process.exit(1);
    }

    const exportData = JSON.parse(fs.readFileSync(EXPORT_CURATED, "utf8"));
    const uiData = JSON.parse(fs.readFileSync(UI_CURATED, "utf8"));

    let violations = 0;

    // --- RULE 1: Curated Run ID Set Parity ---
    console.log(`🔍 Verification 1: Curated Run ID Set Parity...`);
    const exportIds = new Set(exportData.runs?.map(r => r.run_id) ?? []);
    const uiIds = new Set(uiData.runs?.map(r => r.run_id) ?? []);

    const missingInUI = [...exportIds].filter(id => !uiIds.has(id));
    const extraInUI = [...uiIds].filter(id => !exportIds.has(id));

    if (missingInUI.length > 0 || extraInUI.length > 0) {
        console.error(`❌ Run ID drift detected!`);
        if (missingInUI.length > 0) console.error(`   Missing in UI: [${missingInUI.slice(0, 5).join(", ")}${missingInUI.length > 5 ? "..." : ""}]`);
        if (extraInUI.length > 0) console.error(`   Extra in UI:   [${extraInUI.slice(0, 5).join(", ")}${extraInUI.length > 5 ? "..." : ""}]`);
        violations++;
    } else {
        console.log(`   ✅ Set parity confirmed (${uiIds.size} runs)`);
    }

    // --- RULE 2: Substrate Coverage Parity ---
    console.log(`🔍 Verification 2: Substrate Coverage Parity...`);
    const exportSubstrates = new Set(exportData.runs?.map(r => r.substrate_id) ?? []);
    const uiSubstrates = new Set(uiData.runs?.map(r => r.substrate_id) ?? []);

    const missingSubstrates = [...exportSubstrates].filter(s => !uiSubstrates.has(s));
    const extraSubstrates = [...uiSubstrates].filter(s => !exportSubstrates.has(s));

    if (missingSubstrates.length > 0 || extraSubstrates.length > 0) {
        console.error(`❌ Substrate set drift!`);
        if (missingSubstrates.length > 0) console.error(`   Missing in UI: [${missingSubstrates.join(", ")}]`);
        if (extraSubstrates.length > 0) console.error(`   Extra in UI:   [${extraSubstrates.join(", ")}]`);
        violations++;
    } else {
        console.log(`   ✅ Substrate parity confirmed ([${[...uiSubstrates].join(", ")}])`);
    }

    // --- RULE 3: Ruleset Registry Parity ---
    console.log(`🔍 Verification 3: Ruleset Registry/Manifest Parity...`);
    const diskFolders = getRulesetFolders();
    const registryContent = fs.readFileSync(RULESET_REGISTRY, "utf8");

    // Simple heuristic: check if IDs from data/rulesets exist in registry.ts
    const missingInRegistry = diskFolders.filter(f => !registryContent.includes(f));

    if (missingInRegistry.length > 0) {
        console.error(`❌ Ruleset parity failure: ${missingInRegistry.length} folder(s) not in registry.ts`);
        console.error(`   Missing: [${missingInRegistry.join(", ")}]`);
        violations++;
    } else {
        console.log(`   ✅ Ruleset parity confirmed (${diskFolders.length} versions)`);
    }

    if (violations > 0) {
        console.log(`\n❌ Gate Status: FAIL (${violations} violations)`);
        process.exit(1);
    } else {
        console.log(`\n✅ Gate Status: PASS`);
    }
}

run().catch(err => {
    console.error(`\n💥 Sanity Check failed: ${err.message}`);
    process.exit(1);
});
