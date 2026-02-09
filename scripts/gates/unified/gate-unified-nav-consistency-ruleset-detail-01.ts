/**
 * Gate P4-D1: Unified Nav Consistency
 * 
 * Verifies that all ruleset detail pages (`/rulesets/x`) share the same 
 * global navigation topology as the main site.
 * 
 * Target Topology:
 * - Home
 * - Runs
 * - Runsets
 * - Rulesets
 * - Governance
 * - Releases
 * 
 * Forbidden Patterns:
 * - "Real Runs V2"
 * - "Simulated V1"
 * - Split nav
 */

import { checkRoute } from '../../../../_lib/check-route';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

export const gate = {
    id: 'GATE-UNIFIED-NAV-CONSISTENCY-RULESET-DETAIL-01',
    description: 'Verify Unified Navigation Topology on Ruleset Pages',
    run: async () => {
        let pass = true;

        // Pages to check
        const TARGETS = [
            '/rulesets/ruleset-v2.0.0', // V2.0.0
            '/rulesets/ruleset-v2.0.1', // V2.0.1
            '/rulesets/ruleset-1.3'     // V1 (Reference: confirmed from data/rulesets dir)
        ];

        // Expected Links in Nav
        const REQUIRED_LINKS = [
            '/runs',
            '/runsets',
            '/rulesets',
            '/governance',
            '/releases'
        ];

        // Forbidden Text in Nav
        const FORBIDDEN_TEXT = [
            'Real Runs V2',
            'Simulated V1',
            'Legacy'
        ];

        for (const path of TARGETS) {
            console.log(`[INFO] Auditing Navigation: ${path}`);

            // 1. Fetch Page
            // Note: This relies on server running at localhost:3000
            // We use a custom fetch wrapper or existing checkRoute logic
            try {
                const res = await fetch(`http://localhost:3000${path}`);
                if (res.status !== 200) {
                    console.error(`[FAIL] Page ${path} returned ${res.status}`);
                    pass = false;
                    continue;
                }

                const html = await res.text();
                const $ = cheerio.load(html);

                // 2. Locate Nav
                // Heuristic: <nav> tag or header
                const navText = $('nav').text();
                const navHtml = $('nav').html() || '';

                if (!navText) {
                    console.error(`[FAIL] No <nav> element found on ${path}`);
                    pass = false;
                    continue;
                }

                // 3. Verify Required Links Presence
                for (const req of REQUIRED_LINKS) {
                    // Check href existence
                    const hasLink = $(`nav a[href="${req}"]`).length > 0;
                    if (!hasLink) {
                        console.error(`[FAIL] ${path} missing nav link to ${req}`);
                        pass = false;
                    }
                }

                // 4. Verify Forbidden Patterns
                for (const bad of FORBIDDEN_TEXT) {
                    if (navText.includes(bad)) {
                        console.error(`[FAIL] ${path} contains forbidden nav text: "${bad}"`);
                        pass = false;
                    }
                }

                if (pass) {
                    console.log(`[PASS] ${path} navigation topology verified.`);
                }

            } catch (e) {
                console.error(`[FAIL] Error fetching ${path}`, e);
                pass = false;
            }
        }

        return pass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then((passed) => {
        if (passed) {
            console.log(`[PASS] ${gate.id}`);
            process.exit(0);
        } else {
            console.error(`[FAIL] ${gate.id}`);
            process.exit(1);
        }
    });
}
