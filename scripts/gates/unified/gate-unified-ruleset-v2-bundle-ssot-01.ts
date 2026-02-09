/**
 * GATE-UNIFIED-RULESET-V2-BUNDLE-SSOT-01
 * 
 * Verifies existence and structure of V2 ruleset bundles.
 * Enforces that V2 rulesets have detailed SSOT projection.
 */

import fs from 'fs';
import path from 'path';

const V2_BUNDLE_DIR = path.join(process.cwd(), 'public/_data/v2/rulesets/bundles');
const REQUIRED_BUNDLES = ['2.0.1.json'];

export const gate = {
    id: 'GATE-UNIFIED-RULESET-V2-BUNDLE-SSOT-01',
    name: 'Ruleset V2 Bundle SSOT Audit',
    run: async () => {
        let pass = true;

        if (!fs.existsSync(V2_BUNDLE_DIR)) {
            console.error(`[FAIL] Bundle directory missing: ${V2_BUNDLE_DIR}`);
            return false;
        }

        for (const file of REQUIRED_BUNDLES) {
            const p = path.join(V2_BUNDLE_DIR, file);
            if (!fs.existsSync(p)) {
                console.error(`[FAIL] Missing required ruleset bundle: ${file}`);
                pass = false;
                continue;
            }

            try {
                const content = JSON.parse(fs.readFileSync(p, 'utf-8'));

                // Validate Schema
                if (!content.id || !content.version) {
                    console.error(`[FAIL] ${file} missing id/version`);
                    pass = false;
                }
                if (!Array.isArray(content.clauses) || content.clauses.length === 0) {
                    console.error(`[FAIL] ${file} clauses missing or empty`);
                    pass = false;
                }
                console.log(`[PASS] ${file} validated (${content.clauses.length} clauses)`);

            } catch (e) {
                console.error(`[FAIL] ${file} JSON parse error`, e);
                pass = false;
            }
        }

        return pass;
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(p => process.exit(p ? 0 : 1));
}
