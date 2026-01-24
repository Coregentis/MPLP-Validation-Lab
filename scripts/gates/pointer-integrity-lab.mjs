import fs from "node:fs";

function mustContain(file, needle) {
    const txt = fs.readFileSync(file, "utf8");
    if (!txt.includes(needle)) {
        console.error(`GATE FAIL: missing pointer text in ${file}`);
        console.error(`Missing substring:\n${needle}`);
        process.exit(1);
    }
}

// Check for v0.9 series summary (core content, not exact markdown syntax)
mustContain(
    "README.md",
    "v0.9.0–v0.9.1 upgrades ruleset diff from \"generatable\" to \"explainable + reproducible + referenceable\" while preserving the v0.8 frozen evidence chain."
);

mustContain(
    "governance/seals/README.md",
    "UI-FACETS-REPROPACK-SEAL.v0.9.1"
);

console.log("✅ GATE PASS: Lab pointer integrity checks passed.");
