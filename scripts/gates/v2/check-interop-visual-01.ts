import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-INTEROP-VISUAL-01",
    name: "Interop Visualizer Presence",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        const APP_ROOT = path.resolve('app');

        // Scan for interop visualizer component usage
        // Note: Strict check would parse AST. Simple check greps source.
        const files = await glob('app/**/*.{ts,tsx}');
        let hasVisualizer = false;

        for (const f of files) {
            const content = fs.readFileSync(f, 'utf-8');
            if (content.includes('InteropGraph') || content.includes('InteropVisualizer')) {
                hasVisualizer = true;
                break;
            }
        }

        if (!hasVisualizer) {
            // This is expected to fail until PR-07
            failures.push({ message: "No InteropVisualizer component usage found in app/", severity: "error" });
        }

        return {
            gate_id: "GATE-V2-INTEROP-VISUAL-01",
            name: "Interop Visualizer Presence",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Visualizer Missing" : "Visualizer Found",
            failures
        };
    }
};
