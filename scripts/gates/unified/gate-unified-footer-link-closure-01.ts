/**
 * GATE-UNIFIED-FOOTER-LINK-CLOSURE-01
 * 
 * Verifies footer links on the homepage (localhost:3000)
 * 1. Parses footer links
 * 2. Checks status codes (200 OK)
 * 3. Ensures no /v2/ paths
 */

import { checkRoute } from '../_lib/check-route';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://localhost:3000';

export const gate = {
    id: 'GATE-UNIFIED-FOOTER-LINK-CLOSURE-01',
    name: 'Footer Link Closure Audit',
    run: async () => {
        try {
            const res = await fetch(BASE_URL);
            if (res.status !== 200) {
                console.error(`[FAIL] Homepage not accessible: ${res.status}`);
                return false;
            }
            const html = await res.text();
            const $ = cheerio.load(html);

            // Find footer - try tag or class heuristics
            // Cheerio selectors are jQuery-like
            const footerLinks = $('footer a');

            if (footerLinks.length === 0) {
                console.error('[FAIL] No footer links found');
                return false;
            }

            const links: string[] = [];
            footerLinks.each((_, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('/')) {
                    links.push(href);
                }
            });

            console.log(`[INFO] Found ${links.length} internal footer links`);

            let pass = true;
            for (const link of links) {
                if (link.includes('/v2/')) {
                    console.error(`[FAIL] Forbidden /v2/ path in footer: ${link}`);
                    pass = false;
                }

                const ok = await checkRoute(link);
                if (!ok) pass = false;
            }

            return pass;
        } catch (e) {
            console.error('[FAIL] Execution error:', e);
            return false;
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(p => process.exit(p ? 0 : 1));
}
