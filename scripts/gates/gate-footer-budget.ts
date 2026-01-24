import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * VLAB-GATE-23: Footer Budget Enforcement
 * 
 * Rule: Max 10 links per footer column.
 * Purpose: Prevent information architecture degradation and ensure scannability.
 */

const PROJECT_ROOT = process.cwd();
const NAV_MAP_PATH = path.join(PROJECT_ROOT, 'governance/NAVIGATION_MAP.yaml');
const MAX_LINKS_PER_COL = 10;

function runGate23() {
    console.log(`🛡️  Running VLAB-GATE-23: Footer Budget (Limit: ${MAX_LINKS_PER_COL})...`);

    if (!fs.existsSync(NAV_MAP_PATH)) {
        console.error('❌ Error: NAVIGATION_MAP.yaml not found.');
        process.exit(1);
    }

    const doc: any = yaml.load(fs.readFileSync(NAV_MAP_PATH, 'utf8'));
    const footer = doc.footer;

    if (!footer) {
        console.log('🟢 Pass: No footer sections defined.');
        return;
    }

    let failCount = 0;

    Object.entries(footer).forEach(([key, section]: [string, any]) => {
        const linkCount = section.links?.length || 0;
        if (linkCount > MAX_LINKS_PER_COL) {
            console.error(`\n❌ VLAB-GATE-23 FAIL: Footer section "${key}" exceeds budget.`);
            console.error(`   Count: ${linkCount} (Limit: ${MAX_LINKS_PER_COL})`);
            console.error('   Action: Refactor information architecture or consolidate links.');
            failCount++;
        }
    });

    if (failCount > 0) {
        process.exit(1);
    }

    console.log('🟢 Pass: All footer sections within budget.');
}

runGate23();
