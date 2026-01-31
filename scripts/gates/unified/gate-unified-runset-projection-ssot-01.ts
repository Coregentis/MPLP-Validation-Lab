/**
 * GATE-UNIFIED-RUNSET-PROJECTION-SSOT-01
 * Checks that the UI Version Model reflects the inventory SSOT
 */
import { fail, pass, runGate } from '../_lib/gate-runner';
import { getVersionStripModel } from '../../../lib/unified/version-strip-model';
import fs from 'fs';
import path from 'path';

export const gate = {
    id: 'GATE-UNIFIED-RUNSET-PROJECTION-SSOT-01',
    name: 'Runset Projection Verification',
    run: async () => {
        const model = await getVersionStripModel();

        // Check V1 inventory presence (naive file check to confirm model loaded it)
        const v1Path = path.join(process.cwd(), 'public/_data/curated-runs.json');
        let v1Expected = 0;
        if (fs.existsSync(v1Path)) {
            const d = JSON.parse(fs.readFileSync(v1Path, 'utf8'));
            v1Expected = d.runs?.length || 0;
        }

        // Check V2 inventory presence
        const v2Path = path.join(process.cwd(), 'public/_data/v2/runs/index.json');
        let v2Expected = 0;
        if (fs.existsSync(v2Path)) {
            const d = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
            v2Expected = d.data?.runs?.length || 0;
        }

        const errors: string[] = [];
        if (model.run_inventory.v1_count !== v1Expected) {
            errors.push(`V1 Run Count Mismatch: Model=${model.run_inventory.v1_count}, File=${v1Expected}`);
        }
        if (model.run_inventory.v2_count !== v2Expected) {
            errors.push(`V2 Run Count Mismatch: Model=${model.run_inventory.v2_count}, File=${v2Expected}`);
        }

        if (errors.length > 0) {
            return fail('Runset Projection Mismatch', errors);
        }

        return pass('Runset Project correctly reflects SSOT inventories', [
            `V1: ${model.run_inventory.v1_count}`,
            `V2: ${model.run_inventory.v2_count}`
        ]);
    }
};

runGate(gate).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.exit_code);
});
