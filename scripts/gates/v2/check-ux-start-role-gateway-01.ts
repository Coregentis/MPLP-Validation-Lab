
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-START-ROLE-GATEWAY-01",
    name: "Start Page Role Gateway",
    execute: async (): Promise<GateResult> => {
        const BINDINGS_PATH = path.resolve('governance/ux/page-bindings-v1.yaml');
        const bindings = loadYaml(BINDINGS_PATH);
        const startPage = bindings.pages.find((p: any) => p.route === '/start');

        if (!startPage) {
            return {
                gate_id: "GATE-V2-START-ROLE-GATEWAY-01",
                name: "Start Page Role Gateway",
                exit_code: 1,
                summary: "Start page route '/start' not found in bindings",
                failures: [{ message: "Missing start page binding", severity: "error" }]
            };
        }

        const requiredBlocks = ["BLOCK_START_HERO", "BLOCK_ROLE_GATEWAY"];
        const missing = requiredBlocks.filter(b => !startPage.blocks.includes(b));

        if (missing.length > 0) {
            return {
                gate_id: "GATE-V2-START-ROLE-GATEWAY-01",
                name: "Start Page Role Gateway",
                exit_code: 1,
                summary: `Start page missing required blocks`,
                failures: missing.map(m => ({ message: `Missing block: ${m}`, severity: "error" }))
            };
        }

        return {
            gate_id: "GATE-V2-START-ROLE-GATEWAY-01",
            name: "Start Page Role Gateway",
            exit_code: 0,
            summary: "Start page has Hero and Role Gateway",
            failures: []
        };
    }
};
