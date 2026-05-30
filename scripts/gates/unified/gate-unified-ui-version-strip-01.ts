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

function hasGlobalVersionStrip(projectRoot: string): boolean {
    const appLayoutPath = path.join(projectRoot, 'app/layout.tsx');
    const appShellPath = path.join(projectRoot, 'components/layout/AppShell.tsx');
    if (!fs.existsSync(appLayoutPath) || !fs.existsSync(appShellPath)) {
        return false;
    }

    const appLayout = fs.readFileSync(appLayoutPath, 'utf8');
    const appShell = fs.readFileSync(appShellPath, 'utf8');
    return appLayout.includes('<AppShell>') && appShell.includes('<VersionStrip');
}

export const gate = {
    id: 'GATE-UNIFIED-UI-VERSION-STRIP-01',
    name: 'UI Version Strip Presence',
    run: async () => {
        const missing: string[] = [];
        const projectRoot = process.cwd();
        const globalVersionStrip = hasGlobalVersionStrip(projectRoot);

        for (const relPath of REQUIRED_PAGES) {
            const fullPath = path.join(projectRoot, relPath);
            if (!fs.existsSync(fullPath)) {
                missing.push(`${relPath} (File Not Found)`);
                continue;
            }
            if (globalVersionStrip) {
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
        return pass(globalVersionStrip
            ? 'All key pages inherit VersionStrip from AppShell'
            : 'All key pages include VersionStrip');
    }
};

runGate(gate).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.exit_code);
});
