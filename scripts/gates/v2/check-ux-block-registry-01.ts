import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-UX-BLOCK-REGISTRY-01",
    name: "Block Registry Completeness",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const REGISTRY_PATH = path.resolve('governance/ux/component-registry-v1.yaml');
        const JOURNEYS_PATH = path.resolve('governance/ux/role-journeys-v1.yaml');
        const ROLE_MODEL_PATH = path.resolve('governance/ux/role-model-v1.yaml');

        const registry = loadYaml(REGISTRY_PATH);
        const journeys = loadYaml(JOURNEYS_PATH);
        const roleModel = loadYaml(ROLE_MODEL_PATH);

        const definedBlocks = new Set((registry.blocks || []).map((b: any) => b.block_id));

        // Check Journeys
        if (journeys.journeys) {
            for (const j of journeys.journeys) {
                if (j.steps) {
                    j.steps.forEach((step: any, idx: number) => {
                        (step.expect_blocks || []).forEach((blockId: string) => {
                            if (!definedBlocks.has(blockId)) {
                                failures.push({ message: `Journey ${j.role} step ${idx} refs unknown block: ${blockId}`, severity: "error" });
                            }
                        });
                    });
                }
            }
        }

        // Check Role Model
        if (roleModel.roles) {
            for (const r of roleModel.roles) {
                (r.must_show_blocks || []).forEach((blockId: string) => {
                    if (!definedBlocks.has(blockId)) {
                        failures.push({ message: `Role ${r.id} refs unknown block: ${blockId}`, severity: "error" });
                    }
                });
            }
        }

        return {
            gate_id: "GATE-V2-UX-BLOCK-REGISTRY-01",
            name: "Block Registry Completeness",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Block registry mismatch" : "All blocks registered",
            failures
        };
    }
};
