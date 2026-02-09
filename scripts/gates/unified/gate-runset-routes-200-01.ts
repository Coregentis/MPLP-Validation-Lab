/**
 * GATE-RUNSET-ROUTES-200-01
 * 
 * Verifies that the Runset Index and all Runset Detail pages are accessible (200 OK).
 * 
 * Usage: npx tsx scripts/gates/unified/gate-runset-routes-200-01.ts
 */

import { loadAllRunsets } from '../../../lib/unified/load-all-runsets';

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
    id: 'GATE-RUNSET-ROUTES-200-01',
    name: 'Runset Routes Audit',
    run: async () => {
        // 1. Check Index
        let allPass = await checkRoute('/runsets');

        // 2. Check Detail Pages
        const runsets = loadAllRunsets();
        for (const rs of runsets) {
            // rs.href is something like /runsets/v1-curated
            const pass = await checkRoute(rs.href);
            if (!pass) allPass = false;
        }

        return allPass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => process.exit(pass ? 0 : 1));
}
