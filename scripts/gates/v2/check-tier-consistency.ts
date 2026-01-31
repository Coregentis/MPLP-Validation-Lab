import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

const PROJECTIONS_ROOT = path.resolve('public/_data/v2');

export const gateTierConsistency: GateDefinition = {
    gate_id: 'GATE-V2-TIER-CONSISTENCY-01',
    name: 'Strict Tier Consistency Logic (REPRODUCED Closure)',
    execute: async () => {
        const failures: GateFailure[] = [];

        try {
            const runsDir = path.join(PROJECTIONS_ROOT, 'runs');
            if (!fs.existsSync(runsDir)) {
                return fail('GATE-V2-TIER-CONSISTENCY-01', 'Tier Consistency', 'Runs dir missing', [{ message: 'runs dir missing', severity: 'error' }]);
            }

            const runFiles = fs.readdirSync(runsDir).filter(f => f.endsWith('.json') && f !== 'index.json' && !f.includes('.evidence.'));

            for (const file of runFiles) {
                const run = readJson(path.join(runsDir, file));
                const data = run.data;
                const tier = data.evidence_maturity_tier;
                const runId = data.pack_id;

                if (tier === 'REPRODUCED') {
                    // C1: Canonical Hash Closure
                    if (!data.hashes?.canonical_pack_root_hash) {
                        failures.push({ message: `Run ${runId} [REPRODUCED] missing canonical_pack_root_hash`, severity: 'error', file });
                    }

                    // C2: Verification Status
                    if (data.verify?.overall_status !== 'VERIFIED') {
                        failures.push({ message: `Run ${runId} [REPRODUCED] verify status is ${data.verify?.overall_status}, expected VERIFIED`, severity: 'error', file });
                    }

                    // C3: Hash Match
                    if (data.verify?.hash_verification?.match !== true) {
                        failures.push({ message: `Run ${runId} [REPRODUCED] hash verification match is not true`, severity: 'error', file });
                    }

                    // C4: Repro Command
                    if (!data.repro?.command) {
                        failures.push({ message: `Run ${runId} [REPRODUCED] missing repro command`, severity: 'error', file });
                    }

                    // C5: Pointers Existence
                    if (!data.pointers || Object.keys(data.pointers).length === 0) {
                        failures.push({ message: `Run ${runId} [REPRODUCED] missing pointers`, severity: 'error', file });
                    }
                }

                // Note: 'DISPUTE_READY' checks deferred to RC-3 as per plan
            }

        } catch (e: any) {
            return fail('GATE-V2-TIER-CONSISTENCY-01', 'Tier Consistency', `Gate crashed: ${e.message}`, [{ message: String(e), severity: 'error' }]);
        }

        if (failures.length > 0) {
            return fail('GATE-V2-TIER-CONSISTENCY-01', 'Strict Tier Consistency Logic', `Found ${failures.length} tier consistency violations`, failures);
        }

        return pass('GATE-V2-TIER-CONSISTENCY-01', 'Strict Tier Consistency Logic');
    }
};
