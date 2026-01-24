import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

function sha256File(p) {
    const buf = fs.readFileSync(p);
    return crypto.createHash("sha256").update(buf).digest("hex");
}

function fail(msg) {
    console.error(msg);
    process.exit(1);
}

const ROOT = process.cwd();

const LOCKED = [
    {
        rel: "export/ruleset-diff/index.json",
        expected:
            "e40c28e3d4a38986e5d4c083b00a0ee7eecf26e05a971d7c571291792b116d94",
    },
    {
        rel: "export/ruleset-diff/ruleset-1.0_to_ruleset-1.1/diff.json",
        expected:
            "2c57a6e80cd4481ef9d3b8fe7f06d1a9b07bf727b73430f2536f3d33b4e25c18",
    },
    {
        rel: "export/ruleset-diff/ruleset-1.1_to_ruleset-1.2/diff.json",
        expected:
            "273f91b78efe6bc898f4cecf5149323963f15d04ec174fea9aee708d6c817694",
    },
    {
        rel: "export/ruleset-diff/ruleset-1.0_to_ruleset-1.2/diff.json",
        expected:
            "6bd6537d5c036ae44b0d977b8a8a914fb2e13156ad9b32f5be6d9c6735ef774f",
    },
];

let mismatches = [];

for (const item of LOCKED) {
    const abs = path.join(ROOT, item.rel);
    if (!fs.existsSync(abs)) {
        mismatches.push({
            file: item.rel,
            expected: item.expected,
            actual: "<MISSING>",
        });
        continue;
    }
    const actual = sha256File(abs);
    if (actual !== item.expected) {
        mismatches.push({ file: item.rel, expected: item.expected, actual });
    }
}

if (mismatches.length > 0) {
    console.error("GATE FAIL: v0.8 frozen artifacts hash mismatch detected.");
    for (const m of mismatches) {
        console.error(`- ${m.file}`);
        console.error(`  expected: ${m.expected}`);
        console.error(`  actual:   ${m.actual}`);
    }
    fail("v0.8 frozen evidence chain integrity violated. STOP.");
}

console.log("GATE PASS: v0.8 frozen artifacts hashes match locked seal values.");
