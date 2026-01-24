import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const FMM_DATA_PATH = path.join(PROJECT_ROOT, 'public/_data/fmm.json');
const GENERATOR_PATH = path.join(PROJECT_ROOT, 'scripts/generate-fmm.mjs');

/**
 * VLAB-GATE-10: FMM SSOT Derivation Check
 * Ensures public/_data/fmm.json is fresh and consistent with governance SSOTs.
 */

function runGate10() {
    console.log('🛡️  Running VLAB-GATE-10: FMM SSOT Derivation Check...');

    if (!fs.existsSync(FMM_DATA_PATH)) {
        console.error('❌ FMM data file missing.');
        process.exit(1);
    }

    const currentFmm = fs.readFileSync(FMM_DATA_PATH, 'utf8');

    // Run the generator to produce a fresh version
    console.log('🔄 Re-generating FMM for consistency check...');
    execSync(`node ${GENERATOR_PATH}`, { stdio: 'pipe' });

    const newFmm = fs.readFileSync(FMM_DATA_PATH, 'utf8');

    if (currentFmm !== newFmm) {
        console.error('❌ FMM Drift Detected: public/_data/fmm.json is out of sync with governance SSOTs.');
        console.error('👉 Run "node scripts/generate-fmm.mjs" to update.');
        process.exit(1);
    }

    console.log('🟢 Gate PASS: FMM is consistent with SSOT.');
}

runGate10();
