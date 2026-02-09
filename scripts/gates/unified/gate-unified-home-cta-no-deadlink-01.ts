/**
 * GATE-UNIFIED-HOME-CTA-NO-DEADLINK-01
 * 
 * Verifies CTA links on Homepage (Quick Start & Discovery Cards)
 * 1. Checks validity (200 OK)
 * 2. Ensures /runsets is present
 */

import { checkRoute } from '../_lib/check-route';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://localhost:3000';

export const gate = {
    id: 'GATE-UNIFIED-HOME-CTA-NO-DEADLINK-01',
    name: 'Home CTA Deadlink Audit',
    run: async () => {
        try {
            const res = await fetch(BASE_URL);
            const html = await res.text();
            const $ = cheerio.load(html);

            // Audit all internal links on the homepage for safety
            const internalLinks: string[] = [];

            $('a').each((_, el) => {
                const href = $(el).attr('href');
                if (href && href.startsWith('/')) {
                    internalLinks.push(href);
                }
            });

            console.log(`[INFO] Audit ${internalLinks.length} homepage internal links`);

            let pass = true;
            let foundRunsets = false;

            for (const link of internalLinks) {
                if (link === '/runsets') foundRunsets = true;

                // Skip empty or anchor links
                if (link === '/' || link.startsWith('#')) continue;

                const ok = await checkRoute(link);
                if (!ok) pass = false;
            }

            if (!foundRunsets) {
                console.error('[FAIL] /runsets link not found on Homepage');
                pass = false;
            } else {
                console.log('[PASS] /runsets link present');
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
