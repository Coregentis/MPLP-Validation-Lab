import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

/**
 * GATE-LAYOUT-APPSHELL-01: Layout Integrity Checker
 * 
 * Enforces Strategy A:
 * 1. No nested <main> tags in pages.
 * 2. No min-h-screen wrappers in pages.
 * 3. No local max-w-5xl/6xl/7xl containers in pages (AppShell owns width).
 * 4. No full-screen background effects in items.
 */

const APP_DIR = path.join(process.cwd(), 'app');
const WHITELIST_FILES = [
    'components/layout/AppShell.tsx',
    'app/layout.tsx', // Root layout must have HTML/Body/AppShell
    'app/not-found.tsx', // Often standalone
    'app/error.tsx',
    'app/global-error.tsx'
];

const FORBIDDEN_PATTERNS = [
    { pattern: /<main/g, message: 'Nested <main> tag detected. Use <AppShell> in root layout only.' },
    { pattern: /min-h-screen/g, message: 'min-h-screen detected. AppShell handles height.' },
    { pattern: /max-w-(5|6|7)xl/g, message: 'Restricted layout width detected (max-w-5/6/7xl). Let AppShell control width.' },
    { pattern: /bg-(grid|mesh|gradient)/g, message: 'Global background effect detected. AppShell handles backgrounds.' }
];

// Banner check
const BANNER_FILE = 'components/layout/non-endorsement-banner.tsx';
const BANNER_REQUIREMENT = 'max-w-7xl';

async function checkLayoutIntegrity() {
    console.log('🔍 GATE-LAYOUT-APPSHELL-01: Scanning for layout violations...');

    // 1. Scan Page Files
    const pageFiles = await glob('app/**/page.tsx', { cwd: process.cwd() });
    let errors = 0;

    for (const file of pageFiles) {
        if (WHITELIST_FILES.some(w => file.endsWith(w))) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(process.cwd(), file);

        FORBIDDEN_PATTERNS.forEach(rule => {
            if (rule.pattern.test(content)) {
                // Ignore comments
                const cleanContent = content.replace(/{\/\*[\s\S]*?\*\/}/g, '');
                if (rule.pattern.test(cleanContent)) {
                    console.error(`❌ Violation in ${relPath}: ${rule.message}`);
                    errors++;
                }
            }
        });
    }

    // 2. Check Banner
    if (fs.existsSync(BANNER_FILE)) {
        const bannerContent = fs.readFileSync(BANNER_FILE, 'utf-8');
        if (!bannerContent.includes(BANNER_REQUIREMENT)) {
            console.error(`❌ Violation in ${BANNER_FILE}: Inner container must be 'max-w-7xl'.`);
            errors++;
        } else {
            console.log(`✅ Banner structural check passed.`);
        }
    }

    if (errors > 0) {
        console.error(`\n💥 Found ${errors} layout violations. Strategy A enforcement failed.`);
        process.exit(1);
    } else {
        console.log(`\n✅ Strategy A Integrity Verified: No nested shells or width overrides found.`);
        process.exit(0);
    }
}

checkLayoutIntegrity();
