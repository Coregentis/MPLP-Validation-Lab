import fs from 'node:fs';
import path from 'node:path';
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { loadYaml, walkDir } from '../_lib/io';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-NO-HANDWRITE-COPY-01",
    name: "No Handwrite Frozen Copy",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const REGISTRY_PATH = path.resolve('governance/ux/component-registry-v1.yaml');
        const APP_ROOT = path.resolve('app');

        const registry = loadYaml(REGISTRY_PATH);
        const tokens = registry.tokens || {};
        const forbiddenPhrases = Object.values(tokens) as string[];

        const files = walkDir(APP_ROOT, ['.tsx', '.ts']);

        for (const file of files) {
            // Skip the generated file itself
            if (file.endsWith('ux.generated.ts')) continue;

            const content = fs.readFileSync(file, 'utf-8');
            for (const phrase of forbiddenPhrases) {
                // Allowlist exemption: "PASS", "FAIL", "REJECTED", "ID" are common literals or substrings
                if (['PASS', 'FAIL', 'REJECTED', 'ID'].includes(phrase)) continue;

                if (content.includes(phrase)) {
                    failures.push({
                        message: `Found hardcoded frozen token in ${path.relative(process.cwd(), file)}: "${phrase}"`,
                        severity: "error"
                    });
                }
            }
        }

        return {
            gate_id: "GATE-V2-NO-HANDWRITE-COPY-01",
            name: "No Handwrite Frozen Copy",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? `Found ${failures.length} hardcoded tokens` : "No hardcoded frozen tokens found",
            failures
        };
    }
};
