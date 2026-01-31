import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import path from 'node:path';

const PROJECTION_PATH = path.resolve('public/_data/v2/ia-entrypoints.json');

export const gateIAEntrypoints: GateDefinition = {
    gate_id: 'GATE-V2-IA-ENTRYPOINTS-01',
    name: 'IA Entrypoints Integrity',
    execute: async (): Promise<GateResult> => {
        if (!fs.existsSync(PROJECTION_PATH)) {
            return fail('GATE-V2-IA-ENTRYPOINTS-01', 'IA Entrypoints Integrity', 'Projection missing', [{
                message: 'ia-entrypoints.json not found. Run projection build.',
                severity: 'error'
            }]);
        }

        const projection = readJson(PROJECTION_PATH);
        const roles = projection.data?.roles;

        if (!Array.isArray(roles) || roles.length === 0) {
            return fail('GATE-V2-IA-ENTRYPOINTS-01', 'IA Entrypoints Integrity', 'No roles', [{
                message: 'Roles array empty or missing',
                severity: 'error'
            }]);
        }

        const requiredRoles = ['architect', 'compliance', 'auditor', 'builder'];
        const foundRoles = roles.map((r: any) => r.id);
        const missing = requiredRoles.filter(r => !foundRoles.includes(r));

        if (missing.length > 0) {
            return fail('GATE-V2-IA-ENTRYPOINTS-01', 'IA Entrypoints Integrity', 'Missing roles', [{
                message: `Missing required roles: ${missing.join(', ')}`,
                severity: 'error'
            }]);
        }

        for (const role of roles) {
            for (const p of role.primary_path) {
                if (!p.url.startsWith('/') && !p.url.startsWith('http')) {
                    return fail('GATE-V2-IA-ENTRYPOINTS-01', 'IA Entrypoints Integrity', 'Invalid URL', [{
                        message: `Invalid URL format: ${p.url} in role ${role.id}`,
                        severity: 'error'
                    }]);
                }
            }
        }

        return pass('GATE-V2-IA-ENTRYPOINTS-01', 'IA Entrypoints Integrity', 'All entrypoints validated');
    }
};
