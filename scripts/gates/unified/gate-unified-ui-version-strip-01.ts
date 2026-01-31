/**
 * GATE-UNIFIED-UI-VERSION-STRIP-01
 * Static check for Version Strip usage
 */
import fs from 'fs';
import path from 'path';
import { fail, pass, warn, runGate } from '../_lib/gate-runner';

const REQUIRED_PAGES = [
    'app/runs/page.tsx',
    'app/rulesets/page.tsx',
    'app/releases/page.tsx',
    'app/governance/page.tsx'
];

export const gate = {
    id: 'GATE-UNIFIED-UI-VERSION-STRIP-01',
    name: 'UI Version Strip Presence',
    run: async () => {
        const missing: string[] = [];
        const projectRoot = process.cwd();

        for (const relPath of REQUIRED_PAGES) {
            const fullPath = path.join(projectRoot, relPath);
            if (!fs.existsSync(fullPath)) {
                missing.push(`${relPath} (File Not Found)`);
                continue;
            }
            const content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('<VersionStrip')) {
                missing.push(relPath);
            }
        }

        if (missing.length > 0) {
            return fail('Missing VersionStrip in key pages', missing);
        }
        return pass('All key pages include VersionStrip');
    }
};

runGate(gate).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.exit_code);
});
