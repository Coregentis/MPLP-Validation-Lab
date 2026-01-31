import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-POINTER-CANON-01",
    name: "Pointer Canonical Form",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const ROLE_MODEL_PATH = path.resolve('governance/ux/role-model-v1.yaml');
        const model = loadYaml(ROLE_MODEL_PATH);

        const POINTER_REGEX = /^mplp:\/\/(timeline|artifacts|manifest)\/[a-zA-Z0-9\/._-]+([?#].*)?$/;

        if (model.roles) {
            for (const r of model.roles) {
                (r.must_see_proof_targets || []).forEach((ptr: string) => {
                    if (!POINTER_REGEX.test(ptr)) {
                        failures.push({ message: `Role ${r.id} has invalid pointer: ${ptr}`, severity: "error" });
                    }
                });
            }
        }

        return {
            gate_id: "GATE-V2-POINTER-CANON-01",
            name: "Pointer Canonical Form",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Pointer canon violation" : "Pointers canonical",
            failures
        };
    }
};
