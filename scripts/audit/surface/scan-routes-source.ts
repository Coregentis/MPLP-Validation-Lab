#!/usr/bin/env tsx
/**
 * Surface Coverage Auditor - Step 0: Source Route Scanner
 * 
 * Scans app page.tsx files and app route.ts files to generate routes.source.json
 * 
 * Output: audit/surface/routes.source.json
 * 
 * Usage: npx tsx scripts/audit/surface/scan-routes-source.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface SourceRoute {
    route_path: string;          // e.g., /rulesets/[ruleset_id]
    kind: 'page' | 'api';        // page.tsx or route.ts
    file_path: string;           // relative path from project root
    dynamic_params: string[];    // e.g., ['ruleset_id']
    segment_group: string;       // e.g., 'rulesets', 'runs', 'governance'
}

interface SourceInventory {
    generated_at: string;
    total_routes: number;
    pages: number;
    apis: number;
    routes: SourceRoute[];
}

const APP_ROOT = path.join(process.cwd(), 'app');

function filePathToRoute(filePath: string): string {
    // Convert: app/rulesets/[ruleset_id]/page.tsx -> /rulesets/[ruleset_id]
    let route = filePath
        .replace(/^app/, '')
        .replace(/\/page\.tsx$/, '')
        .replace(/\/route\.ts$/, '')
        .replace(/\/route\.tsx$/, '');

    // Handle root page
    if (route === '' || route === '/') {
        return '/';
    }

    // Handle route groups (parentheses)
    route = route.replace(/\/\([^)]+\)/g, '');

    return route;
}

function extractDynamicParams(route: string): string[] {
    const matches = route.match(/\[([^\]]+)\]/g);
    if (!matches) return [];
    return matches.map(m => m.replace(/[\[\]]/g, ''));
}

function extractSegmentGroup(route: string): string {
    // Extract first meaningful segment
    const segments = route.split('/').filter(Boolean);
    if (segments.length === 0) return 'root';

    // Skip dynamic params for grouping
    const firstStatic = segments.find(s => !s.startsWith('['));
    return firstStatic || segments[0].replace(/[\[\]]/g, '');
}

async function scanRoutes(): Promise<SourceInventory> {
    const routes: SourceRoute[] = [];

    // Scan page.tsx files
    const pageFiles = await glob('app/**/page.tsx', { cwd: process.cwd() });
    for (const file of pageFiles) {
        const routePath = filePathToRoute(file);
        routes.push({
            route_path: routePath,
            kind: 'page',
            file_path: file,
            dynamic_params: extractDynamicParams(routePath),
            segment_group: extractSegmentGroup(routePath),
        });
    }

    // Scan route.ts files (API routes)
    const apiFiles = await glob('app/**/route.ts', { cwd: process.cwd() });
    for (const file of apiFiles) {
        const routePath = filePathToRoute(file);
        routes.push({
            route_path: routePath,
            kind: 'api',
            file_path: file,
            dynamic_params: extractDynamicParams(routePath),
            segment_group: extractSegmentGroup(routePath),
        });
    }

    // Sort by route path
    routes.sort((a, b) => a.route_path.localeCompare(b.route_path));

    const pages = routes.filter(r => r.kind === 'page').length;
    const apis = routes.filter(r => r.kind === 'api').length;

    return {
        generated_at: new Date().toISOString(),
        total_routes: routes.length,
        pages,
        apis,
        routes,
    };
}

async function main() {
    console.log('🔍 Surface Coverage Auditor - Source Route Scanner');
    console.log('================================================\n');

    const inventory = await scanRoutes();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'audit/surface');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'routes.source.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(`📊 Total Routes: ${inventory.total_routes}`);
    console.log(`   - Pages: ${inventory.pages}`);
    console.log(`   - APIs: ${inventory.apis}`);
    console.log('');

    // Group by segment
    const bySegment = new Map<string, SourceRoute[]>();
    for (const route of inventory.routes) {
        const existing = bySegment.get(route.segment_group) || [];
        existing.push(route);
        bySegment.set(route.segment_group, existing);
    }

    console.log('📁 Routes by Segment:');
    for (const [segment, routes] of Array.from(bySegment.entries()).sort()) {
        console.log(`   ${segment}: ${routes.length} routes`);
        for (const r of routes) {
            const kind = r.kind === 'api' ? '[API]' : '[PAGE]';
            const dynamic = r.dynamic_params.length ? ` (${r.dynamic_params.join(', ')})` : '';
            console.log(`      ${kind} ${r.route_path}${dynamic}`);
        }
    }

    console.log(`\n✅ Output: ${outputPath}`);
}

main().catch(console.error);
