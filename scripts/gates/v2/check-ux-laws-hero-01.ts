
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';
import path from 'path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-LAWS-HERO-01",
    name: "Laws Page Hero",
    execute: async (): Promise<GateResult> => {
        const BINDINGS_PATH = path.resolve('governance/ux/page-bindings-v1.yaml');
        const bindings = loadYaml(BINDINGS_PATH);
        const lawsPage = bindings.pages.find((p: any) => p.route === '/laws');

        if (!lawsPage) {
            return {
                gate_id: "GATE-V2-LAWS-HERO-01",
                name: "Laws Page Hero",
                exit_code: 1,
                summary: "Laws page route '/laws' not found in bindings",
                failures: [{ message: "Missing laws page binding", severity: "error" }]
            };
        }

        // Accepts generic BLOCK_HERO or specific BLOCK_LAWS_HERO if we renamed it.
        // We kept BLOCK_HERO.
        const hasHero = lawsPage.blocks.includes("BLOCK_HERO") || lawsPage.blocks.includes("BLOCK_LAWS_HERO");
        const hasBrowser = lawsPage.blocks.includes("BLOCK_CLAUSE_BROWSER");

        if (!hasHero || !hasBrowser) {
            return {
                gate_id: "GATE-V2-LAWS-HERO-01",
                name: "Laws Page Hero",
                exit_code: 1,
                summary: `Laws page missing required blocks`,
                failures: [
                    !hasHero ? { message: "Missing BLOCK_HERO", severity: "error" } : null,
                    !hasBrowser ? { message: "Missing BLOCK_CLAUSE_BROWSER", severity: "error" } : null
                ].filter(Boolean) as any[]
            };
        }

        return {
            gate_id: "GATE-V2-LAWS-HERO-01",
            name: "Laws Page Hero",
            exit_code: 0,
            summary: "Laws page has Hero and Clause Browser",
            failures: []
        };
    }
};
