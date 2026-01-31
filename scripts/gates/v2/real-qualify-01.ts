import fs from 'node:fs';
import path from 'node:path';
import { type GateDefinition, type GateResult, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-REAL-QUALIFY-01';
const GATE_NAME = 'Real Provenance Qualification';

/**
 * Enforces strict provenance requirements for any pack labeled INDEXABLE_REAL.
 * 
 * Checks:
 * 1. substrate_ref: upstream_tag and upstream_commit_sha must be present and valid.
 * 2. lock_ref: lock_sha256 must be present and valid.
 * 3. env_ref: runner_type must be 'container' and image_digest must be present.
 * 4. hashes: canonical_pack_root_hash must be present.
 */
async function execute(): Promise<GateResult> {
    const failures: GateFailure[] = [];
    const RUNS_DIR = path.resolve('data/runs/v2/real');

    if (!fs.existsSync(RUNS_DIR)) {
        return {
            gate_id: GATE_ID,
            name: GATE_NAME,
            exit_code: 0,
            summary: 'No real runs found to qualify',
            failures: []
        };
    }

    // Walk substrates
    const substrates = fs.readdirSync(RUNS_DIR).filter(f => fs.statSync(path.join(RUNS_DIR, f)).isDirectory());

    for (const substrateId of substrates) {
        const substratePath = path.join(RUNS_DIR, substrateId);
        const runs = fs.readdirSync(substratePath).filter(f => fs.statSync(path.join(substratePath, f)).isDirectory());

        for (const runId of runs) {
            const manifestPath = path.join(substratePath, runId, 'manifest.json');
            if (!fs.existsSync(manifestPath)) continue;

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

            // Only qualify INDEXABLE_REAL
            if (manifest.indexability_status !== 'INDEXABLE_REAL') continue;

            // RC-3: Exempt DISPUTE_READY runs from strict qualification (as they are intentional failures)
            if (manifest.evidence_maturity_tier === 'DISPUTE_READY') continue;

            // 1. Substrate Ref (Dual-Mode)
            const substrateRef = manifest.substrate_ref;
            if (!substrateRef) {
                failures.push({ file: manifestPath, line: 1, message: 'Missing substrate_ref in REAL run', severity: 'error' });
            } else {
                const isGithub = substrateRef.upstream_repo?.includes('github.com');
                const tag = substrateRef.upstream_tag;
                const sha = substrateRef.upstream_commit_sha;

                // Tag is always required (pinned version)
                if (!tag || tag === 'unknown' || tag === 'pending') {
                    failures.push({ file: manifestPath, line: 1, message: `Invalid/missing upstream_tag: ${tag}`, severity: 'error' });
                }

                // SHA is required for GitHub sources
                if (isGithub && (!sha || sha === 'unknown' || sha === 'pending')) {
                    failures.push({ file: manifestPath, line: 1, message: `GitHub source requires upstream_commit_sha: ${sha}`, severity: 'error' });
                }
            }

            // 2. Lock Ref (Integrity check for Registry sources)
            const lockRef = manifest.lock_ref;
            if (!lockRef) {
                failures.push({ file: manifestPath, line: 1, message: 'Missing lock_ref in REAL run', severity: 'error' });
            } else if (!lockRef.lock_sha256 || lockRef.lock_sha256 === 'unknown' || lockRef.lock_sha256 === 'pending') {
                failures.push({ file: manifestPath, line: 1, message: `Invalid/missing lock_sha256: ${lockRef.lock_sha256}`, severity: 'error' });
            }

            // 3. Env Ref (Sealing Check)
            const envRef = manifest.env_ref;
            if (!envRef) {
                failures.push({ file: manifestPath, line: 1, message: 'Missing env_ref in REAL run', severity: 'error' });
            } else {
                if (envRef.runner_type !== 'container') {
                    failures.push({ file: manifestPath, line: 1, message: `Invalid runner_type for REAL: ${envRef.runner_type}. Must be 'container'.`, severity: 'error' });
                }
                if (!envRef.image_digest || envRef.image_digest.startsWith('unknown')) {
                    failures.push({ file: manifestPath, line: 1, message: 'Missing/invalid image_digest (Runner Seal missing)', severity: 'error' });
                }
            }

            // 4. Canonical Hash
            if (!manifest.hashes?.canonical_pack_root_hash) {
                failures.push({ file: manifestPath, line: 1, message: 'Missing canonical_pack_root_hash (Canonical Seal missing)', severity: 'error' });
            }
        }
    }

    return {
        gate_id: GATE_ID,
        name: GATE_NAME,
        exit_code: failures.length > 0 ? 1 : 0,
        summary: failures.length > 0
            ? `Found ${failures.length} qualification issues in REAL runs`
            : 'All REAL runs meet provenance qualification standards',
        failures
    };
}

export const gateRealQualify: GateDefinition = {
    gate_id: GATE_ID,
    name: GATE_NAME,
    execute
};
