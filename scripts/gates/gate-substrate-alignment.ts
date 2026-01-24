import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const PROJECT_ROOT = process.cwd();
const ALLOWLIST_PATH = path.join(PROJECT_ROOT, 'data/curated-runs/allowlist.yaml');

async function main() {
    console.log('🛡️  Running VLAB-GATE-08: Substrate Fingerprint Alignment...');
    let failures = 0;

    const allowlist: any = yaml.load(fs.readFileSync(ALLOWLIST_PATH, 'utf-8'));

    for (const run of allowlist.runs) {
        if (!run.indexable) continue;

        // 1. Fingerprint Ref Check
        if (!run.substrate_fingerprint_ref) {
            console.error(`❌ Indexable run ${run.run_id} is missing substrate_fingerprint_ref`);
            failures++;
        } else {
            const fpPath = path.join(PROJECT_ROOT, run.substrate_fingerprint_ref);
            if (!fs.existsSync(fpPath)) {
                console.error(`❌ Fingerprint file not found for ${run.run_id}: ${run.substrate_fingerprint_ref}`);
                failures++;
            }
        }

        // 2. Fieldmap Ref Check
        if (!run.fieldmap_ref) {
            console.error(`❌ Indexable run ${run.run_id} is missing fieldmap_ref`);
            failures++;
        } else {
            const fmPath = path.join(PROJECT_ROOT, run.fieldmap_ref);
            if (!fs.existsSync(fmPath)) {
                console.error(`❌ Fieldmap file not found for ${run.run_id}: ${run.fieldmap_ref}`);
                failures++;
            }
        }
    }

    if (failures > 0) {
        process.exit(1);
    } else {
        console.log('🟢 Gate PASS: All indexable runs have valid fingerprints and fieldmaps.');
        process.exit(0);
    }
}

main();
