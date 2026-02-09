#!/usr/bin/env tsx
/**
 * GATE-SURFACE-LINK-INTEGRITY-01
 * 
 * Verifies that all internal links return 200 status.
 * 
 * Exit Code:
 *   0 = PASS (no broken links)
 *   1 = FAIL (broken links found)
 */

import fs from 'fs';
import path from 'path';

interface RuntimeRoute {
    path: string;
    status: number;
    is_internal: boolean;
    discovered_from: string[];
}

function main() {
    console.log('=== GATE-SURFACE-LINK-INTEGRITY-01 ===\n');

    const runtimeRoutesPath = path.join(process.cwd(), 'audit/surface/routes.runtime.json');

    if (!fs.existsSync(runtimeRoutesPath)) {
        console.log('❌ FAIL: routes.runtime.json not found. Run runtime scanner first.');
        process.exit(1);
    }

    const runtimeRoutes: RuntimeRoute[] = JSON.parse(fs.readFileSync(runtimeRoutesPath, 'utf-8')).routes;

    // Find broken internal links (4xx, 5xx)
    const broken = runtimeRoutes.filter(r => r.is_internal && r.status >= 400);

    console.log(`📊 Total Internal Routes: ${runtimeRoutes.filter(r => r.is_internal).length}`);
    console.log(`📊 Broken Links (4xx/5xx): ${broken.length}`);

    if (broken.length > 0) {
        console.log('\n❌ Broken links:');
        for (const r of broken) {
            console.log(`   [${r.status}] ${r.path}`);
            console.log(`       From: ${r.discovered_from.slice(0, 3).join(', ')}`);
        }
        console.log('\n❌ GATE FAILED');
        process.exit(1);
    }

    console.log('\n✅ GATE PASSED: No broken internal links');
}

main();
