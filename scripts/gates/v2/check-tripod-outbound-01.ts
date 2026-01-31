
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { TRIPOD, TOKENS } from '../../app/_ssot/ux.generated';
import { glob } from 'glob';
import fs from 'node:fs';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-TRIPOD-OUTBOUND-01",
    name: "Tripod Outbound Integrity",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const outbound = TRIPOD.outbound || [];

        // 1. Validate Outbound Definition against Tokens
        for (const out of outbound) {
            if (out.required_token && !TOKENS[out.required_token]) {
                failures.push({
                    message: `Outbound definition '${out.id}' requires unknown token: ${out.required_token}`,
                    severity: "error"
                });
            }
        }

        // 2. Scan Components for hardcoded usage? 
        // Or check if Components use the Tripod map?
        // Ideally, specific components like ClauseList should import TRIPOD and usage should be verified.
        // For now, we enforce that the definition itself is valid.

        return {
            gate_id: "GATE-V2-TRIPOD-OUTBOUND-01",
            name: "Tripod Outbound Integrity",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Outbound Integrity Failed" : "Outbound Integrity Verified",
            failures
        };
    }
};
