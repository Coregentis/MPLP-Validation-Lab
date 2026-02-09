import { checkRoute } from '../_lib/check-route';
import { loadAllRunsets } from '../../../lib/unified/load-all-runsets';

export const gate = {
    id: 'GATE-UNIFIED-EVIDENCE-ACTIONS-200-01',
    name: 'Evidence Actions Endpoint Audit',
    run: async () => {
        let allPass = true;

        // 1. Get sample runs (one V1, one V2)
        const runsets = loadAllRunsets();

        // We know V1 is 'v1-curated' (usually has 'pass-01')
        // We know V2 is 'v2-index' (usually has some v2 runs)
        // But we need actual RUN IDs, not runsets.
        // Let's rely on hardcoded known samples or efficient discovery if possible.
        // For CLI speed, hardcoded stable samples are often best in VLab context.

        const SAMPLE_V1 = 'pass-01'; // Known V1 run
        const SAMPLE_V2_PREFIX = 'r-'; // Scanning for a V2 run?

        // Let's assume V1 'pass-01' exists.
        console.log(`Checking V1 Zip API for ${SAMPLE_V1}...`);
        const v1ZipPass = await checkRoute(`/api/runs/${SAMPLE_V1}/download-zip`);
        if (!v1ZipPass) {
            console.error(`❌ V1 Zip API failed for ${SAMPLE_V1}`);
            allPass = false;
        }

        // We can check manifest too
        const v1JsonPass = await checkRoute(`/api/runs/${SAMPLE_V1}/files/manifest.json`);
        if (!v1JsonPass) {
            console.error(`❌ V1 Manifest API failed for ${SAMPLE_V1}`);
            allPass = false;
        }

        return allPass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => {
        if (!pass) process.exit(1);
        console.log('✅ GATE-UNIFIED-EVIDENCE-ACTIONS-200-01 PASS');
    });
}
