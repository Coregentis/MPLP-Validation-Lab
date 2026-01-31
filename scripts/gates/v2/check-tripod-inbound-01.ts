
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { TRIPOD, PAGE_BINDINGS } from '../../app/_ssot/ux.generated';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-TRIPOD-INBOUND-01",
    name: "Tripod Inbound Integrity",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const inbound = TRIPOD.inbound || [];

        for (const entry of inbound) {
            // Verify Target Route exists in Page Bindings
            // PAGE_BINDINGS routes might be dynamic like /cases/[id].
            // Entry target_route: /cases/[id]
            const targetPage = PAGE_BINDINGS.find(p => p.route === entry.target_route);

            if (!targetPage) {
                failures.push({
                    message: `Inbound entry '${entry.id}' targets unknown route: ${entry.target_route}`,
                    severity: "error"
                });
                continue;
            }

            // Verify Required Blocks are present in Target Page Binding
            if (entry.required_blocks) {
                for (const reqBlock of entry.required_blocks) {
                    if (!targetPage.blocks.includes(reqBlock)) {
                        failures.push({
                            message: `Inbound entry '${entry.id}' requires block '${reqBlock}' but target '${targetPage.id}' does not bind it.`,
                            severity: "error"
                        });
                    }
                }
            }
        }

        return {
            gate_id: "GATE-V2-TRIPOD-INBOUND-01",
            name: "Tripod Inbound Integrity",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Inbound Integrity Failed" : "Inbound Integrity Verified",
            failures
        };
    }
};
