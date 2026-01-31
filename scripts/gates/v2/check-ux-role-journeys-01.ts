import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-ROLE-JOURNEYS-01",
    name: "Role Journeys Integrity",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const JOURNEYS_PATH = path.resolve('governance/ux/role-journeys-v1.yaml');
        const data = loadYaml(JOURNEYS_PATH);

        if (!data.journeys || !Array.isArray(data.journeys)) {
            return {
                gate_id: "GATE-V2-ROLE-JOURNEYS-01",
                name: "Role Journeys Integrity",
                exit_code: 1,
                summary: "Invalid journeys format",
                failures: [{ message: "journeys root array missing", severity: "error" }]
            };
        }

        for (const journey of data.journeys) {
            if (!journey.role) failures.push({ message: "Journey missing role ID", severity: "error" });
            if (!journey.steps || journey.steps.length === 0) {
                failures.push({ message: `Journey for ${journey.role} has no steps`, severity: "error" });
            } else {
                journey.steps.forEach((step: any, idx: number) => {
                    if (!step.route) failures.push({ message: `Step ${idx} in ${journey.role} missing route`, severity: "error" });
                    if (!step.expect_blocks || step.expect_blocks.length === 0) {
                        failures.push({ message: `Step ${idx} in ${journey.role} missing expect_blocks`, severity: "error" });
                    }
                    // Fix-3: Check registry existence via generated SSOT? 
                    // MVP: Just enforce structure. Fix-3 done in Compiler mainly.
                });
            }
        }

        return {
            gate_id: "GATE-V2-ROLE-JOURNEYS-01",
            name: "Role Journeys Integrity",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? `Found ${failures.length} journey issues` : "Journeys verified",
            failures
        };
    }
};
