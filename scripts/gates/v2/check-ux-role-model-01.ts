import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-ROLE-MODEL-01",
    name: "Role Model Coverage",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const ROLE_MODEL_PATH = path.resolve('governance/ux/role-model-v1.yaml');
        const model = loadYaml(ROLE_MODEL_PATH);

        const requiredRoles = ['architect', 'compliance', 'auditor', 'builder'];
        const definedRoles = (model.roles || []).map((r: any) => r.id);

        for (const role of requiredRoles) {
            if (!definedRoles.includes(role)) {
                failures.push({ message: `Missing required role definition: ${role}`, severity: "error" });
            }
        }

        return {
            gate_id: "GATE-V2-ROLE-MODEL-01",
            name: "Role Model Coverage",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Role Model incomplete" : "Role Model verified",
            failures
        };
    }
};
