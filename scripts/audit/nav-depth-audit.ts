/**
 * Navigation Depth Audit Tool (v2.0)
 * 
 * Generates comprehensive navigation discoverability reports:
 * 1. page_graph.json - All pages and internal links between them
 * 2. nav-depth-report.json - BFS-computed min depth from entry points
 * 3. nav-ssot-alignment.json - Diff between Nav/Footer and NAVIGATION_MAP.yaml
 * 
 * VLAB-GATE-24: Strict L1 Definition
 * - A page is L1 iff it is linked in Navbar (Nav.tsx) or Footer (Footer.tsx) or is Home (/).
 * - All static governance pages MUST be L1.
 */

import * as fs from 'fs';
import * as path from 'path';
import yaml from 'yaml';

const PROJECT_ROOT = process.cwd();
const APP_DIR = path.join(PROJECT_ROOT, 'app');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'reports/navigation');

// ============================================================================
// Types
// ============================================================================

interface PageNode {
    path: string;
    file: string;
    isDynamic: boolean;
}

interface PageGraph {
    generated_at: string;
    nodes: PageNode[];
    edges: { from: string; to: string }[];
}

interface DepthEntry {
    path: string;
    min_depth: number | null;
    class: 'L1' | 'L2' | 'L3' | 'orphan';
    path_example: string[];
    entry_type: 'navbar' | 'footer' | 'in-page' | 'none';
}

interface DepthReport {
    generated_at: string;
    summary: {
        total: number;
        L1: number;
        L2: number;
        L3: number;
        orphan: number;
    };
    pages: DepthEntry[];
}

interface SSOTAlignment {
    generated_at: string;
    navbar: {
        ssot: string[];
        actual: string[];
        missing_in_ui: string[];
        extra_in_ui: string[];
    };
    footer: {
        ssot: string[];
        actual: string[];
        missing_in_ui: string[];
        extra_in_ui: string[];
    };
}

// ============================================================================
// Step 1: Find all pages
// ============================================================================

function findAllPages(): PageNode[] {
    const pages: PageNode[] = [];

    function scanDir(dir: string, routePath: string = '') {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (['api', '_components', '_shared', 'node_modules'].includes(entry.name)) continue;
                const isDynamic = entry.name.startsWith('[') && entry.name.endsWith(']');
                const segment = isDynamic ? entry.name : entry.name;
                scanDir(fullPath, `${routePath}/${segment}`);
            } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx') {
                const pagePath = routePath || '/';
                pages.push({
                    path: pagePath,
                    file: path.relative(PROJECT_ROOT, fullPath),
                    isDynamic: pagePath.includes('[')
                });
            }
        }
    }

    scanDir(APP_DIR);
    return pages;
}

// ============================================================================
// Step 2: Extract internal links
// ============================================================================

function extractLinks(filePath: string): string[] {
    const absPath = path.join(PROJECT_ROOT, filePath);
    if (!fs.existsSync(absPath)) return [];

    const content = fs.readFileSync(absPath, 'utf8');
    const links: string[] = [];
    const hrefRegex = /href=["'](\/?[^"']+)["']/g;
    let match;

    while ((match = hrefRegex.exec(content)) !== null) {
        const href = match[1];
        if (href.startsWith('/') && !href.startsWith('//')) {
            const normalized = href.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
            if (!links.includes(normalized)) links.push(normalized);
        }
    }
    return links;
}

function buildPageGraph(pages: PageNode[]): PageGraph {
    const edges: { from: string; to: string }[] = [];
    for (const page of pages) {
        const links = extractLinks(page.file);
        for (const link of links) {
            edges.push({ from: page.path, to: link });
        }
    }
    return { generated_at: new Date().toISOString(), nodes: pages, edges };
}

// ============================================================================
// Step 3: Parse Navigation components
// ============================================================================

