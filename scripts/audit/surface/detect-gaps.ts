#!/usr/bin/env tsx
/**
 * Surface Coverage Auditor - Unified Gap Detection (v2 - Calibrated)
 * 
 * Combines link integrity, empty shell detection, and route closure checks.
 * Now includes public asset explainability and data dependency checks.
 * 
 * Output: audit/surface/gaps-report.md
 * 
 * Usage: npx tsx scripts/audit/surface/detect-gaps.ts
 */

import fs from 'fs';
import path from 'path';

interface SourceRoute {
    route_path: string;
    kind: 'page' | 'api';
    file_path: string;
    dynamic_params: string[];
    segment_group: string;
}

interface RuntimeRoute {
    url: string;
    path: string;
    status: number;
    discovered_from: string[];
    is_internal: boolean;
    content_type?: string;
}

interface PublicAsset {
    public_path: string;
    file_path: string;
    kind: string;
}

interface PageContract {
    route_path: string;
    file_path: string;
    segment_group: string;
    is_dynamic: boolean;
    dynamic_params: string[];
    loader_chain: { loader_name: string; loader_file: string; data_sources: string[] }[];
    data_dependencies?: {
        fs_reads: string[];
        api_calls: string[];
        lib_calls: string[];
    };
    explicit_no_data?: boolean;
    required_entities: string[];
    required_links: string[];
    forbidden_patterns: string[];
    notes: string;
}

interface Gap {
    severity: 'P0' | 'P1' | 'P2';
    category: 'link_broken' | 'empty_shell' | 'orphan_route' | 'missing_contract' | 'missing_data_deps' | 'unexplained_static';
    route: string;
    description: string;
    discovered_from?: string[];
    suggested_fix: string;
}

interface ExplainedAsset {
    path: string;
    explained_by: 'route' | 'static_asset' | 'api' | 'next_internal';
    source?: string;
}

// Load inventories
function loadSourceRoutes(): SourceRoute[] {
    const p = path.join(process.cwd(), 'audit/surface/routes.source.json');
    if (!fs.existsSync(p)) throw new Error('routes.source.json not found');
    return JSON.parse(fs.readFileSync(p, 'utf-8')).routes;
}

function loadRuntimeRoutes(): RuntimeRoute[] {
    const p = path.join(process.cwd(), 'audit/surface/routes.runtime.json');
    if (!fs.existsSync(p)) throw new Error('routes.runtime.json not found');
    return JSON.parse(fs.readFileSync(p, 'utf-8')).routes;
}

function loadPublicAssets(): PublicAsset[] {
    const p = path.join(process.cwd(), 'audit/surface/assets.public.json');
    if (!fs.existsSync(p)) {
        console.log('⚠️  assets.public.json not found, skipping static asset check');
        return [];
    }
    return JSON.parse(fs.readFileSync(p, 'utf-8')).assets;
}

function loadPageContracts(): PageContract[] {
    const p = path.join(process.cwd(), 'audit/surface/page-contracts.json');
    if (!fs.existsSync(p)) throw new Error('page-contracts.json not found');
    return JSON.parse(fs.readFileSync(p, 'utf-8')).contracts;
}

// Match a concrete path against a route pattern
function matchRoutePattern(pathStr: string, pattern: string): boolean {
    const regexStr = pattern
        .replace(/\[\.\.\.([^\]]+)\]/g, '(.+)')
        .replace(/\[([^\]]+)\]/g, '([^/]+)');
    const regex = new RegExp(`^${regexStr}$`);
    return regex.test(pathStr);
}

// Explain a runtime path
function explainPath(
    pathStr: string,
    sourceRoutes: SourceRoute[],
    publicAssets: PublicAsset[]
): ExplainedAsset | null {
    // 1. Check Next.js internal paths
    if (pathStr.startsWith('/_next/')) {
        return { path: pathStr, explained_by: 'next_internal' };
    }

    // 2. Check API routes
    if (pathStr.startsWith('/api/')) {
        const match = sourceRoutes.find(r => r.kind === 'api' && matchRoutePattern(pathStr, r.route_path));
        if (match) {
            return { path: pathStr, explained_by: 'api', source: match.route_path };
        }
    }

    // 3. Check page routes
    for (const route of sourceRoutes) {
        if (route.kind !== 'page') continue;
        if (matchRoutePattern(pathStr, route.route_path)) {
            return { path: pathStr, explained_by: 'route', source: route.route_path };
        }
    }

    // 4. Check static assets (public/)
    const asset = publicAssets.find(a => a.public_path === pathStr);
    if (asset) {
        return { path: pathStr, explained_by: 'static_asset', source: asset.file_path };
    }

    // 5. Check common static file patterns (data files, etc.)
    if (pathStr.endsWith('.json') ||
        pathStr.endsWith('.xml') ||
        pathStr.endsWith('.txt') ||
        pathStr.endsWith('.ico') ||
        pathStr.endsWith('.png') ||
        pathStr.endsWith('.jpg') ||
        pathStr.endsWith('.svg') ||
        pathStr.endsWith('.woff2')) {
        // These are likely static files served from public/
        return { path: pathStr, explained_by: 'static_asset', source: 'inferred' };
    }

    return null;
}

