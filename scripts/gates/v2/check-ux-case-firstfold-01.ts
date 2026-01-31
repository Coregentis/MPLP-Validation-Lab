import { GateDefinition, GateResult } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';
import { loadYaml } from '../_lib/io';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-CASE-FIRSTFOLD-01",
    name: "Case Page First Fold",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const BINDINGS_PATH = path.resolve('governance/ux/page-bindings-v1.yaml');
        if (!fs.existsSync(BINDINGS_PATH)) {
            failures.push({ message: "Page Bindings SSOT not found", severity: "error" });
        } else {
            const bindings = loadYaml(BINDINGS_PATH);
            const casePage = bindings.pages ? bindings.pages.find((p: any) => p.id === 'case_detail') : null;
            if (!casePage) {
                failures.push({ message: "case_detail binding missing in SSOT", severity: "error" });
            } else {
                const requiredBlocks = ['BLOCK_VERDICT_BADGE', 'BLOCK_PROVENANCE'];
                for (const req of requiredBlocks) {
                    if (!casePage.blocks.includes(req)) {
                        failures.push({ message: `Case Detail SSOT missing mandatory block: ${req}`, severity: "error" });
                    }
                }
            }
        }

        return {
            gate_id: "GATE-V2-CASE-FIRSTFOLD-01",
            name: "Case Page First Fold",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "First Fold incomplete" : "First Fold validated",
            failures
        };
    }
};
