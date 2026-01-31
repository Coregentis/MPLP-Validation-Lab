import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

export const gateProjectionClosure: GateDefinition = {
    gate_id: 'GATE-V2-PROJECTION-CLOSURE-01',
    name: 'Evidence Resolution Integrity',
    execute: async () => {
        const failures: GateFailure[] = [];

        try {
            const runProjections = await glob('public/_data/v2/runs/*.json', {
                ignore: 'public/_data/v2/runs/index.json'
            });

            if (runProjections.length === 0) {
                return fail('GATE-V2-PROJECTION-CLOSURE-01', 'Closure Check', 'No projections found', [{ message: 'No run projections found', severity: 'error' }]);
            }

            for (const runFile of runProjections) {
                if (runFile.endsWith('.evidence.json')) continue;

                const runId = path.basename(runFile, '.json');
                const evidenceFile = path.join(path.dirname(runFile), `${runId}.evidence.json`);

                if (!fs.existsSync(evidenceFile)) {
                    failures.push({ message: `Missing evidence projection for run ${runId}`, severity: 'error', file: runFile });
                    continue;
                }

                const runData = readJson(runFile);
                const evidenceData = readJson(evidenceFile);

                const evaluation = runData.data.evaluation;
                if (!evaluation || !evaluation.results) {
                    continue;
                }

                for (const res of evaluation.results) {
                    const ptr = res.evidence_pointer;
                    const slice = evidenceData.data[ptr];

                    if (!slice) {
                        failures.push({ message: `Pointer [${ptr}] not resolved in evidence projection`, severity: 'error', file: evidenceFile });
                    } else if (slice.error) {
                        failures.push({ message: `Slice capture error for [${ptr}]: ${slice.error}`, severity: 'error', file: evidenceFile });
                    }
                }
            }

        } catch (e: any) {
            return fail('GATE-V2-PROJECTION-CLOSURE-01', 'Closure Check', `Gate crashed: ${e.message}`, [{ message: String(e), severity: 'error' }]);
        }

        if (failures.length > 0) {
            return fail('GATE-V2-PROJECTION-CLOSURE-01', 'Evidence Resolution Integrity', `Found ${failures.length} closure violations`, failures);
        }

        return pass('GATE-V2-PROJECTION-CLOSURE-01', 'Projection Closure Verified');
    }
};
