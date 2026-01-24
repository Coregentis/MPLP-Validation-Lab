import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * VLAB-GATE-22: Disallowed Route Cross-check
 * 
 * Rule: No path listed in `disallowed_routes` can appear in:
 * - navbar
 * - footer
 * - home_cards
 * - cross_links
 * 
 * Purpose: Ensures logical consistency in NAVIGATION_MAP.yaml.
 */

const PROJECT_ROOT = process.cwd();
const NAV_MAP_PATH = path.join(PROJECT_ROOT, 'governance/NAVIGATION_MAP.yaml');

function runGate22() {
    console.log('🛡️  Running VLAB-GATE-22: Disallowed Route Cross-check...');

    if (!fs.existsSync(NAV_MAP_PATH)) {
        console.error('❌ Error: NAVIGATION_MAP.yaml not found.');
        process.exit(1);
    }

    const doc: any = yaml.load(fs.readFileSync(NAV_MAP_PATH, 'utf8'));
    const disallowed = doc.disallowed_routes || [];

    if (disallowed.length === 0) {
        console.log('🟢 Pass: No disallowed routes defined.');
        return;
    }

    // Collect all links in UI sections
    const uiLinks: string[] = [];

    // Navbar
    if (doc.navbar?.internal) {
        doc.navbar.internal.forEach((item: any) => uiLinks.push(item.href));
    }

    // Footer
    if (doc.footer) {
        Object.values(doc.footer).forEach((section: any) => {
            if (section.links) {
                section.links.forEach((item: any) => uiLinks.push(item.href));
            }
        });
    }

    // Home Cards
    if (doc.home_cards) {
        Object.values(doc.home_cards).forEach((group: any) => {
            if (Array.isArray(group)) {
                group.forEach((item: any) => uiLinks.push(item.href));
            }
        });
    }

    // Cross Links
    if (doc.cross_links) {
        Object.values(doc.cross_links).forEach((links: any) => {
            if (Array.isArray(links)) {
                links.forEach((item: any) => uiLinks.push(item.href));
            }
        });
    }

    const violations = disallowed.filter((route: string) => uiLinks.includes(route));

    if (violations.length > 0) {
        console.error('\n❌ VLAB-GATE-22 FAIL: Disallowed routes found in UI navigation!');
        violations.forEach((route: string) => {
            console.error(`   - Violation: ${route} is defined as disallowed but linked in UI.`);
        });
        process.exit(1);
    }

    console.log('🟢 Pass: No disallowed routes present in UI navigation.');
}

runGate22();
