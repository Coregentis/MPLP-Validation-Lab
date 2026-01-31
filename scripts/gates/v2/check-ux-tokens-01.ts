import { GateDefinition, GateResult } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-UX-TOKENS-01",
    name: "UX Tokens Consistency",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const GEN_PATH = path.resolve('app/_ssot/ux.generated.ts');

        if (!fs.existsSync(GEN_PATH)) {
            return {
                gate_id: "GATE-V2-UX-TOKENS-01",
                name: "UX Tokens Consistency",
                exit_code: 1,
                summary: "ux.generated.ts missing",
                failures: [{ message: "Generated SSOT file not found", severity: "error" }]
            };
        }

        const content = fs.readFileSync(GEN_PATH, 'utf-8');

        // Naive verification: ensure TOKENS export exists and some key tokens are present
        if (!content.includes('export const TOKENS')) {
            failures.push({ message: "TOKENS export missing in generated file", severity: "error" });
        }

        // Verify key tokens from Fix-1
        if (!content.includes('DISCL_NOT_CERTIFICATION')) {
            failures.push({ message: "DISCL_NOT_CERTIFICATION unification failed (missing in generated)", severity: "error" });
        }
        if (content.includes('DISCL_NO_CERTIFICATION')) {
            failures.push({ message: "DISCL_NO_CERTIFICATION (deprecated) found in generated file", severity: "error" });
        }

        return {
            gate_id: "GATE-V2-UX-TOKENS-01",
            name: "UX Tokens Consistency",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Token consistency failed" : "Tokens unified",
            failures
        };
    }
};
