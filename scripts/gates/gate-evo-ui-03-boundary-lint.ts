import * as fs from 'fs';
import * as path from 'path';

/**
 * VLAB-GATE-EVO-UI-03: Terminology & Disclaimer
 * 
 * Enforces governance boundaries on the evolution visibility layer:
 * 1. ZERO banned words (certified, ranking, score, etc.)
 * 2. MANDATORY DisclaimerBox(kind="non_certification")
 */

const APP_EVO_DIR = path.join(process.cwd(), 'app/rulesets/evolution');
const APP_DIFF_DIR = path.join(process.cwd(), 'app/rulesets/diff');

const BANNED_WORDS = [
    'certified', 'certification',
    'ranked', 'ranking',
    'score', 'ranking list',
    'compliant', 'compliance',
    'official mark'
];

const DISCLAIME_REGEX = /DisclaimerBox\s+kind=["']non_certification["']/;

function main() {
    console.log('🛡️  Running VLAB-GATE-EVO-UI-03: Terminology & Disclaimer...');

    function scanPages(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scanPages(fullPath);
            } else if (entry.name.endsWith('.tsx')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                const lowerContent = content.toLowerCase();

                // 1. Terminology Lint
                for (const word of BANNED_WORDS) {
                    if (lowerContent.includes(word)) {
                        // Special check: ensure it's not in the DisclaimerBox kind name itself
                        // (which the regex covers, but simple include might be too broad if we are not careful)
                        // Actually, 'non_certification' contains 'certification'.
                        // Let's refine the check to ignore the kind prop.
                        const cleanedContent = lowerContent.replace(/kind=["']non_certification["']/g, '');
                        if (cleanedContent.includes(word)) {
                            console.error(`❌ FAIL: Banned word "${word}" detected in ${path.relative(process.cwd(), fullPath)}`);
                            process.exit(1);
                        }
                    }
                }

                // 2. Mandatory Disclaimer
                if (!DISCLAIME_REGEX.test(content)) {
                    console.error(`❌ FAIL: Mandatory DisclaimerBox(non_certification) missing in ${path.relative(process.cwd(), fullPath)}`);
                    process.exit(1);
                }
            }
        }
    }

    scanPages(APP_EVO_DIR);
    scanPages(APP_DIFF_DIR);

    console.log('🟢 PASS: Evolution pages satisfy all terminology and boundary constraints.');
}

main();
