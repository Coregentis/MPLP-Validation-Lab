/**
 * GATE-DOCLET-TOKEN-COVERAGE-01
 * 
 * Ensures all tokens used in Doclets ({{token}}) can be resolved
 * against the current VersionStripModel.
 */

import fs from 'fs';
import path from 'path';
import { getVersionStripModel } from '../../../lib/unified/version-strip-model';

const DOCLETS_DIR = path.join(process.cwd(), 'content/doclets');

function resolveToken(model: any, token: string): boolean {
    const parts = token.split(".");
    let cur = model;
    for (const p of parts) {
        if (cur == null || typeof cur !== "object" || !(p in cur)) return false;
        cur = cur[p];
    }
    return true;
}

export const gate = {
    id: 'GATE-DOCLET-TOKEN-COVERAGE-01',
    name: 'Doclet Token Coverage',
    run: async () => {
        if (!fs.existsSync(DOCLETS_DIR)) return true;

        const files = fs.readdirSync(DOCLETS_DIR).filter(f => f.endsWith('.md'));
        const model = await getVersionStripModel();
        const errors: string[] = [];

        files.forEach(f => {
            const content = fs.readFileSync(path.join(DOCLETS_DIR, f), 'utf-8');
            const matches = content.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g);

            for (const match of matches) {
                const token = match[1];
                if (!resolveToken(model, token)) {
                    errors.push(`Token {{${token}}} in ${f} cannot be resolved against VersionStripModel.`);
                }
            }
        });

        if (errors.length > 0) {
            console.error('Doclet Token Violations:');
            errors.forEach(e => console.error(`- ${e}`));
            console.error('Available keys in root:', Object.keys(model).join(', '));
            return false;
        }

        console.log(`Verified tokens in ${files.length} doclets.`);
        return true;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => process.exit(pass ? 0 : 1));
}
