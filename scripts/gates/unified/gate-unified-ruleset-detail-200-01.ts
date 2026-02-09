/**
 * GATE-UNIFIED-RULESET-DETAIL-200-01
 * 
 * Verifies that all registered rulesets have accessible detail pages (200 OK).
 */

import { listRulesets } from '../../../lib/rulesets/loadRuleset';

const BASE_URL = 'http://localhost:3000';

async function checkRoute(route: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}${route}`);
        if (res.status === 200) {
            console.log(`[PASS] ${route} -> 200 OK`);
            return true;
        } else {
            console.error(`[FAIL] ${route} -> ${res.status}`);
            return false;
        }
    } catch (e) {
        console.error(`[FAIL] ${route} -> Network Error: ${(e as Error).message}`);
        return false;
    }
}

export const gate = {
    id: 'GATE-UNIFIED-RULESET-DETAIL-200-01',
    name: 'Ruleset Detail Routes Audit',
    run: async () => {
        const rulesets = listRulesets();
        let allPass = true;

        for (const rs of rulesets) {
            const route = `/rulesets/${rs.id}`;
            const pass = await checkRoute(route);
            if (!pass) allPass = false;
        }

        return allPass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => process.exit(pass ? 0 : 1));
}
