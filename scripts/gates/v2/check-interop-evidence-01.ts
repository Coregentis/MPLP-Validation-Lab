import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

const RUNS_ROOT = path.resolve('data/runs/v2/real');
// Target Interop Stack
const TARGET_STACK_JSON = '["LangGraph","MCP","A2A"]';

export const gate: GateDefinition = {
    gate_id: 'GATE-V2-INTEROP-EVIDENCE-01',
    name: 'Interop Evidence Deep Scan',

    execute: async (): Promise<GateResult> => {
        // 1. Find the Interop Run(s) manifest
        const manifests = glob.sync(path.join(RUNS_ROOT, '**', 'manifest.json'));
        let killerRunPath: string | null = null;
        let killerRunId = '';

        for (const mPath of manifests) {
            try {
                const content = fs.readFileSync(mPath, 'utf-8');
                const json = JSON.parse(content);
                // Simple strict equality check for array JSON string
                if (JSON.stringify(json.interop_stack) === TARGET_STACK_JSON) {
                    killerRunPath = path.dirname(mPath);
                    killerRunId = json.pack_id;
                    break;
                }
            } catch (e) {
                // Ignore malformed manifests
            }
        }

        if (!killerRunPath) {
            return fail(gate.gate_id, gate.name, 'Interop Benchmark run not found on disk (cannot scan evidence).', []);
        }

        // 2. Scan Timeline
        const timelinePath = path.join(killerRunPath, 'timeline', 'events.ndjson');
        if (!fs.existsSync(timelinePath)) {
            return fail(gate.gate_id, gate.name, `Timeline missing for Interop Run at ${killerRunPath}`, []);
        }

        const stats = { hasMcp: false, hasA2A: false };

        try {
            const lines = fs.readFileSync(timelinePath, 'utf-8').split('\n').filter(Boolean);
            for (const line of lines) {
                const event = JSON.parse(line);
                if (event.type === 'mcp_tool_call') stats.hasMcp = true;
                if (event.type === 'a2a_envelope') stats.hasA2A = true;
            }
        } catch (e) {
            return fail(gate.gate_id, gate.name, `Failed to parse timeline at ${timelinePath}`, [{ message: String(e), severity: 'error' }]);
        }

        if (!stats.hasMcp) return fail(gate.gate_id, gate.name, `Missing 'mcp_tool_call' event in timeline for ${killerRunId}.`, []);
        if (!stats.hasA2A) return fail(gate.gate_id, gate.name, `Missing 'a2a_envelope' event in timeline for ${killerRunId}.`, []);

        return pass(gate.gate_id, gate.name, `Interop Evidence Confirmed for ${killerRunId} (MCP + A2A present).`);
    }
};
