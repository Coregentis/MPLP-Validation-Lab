/**
 * GATE-UNIFIED-RULESET-DETAIL-DENSITY-01
 * 
 * Verifies V2 ruleset detail page renders clauses.
 */

import { checkRoute } from '../_lib/check-route';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://localhost:3000';
const TARGET_URL = `${BASE_URL}/rulesets/ruleset-v2.0.1`;

export const gate = {
    id: 'GATE-UNIFIED-RULESET-DETAIL-DENSITY-01',
    name: 'Ruleset V2 Information Density Audit',
    run: async () => {
        try {
            const res = await fetch(TARGET_URL);
            if (res.status !== 200) {
                console.error(`[FAIL] Failed to fetch ${TARGET_URL}: ${res.status}`);
                return false;
            }

            const html = await res.text();
            const $ = cheerio.load(html);

            // Check for clauses
            // Heuristic: Look for list items that contain "1." or "Determinism" or specific class
            // or just Look for the text we know is in the bundle

            const pageText = $('body').text();

            if (!pageText.includes("Deterministic Replay")) {
                console.error('[FAIL] "Deterministic Replay" clause not found in rendered page');
                return false;
            }

            // Check for requirements section
            if (!pageText.includes("Determinism Check") && !pageText.includes("PROV-001")) {
                console.error('[FAIL] Requirements (PROV-001) not found');
                return false;
            }

            console.log('[PASS] V2 Information Density Confirmed');
            return true;

        } catch (e) {
            console.error('[FAIL] Execution error:', e);
            return false;
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(p => process.exit(p ? 0 : 1));
}
