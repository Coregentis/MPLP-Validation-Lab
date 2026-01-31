import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { readJson, sha256File } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

const SCOPE_FREEZE_PATH = path.resolve('governance/scope-freeze-v2.md');
const PROJECTIONS_ROOT = path.resolve('public/_data/v2');

interface ScopeSSOT {
    scope_ssot_version: string;
    projection_schema_version: string;
    allowed_evidence_maturity_tiers: string[];
    allowed_adjudicable_surfaces: string[];
    frozen_profile_suites: string[];
    allowed_interop_stacks: string[][];
    scope_claims: {
        liability_disclaimer: string;
    };
}

function loadScopeSSOT(): { data: ScopeSSOT; ref: string } {
    if (!fs.existsSync(SCOPE_FREEZE_PATH)) {
        throw new Error(`Critical: Scope Freeze file not found at ${SCOPE_FREEZE_PATH}`);
    }

    const content = fs.readFileSync(SCOPE_FREEZE_PATH, 'utf-8');
    const ref = sha256File(SCOPE_FREEZE_PATH);

    const match = content.match(/```yaml([\s\S]*?)```/);
    if (!match || !match[1]) {
        throw new Error('Critical: No YAML block found in Scope Freeze file');
    }

    const data = yaml.parse(match[1]) as ScopeSSOT;
    return { data, ref };
}

export const gateScopeSSOT: GateDefinition = {
    gate_id: 'GATE-V2-SCOPE-SSOT-01',
    name: 'Enforce strict Projection compliance with Scope SSOT',
    execute: async () => {
        const failures: GateFailure[] = [];

        try {
            // 1. Load Scope SSOT
            const { data: ssot, ref: ssotRef } = loadScopeSSOT();

            // 2. Validate Runs Index
            const runsIndexPath = path.join(PROJECTIONS_ROOT, 'runs', 'index.json');
            if (!fs.existsSync(runsIndexPath)) {
                return fail('GATE-V2-SCOPE-SSOT-01', 'Scope SSOT Check', 'Runs Index not found', [{ message: 'runs/index.json missing', severity: 'error' }]);
            }

            const runsIndex = readJson(runsIndexPath);

            // Check Versioning Matches
            if (runsIndex.scope_ssot_version !== ssot.scope_ssot_version) {
                failures.push({ message: `Runs Index scope_ssot_version mismatch. Expected: ${ssot.scope_ssot_version}, Found: ${runsIndex.scope_ssot_version}`, severity: 'error' });
            }
            if (runsIndex.projection_schema_version !== ssot.projection_schema_version) {
                failures.push({ message: `Runs Index projection_schema_version mismatch. Expected: ${ssot.projection_schema_version}, Found: ${runsIndex.projection_schema_version}`, severity: 'error' });
            }
            if (runsIndex.scope_freeze_ref !== ssotRef) {
                failures.push({ message: `Runs Index scope_freeze_ref mismatch. Expected: ${ssotRef}, Found: ${runsIndex.scope_freeze_ref}`, severity: 'error' });
            }

            // 3. Validate Each Run Projection
            const runsDir = path.join(PROJECTIONS_ROOT, 'runs');
            const runFiles = fs.readdirSync(runsDir).filter(f => f.endsWith('.json') && f !== 'index.json' && !f.includes('.evidence.'));

            for (const file of runFiles) {
                const run = readJson(path.join(runsDir, file));
                const runId = run.data.pack_id;

                // Version Check
                if (run.scope_ssot_version !== ssot.scope_ssot_version) {
                    failures.push({ message: `Run ${runId}: scope_ssot_version mismatch`, severity: 'error', file });
                }

                // Tier Check
                const tier = run.data.evidence_maturity_tier;
                if (!ssot.allowed_evidence_maturity_tiers.includes(tier)) {
                    failures.push({ message: `Run ${runId}: Invalid tier '${tier}'`, severity: 'error', file });
                }

                // Profile Suite Check
                const suite = run.data.profile_suite_id;
                if (suite && !ssot.frozen_profile_suites.includes(suite)) {
                    failures.push({ message: `Run ${runId}: Invalid profile_suite_id '${suite}'`, severity: 'error', file });
                }

                // Surfaces Keys Check
                const surfaces = run.data.adjudicable_surfaces;
                if (surfaces) {
                    const keys = Object.keys(surfaces);
                    for (const k of keys) {
                        if (!ssot.allowed_adjudicable_surfaces.includes(k)) {
                            failures.push({ message: `Run ${runId}: Invalid surface '${k}'`, severity: 'error', file });
                        }
                    }
                }

                // Interop Stack Check
                const stack = run.data.interop_stack;
                const isValidStack = ssot.allowed_interop_stacks.some(allowedRow => {
                    return JSON.stringify(allowedRow) === JSON.stringify(stack);
                });

                if (!isValidStack) {
                    failures.push({ message: `Run ${runId}: Invalid interop_stack ${JSON.stringify(stack)}`, severity: 'error', file });
                }

                // Liability Disclaimer Check
                if (run.data.scope_claims !== ssot.scope_claims.liability_disclaimer) {
                    failures.push({ message: `Run ${runId}: Invalid scope_claims text`, severity: 'error', file });
                }
            }

        } catch (e: any) {
            return fail('GATE-V2-SCOPE-SSOT-01', 'Scope SSOT Check', `Gate crashed: ${e.message}`, [{ message: String(e), severity: 'error' }]);
        }

        if (failures.length > 0) {
            return fail('GATE-V2-SCOPE-SSOT-01', 'Enforce strict Projection compliance with Scope SSOT', `Found ${failures.length} Scope SSOT violations`, failures);
        }

        return pass('GATE-V2-SCOPE-SSOT-01', 'Enforce strict Projection compliance with Scope SSOT');
    }
};
