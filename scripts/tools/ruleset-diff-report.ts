#!/usr/bin/env npx tsx
/**
 * Ruleset Diff Report Tool (P0-2)
 * 
 * Compares verdict differences for a pack across two ruleset versions.
 * Outputs clause_delta and evidence_requirements_delta for explainability.
 * 
 * Governance: REV2 P0-2 - ruleset evolution diff for defensible transmission
 * 
 * Usage: npm run tool:ruleset-diff -- <pack_id> <ruleset_a> <ruleset_b>
 * Example: npm run tool:ruleset-diff gf-01-smoke ruleset-1.0 ruleset-1.1
 * 
 * Output: export/ruleset-diff/<pack_id>/<ruleset_a>-vs-<ruleset_b>.json
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "../..");

// =============================================================================
// Types
// =============================================================================

interface ClauseDelta {
    clause_id: string;
    requirement_id?: string;
    domain_id?: string;
    verdict_a: string;
    verdict_b: string;
    reason_code_a?: string;
    reason_code_b?: string;
}

interface RequirementDelta {
    requirement_id: string;
    in_a: boolean;
    in_b: boolean;
}

interface DiffReport {
    pack_id: string;
    ruleset_a: string;
    ruleset_b: string;
    generated_at: string;
    verdict_a: string;
    verdict_b: string;
    reason_code_a?: string;
    reason_code_b?: string;
    clause_delta: ClauseDelta[];
    evidence_requirements_delta: RequirementDelta[];
    non_normative_boundary: string;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
    const args = process.argv.slice(2);

    if (args.length < 3 || args.includes("--help")) {
        console.log(`
Ruleset Diff Report Tool (P0-2)

Usage: npm run tool:ruleset-diff -- <pack_id> <ruleset_a> <ruleset_b>

Arguments:
  pack_id      ID of the run pack to evaluate (e.g., gf-01-smoke)
  ruleset_a    First ruleset version (e.g., ruleset-1.0)
  ruleset_b    Second ruleset version (e.g., ruleset-1.1)

Output:
  JSON report at export/ruleset-diff/<pack_id>/<a>-vs-<b>.json

Governance:
  This tool outputs ruleset evolution differences and does NOT:
  - Define protocol semantics
  - Make claims about protocol compatibility
  - Provide certification or endorsement
`);
        process.exit(args.includes("--help") ? 0 : 1);
    }

    const [packId, rulesetA, rulesetB] = args;

    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Ruleset Diff Report Tool (P0-2)");
    console.log("═══════════════════════════════════════════════════════════\n");
    console.log(`  Pack:      ${packId}`);
    console.log(`  Ruleset A: ${rulesetA}`);
    console.log(`  Ruleset B: ${rulesetB}\n`);

    try {
        // Import dependencies
        const { loadRunBundle } = await import(
            `file://${path.join(PROJECT_ROOT, "lib/bundles/load_run_bundle.ts")}`
        );
        const { getRuleset } = await import(
            `file://${path.join(PROJECT_ROOT, "lib/rulesets/registry.ts")}`
        );

        // Load pack
        const bundle = loadRunBundle(packId);
        if (!bundle) {
            console.error(`❌ Pack not found: ${packId}`);
            process.exit(1);
        }
        console.log(`✓ Loaded pack: ${packId}\n`);

        // Load rulesets
        const rsA = await getRuleset(rulesetA);
        const rsB = await getRuleset(rulesetB);

        if (!rsA?.adjudicator) {
            console.error(`❌ Ruleset A not loadable or no adjudicator: ${rulesetA}`);
            process.exit(1);
        }
        if (!rsB?.adjudicator) {
            console.error(`❌ Ruleset B not loadable or no adjudicator: ${rulesetB}`);
            process.exit(1);
        }

        console.log(`✓ Loaded ruleset: ${rulesetA}`);
        console.log(`✓ Loaded ruleset: ${rulesetB}\n`);

        // Execute adjudicators
        console.log("Executing adjudicators...");
        const evalA = await rsA.adjudicator(bundle);
        const evalB = await rsB.adjudicator(bundle);

        console.log(`  ${rulesetA}: ${evalA.topline_verdict}`);
        console.log(`  ${rulesetB}: ${evalB.topline_verdict}\n`);

        // Compute clause delta
        const clauseMapA = new Map<string, typeof evalA.clauses[0]>();
        for (const c of evalA.clauses ?? []) {
            clauseMapA.set(c.clause_id, c);
        }

        const clauseMapB = new Map<string, typeof evalB.clauses[0]>();
        for (const c of evalB.clauses ?? []) {
            clauseMapB.set(c.clause_id, c);
        }

        const allClauseIds = new Set([...clauseMapA.keys(), ...clauseMapB.keys()]);
        const clauseDelta: ClauseDelta[] = [];

        for (const clauseId of allClauseIds) {
            const cA = clauseMapA.get(clauseId);
            const cB = clauseMapB.get(clauseId);

            const verdictA = cA?.status ?? "MISSING";
            const verdictB = cB?.status ?? "MISSING";

            // Only include if there's a difference
            if (verdictA !== verdictB || cA?.reason_code !== cB?.reason_code) {
                clauseDelta.push({
                    clause_id: clauseId,
                    requirement_id: cA?.requirement_id ?? cB?.requirement_id,
                    domain_id: cA?.domain_id ?? cB?.domain_id,
                    verdict_a: verdictA,
                    verdict_b: verdictB,
                    reason_code_a: cA?.reason_code,
                    reason_code_b: cB?.reason_code,
                });
            }
        }

        // Compute evidence requirements delta
        const reqsA = new Set<string>();
        const reqsB = new Set<string>();

        for (const c of evalA.clauses ?? []) {
            if (c.requirement_id) reqsA.add(c.requirement_id);
        }
        for (const c of evalB.clauses ?? []) {
            if (c.requirement_id) reqsB.add(c.requirement_id);
        }

        const allReqs = new Set([...reqsA, ...reqsB]);
        const requirementsDelta: RequirementDelta[] = [];

        for (const reqId of allReqs) {
            const inA = reqsA.has(reqId);
            const inB = reqsB.has(reqId);
            if (inA !== inB) {
                requirementsDelta.push({
                    requirement_id: reqId,
                    in_a: inA,
                    in_b: inB,
                });
            }
        }

        // Build report
        const report: DiffReport = {
            pack_id: packId,
            ruleset_a: rulesetA,
            ruleset_b: rulesetB,
            generated_at: new Date().toISOString(),
            verdict_a: evalA.topline_verdict,
            verdict_b: evalB.topline_verdict,
            reason_code_a: evalA.reason_code ?? undefined,
            reason_code_b: evalB.reason_code ?? undefined,
            clause_delta: clauseDelta,
            evidence_requirements_delta: requirementsDelta,
            non_normative_boundary:
                "This report describes ruleset evolution differences. " +
                "It does NOT define protocol semantics or claim compatibility.",
        };

        // Write output
        const outDir = path.join(PROJECT_ROOT, "export", "ruleset-diff", packId);
        fs.mkdirSync(outDir, { recursive: true });

        const outFile = path.join(outDir, `${rulesetA}-vs-${rulesetB}.json`);
        fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

        console.log("═══════════════════════════════════════════════════════════");
        console.log("  Report Generated");
        console.log("═══════════════════════════════════════════════════════════\n");
        console.log(`  Output: ${outFile}`);
        console.log(`  Verdict A: ${report.verdict_a}`);
        console.log(`  Verdict B: ${report.verdict_b}`);
        console.log(`  Clause deltas: ${clauseDelta.length}`);
        console.log(`  Requirement deltas: ${requirementsDelta.length}\n`);

        if (clauseDelta.length > 0) {
            console.log("  Clause Changes:");
            for (const d of clauseDelta.slice(0, 5)) {
                console.log(`    ${d.clause_id}: ${d.verdict_a} → ${d.verdict_b}`);
            }
            if (clauseDelta.length > 5) {
                console.log(`    ... and ${clauseDelta.length - 5} more`);
            }
            console.log("");
        }

    } catch (e) {
        console.error(`\n❌ Error: ${e}`);
        process.exit(1);
    }
}

main();
