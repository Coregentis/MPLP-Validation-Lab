import fs from 'node:fs';
import path from 'node:path';
import yaml from 'yaml';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';
import { glob } from 'glob';
import { readJson, sha256File } from '../_lib/io';


export const gateDisputeSSOT: GateDefinition = {
    gate_id: 'GATE-V2-DISPUTE-SSOT-01',
    name: 'Dispute SSOT Integrity',
    execute: async () => {
        const failures: GateFailure[] = [];

        // 1. Validate Dispute Freeze SSOT File
        const ssotPath = path.resolve('governance/dispute-freeze-v2.md');
        if (!fs.existsSync(ssotPath)) {
            return fail('GATE-V2-DISPUTE-SSOT-01', 'SSOT Check', 'Missing SSOT file', [{ message: 'governance/dispute-freeze-v2.md not found', severity: 'error' }]);
        }

        const content = fs.readFileSync(ssotPath, 'utf8');
        const match = content.match(/```yaml([\s\S]*?)```/);

        if (!match || !match[1]) {
            failures.push({ message: 'No embedded YAML block found in dispute-freeze-v2.md', severity: 'error' });
        } else {
            try {
                const doc = yaml.parse(match[1]);
                const ssot = doc.dispute_freeze;

                if (!ssot) {
                    failures.push({ message: 'Missing root key: dispute_freeze', severity: 'error' });
                } else {
                    // Validate Structure
                    if (ssot.version !== 'v2') failures.push({ message: `Invalid version: ${ssot.version}, expected v2`, severity: 'error' });

                    if (!ssot.dispute_types || !ssot.dispute_types.enabled_in_rc3) {
                        failures.push({ message: 'Missing dispute_types.enabled_in_rc3', severity: 'error' });
                    }

                    if (!ssot.dispute_ready_minimum) failures.push({ message: 'Missing dispute_ready_minimum definition', severity: 'error' });

                    // Check Types
                    const enabledTypes = ssot.dispute_types?.enabled_in_rc3 || [];
                    const allowedTypes = ['policy_violation', 'provenance'];

                    enabledTypes.forEach((t: string) => {
                        if (!allowedTypes.includes(t)) {
                            failures.push({ message: `Unknown or disallowed dispute type in enabled_in_rc3: ${t}`, severity: 'error' });
                        }
                    });
                }
            } catch (e: any) {
                failures.push({ message: `Invalid YAML in SSOT: ${e.message}`, severity: 'error' });
            }
        }

        if (failures.length > 0) {
            return fail('GATE-V2-DISPUTE-SSOT-01', 'Dispute SSOT Integrity', `Found ${failures.length} violations`, failures);
        }

        return pass('GATE-V2-DISPUTE-SSOT-01', 'Dispute SSOT Integrity Verified');
    }
};
