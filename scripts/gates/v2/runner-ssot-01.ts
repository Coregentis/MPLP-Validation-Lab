import fs from 'node:fs';
import path from 'node:path';
import { type GateDefinition, type GateResult, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-RUNNER-SSOT-01';
const GATE_NAME = 'Runner Seal Integrity (SSOT)';

/**
 * Validates that the manifest.json values for environment provenance 
 * exactly match the runner's metadata (SSOT).
 */
async function execute(): Promise<GateResult> {
    const failures: GateFailure[] = [];
    const RUNS_DIR = path.resolve('data/runs/v2/real');

    if (!fs.existsSync(RUNS_DIR)) {
        return {
            gate_id: GATE_ID,
            name: GATE_NAME,
            exit_code: 0,
            summary: 'No real runs found to verify seal',
            failures: []
        };
    }

    const substrates = fs.readdirSync(RUNS_DIR).filter(f => fs.statSync(path.join(RUNS_DIR, f)).isDirectory());

    for (const substrateId of substrates) {
        const substratePath = path.join(RUNS_DIR, substrateId);
        const runs = fs.readdirSync(substratePath).filter(f => fs.statSync(path.join(substratePath, f)).isDirectory());

        for (const runId of runs) {
            const runPath = path.join(substratePath, runId);
            const manifestPath = path.join(runPath, 'manifest.json');
            const metaPath = path.join(runPath, 'reports', 'runner.meta.json');

            if (!fs.existsSync(manifestPath)) continue;

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            if (manifest.indexability_status !== 'INDEXABLE_REAL') continue;

            // RC-3: Exempt DISPUTE_READY runs from strict runner seal checks (intentional provenance failure)
            if (manifest.evidence_maturity_tier === 'DISPUTE_READY') continue;

            if (!fs.existsSync(metaPath)) {
                failures.push({ file: manifestPath, line: 1, message: 'Missing reports/runner.meta.json (Sealing Evidence Missing)', severity: 'error' });
                continue;
            }

            const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
            const envRef = manifest.env_ref || {};

            // 1. Image Digest Match
            if (envRef.image_digest !== meta.image_digest) {
                failures.push({
                    file: manifestPath,
                    line: 1,
                    message: `Image digest mismatch: manifest(${envRef.image_digest}) vs meta(${meta.image_digest})`,
                    severity: 'error'
                });
            }

            // 2. Executed At Match
            if (envRef.executed_at !== meta.executed_at) {
                failures.push({
                    file: manifestPath,
                    line: 1,
                    message: `Execution timestamp mismatch: manifest(${envRef.executed_at}) vs meta(${meta.executed_at})`,
                    severity: 'error'
                });
            }

            // 3. Fingerprint Match (Deep Compare)
            const manifestFingerprint = JSON.stringify(envRef.environment_fingerprint || {});
            const metaFingerprint = JSON.stringify(meta.environment_fingerprint || {});

            if (manifestFingerprint !== metaFingerprint) {
                failures.push({
                    file: manifestPath,
                    line: 1,
                    message: `Environment fingerprint mismatch: manifest(${manifestFingerprint}) vs meta(${metaFingerprint})`,
                    severity: 'error'
                });
            }
        }
    }

    return {
        gate_id: GATE_ID,
        name: GATE_NAME,
        exit_code: failures.length > 0 ? 1 : 0,
        summary: failures.length > 0
            ? `Found ${failures.length} seal integrity violations`
            : 'All REAL runs have bit-identical seal integrity (Manifest matches Runner SSOT)',
        failures
    };
}

export const gateRunnerSSOT: GateDefinition = {
    gate_id: GATE_ID,
    name: GATE_NAME,
    execute
};
