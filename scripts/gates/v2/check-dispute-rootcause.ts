import { glob } from 'glob';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

export const gateDisputeRootCause: GateDefinition = {
    gate_id: 'GATE-V2-DISPUTE-ROOTCAUSE-01',
    name: 'Dispute Root Cause Compliance',
    execute: async () => {
        const failures: GateFailure[] = [];

        // 1. Scan Projections
        const runProjections = await glob('public/_data/v2/runs/*.json', {
            ignore: 'public/_data/v2/runs/index.json'
        });

        const ALLOWED_ROOT_CAUSES = ['policy_violation', 'provenance'];
        const RESERVED_ROOT_CAUSES = ['determinism', 'integrity'];

        for (const runFile of runProjections) {
            if (runFile.endsWith('.evidence.json')) continue;

            const runData = readJson(runFile);
            const run = runData.data;

            if (run.evidence_maturity_tier !== 'DISPUTE_READY') continue;

            const closure = run.dispute_closure;
            if (!closure || !closure.fail_signature) continue; // Handled by CLOSURE gate

            const failType = closure.fail_signature.type;

            // Check against Allowlist
            if (!ALLOWED_ROOT_CAUSES.includes(failType)) {
                let msg = `Run ${run.pack_id} uses disallowed root cause: '${failType}'.`;

                if (RESERVED_ROOT_CAUSES.includes(failType)) {
                    msg += ` This cause is RESERVED and not enabled in RC-3. Subtle determinism faults are prohibited.`;
                } else {
                    msg += ` Allowed: ${ALLOWED_ROOT_CAUSES.join(', ')}.`;
                }

                failures.push({ message: msg, severity: 'error', file: runFile });
            }
        }

        if (failures.length > 0) {
            return fail('GATE-V2-DISPUTE-ROOTCAUSE-01', 'Root Cause Violation', `Found ${failures.length} invalid root causes`, failures);
        }

        return pass('GATE-V2-DISPUTE-ROOTCAUSE-01', 'Root Causes Verified');
    }
};
