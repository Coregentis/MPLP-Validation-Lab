import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';
import { readJson } from '../_lib/io';

const LAYOUT_PATH = path.resolve('app/layout.tsx');
const POLICIES_INDEX_PATH = path.resolve('public/_data/v2/policies-index.json');

export const gateNavDiscoverability: GateDefinition = {
    gate_id: 'GATE-V2-NAV-DISCOVERABILITY-01',
    name: 'Navigation Discoverability Check',
    execute: async (): Promise<GateResult> => {
        const NAV_PATH = path.resolve('app/_ssot/nav.ts');
        const navContent = fs.readFileSync(NAV_PATH, 'utf-8');
        // Check for new Court IA routes
        const requiredLinks = ['/start', '/cases', '/laws', '/policies/reg-mapping'];
        // Check if they are present in the SSOT definitions
        const missing = requiredLinks.filter(l => !navContent.includes(`href: '${l}'`) && !navContent.includes(`href: "${l}"`));

        if (missing.length > 0) {
            return fail('GATE-V2-NAV-DISCOVERABILITY-01', 'Navigation Discoverability Check', 'Missing Links', [{
                message: `SSOT Nav missing required links: ${missing.join(', ')}`,
                severity: 'error'
            }]);
        }

        if (fs.existsSync(POLICIES_INDEX_PATH)) {
            const policies = readJson(POLICIES_INDEX_PATH);
            const hasRegMapping = policies.data.policies.some((p: any) => p.id === 'reg_mapping');
            if (!hasRegMapping) {
                return fail('GATE-V2-NAV-DISCOVERABILITY-01', 'Navigation Discoverability Check', 'Missing Policy', [{
                    message: 'Reg Mapping not found in Policies Index',
                    severity: 'error'
                }]);
            }
        }

        return pass('GATE-V2-NAV-DISCOVERABILITY-01', 'Navigation Discoverability Check', 'Nav structure validated');
    }
};
