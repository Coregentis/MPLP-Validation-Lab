/**
 * GATE-UNIFIED-NAV-ENTRY-CLOSURE-01
 * 
 * Static analysis of components/Nav.tsx to ensure:
 * 1. Required top-level links exist (/runsets, /runs, etc.)
 * 2. No legacy /v2/ paths or runset-v2 slugs
 */

import fs from 'fs';
import path from 'path';

const NAV_FILE = path.join(process.cwd(), 'components/Nav.tsx');

const REQUIRED_LINKS = [
    '/runs',
    '/runsets',
    '/rulesets',
    '/governance',
    '/releases'
];

const FORBIDDEN_PATTERNS = [
    '/v2/',
    'runset-v2.'
];

export const gate = {
    id: 'GATE-UNIFIED-NAV-ENTRY-CLOSURE-01',
    name: 'Nav Entry Closure Audit',
    run: async () => {
        if (!fs.existsSync(NAV_FILE)) {
            console.error(`[FAIL] Nav file not found: ${NAV_FILE}`);
            return false;
        }

        const content = fs.readFileSync(NAV_FILE, 'utf-8');
        let pass = true;

        // Check required links
        for (const link of REQUIRED_LINKS) {
            // Check for presence of the link string literal (simple heuristic for config arrays)
            if (!content.includes(`'${link}'`) && !content.includes(`"${link}"`)) {
                console.error(`[FAIL] Missing required link: ${link}`);
                pass = false;
            } else {
                console.log(`[PASS] Found link: ${link}`);
            }
        }

        // Check forbidden patterns
        for (const forbidden of FORBIDDEN_PATTERNS) {
            if (content.includes(forbidden)) {
                console.error(`[FAIL] Found forbidden pattern: ${forbidden}`);
                pass = false;
            } else {
                console.log(`[PASS] No forbidden pattern: ${forbidden}`);
            }
        }

        return pass;
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(p => process.exit(p ? 0 : 1));
}
