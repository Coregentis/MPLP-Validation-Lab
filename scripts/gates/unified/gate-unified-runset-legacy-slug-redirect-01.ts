/**
 * GATE-UNIFIED-RUNSET-LEGACY-SLUG-REDIRECT-01
 * 
 * Verifies that legacy runset slugs (runset-v2.0.0, runset-v2.0.1)
 * correctly redirect to their canonical paths (v2-index).
 */

import { checkRoute } from '../_lib/check-route';

const BASE_URL = 'http://localhost:3000';
const LEGACY_SLUGS = [
    'runset-v2.0.0',
    'runset-v2.0.1'
];
const CANONICAL_TARGET = '/runsets/v2-index';

export const gate = {
    id: 'GATE-UNIFIED-RUNSET-LEGACY-SLUG-REDIRECT-01',
    name: 'Runset Legacy Slug Redirect Audit',
    run: async () => {
        let pass = true;

        for (const slug of LEGACY_SLUGS) {
            const url = `${BASE_URL}/runsets/${slug}`;
            console.log(`[INFO] Checking legacy slug: ${slug} -> ${url}`);

            try {
                // Fetch with redirect: manual to inspect headers?
                // Or just fetch and check final URL.
                const res = await fetch(url, { redirect: 'follow' });

                if (res.status !== 200) {
                    console.error(`[FAIL] ${slug} returned ${res.status}`);
                    pass = false;
                    continue;
                }

                // Check final URL path
                const finalUrl = new URL(res.url);
                if (finalUrl.pathname !== CANONICAL_TARGET) {
                    console.error(`[FAIL] ${slug} redirected to ${finalUrl.pathname}, expected ${CANONICAL_TARGET}`);
                    pass = false;
                } else {
                    console.log(`[PASS] ${slug} -> ${finalUrl.pathname}`);
                }
            } catch (e) {
                console.error(`[FAIL] Exception checking ${slug}:`, e);
                pass = false;
            }
        }

        return pass;
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(p => process.exit(p ? 0 : 1));
}
