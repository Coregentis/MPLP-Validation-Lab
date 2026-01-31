import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { gateFailBenchmark as failureGate } from './check-fail-benchmark';
import { gate as tripodInboundGate } from './check-tripod-inbound-01';
import { gate as tripodOutboundGate } from './check-tripod-outbound-01';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import path from 'node:path';

const REGISTRY_PATH = path.resolve('governance/gates/gate-registry-v2.json');
const RUNNER_PATH = path.resolve('scripts/gates/run-all.ts');

export const gateGateRegistry: GateDefinition = {
    gate_id: 'GATE-V2-GATE-REGISTRY-01',
    name: 'Gate Registry SSOT Check',
    execute: async (): Promise<GateResult> => {
        if (!fs.existsSync(REGISTRY_PATH)) {
            return fail('GATE-V2-GATE-REGISTRY-01', 'Gate Registry SSOT Check', 'Registry file missing', [{
                message: 'governance/gates/gate-registry-v2.json not found',
                severity: 'error'
            }]);
        }

        const registry = readJson(REGISTRY_PATH);
        const expectedCount = registry.active_gate_count;

        const runnerContent = fs.readFileSync(RUNNER_PATH, 'utf-8');
        const arrayMatch = runnerContent.match(/const gates = \[\s*([\s\S]*?)\];/);

        if (!arrayMatch) {
            return fail('GATE-V2-GATE-REGISTRY-01', 'Gate Registry SSOT Check', 'Cannot parse run-all.ts', [{
                message: 'Could not find gates array in run-all.ts',
                severity: 'error'
            }]);
        }

        const gateItems = arrayMatch[1]
            .split(',')
            .map(s => s.trim())
            .filter(s => s && !s.startsWith('//')); // Simple filter

        // Better: Remove all single line comments from the block first
        const blockClean = arrayMatch[1].replace(/\/\/.*$/gm, '');
        const activeGateItems = blockClean
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const actualCount = activeGateItems.length;

        if (actualCount !== expectedCount) {
            return fail('GATE-V2-GATE-REGISTRY-01', 'Gate Registry SSOT Check', 'Count mismatch', [{
                message: `Registry expects ${expectedCount} gates, but run-all.ts has ${actualCount}`,
                severity: 'error'
            }]);
        }

        return pass('GATE-V2-GATE-REGISTRY-01', 'Gate Registry SSOT Check', `Verified ${actualCount} active gates.`);
    }
};
