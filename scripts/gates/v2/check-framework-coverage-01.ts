import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import path from 'path';

const INDEX_PATH = path.resolve('public/_data/v2/runs/index.json');
const REQUIRED_SUBSTRATES = ['langchain', 'langgraph', 'semantickernel', 'metagpt'];

export const gate: GateDefinition = {
    gate_id: 'GATE-V2-FRAMEWORK-COVERAGE-01',
    name: 'Mainstream Framework Coverage',

    execute: async (): Promise<GateResult> => {
        try {
            const index = readJson(INDEX_PATH);
            const runs = index.data.runs;
            const substrates = new Set(runs.map((r: any) => r.substrate_id));

            const missing = REQUIRED_SUBSTRATES.filter(s => !substrates.has(s));

            if (missing.length > 0) {
                return fail(gate.gate_id, gate.name, `Missing coverage for frameworks: ${missing.join(', ')}`, missing.map(m => ({ message: `Missing: ${m}`, severity: 'error' })));
            }

            return pass(gate.gate_id, gate.name, `All ${REQUIRED_SUBSTRATES.length} required frameworks covered.`);
        } catch (e: any) {
            return fail(gate.gate_id, gate.name, `Failed to read coverage index: ${e}`, [{ message: String(e), severity: 'error' }]);
        }
    }
};
