import fs from 'node:fs';
import path from 'node:path';
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { sha256File } from '../_lib/io';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-SSOT-GENERATED-01",
    name: "SSOT Generated Integrity",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const genPath = path.resolve('app/_ssot/ux.generated.ts');

        if (!fs.existsSync(genPath)) {
            return {
                gate_id: "GATE-V2-SSOT-GENERATED-01",
                name: "SSOT Generated Integrity",
                exit_code: 1,
                summary: "ux.generated.ts missing",
                failures: [{ message: "File not found: app/_ssot/ux.generated.ts", severity: "error" }]
            };
        }

        const content = fs.readFileSync(genPath, 'utf-8');
        const match = content.match(/export const SSOT_HASHES = ({[\s\S]*?});/);

        if (!match) {
            failures.push({ message: "Could not parse SSOT_HASHES from generated file", severity: "error" });
        } else {
            const recordedHashes = JSON.parse(match[1]);
            const UX_ROOT = path.resolve('governance/ux');
            const files = {
                roleModel: 'role-model-v1.yaml',
                roleJourneys: 'role-journeys-v1.yaml',
                caseShelves: 'case-shelves-v1.yaml',
                tripodMap: 'tripod-entry-map-v1.yaml',
                componentRegistry: 'component-registry-v1.yaml'
            };

            for (const [key, filename] of Object.entries(files)) {
                const filePath = path.join(UX_ROOT, filename);
                const currentHash = sha256File(filePath);
                if (currentHash !== recordedHashes[key]) {
                    failures.push({
                        message: `Hash mismatch for ${filename}. Run npm run projection:build to fix.`,
                        severity: "error"
                    });
                }
            }
        }

        return {
            gate_id: "GATE-V2-SSOT-GENERATED-01",
            name: "SSOT Generated Integrity",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "SSOT hash mismatch" : "Generated file matches SSOTs",
            failures
        };
    }
};
