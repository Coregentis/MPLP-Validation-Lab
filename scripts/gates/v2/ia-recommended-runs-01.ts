import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import path from 'node:path';

const PROJECTION_PATH = path.resolve('public/_data/v2/recommended.json');
const RUNS_INDEX_PATH = path.resolve('public/_data/v2/runs/index.json');

export const gateIARecommendedRuns: GateDefinition = {
    gate_id: 'GATE-V2-RECOMMENDED-RUNS-01',
    name: 'IA Recommended Runs Integrity',
    execute: async (): Promise<GateResult> => {
        if (!fs.existsSync(PROJECTION_PATH) || !fs.existsSync(RUNS_INDEX_PATH)) {
            return fail('GATE-V2-RECOMMENDED-RUNS-01', 'IA Recommended Runs Integrity', 'Projections missing', [{
                message: 'recommended.json or runs/index.json not found',
                severity: 'error'
            }]);
        }

        const recommended = readJson(PROJECTION_PATH);
        const index = readJson(RUNS_INDEX_PATH);

        const availableRuns = new Set(index.data.runs.map((r: any) => r.pack_id));
        const recommendedList = recommended.data?.recommended;

        if (!Array.isArray(recommendedList)) {
            return fail('GATE-V2-RECOMMENDED-RUNS-01', 'IA Recommended Runs Integrity', 'Invalid format', [{
                message: 'recommended list is not an array',
                severity: 'error'
            }]);
        }

        for (const item of recommendedList) {
            if (!availableRuns.has(item.run_id)) {
                return fail('GATE-V2-RECOMMENDED-RUNS-01', 'IA Recommended Runs Integrity', 'Invalid Run ID', [{
                    message: `Recommended run ID not found in inventory: ${item.run_id}`,
                    severity: 'error'
                }]);
            }
        }

        return pass('GATE-V2-RECOMMENDED-RUNS-01', 'IA Recommended Runs Integrity', 'Recommended runs verified against inventory');
    }
};
