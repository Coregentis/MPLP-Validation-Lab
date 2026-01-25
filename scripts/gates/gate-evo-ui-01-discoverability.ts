import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-EVO-UI-01: Discoverability
 * 
 * Asserts that the Ruleset Evolution Hub is easily discoverable.
 * Pattern: min_depth in nav-depth-report.json must be <= 2.
 */

const REPORT_PATH = path.join(process.cwd(), 'reports/navigation/nav-depth-report.json');

function main() {
    console.log('🛡️  Running VLAB-GATE-EVO-UI-01: Discoverability...');

    if (!fs.existsSync(REPORT_PATH)) {
        console.error('❌ nav-depth-report.json not found. Run "npm run audit:nav-depth" first.');
        process.exit(1);
    }

    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const evolutionEntry = report.pages.find((p: any) => p.path === '/rulesets/evolution');

    if (!evolutionEntry) {
        console.error('❌ Ruleset Evolution Hub page not found in report.');
        process.exit(1);
    }

    console.log(`ℹ️  /rulesets/evolution: depth=${evolutionEntry.min_depth}, class=${evolutionEntry.class}`);

    if (evolutionEntry.min_depth === null || evolutionEntry.min_depth > 2) {
        console.error('❌ FAIL: Evolution Hub depth > 2 or unreachable.');
        process.exit(1);
    }

    console.log('🟢 PASS: Ruleset Evolution Hub is L1/L2 discoverable.');
}

main();
