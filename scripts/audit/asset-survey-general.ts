/**
 * Asset Survey Tool
 * 
 * Generates a high-level inventory of SSOT assets, Loaders, and Routes to facilitate
 * the "Asset Reuse First" policy (governance/policies/asset-reuse-first.md).
 * 
 * Usage: npx tsx scripts/audit/asset-survey-general.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const ANSI = {
    BOLD: '\x1b[1m',
    RESET: '\x1b[0m',
    CYAN: '\x1b[36m',
    GREEN: '\x1b[32m',
    DIM: '\x1b[2m'
};

function scanDir(dir: string, pattern: RegExp, depth = 0, maxDepth = 3): string[] {
    if (depth > maxDepth) return [];
    if (!fs.existsSync(dir)) return [];

    let results: string[] = [];
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                results = results.concat(scanDir(fullPath, pattern, depth + 1, maxDepth));
            } else if (pattern.test(item.name)) {
                results.push(fullPath);
            }
        }
    } catch (e) {
        // quiet fail
    }
    return results;
}

async function runSurvey() {
    console.log(`${ANSI.BOLD}MPLP Validation Lab - Asset Survey${ANSI.RESET}`);
    console.log(`${ANSI.DIM}Generated at ${new Date().toISOString()}${ANSI.RESET}\n`);

    // 1. DATA ASSETS
    console.log(`${ANSI.CYAN}=== 1. Data Assets (SSOT) ===${ANSI.RESET}`);
    const dataPaths = [
        'data',
        'public/_data',
        'governance'
    ];

    for (const d of dataPaths) {
        if (!fs.existsSync(d)) continue;
        console.log(`${ANSI.BOLD}Path: ${d}/${ANSI.RESET}`);
        const files = scanDir(d, /\.(json|yaml|md)$/, 0, 3);
        // Summarize by subfolder to avoid spam
        const summary: Record<string, number> = {};
        files.forEach(f => {
            const rel = path.relative(d, f);
            const parent = path.dirname(rel);
            summary[parent] = (summary[parent] || 0) + 1;
        });

        Object.entries(summary).slice(0, 10).forEach(([folder, count]) => {
            console.log(`  - ${folder}/ (${count} files)`);
        });
        if (Object.keys(summary).length > 10) console.log(`  - ... (${Object.keys(summary).length - 10} more dirs)`);
    }

    // 2. LOADERS
    console.log(`\n${ANSI.CYAN}=== 2. Loaders / Logic ===${ANSI.RESET}`);
    const libFiles = scanDir('lib', /\.(ts|tsx)$/);
    const loaders = libFiles.filter(f => f.toLowerCase().includes('load') || f.toLowerCase().includes('model'));

    loaders.forEach(f => {
        const rel = path.relative(process.cwd(), f);
        console.log(`  - ${rel}`);
    });

    // 3. ROUTES
    console.log(`\n${ANSI.CYAN}=== 3. Routes / Pages ===${ANSI.RESET}`);
    const appFiles = scanDir('app', /page\.(tsx|js)$/);
    appFiles.forEach(f => {
        const rel = path.relative('app', f).replace('/page.tsx', '');
        console.log(`  - /${rel}`);
    });

    // 4. API
    console.log(`\n${ANSI.CYAN}=== 4. API Endpoints ===${ANSI.RESET}`);
    const apiFiles = scanDir('app/api', /route\.(ts|js)$/);
    apiFiles.forEach(f => {
        const rel = path.relative('app', f).replace('/route.ts', '');
        console.log(`  - /${rel}`);
    });

    // 5. GATES
    console.log(`\n${ANSI.CYAN}=== 5. Gates (Scripts) ===${ANSI.RESET}`);
    const gateFiles = scanDir('scripts/gates', /\.ts$/);
    console.log(`  Found ${gateFiles.length} gate scripts.`);
    // List strictly unified ones
    const unifiedGates = gateFiles.filter(f => f.includes('unified'));
    console.log(`  - Unified Gates: ${unifiedGates.length}`);
    unifiedGates.slice(0, 5).forEach(f => console.log(`    - ${path.basename(f)}`));
    if (unifiedGates.length > 5) console.log(`    - ...`);

    console.log(`\n${ANSI.GREEN}Survey Complete. Use this inventory to check for reusable assets before creating new ones.${ANSI.RESET}`);
}

runSurvey();