function parseNavLinks(): string[] {
    const navPath = path.join(PROJECT_ROOT, 'components/Nav.tsx');
    if (!fs.existsSync(navPath)) return [];
    const content = fs.readFileSync(navPath, 'utf8');
    const links: string[] = [];
    const navItemsMatch = content.match(/const\s+NAV_ITEMS\s*=\s*\[([\s\S]*?)\];/);
    if (navItemsMatch) {
        const hrefRegex = /href:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = hrefRegex.exec(navItemsMatch[1])) !== null) {
            if (match[1].startsWith('/')) links.push(match[1]);
        }
    }
    return links;
}

function parseFooterLinks(): string[] {
    const footerPath = path.join(PROJECT_ROOT, 'components/layout/Footer.tsx');
    if (!fs.existsSync(footerPath)) return [];
    const content = fs.readFileSync(footerPath, 'utf8');
    const links: string[] = [];
    const hrefRegex = /href=["'](\/?[^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(content)) !== null) {
        const href = match[1];
        if (href.startsWith('/') && !href.startsWith('//')) {
            if (!links.includes(href)) links.push(href);
        }
    }
    return links;
}

// ============================================================================
// Step 4: Parse SSOT
// ============================================================================

function parseSSOT(): { navbar: string[]; footer: string[] } {
    const ssotPath = path.join(PROJECT_ROOT, 'governance/NAVIGATION_MAP.yaml');
    if (!fs.existsSync(ssotPath)) return { navbar: [], footer: [] };
    const content = fs.readFileSync(ssotPath, 'utf8');
    const data = yaml.parse(content);
    const navbar: string[] = [];
    const footer: string[] = [];

    if (data.navbar?.internal) {
        for (const item of data.navbar.internal) if (item.href) navbar.push(item.href);
    }
    if (data.footer) {
        for (const col of Object.values(data.footer) as any[]) {
            if (col.links) for (const link of col.links) if (link.href?.startsWith('/')) footer.push(link.href);
        }
    }
    return { navbar, footer };
}

// ============================================================================
// Step 5: BFS (Strict L1 Definition)
// ============================================================================

function computeDepths(graph: PageGraph, navLinks: string[], footerLinks: string[]): DepthReport {
    const L1_ENTRIES = new Set([...navLinks, ...footerLinks, '/']);
    const pageSet = new Set(graph.nodes.map(n => n.path));
    const adj: Map<string, string[]> = new Map();
    for (const node of graph.nodes) adj.set(node.path, []);
    for (const edge of graph.edges) if (adj.has(edge.from)) adj.get(edge.from)!.push(edge.to);

    const depths: Map<string, { depth: number; path: string[]; entryType: string }> = new Map();
    const queue: { node: string; depth: number; path: string[]; entryType: string }[] = [];

    // L1 Initialization (Only direct nav/footer links)
    for (const entry of L1_ENTRIES) {
        if (pageSet.has(entry)) {
            const entryType = navLinks.includes(entry) ? 'navbar' : (footerLinks.includes(entry) ? 'footer' : 'home');
            queue.push({ node: entry, depth: 1, path: [entry], entryType });
            depths.set(entry, { depth: 1, path: [entry], entryType });
        }
    }

    // BFS for L2+
    while (queue.length > 0) {
        const { node, depth, path: currentPath } = queue.shift()!;
        const neighbors = adj.get(node) || [];
        for (const neighbor of neighbors) {
            const matchingPage = graph.nodes.find(n => n.path === neighbor);
            if (matchingPage && !depths.has(matchingPage.path)) {
                depths.set(matchingPage.path, { depth: depth + 1, path: [...currentPath, matchingPage.path], entryType: 'in-page' });
                queue.push({ node: matchingPage.path, depth: depth + 1, path: [...currentPath, matchingPage.path], entryType: 'in-page' });
            }
        }
    }

    const pages: DepthEntry[] = [];
    let L1 = 0, L2 = 0, L3 = 0, orphan = 0;
    for (const node of graph.nodes) {
        const info = depths.get(node.path);
        let depthClass: any = 'orphan';
        if (info) {
            if (info.depth === 1) { L1++; depthClass = 'L1'; }
            else if (info.depth === 2) { L2++; depthClass = 'L2'; }
            else { L3++; depthClass = 'L3'; }
        } else { orphan++; }
        pages.push({ path: node.path, min_depth: info?.depth || null, class: depthClass, path_example: info?.path || [], entry_type: info?.entryType as any || 'none' });
    }
    pages.sort((a, b) => (a.min_depth || 999) - (b.min_depth || 999));
    return { generated_at: new Date().toISOString(), summary: { total: graph.nodes.length, L1, L2, L3, orphan }, pages };
}

