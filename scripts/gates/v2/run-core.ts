#!/usr/bin/env tsx

/**
 * Gate Runner - Executes all V2 gates
 */

import { runGate, type GateResult, type GateExit } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';

// Imports based on verified exports
import { gateDisputeClosure } from './check-dispute-closure';
import { gateDisputeRootCause } from './check-dispute-rootcause';
import { gateDisputeSSOT } from './check-dispute-ssot';
import { gateFailBenchmark } from './check-fail-benchmark';
import { gate as tripodInboundGate } from './check-tripod-inbound-01';
import { gate as tripodOutboundGate } from './check-tripod-outbound-01';
import { gate as frameworkCoverageGate } from './check-framework-coverage-01';
import { gateGateRegistry } from './check-gate-registry';
import { gate as interopBenchGate } from './check-interop-benchmark-01';
import { gate as interopEvidenceGate } from './check-interop-evidence-01';
import { gate as pointerCanonGate } from './check-pointer-canon-01';
import { gate as blockRegistryGate } from './check-ux-block-registry-01';
import { gate as uxTokensGate } from './check-ux-tokens-01';
import { gateProjectionSchema } from './check-projection-schema';
import { gateRegMappingDisclaimer } from './check-reg-mapping-disclaimer';
import { gateRegMappingSSOT } from './check-reg-mapping-ssot';
import { gateRulesetDiffpack } from './check-ruleset-diffpack';
import { gateScopeSSOT } from './check-scope-ssot';
import { gateTierConsistency } from './check-tier-consistency';
import { gateDeterminism } from './det-01';
import { gateIAEntrypoints } from './ia-entrypoints-01';
import { gateIAExploreTemplates } from './ia-explore-templates-01';
import { gateIARecommendedRuns } from './ia-recommended-runs-01';
import { gateNoFS } from './no-fs-01';
import { gateProjectionOnly } from './proj-only-01';
import { gateProjectionClosure } from './projection-closure-01';
import { gateRealQualify } from './real-qualify-01';
import { gateRunnerSSOT } from './runner-ssot-01';

// RC-6 new gates import
// RC-6 new gates (Core Integrity Only)
import { gate as ssotGeneratedGate } from './check-ux-ssot-generated-01';
import { gate as noHandwriteGate } from './check-ux-no-handwrite-copy-01';


// Content Visibility Gate (was missing from runner)
import { gateContentVisibility } from './check-content-visibility';


async function main() {
    console.error('='.repeat(60));
    console.error('V2 GATES - Running all gates...');
    console.error('='.repeat(60));

    const gates = [
        // RC-1/Architectural
        gateDeterminism,
        gateProjectionOnly,
        gateRealQualify,
        gateRunnerSSOT,
        // RC-2
        gateScopeSSOT,
        gateTierConsistency,
        gateProjectionSchema,
        gateDisputeSSOT,
        gateRegMappingSSOT,
        gateRegMappingDisclaimer,

        // RC-4
        gateIAEntrypoints,
        gateIAExploreTemplates,
        gateIARecommendedRuns,

        // RC-5
        frameworkCoverageGate,
        interopBenchGate,
        interopEvidenceGate,

        // RC-6
        // RC-6 (Core)
        ssotGeneratedGate,

        // PR-03.5
        uxTokensGate,
        blockRegistryGate,
        pointerCanonGate,

        // Tripod Integration
        tripodInboundGate,
        tripodOutboundGate,

        // Content Visibility match V1 integration
        gateContentVisibility
    ];

    const results: GateResult[] = [];
    for (const gate of gates) {
        results.push(await runGate(gate as any));
    }

    // Compute worst exit code
    const worst: GateExit = results.reduce(
        (acc, r) => Math.max(acc, r.exit_code ?? 0) as GateExit,
        0 as GateExit
    );

    // Print summary
    console.error('\n' + '='.repeat(60));
    console.error('GATE SUMMARY');
    console.error('='.repeat(60));

    const counts = summarize(results);
    console.error(`Total Gates: ${results.length}`);
    console.error(`✅ Passed: ${counts.pass}`);
    console.error(`⚠️  Warnings: ${counts.warn}`);
    console.error(`❌ Failed: ${counts.fail}`);
    console.error('='.repeat(60));

    // Write report to file
    const reportPath = path.resolve(__dirname, 'reports/gate_report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify({
        summary: counts,
        results
    }, null, 2));

    console.error(`\n📄 Gate Report written to: ${reportPath}`);

    // Output JSON for machine consumption (keep stdout for piping if needed)
    console.log(JSON.stringify({
        summary: counts,
        results
    }, null, 2));

    process.exit(worst);
}

function summarize(results: GateResult[]) {
    const counts = { pass: 0, warn: 0, fail: 0 };
    for (const r of results) {
        if (r.exit_code === 0) counts.pass++;
        else if (r.exit_code === 2) counts.warn++;
        else counts.fail++;
    }
    return counts;
}

main().catch((e) => {
    console.error('Fatal error running gates:', e);
    process.exit(1);
});
