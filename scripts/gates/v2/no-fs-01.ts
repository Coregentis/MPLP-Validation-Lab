import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { glob } from 'glob';
import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve('app');

export const gateNoFS: GateDefinition = {
    gate_id: 'GATE-V2-NO-FS-01',
    name: 'Runtime Integrity (No FS)',
    execute: async (): Promise<GateResult> => {
        if (!fs.existsSync(APP_ROOT)) {
            return fail('GATE-V2-NO-FS-01', 'Runtime Integrity (No FS)', 'System Error', [{
                message: 'app directory not found',
                severity: 'error'
            }]);
        }

        const files = await glob(path.join(APP_ROOT, '**/*.{ts,tsx}'));
        const violations: { file: string, message: string }[] = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');

            if (content.match(/from ['"](node:)?fs(\/promises)?['"]/)) {
                violations.push({
                    file: path.relative(process.cwd(), file),
                    message: 'Importing fs module'
                });
            }
            if (content.match(/require\(['"](node:)?fs(\/promises)?['"]\)/)) {
                violations.push({
                    file: path.relative(process.cwd(), file),
                    message: 'Requiring fs module'
                });
            }
        }

        if (violations.length > 0) {
            return fail('GATE-V2-NO-FS-01', 'Runtime Integrity (No FS)', 'FS Usage Detected', violations.map(v => ({
                message: v.message,
                file: v.file,
                severity: 'error'
            })));
        }

        return pass('GATE-V2-NO-FS-01', 'Runtime Integrity (No FS)', 'No runtime FS access detected');
    }
};
