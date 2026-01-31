import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { readJson } from '../_lib/io';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

export const gateReleaseIdentity: GateDefinition = {
    gate_id: 'GATE-V2-RELEASE-ID-01',
    name: 'Release Identity Integrity',
    execute: async () => {
        const failures: GateFailure[] = [];

        try {
            const rcPath = path.resolve('releases/rc-6/rc-6.json'); // Updated to RC-6
            if (!fs.existsSync(rcPath)) {
                return fail('GATE-V2-RELEASE-ID-01', 'Release Check', 'RC-6 Manifest missing', [{ message: 'Missing releases/rc-6/rc-6.json', severity: 'error' }]);
            }

            const rc = readJson(rcPath);

            // 1. Build ID Check
            if (!/^rc-6-\d{8}$/.test(rc.build_id)) {
                // Strict format: rc-6-YYYYMMDD
                failures.push({ message: `Invalid build_id format: ${rc.build_id}. Expected rc-6-YYYYMMDD`, severity: 'error' });
            }

            // 2. Git Tag Check
            if (!rc.git_tag?.startsWith('lab-v2-rc-')) {
                failures.push({ message: `Invalid git_tag format: ${rc.git_tag}`, severity: 'error' });
            }

            // 3. SSOT Hash Presence Check
            if (!rc.ssot_hashes?.roleModel || !rc.ssot_hashes?.componentRegistry) {
                failures.push({ message: 'Missing critical SSOT hashes in Release Record', severity: 'error' });
            }

            // 4. Verify Gate Report Link
            const gateReportPath = path.resolve(rc.gates?.report_path || 'INVALID');
            if (!fs.existsSync(gateReportPath)) {
                failures.push({ message: `Gate Report not found at ${rc.gates?.report_path}`, severity: 'error' });
            }

        } catch (e: any) {
            return fail('GATE-V2-RELEASE-ID-01', 'Release Check', `Gate crashed: ${e.message}`, [{ message: String(e), severity: 'error' }]);
        }

        if (failures.length > 0) {
            return fail('GATE-V2-RELEASE-ID-01', 'Release Identity Integrity', `Found ${failures.length} identity violations`, failures);
        }

        return pass('GATE-V2-RELEASE-ID-01', 'Release Identity Verified');
    }
};
