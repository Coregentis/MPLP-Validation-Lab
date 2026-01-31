
import fs from 'node:fs';
import path from 'node:path';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';
import { loadYaml } from '../_lib/io';

export const gateRegMappingDisclaimer: GateDefinition = {
    gate_id: 'GATE-V2-REG-MAPPING-DISCLAIMER-01',
    name: 'Reg Mapping UI Disclaimer',
    execute: async () => {
        const failures: GateFailure[] = [];

        const BINDINGS_PATH = path.resolve('governance/ux/page-bindings-v1.yaml');
        if (!fs.existsSync(BINDINGS_PATH)) {
            failures.push({ message: 'Page Bindings SSOT not found', severity: 'error' });
        } else {
            const bindings = loadYaml(BINDINGS_PATH);
            const regPage = bindings.pages ? bindings.pages.find((p: any) => p.id === 'reg_mapping') : null;

            if (!regPage) {
                failures.push({ message: 'reg_mapping binding missing in SSOT', severity: 'error' });
            } else {
                if (!regPage.blocks.includes('BLOCK_DISCLAIMER_BANNER')) {
                    failures.push({ message: 'Reg Mapping page missing mandatory BLOCK_DISCLAIMER_BANNER', severity: 'error' });
                }
            }
        }

        if (failures.length > 0) {
            return fail('GATE-V2-REG-MAPPING-DISCLAIMER-01', 'Reg Mapping UI Disclaimer', `Found ${failures.length} violations`, failures);
        }

        return pass('GATE-V2-REG-MAPPING-DISCLAIMER-01', 'Disclaimer Presence Verified');
    }
};
