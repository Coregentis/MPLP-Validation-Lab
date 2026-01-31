import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import path from 'path';

const INDEX_PATH = path.resolve('public/_data/v2/runs/index.json');
const TARGET_STACK = JSON.stringify(["LangGraph", "MCP", "A2A"]);

export const gate: GateDefinition = {
    gate_id: 'GATE-V2-INTEROP-BENCH-01',
    name: 'Interop Benchmark Existence',

    execute: async (): Promise<GateResult> => {
        try {
            const index = readJson(INDEX_PATH);
            const runs = index.data.runs;

            // Check if any run has the exact stack
            const hasKillerRun = runs.some((r: any) =>
                JSON.stringify(r.interop_stack) === TARGET_STACK
            );

            if (!hasKillerRun) {
                return fail(gate.gate_id, gate.name, `Interop Benchmark not found. Expected stack: ${TARGET_STACK}`, []);
            }

            return pass(gate.gate_id, gate.name, 'Interop Benchmark (LangGraph + MCP + A2A) confirmed.');
        } catch (e) {
            return fail(gate.gate_id, gate.name, `Failed to read runs index: ${e}`, [{ message: String(e), severity: 'error' }]);
        }
    }
};