async function detectGaps(): Promise<{ gaps: Gap[]; explained: ExplainedAsset[] }> {
    const gaps: Gap[] = [];
    const explained: ExplainedAsset[] = [];

    const sourceRoutes = loadSourceRoutes();
    const runtimeRoutes = loadRuntimeRoutes();
    const publicAssets = loadPublicAssets();
    const pageContracts = loadPageContracts();

    console.log('🔍 Detecting gaps (calibrated v2)...\n');

    // === A. Link Topology Gaps (404/500) ===
    console.log('📊 A. Link Topology Check');
    let brokenCount = 0;
    for (const route of runtimeRoutes) {
        if (!route.is_internal) continue;

        if (route.status >= 400) {
            gaps.push({
                severity: 'P0',
                category: 'link_broken',
                route: route.path,
                description: `HTTP ${route.status} error`,
                discovered_from: route.discovered_from,
                suggested_fix: route.status === 404
                    ? 'Add page or fix link source'
                    : 'Fix server error',
            });
            brokenCount++;
            console.log(`   ❌ [${route.status}] ${route.path}`);
        }
    }
    if (brokenCount === 0) console.log('   ✅ No broken links');

    // === B. Route Closure Check (with Public Asset Explainability) ===
    console.log('\n📊 B. Route Closure Check (with Static Asset Explainability)');
    let orphanCount = 0;
    for (const route of runtimeRoutes) {
        if (!route.is_internal || route.status !== 200) continue;

        const explanation = explainPath(route.path, sourceRoutes, publicAssets);

        if (explanation) {
            explained.push(explanation);
        } else {
            gaps.push({
                severity: 'P1',
                category: 'orphan_route',
                route: route.path,
                description: 'Runtime path not explained by routes or static assets',
                discovered_from: route.discovered_from,
                suggested_fix: 'Add route, static asset, or redirect',
            });
            orphanCount++;
            console.log(`   ⚠️  Orphan: ${route.path}`);
        }
    }
    if (orphanCount === 0) console.log('   ✅ All runtime paths explained');

    // === C. Contract Coverage Check ===
    console.log('\n📊 C. Contract Coverage Check');
    const contractPaths = new Set(pageContracts.map(c => c.route_path));
    let missingContractCount = 0;
    for (const route of sourceRoutes) {
        if (route.kind !== 'page') continue;

        if (!contractPaths.has(route.route_path)) {
            gaps.push({
                severity: 'P1',
                category: 'missing_contract',
                route: route.route_path,
                description: 'Page has no contract defined',
                suggested_fix: 'Generate or manually define page contract',
            });
            missingContractCount++;
            console.log(`   ⚠️  No contract: ${route.route_path}`);
        }
    }
    if (missingContractCount === 0) console.log('   ✅ All pages have contracts');

    // === D. Data Dependency Check (upgraded from loader check) ===
    console.log('\n📊 D. Data Dependency Check');
    let missingDepsCount = 0;
    for (const contract of pageContracts) {
        if (!contract.is_dynamic) continue;

        const hasLoaders = contract.loader_chain.length > 0;
        const hasDataDeps = contract.data_dependencies && (
            contract.data_dependencies.fs_reads.length > 0 ||
            contract.data_dependencies.api_calls.length > 0 ||
            contract.data_dependencies.lib_calls.length > 0
        );
        const explicitNoData = contract.explicit_no_data === true;

        if (!hasLoaders && !hasDataDeps && !explicitNoData) {
            gaps.push({
                severity: 'P2',
                category: 'missing_data_deps',
                route: contract.route_path,
                description: 'Dynamic page has no detected data dependencies',
                suggested_fix: 'Add data_dependencies to contract or mark explicit_no_data',
            });
            missingDepsCount++;
            console.log(`   ⚠️  Missing deps: ${contract.route_path}`);
        }
    }
    if (missingDepsCount === 0) console.log('   ✅ All dynamic pages have data deps or explicit_no_data');

    return { gaps, explained };
}