// ============================================================================
// Reporting & Final Logic
// ============================================================================

function computeSSOTAlignment(ssot: any, actualNav: string[], actualFooter: string[]): SSOTAlignment {
    return {
        generated_at: new Date().toISOString(),
        navbar: { ssot: ssot.navbar, actual: actualNav, missing_in_ui: ssot.navbar.filter((s: string) => !actualNav.includes(s)), extra_in_ui: actualNav.filter(a => !ssot.navbar.includes(a)) },
        footer: { ssot: ssot.footer, actual: actualFooter, missing_in_ui: ssot.footer.filter((s: string) => !actualFooter.includes(s)), extra_in_ui: actualFooter.filter(a => !ssot.footer.includes(a)) }
    };
}

function generateFixlist(depthReport: DepthReport, alignment: SSOTAlignment): string {
    const lines = ['# Navigation Discoverability Fixed List', `Generated: ${new Date().toISOString()}`, '---', '## VLAB-GATE-24: Strict L1 Compliance', 'Rule: Static pages MUST be directly linked (L1).'];
    const staticViolations = depthReport.pages.filter(p => !p.path.includes('[') && p.class !== 'L1' && p.path !== '/');
    if (staticViolations.length > 0) {
        lines.push('\n### 🔴 Violations (L2+ or Orphan)');
        for (const v of staticViolations) lines.push(`- \`${v.path}\` (Class: ${v.class}, Depth: ${v.min_depth || '∞'})`);
    } else { lines.push('\n🟢 No static violations found.'); }
    return lines.join('\n');
}

async function main() {
    console.log('🔍 Navigation Depth Audit Tool (Strict L1 Mode)');
    const pages = findAllPages();
    const graph = buildPageGraph(pages);
    const navbarLinks = parseNavLinks();
    const footerLinks = parseFooterLinks();
    const ssot = parseSSOT();
    const report = computeDepths(graph, navbarLinks, footerLinks);
    const alignment = computeSSOTAlignment(ssot, navbarLinks, footerLinks);
    const fixlist = generateFixlist(report, alignment);

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'nav-depth-report.json'), JSON.stringify(report, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'FIXLIST-nav-depth.md'), fixlist);

    console.log('\n📊 AUDIT SUMMARY');
    const staticOrphans = report.pages.filter(p => !p.path.includes('[') && p.class === 'orphan');
    const staticL2Plus = report.pages.filter(p => !p.path.includes('[') && p.class !== 'L1' && p.class !== 'orphan' && p.path !== '/');

    let failed = false;
    if (staticOrphans.length > 0) { console.error(`❌ FAIL: ${staticOrphans.length} static orphan(s)`); failed = true; }
    if (staticL2Plus.length > 0) { console.error(`❌ FAIL: ${staticL2Plus.length} static L2+ depth page(s) (GATE-24)`); failed = true; }

    if (!failed) console.log('🟢 PASS: All status pages are L1 discoverable.');
    if (alignment.navbar.missing_in_ui.length > 0 || alignment.footer.missing_in_ui.length > 0) console.warn('⚠️  WARN: SSOT misalignment detected.');

    if (failed) process.exit(1);
}

main().catch(console.error);
