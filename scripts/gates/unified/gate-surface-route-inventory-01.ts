#!/usr/bin/env tsx
/**
 * GATE-SURFACE-ROUTE-INVENTORY-CLOSURE-01
 * 
 * Verifies that all runtime-discovered paths can be explained by source routes.
 * 
 * Exit Code:
 *   0 = PASS (all paths explained)
 *   1 = FAIL (unexplained paths found)
 */

import fs from 'fs';
import path from 'path';

interface SourceRoute {
    route_path: string;
    kind: 'page' | 'api';
    dynamic_params: string[];
}

interface RuntimeRoute {
    path: string;
    status: number;
    is_internal: boolean;
}

function matchRoutePattern(pathStr: string, pattern: string): boolean {
    const regexStr = pattern
        .replace(/\[\.\.\.([^\]]+)\]/g, '(.+)')
        .replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${regexStr}$`);
    return regex.test(pathStr);
}

function main() {
    console.log('=== GATE-SURFACE-ROUTE-INVENTORY-CLOSURE-01 ===\n');

    const sourceRoutesPath = path.join(process.cwd(), 'audit/surface/routes.source.json');
    const runtimeRoutesPath = path.join(process.cwd(), 'audit/surface/routes.runtime.json');

    if (!fs.existsSync(sourceRoutesPath) || !fs.existsSync(runtimeRoutesPath)) {
        console.log('❌ FAIL: Inventory files not found. Run surface scanners first.');
        process.exit(1);
    }

    const sourceRoutes: SourceRoute[] = JSON.parse(fs.readFileSync(sourceRoutesPath, 'utf-8')).routes;
    const runtimeRoutes: RuntimeRoute[] = JSON.parse(fs.readFileSync(runtimeRoutesPath, 'utf-8')).routes;

    // Filter internal 200 pages only
    const internalPages = runtimeRoutes.filter(r => r.is_internal && r.status === 200);

    // Patterns to skip
    const skipPatterns = [
        /^\/_next\//,
        /^\/api\//,
        /\.(json|xml|png|jpg|ico|svg|woff2?)$/,
        /^\/brand\//,
        /^\/favicon/,
    ];

    const unexplained: string[] = [];

    for (const route of internalPages) {
        // Skip known static patterns
        if (skipPatterns.some(p => p.test(route.path))) continue;

        // Check if any source route pattern matches
        const explained = sourceRoutes.some(sr => matchRoutePattern(route.path, sr.route_path));

        if (!explained) {
            unexplained.push(route.path);
        }
    }

    console.log(`📊 Source Routes: ${sourceRoutes.length}`);
    console.log(`📊 Runtime Internal 200s: ${internalPages.length}`);
    console.log(`📊 Unexplained Paths: ${unexplained.length}`);

    if (unexplained.length > 0) {
        console.log('\n❌ Unexplained paths:');
        for (const p of unexplained.slice(0, 20)) {
            console.log(`   ${p}`);
        }
        if (unexplained.length > 20) {
            console.log(`   ... and ${unexplained.length - 20} more`);
        }
        console.log('\n❌ GATE FAILED');
        process.exit(1);
    }

    console.log('\n✅ GATE PASSED: All runtime paths explained by source routes');
}

main();