function generateReport(gaps: Gap[], explained: ExplainedAsset[]): string {
    const lines: string[] = [
        '# Surface Coverage Gaps Report (Calibrated v2)',
        '',
        `**Generated**: ${new Date().toISOString()}`,
        '',
        `**Total Gaps**: ${gaps.length}`,
        `**Explained Paths**: ${explained.length}`,
        '',
        '## Summary by Severity',
        '',
        `| Severity | Count |`,
        `|----------|-------|`,
        `| P0 (Critical) | ${gaps.filter(g => g.severity === 'P0').length} |`,
        `| P1 (Important) | ${gaps.filter(g => g.severity === 'P1').length} |`,
        `| P2 (Minor) | ${gaps.filter(g => g.severity === 'P2').length} |`,
        '',
        '## Summary by Category',
        '',
        `| Category | Count |`,
        `|----------|-------|`,
        `| Link Broken | ${gaps.filter(g => g.category === 'link_broken').length} |`,
        `| Orphan Route | ${gaps.filter(g => g.category === 'orphan_route').length} |`,
        `| Missing Contract | ${gaps.filter(g => g.category === 'missing_contract').length} |`,
        `| Missing Data Deps | ${gaps.filter(g => g.category === 'missing_data_deps').length} |`,
        '',
        '## Explained Paths Summary',
        '',
        `| Source | Count |`,
        `|--------|-------|`,
        `| Route | ${explained.filter(e => e.explained_by === 'route').length} |`,
        `| Static Asset | ${explained.filter(e => e.explained_by === 'static_asset').length} |`,
        `| API | ${explained.filter(e => e.explained_by === 'api').length} |`,
        `| Next Internal | ${explained.filter(e => e.explained_by === 'next_internal').length} |`,
        '',
    ];

    // P0 Gaps
    const p0 = gaps.filter(g => g.severity === 'P0');
    if (p0.length > 0) {
        lines.push('## P0 — Critical Gaps (Broken Links / Server Errors)');
        lines.push('');
        for (const gap of p0) {
            lines.push(`### \`${gap.route}\``);
            lines.push(`- **Category**: ${gap.category}`);
            lines.push(`- **Description**: ${gap.description}`);
            if (gap.discovered_from) {
                lines.push(`- **Discovered From**: ${gap.discovered_from.slice(0, 3).join(', ')}`);
            }
            lines.push(`- **Suggested Fix**: ${gap.suggested_fix}`);
            lines.push('');
        }
    }

    // P1 Gaps
    const p1 = gaps.filter(g => g.severity === 'P1');
    if (p1.length > 0) {
        lines.push('## P1 — Important Gaps (Missing Routes / Contracts)');
        lines.push('');
        for (const gap of p1) {
            lines.push(`### \`${gap.route}\``);
            lines.push(`- **Category**: ${gap.category}`);
            lines.push(`- **Description**: ${gap.description}`);
            lines.push(`- **Suggested Fix**: ${gap.suggested_fix}`);
            lines.push('');
        }
    }

    // P2 Gaps
    const p2 = gaps.filter(g => g.severity === 'P2');
    if (p2.length > 0) {
        lines.push('## P2 — Minor Gaps (Missing Data Dependencies)');
        lines.push('');
        for (const gap of p2) {
            lines.push(`- \`${gap.route}\`: ${gap.description}`);
        }
        lines.push('');
    }

    // Zero gaps message
    if (gaps.length === 0) {
        lines.push('## ✅ No Gaps Detected');
        lines.push('');
        lines.push('All paths are explained and all contracts have data dependencies.');
        lines.push('');
    }

    return lines.join('\n');
}

async function main() {
    console.log('🔍 Surface Coverage Auditor - Gap Detection (Calibrated v2)');
    console.log('============================================================\n');

    const { gaps, explained } = await detectGaps();

    console.log('\n📊 Results:');
    console.log(`   Total Gaps: ${gaps.length}`);
    console.log(`   Explained Paths: ${explained.length}`);
    console.log(`   P0 (Critical): ${gaps.filter(g => g.severity === 'P0').length}`);
    console.log(`   P1 (Important): ${gaps.filter(g => g.severity === 'P1').length}`);
    console.log(`   P2 (Minor): ${gaps.filter(g => g.severity === 'P2').length}`);

    // Generate report
    const report = generateReport(gaps, explained);
    const outputDir = path.join(process.cwd(), 'audit/surface');
    const outputPath = path.join(outputDir, 'gaps-report.md');
    fs.writeFileSync(outputPath, report);

    // Also output JSON for programmatic use
    const jsonPath = path.join(outputDir, 'gaps.json');
    fs.writeFileSync(jsonPath, JSON.stringify({
        generated_at: new Date().toISOString(),
        gaps,
        explained_count: explained.length,
    }, null, 2));

    console.log(`\n✅ Report: ${outputPath}`);
    console.log(`✅ JSON: ${jsonPath}`);

    // Exit with error if P0 gaps exist
    if (gaps.filter(g => g.severity === 'P0').length > 0) {
        console.log('\n❌ GATE FAILED: P0 gaps detected');
        process.exit(1);
    } else {
        console.log('\n✅ GATE PASSED: No critical gaps');
    }
}

main().catch(console.error);
