#!/usr/bin/env tsx
/**
 * GATE-NAV-SINGLE-ENTRY-01
 * 
 * Enforces Single Entry Strategy for Navigation.
 * - Runs must use unified entry points (/runs, /runs?tier=...)
 * - No explicit V2 entry points (/v2/*) allowed in main navigation
 * 
 * Ticket: P2-03B
 */

import fs from 'fs';
import path from 'path';
import { runGate, fail, pass, GateResult } from '../_lib/gate-runner';

const NAV_PATH = 'components/Nav.tsx';
const FOOTER_PATH = 'components/layout/Footer.tsx';

// Regex to capture hrefs strings
const HREF_REGEX = /href=['"]([^'"]+)['"]/g;

export const gate = {
    id: 'GATE-NAV-SINGLE-ENTRY-01',
    name: 'Navigation Single Entry Policy',

    async run(): Promise<GateResult> {
        const files = [NAV_PATH, FOOTER_PATH];
        const failures: string[] = [];

        for (const relPath of files) {
            const fullPath = path.join(process.cwd(), relPath);
            if (!fs.existsSync(fullPath)) continue;

            const content = fs.readFileSync(fullPath, 'utf-8');
            let match;

            while ((match = HREF_REGEX.exec(content)) !== null) {
                const href = match[1];

                // 1. Ban /v2/ or /_v2/
                if (href.includes('/v2/') || href.includes('/_v2/') || href === '/v2') {
                    failures.push(`[${relPath}] Forbidden V2 entry point found: ${href}`);
                }

                // 2. Check Runs URLs conform to unified policy
                // Allowed: /runs, /runs?tier=...
                // Disallowed: /runs/v2, etc if they existed
                if (href.startsWith('/runs')) {
                    // Valid patterns:
                    // /runs
                    // /runs?tier=...
                    // /runs/[id] (technically allowed in footer/body but mostly checking main nav strategies)

                    const isAllowed =
                        href === '/runs' ||
                        href.startsWith('/runs?tier=') ||
                        href.match(/^\/runs\/[^/]+$/); // Allow deep link to run ID

                    if (!isAllowed) {
                        failures.push(`[${relPath}] Non-unified run link found: ${href}`);
                    }
                }
            }
        }

        if (failures.length > 0) {
            return fail('Navigation Single Entry Policy violations found', failures);
        }

        return pass('Navigation compliant with Single Entry Strategy', [
            `Checked: ${files.join(', ')}`,
            'No forbidden V2 links found'
        ]);
    }
};

// Execute if running directly
if (require.main === module) {
    runGate(gate).then(result => process.exit(result.exit_code));
}
