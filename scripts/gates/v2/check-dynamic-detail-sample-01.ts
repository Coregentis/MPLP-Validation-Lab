
import { GateDefinition, GateResult } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import path from 'path';
import fs from 'fs';

const ORIGIN = 'http://localhost:3000';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
    name: "Dynamic Detail Page Sampling",
    execute: async (): Promise<GateResult> => {
        const indexJsonPath = path.resolve('public/_data/v2/runs/index.json');

        if (!fs.existsSync(indexJsonPath)) {
            return {
                gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
                name: "Dynamic Detail Page Sampling",
                exit_code: 1,
                summary: "Run Inventory not found",
                failures: [{ message: 'Missing public/_data/v2/runs/index.json', severity: "error" }]
            };
        }

        const runIndex = readJson(indexJsonPath);
        // Correct access pattern for Index V2 Schema
        const runs = runIndex.data?.runs || [];

        if (!Array.isArray(runs) || runs.length === 0) {
            return {
                gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
                name: "Dynamic Detail Page Sampling",
                exit_code: 1,
                summary: "No runs in inventory to sample",
                failures: [{ message: 'Projections ran but produce 0 runs', severity: "error" }]
            };
        }

        // Sample 1 run
        const sampleId = runs[0].pack_id; // Using pack_id as canonical ID
        const route = `/cases/${sampleId}`;

        try {
            const res = await fetch(`${ORIGIN}${route}`);
            if (!res.ok) {
                return {
                    gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
                    name: "Dynamic Detail Page Sampling",
                    exit_code: 1,
                    summary: `Sample Detail Route ${route} returned ${res.status}`,
                    failures: [{ message: `Fetch failed for ${route}`, severity: "error" }]
                };
            }

            const text = await res.text();

            if (!text.includes("Evidence Docket") && !text.includes("Verdict")) {
                return {
                    gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
                    name: "Dynamic Detail Page Sampling",
                    exit_code: 1,
                    summary: "Sample missing core blocks",
                    failures: [{ message: `Page ${route} missing 'Evidence Docket' or 'Verdict'`, severity: "error" }]
                };
            }

        } catch (e) {
            return {
                gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
                name: "Dynamic Detail Page Sampling",
                exit_code: 1,
                summary: `Failed to fetch sample ${route}`,
                failures: [{ message: (e as Error).message, severity: "error" }]
            };
        }

        return {
            gate_id: "GATE-V2-DYNAMIC-DETAIL-SAMPLE-01",
            name: "Dynamic Detail Page Sampling",
            exit_code: 0,
            summary: `Sampled ${sampleId}: OK (Content Verified)`,
            failures: []
        };
    }
};
