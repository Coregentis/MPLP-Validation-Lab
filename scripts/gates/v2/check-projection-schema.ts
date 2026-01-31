import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

const PROJECTIONS_ROOT = path.resolve('public/_data/v2');

export const gateProjectionSchema: GateDefinition = {
    gate_id: 'GATE-V2-PROJECTION-SCHEMA-01',
    name: 'Projection JSON Schema Validation',
    execute: async () => {
        const failures: GateFailure[] = [];

        try {
            // 1. Validate Runs Index Structure
            const runsIndexPath = path.join(PROJECTIONS_ROOT, 'runs', 'index.json');
            if (!fs.existsSync(runsIndexPath)) {
                return fail('GATE-V2-PROJECTION-SCHEMA-01', 'Schema Validation', 'Runs Index missing', [{ message: 'runs/index.json missing', severity: 'error' }]);
            }

            const runsIndex = readJson(runsIndexPath);
            if (runsIndex.projection_type !== 'runs_index') failures.push({ message: 'runs/index.json invalid projection_type', severity: 'error' });
            if (!Array.isArray(runsIndex.data?.runs)) failures.push({ message: 'runs/index.json missing data.runs array', severity: 'error' });
            if (!runsIndex.data?.facets) failures.push({ message: 'runs/index.json missing data.facets', severity: 'error' });

            // 2. Validate Run Detail Structure
            const runsDir = path.join(PROJECTIONS_ROOT, 'runs');
            const runFiles = fs.readdirSync(runsDir).filter(f => f.endsWith('.json') && f !== 'index.json' && !f.includes('.evidence.'));

            for (const file of runFiles) {
                const run = readJson(path.join(runsDir, file));

                // Top Level
                if (run.projection_type !== 'run_detail') failures.push({ message: `Run ${file}: invalid projection_type`, severity: 'error', file });
                if (!run.generated_at) failures.push({ message: `Run ${file}: missing generated_at`, severity: 'error', file });
                if (!run.source_version) failures.push({ message: `Run ${file}: missing source_version`, severity: 'error', file });

                // Data Block
                const data = run.data;
                if (!data) {
                    failures.push({ message: `Run ${file}: missing data block`, severity: 'error', file });
                    continue;
                }

                if (!data.pack_id) failures.push({ message: `Run ${file}: missing data.pack_id`, severity: 'error', file });

                // Provenance Structure
                if (!data.provenance?.substrate_ref) failures.push({ message: `Run ${file}: missing substrate_ref`, severity: 'error', file });
                if (!data.provenance?.env_ref) failures.push({ message: `Run ${file}: missing env_ref`, severity: 'error', file });

                // Hashes
                if (!data.hashes?.pack_root_hash) failures.push({ message: `Run ${file}: missing pack_root_hash`, severity: 'error', file });

                // Evaluation (if present)
                if (data.evaluation && Array.isArray(data.evaluation.results)) {
                    for (const res of data.evaluation.results) {
                        if (!res.evidence_pointer) failures.push({ message: `Run ${file}: clauses result missing evidence_pointer`, severity: 'error', file });
                        if (!res.evidence_pointer.startsWith('mplp://')) failures.push({ message: `Run ${file}: invalid pointer schema ${res.evidence_pointer}`, severity: 'error', file });
                    }
                }
            }

        } catch (e: any) {
            return fail('GATE-V2-PROJECTION-SCHEMA-01', 'Schema Validation', `Gate crashed: ${e.message}`, [{ message: String(e), severity: 'error' }]);
        }

        if (failures.length > 0) {
            return fail('GATE-V2-PROJECTION-SCHEMA-01', 'Projection JSON Schema Validation', `Found ${failures.length} schema violations`, failures);
        }

        return pass('GATE-V2-PROJECTION-SCHEMA-01', 'Projection JSON Schema Validation');
    }
};
