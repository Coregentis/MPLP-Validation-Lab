import fs from 'node:fs';
import path from 'node:path';
import { glob } from 'glob';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

export const gateDisputeClosure: GateDefinition = {
    gate_id: 'GATE-V2-DISPUTE-CLOSURE-01',
    name: 'Dispute Closure Integrity',
    execute: async () => {
        const failures: GateFailure[] = [];

        // 1. Scan Projections for DISPUTE_READY runs
        const runProjections = await glob('public/_data/v2/runs/*.json', {
            ignore: 'public/_data/v2/runs/index.json'
        });

        let disputeReadyCount = 0;

        for (const runFile of runProjections) {
            if (runFile.endsWith('.evidence.json')) continue;

            const runData = readJson(runFile);
            const run = runData.data;

            if (run.evidence_maturity_tier !== 'DISPUTE_READY') continue;

            disputeReadyCount++;
            const runId = run.pack_id;

            // 2. Validate Dispute Closure Block
            if (!run.dispute_closure) {
                failures.push({ message: `Run ${runId} is DISPUTE_READY but missing 'dispute_closure' block`, severity: 'error', file: runFile });
                continue;
            }

            const closure = run.dispute_closure;

            // Check Fail Signature
            if (!closure.fail_signature || !closure.fail_signature.type || !closure.fail_signature.code) {
                failures.push({ message: `Run ${runId} has invalid fail_signature`, severity: 'error', file: runFile });
            }

            // RC-3: Check for fail_root_cause_pointer
            if (!closure.fail_root_cause_pointer) {
                failures.push({ message: `Run ${runId} missing required field: fail_root_cause_pointer`, severity: 'error', file: runFile });
            }

            // RC-3: Check for replay_instructions_ref
            if (!closure.replay_instructions_ref) {
                failures.push({ message: `Run ${runId} missing required field: replay_instructions_ref`, severity: 'error', file: runFile });
            }

            // Check Clause Hits
            if (!Array.isArray(closure.clause_hits) || closure.clause_hits.length === 0) {
                failures.push({ message: `Run ${runId} has no clause_hits`, severity: 'error', file: runFile });
            }

            // Check Evidence Pointers
            if (!Array.isArray(closure.primary_evidence_pointers) || closure.primary_evidence_pointers.length === 0) {
                failures.push({ message: `Run ${runId} has no primary_evidence_pointers`, severity: 'error', file: runFile });
            } else {
                // Verify Pointers Resolve
                const evidenceFile = runFile.replace('.json', '.evidence.json');
                if (fs.existsSync(evidenceFile)) {
                    const evidenceData = readJson(evidenceFile);
                    for (const ptr of closure.primary_evidence_pointers) {
                        const slice = evidenceData.data[ptr];
                        if (!slice) {
                            failures.push({ message: `Run ${runId} pointer [${ptr}] not resolved in evidence projection`, severity: 'error', file: evidenceFile });
                        } else if (slice.error) {
                            failures.push({ message: `Run ${runId} pointer [${ptr}] resolution error: ${slice.error}`, severity: 'error', file: evidenceFile });
                        }
                    }
                } else {
                    failures.push({ message: `Missing evidence projection for ${runId}`, severity: 'error', file: runFile });
                }
            }
        }

        if (disputeReadyCount === 0) {
            // Not a failure if no dispute runs exist, unless we enforce it in another gate (FAIL-BENCH-01)
            // This gate keeps the logic focused on "If DISPUTE_READY, Then strict closure".
        }

        if (failures.length > 0) {
            return fail('GATE-V2-DISPUTE-CLOSURE-01', 'Dispute Closure Integrity', `Found ${failures.length} closure violations`, failures);
        }

        return pass('GATE-V2-DISPUTE-CLOSURE-01', 'Dispute Closure Verified');
    }
};
