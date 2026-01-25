import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-EVO-UI-02: Index Binding
 * 
 * Verifies that evolution pages are bound to the SSOT index and 
 * contain no hardcoded diff IDs (ruleset-x__ruleset-y).
 */

const APP_EVO_DIR = path.join(process.cwd(), 'app/rulesets/evolution');
const APP_DIFF_DIR = path.join(process.cwd(), 'app/rulesets/diff');
const INDEX_IMPORT_REGEX = /@\/lib\/rulesets\/loadDiff/;
const HARDCODED_ID_REGEX = /ruleset-[0-9.]+__ruleset-[0-9.]+/;

function main() {
    console.log('🛡️  Running VLAB-GATE-EVO-UI-02: Index Binding...');

    const pagesResult: string[] = [];

    function scanPages(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scanPages(fullPath);
            } else if (entry.name.endsWith('.tsx')) {
                const content = fs.readFileSync(fullPath, 'utf8');

                // 1. Check for SSOT Index binding
                // Hub must import loadDiff
                if (fullPath.includes('evolution')) {
                    if (!INDEX_IMPORT_REGEX.test(content)) {
                        console.error(`❌ FAIL: Hub page ${entry.name} does not import loadDiff SSOT.`);
                        process.exit(1);
                    }
                }

                // 2. Check for hardcoded IDs
                if (HARDCODED_ID_REGEX.test(content)) {
                    // Exclude comments if any, but better safe than sorry
                    console.error(`❌ FAIL: Hardcoded diff ID detected in ${path.relative(process.cwd(), fullPath)}`);
                    process.exit(1);
                }
            }
        }
    }

    scanPages(APP_EVO_DIR);
    scanPages(APP_DIFF_DIR);

    console.log('🟢 PASS: Evolution pages are SSOT-bound and have zero hardcoded IDs.');
}

main();
