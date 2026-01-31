import { glob } from 'glob';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail } from '../_lib/gate-runner';

export const gateFailBenchmark: GateDefinition = {
    gate_id: 'GATE-V2-FAIL-BENCH-01',
    name: 'Fail Benchmark Existence',
    execute: async () => {
        // 1. Scan Projections
        const runProjections = await glob('public/_data/v2/runs/*.json', {
            ignore: 'public/_data/v2/runs/index.json'
        });

        let failBenchmarkFound = false;

        for (const runFile of runProjections) {
            if (runFile.endsWith('.evidence.json')) continue;

            const runData = readJson(runFile);
            const run = runData.data;

            // Must be FAIL verdict AND DISPUTE_READY tier
            // Note: projection.data has 'evaluation' object but verdict might be in 'verdict' object or 'evaluation.verdict'
            // In build-projection.ts, 'verdict' property is populated from verdict.json status?
            // Actually build-projection.ts copies verdict from verdict.json to run object? No, likely in 'evaluation'.
            // Let's check run object structure.
            // In build-projection: run.verdict_status is populated. But run object in projection file is data: { ... }

            // Looking at previous gate (check-tier-consistency), it reads schema.
            // build-projection writes: indexability_status, verdict_status (wait, verdict is in 'verdict' field of index item, but 'evaluation.verdict' in detail?).
            // Let's check previous file `scripts/build/build-projection.ts`.
            // Structure: data: { indexability_status, evidence_maturity_tier, evaluation: { verdict: "PASS" } }

            const tier = run.evidence_maturity_tier;
            const verdict = run.evaluation?.verdict || run.verdict?.status;

            if (tier === 'DISPUTE_READY' && verdict === 'FAIL') {
                failBenchmarkFound = true;
                break;
            }
        }

        if (!failBenchmarkFound) {
            return fail('GATE-V2-FAIL-BENCH-01', 'Fail Benchmark Check', 'No DISPUTE_READY FAIL benchmark found', [{ message: 'Inventory must contain at least one DISPUTE_READY run with verdict: FAIL', severity: 'error' }]);
        }

        return pass('GATE-V2-FAIL-BENCH-01', 'Fail Benchmark Exists');
    }
};
