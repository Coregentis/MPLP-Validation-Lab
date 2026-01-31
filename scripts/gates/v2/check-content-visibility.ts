/**
 * GATE-V2-CONTENT-VISIBILITY-01
 * 
 * Ensures all runs have non-UNKNOWN verdicts and evidence is present.
 * 
 * Ticket: VLAB-MERGE-P0-GATE-01 (added for V1/V2 integration)
 */

import fs from 'fs';
import path from 'path';

const RUNS_INDEX_PATH = 'public/_data/v2/runs/index.json';

// Inline Gate type to avoid missing import
interface GateResult {
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: string[];
}

interface Gate {
    id: string;
    name: string;
    description: string;
    run(): Promise<GateResult>;
}

export const gateContentVisibility: Gate = {
    id: 'GATE-V2-CONTENT-VISIBILITY-01',
    name: 'Content Visibility Check',
    description: 'Ensures all runs have non-UNKNOWN verdicts and evidence is present',

    async run() {
        const indexPath = path.join(process.cwd(), RUNS_INDEX_PATH);

        if (!fs.existsSync(indexPath)) {
            return {
                status: 'WARN' as const,
                message: 'V2 runs index not found - skipping visibility check',
                details: [`Missing: ${RUNS_INDEX_PATH}`]
            };
        }

        try {
            const content = fs.readFileSync(indexPath, 'utf-8');
            const data = JSON.parse(content);
            const runs = data.data?.runs || [];

            const issues: string[] = [];

            for (const run of runs) {
                // Check verdict is not UNKNOWN
                if (!run.verdict || run.verdict === 'UNKNOWN') {
                    issues.push(`${run.pack_id}: verdict is UNKNOWN or missing`);
                }

                // Check surfaces for at least some evidence presence
                const surfaces = run.surfaces || {};
                const hasSomeEvidence = Object.values(surfaces).some(v => v === true);
                if (!hasSomeEvidence && run.tier !== 'DECLARED') {
                    issues.push(`${run.pack_id}: no evidence surfaces present for tier ${run.tier}`);
                }
            }

            if (issues.length > 0) {
                return {
                    status: 'FAIL' as const,
                    message: `${issues.length} runs have visibility issues`,
                    details: issues.slice(0, 10) // Limit to first 10
                };
            }

            return {
                status: 'PASS' as const,
                message: `All ${runs.length} V2 runs have valid verdicts and evidence`,
                details: []
            };
        } catch (e) {
            return {
                status: 'FAIL' as const,
                message: `Failed to parse V2 runs index: ${e}`,
                details: []
            };
        }
    }
};
