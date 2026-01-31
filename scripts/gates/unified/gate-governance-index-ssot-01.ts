#!/usr/bin/env tsx
/**
 * GATE-GOVERNANCE-INDEX-SSOT-01
 * 
 * Verifies the integrity of the Governance Index SSOT.
 * 
 * Ticket: P2-02D
 */

import fs from 'fs';
import path from 'path';
import { runGate, fail, pass, GateResult } from '../_lib/gate-runner';

const INDEX_PATH = 'public/_data/governance/index.json';

interface GovernanceEntry {
    id: string;
    title: string;
    description: string;
    href: string;
    scope: string;
    tier: string;
}

interface GovernanceData {
    version: string;
    generated_at: string;
    entries: GovernanceEntry[];
}

export const gate = {
    id: 'GATE-GOVERNANCE-INDEX-SSOT-01',
    name: 'Governance Index SSOT Integrity',

    async run(): Promise<GateResult> {
        const fullPath = path.join(process.cwd(), INDEX_PATH);

        if (!fs.existsSync(fullPath)) {
            return fail(`Governance index not found at ${INDEX_PATH}`);
        }

        let data: GovernanceData;
        try {
            data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        } catch (e) {
            return fail(`Failed to parse governance index: ${e instanceof Error ? e.message : String(e)}`);
        }

        const details: string[] = [];
        const ids = new Set<string>();
        let hasErrors = false;

        // Check entries
        if (!Array.isArray(data.entries)) {
            return fail('Governance index "entries" must be an array');
        }

        for (const entry of data.entries) {
            // Check ID uniqueness
            if (ids.has(entry.id)) {
                details.push(`Duplicate ID found: ${entry.id}`);
                hasErrors = true;
            }
            ids.add(entry.id);

            // Check href format
            if (!entry.href.startsWith('/')) {
                details.push(`Entry "${entry.title}" href must start with /: ${entry.href}`);
                hasErrors = true;
            }

            // Verify link target exists (simple check: does a page/directory exist?)
            // This is a heuristic: check if app/{href}/page.tsx or app/{href}.tsx exists
            // Handles basic routes like /policies
            const routePath = entry.href.replace(/^\//, '');
            const pagePathDir = path.join(process.cwd(), 'app', routePath, 'page.tsx');
            const pagePathFile = path.join(process.cwd(), 'app', `${routePath}.tsx`);

            if (!fs.existsSync(pagePathDir) && !fs.existsSync(pagePathFile)) {
                // Try looking for dynamic routes if needed, but for now strict check
                // Allow matching query params (ignore them)
                const cleanPath = routePath.split('?')[0];
                const cleanPagePathDir = path.join(process.cwd(), 'app', cleanPath, 'page.tsx');

                if (!fs.existsSync(cleanPagePathDir)) {
                    details.push(`Entry "${entry.title}" targets missing route: ${entry.href}`);
                    hasErrors = true;
                }
            }
        }

        if (hasErrors) {
            return fail('Governance Index contains invalid entries', details);
        }

        return pass(`Verified ${data.entries.length} governance entries`, [
            `Version: ${data.version}`,
            `Entries: ${data.entries.map(e => e.id).join(', ')}`
        ]);
    }
};

// Execute if running directly
if (require.main === module) {
    runGate(gate).then(result => process.exit(result.exit_code));
}
