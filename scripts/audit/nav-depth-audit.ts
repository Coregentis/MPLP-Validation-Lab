/**
 * Navigation Depth Audit Tool
 * 
 * Generates comprehensive navigation discoverability reports:
 * 1. page_graph.json - All pages and internal links between them
 * 2. nav-depth-report.json - BFS-computed min depth from entry points
 * 3. nav-ssot-alignment.json - Diff between Nav/Footer and NAVIGATION_MAP.yaml
 * 
 * Usage: npx tsx scripts/audit/nav-depth-audit.ts
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
                // Skip api, _components, and node_modules
                if (['api', '_components', '_shared', 'node_modules'].includes(entry.name)) continue;

                // Handle dynamic routes
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
// Step 2: Extract internal links from each page
// ============================================================================

function extractLinks(filePath: string): string[] {
    const absPath = path.join(PROJECT_ROOT, filePath);
    if (!fs.existsSync(absPath)) return [];

    const content = fs.readFileSync(absPath, 'utf8');
    const links: string[] = [];

    // Match href="/..." patterns
    const hrefRegex = /href=["'](\/?[^"']+)["']/g;
    let match;

    while ((match = hrefRegex.exec(content)) !== null) {
        const href = match[1];
        // Only internal links starting with /
        if (href.startsWith('/') && !href.startsWith('//')) {
            // Normalize: remove trailing slash, query params
            const normalized = href.split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
            if (!links.includes(normalized)) {
                links.push(normalized);
            }
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

    return {
        generated_at: new Date().toISOString(),
        nodes: pages,
        edges
    };
}

// ============================================================================
// Step 3: Parse Nav.tsx and Footer.tsx for actual links
// ============================================================================

function parseNavLinks(): string[] {
    const navPath = path.join(PROJECT_ROOT, 'components/Nav.tsx');
    if (!fs.existsSync(navPath)) return [];

    const content = fs.readFileSync(navPath, 'utf8');
    const links: string[] = [];

    // Find NAV_ITEMS array content
    const navItemsMatch = content.match(/const\s+NAV_ITEMS\s*=\s*\[([\s\S]*?)\];/);
    if (navItemsMatch) {
        const hrefRegex = /href:\s*['"]([^'"]+)['"]/g;
        let match;
        while ((match = hrefRegex.exec(navItemsMatch[1])) !== null) {
            if (match[1].startsWith('/')) {
                links.push(match[1]);
            }
        }
    }

    return links;
}

function parseFooterLinks(): string[] {
    const footerPath = path.join(PROJECT_ROOT, 'components/layout/Footer.tsx');
    if (!fs.existsSync(footerPath)) return [];

    const content = fs.readFileSync(footerPath, 'utf8');
    const links: string[] = [];

    // Extract all internal hrefs from Footer
    const hrefRegex = /href=["'](\/?[^"']+)["']/g;
    let match;

    while ((match = hrefRegex.exec(content)) !== null) {
        const href = match[1];
        if (href.startsWith('/') && !href.startsWith('//')) {
            if (!links.includes(href)) {
                links.push(href);
            }
        }
    }

    return links;
}

// ============================================================================
// Step 4: Parse NAVIGATION_MAP.yaml
// ============================================================================

function parseSSOT(): { navbar: string[]; footer: string[] } {
    const ssotPath = path.join(PROJECT_ROOT, 'governance/NAVIGATION_MAP.yaml');
    if (!fs.existsSync(ssotPath)) {
        return { navbar: [], footer: [] };
    }

    const content = fs.readFileSync(ssotPath, 'utf8');
    const data = yaml.parse(content);

    const navbar: string[] = [];
    const footer: string[] = [];

    // Extract navbar internal links
    if (data.navbar?.internal) {
        for (const item of data.navbar.internal) {
            if (item.href) navbar.push(item.href);
        }
    }

    // Extract footer links from all columns
    if (data.footer) {
        for (const columnKey of Object.keys(data.footer)) {
            const column = data.footer[columnKey];
            if (column.links) {
                for (const link of column.links) {
                    if (link.href?.startsWith('/')) {
                        footer.push(link.href);
                    }
                }
            }
        }
    }

    return { navbar, footer };
}

// ============================================================================
// Step 5: BFS Depth Calculation
// ============================================================================

function computeDepths(
    graph: PageGraph,
    navbarLinks: string[],
    footerLinks: string[]
): DepthReport {
    const allEntries = new Set([...navbarLinks, ...footerLinks, '/']);
    const pageSet = new Set(graph.nodes.map(n => n.path));

    // Build adjacency list
    const adj: Map<string, string[]> = new Map();
    for (const node of graph.nodes) {
        adj.set(node.path, []);
    }
    for (const edge of graph.edges) {
        if (adj.has(edge.from)) {
            adj.get(edge.from)!.push(edge.to);
        }
    }

    // BFS from entry nodes
    const depths: Map<string, { depth: number; path: string[]; entryType: string }> = new Map();
    const queue: { node: string; depth: number; path: string[]; entryType: string }[] = [];

    // Initialize with entry nodes
    for (const entry of allEntries) {
        if (pageSet.has(entry)) {
            const entryType = navbarLinks.includes(entry) ? 'navbar' :
                footerLinks.includes(entry) ? 'footer' : 'in-page';
            queue.push({ node: entry, depth: 1, path: [entry], entryType });
            depths.set(entry, { depth: 1, path: [entry], entryType });
        }
    }

    // BFS
    while (queue.length > 0) {
        const { node, depth, path: currentPath, entryType } = queue.shift()!;
        const neighbors = adj.get(node) || [];

        for (const neighbor of neighbors) {
            // Normalize dynamic routes for matching
            const normalizedNeighbor = neighbor.replace(/\[.*?\]/g, '[param]');
            const matchingPage = graph.nodes.find(n => {
                const normalizedPath = n.path.replace(/\[.*?\]/g, '[param]');
                return normalizedPath === normalizedNeighbor || n.path === neighbor;
            });

            if (matchingPage && !depths.has(matchingPage.path)) {
                depths.set(matchingPage.path, {
                    depth: depth + 1,
                    path: [...currentPath, matchingPage.path],
                    entryType: 'in-page'
                });
                queue.push({
                    node: matchingPage.path,
                    depth: depth + 1,
                    path: [...currentPath, matchingPage.path],
                    entryType: 'in-page'
                });
            }
        }
    }

    // Build report
    const pages: DepthEntry[] = [];
    let L1 = 0, L2 = 0, L3 = 0, orphan = 0;

    for (const node of graph.nodes) {
        const info = depths.get(node.path);
        let depthClass: 'L1' | 'L2' | 'L3' | 'orphan';
        let minDepth: number | null = null;
        let pathExample: string[] = [];
        let entryType: 'navbar' | 'footer' | 'in-page' | 'none' = 'none';

        if (info) {
            minDepth = info.depth;
            pathExample = info.path;
            entryType = info.entryType as any;

            if (minDepth === 1) {
                depthClass = 'L1';
                L1++;
            } else if (minDepth === 2) {
                depthClass = 'L2';
                L2++;
            } else {
                depthClass = 'L3';
                L3++;
            }
        } else {
            depthClass = 'orphan';
            orphan++;
        }

        pages.push({
            path: node.path,
            min_depth: minDepth,
            class: depthClass,
            path_example: pathExample,
            entry_type: entryType
        });
    }

    // Sort: orphans first, then by depth
    pages.sort((a, b) => {
        if (a.class === 'orphan' && b.class !== 'orphan') return -1;
        if (a.class !== 'orphan' && b.class === 'orphan') return 1;
        return (a.min_depth || 999) - (b.min_depth || 999);
    });

    return {
        generated_at: new Date().toISOString(),
        summary: { total: graph.nodes.length, L1, L2, L3, orphan },
        pages
    };
}

// ============================================================================
// Step 6: SSOT Alignment Check
// ============================================================================

function computeSSOTAlignment(
    ssot: { navbar: string[]; footer: string[] },
    actualNav: string[],
    actualFooter: string[]
): SSOTAlignment {
    return {
        generated_at: new Date().toISOString(),
        navbar: {
            ssot: ssot.navbar,
            actual: actualNav,
            missing_in_ui: ssot.navbar.filter(s => !actualNav.includes(s)),
            extra_in_ui: actualNav.filter(a => !ssot.navbar.includes(a))
        },
        footer: {
            ssot: ssot.footer,
            actual: actualFooter,
            missing_in_ui: ssot.footer.filter(s => !actualFooter.includes(s)),
            extra_in_ui: actualFooter.filter(a => !ssot.footer.includes(a))
        }
    };
}

// ============================================================================
// Step 7: Generate Fixlist
// ============================================================================

function generateFixlist(
    depthReport: DepthReport,
    alignment: SSOTAlignment
): string {
    const lines: string[] = [
        '# Navigation Depth Fixlist',
        '',
        `**Generated**: ${new Date().toISOString()}`,
        '',
        '---',
        '',
        '## Summary',
        '',
        `| Metric | Value |`,
        `|:---|:---|`,
        `| Total Pages | ${depthReport.summary.total} |`,
        `| L1 (Navbar/Footer) | ${depthReport.summary.L1} |`,
        `| L2 (One Click) | ${depthReport.summary.L2} |`,
        `| L3+ (Deep) | ${depthReport.summary.L3} |`,
        `| **Orphan (No Path)** | **${depthReport.summary.orphan}** |`,
        '',
        '---',
        '',
    ];

    // HIGH: Orphan pages
    const orphans = depthReport.pages.filter(p => p.class === 'orphan');
    if (orphans.length > 0) {
        lines.push('## 🔴 HIGH Priority: Orphan Pages');
        lines.push('');
        lines.push('These pages have NO discoverable path from any entry point.');
        lines.push('');
        lines.push('| Page | Suggested Fix |');
        lines.push('|:---|:---|');
        for (const o of orphans) {
            const suggestion = o.path.includes('/examples/')
                ? 'Add to Footer Evidence column'
                : 'Add to Footer or create index page';
            lines.push(`| \`${o.path}\` | ${suggestion} |`);
        }
        lines.push('');
    }

    // MEDIUM: SSOT misalignment
    const navMissing = alignment.navbar.missing_in_ui;
    const navExtra = alignment.navbar.extra_in_ui;
    const footerMissing = alignment.footer.missing_in_ui;

    if (navMissing.length > 0 || navExtra.length > 0 || footerMissing.length > 0) {
        lines.push('## 🟡 MEDIUM Priority: SSOT Alignment');
        lines.push('');

        if (navMissing.length > 0) {
            lines.push('### Navbar: Missing in UI (defined in SSOT)');
            lines.push('');
            for (const m of navMissing) {
                lines.push(`- \`${m}\` → Add to \`Nav.tsx\``);
            }
            lines.push('');
        }

        if (navExtra.length > 0) {
            lines.push('### Navbar: Extra in UI (not in SSOT)');
            lines.push('');
            for (const e of navExtra) {
                lines.push(`- \`${e}\` → Add to \`NAVIGATION_MAP.yaml\` or remove from \`Nav.tsx\``);
            }
            lines.push('');
        }

        if (footerMissing.length > 0) {
            lines.push('### Footer: Missing in UI (defined in SSOT)');
            lines.push('');
            for (const m of footerMissing) {
                lines.push(`- \`${m}\` → Add to \`Footer.tsx\``);
            }
            lines.push('');
        }
    }

    // LOW: Deep pages (L3+)
    const deepPages = depthReport.pages.filter(p => p.class === 'L3' && !p.path.includes('['));
    if (deepPages.length > 0) {
        lines.push('## 🟢 LOW Priority: Deep Pages (L3+)');
        lines.push('');
        lines.push('Static pages requiring 3+ clicks to discover. Consider adding shortcuts.');
        lines.push('');
        lines.push('| Page | Current Depth | Path |');
        lines.push('|:---|:---|:---|');
        for (const d of deepPages) {
            lines.push(`| \`${d.path}\` | ${d.min_depth} | ${d.path_example.join(' → ')} |`);
        }
        lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('*End of Fixlist*');

    return lines.join('\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
    console.log('🔍 Navigation Depth Audit Tool');
    console.log('==============================\n');

    // Ensure output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Step 1: Find pages
    console.log('Step 1: Finding all pages...');
    const pages = findAllPages();
    console.log(`   Found ${pages.length} pages\n`);

    // Step 2: Build graph
    console.log('Step 2: Building page graph...');
    const graph = buildPageGraph(pages);
    console.log(`   Found ${graph.edges.length} internal links\n`);

    // Step 3: Parse actual navigation
    console.log('Step 3: Parsing Nav.tsx and Footer.tsx...');
    const navbarLinks = parseNavLinks();
    const footerLinks = parseFooterLinks();
    console.log(`   Navbar: ${navbarLinks.length} links`);
    console.log(`   Footer: ${footerLinks.length} links\n`);

    // Step 4: Parse SSOT
    console.log('Step 4: Parsing NAVIGATION_MAP.yaml...');
    const ssot = parseSSOT();
    console.log(`   SSOT Navbar: ${ssot.navbar.length} links`);
    console.log(`   SSOT Footer: ${ssot.footer.length} links\n`);

    // Step 5: Compute depths
    console.log('Step 5: Computing navigation depths (BFS)...');
    const depthReport = computeDepths(graph, navbarLinks, footerLinks);
    console.log(`   L1: ${depthReport.summary.L1}, L2: ${depthReport.summary.L2}, L3: ${depthReport.summary.L3}, Orphan: ${depthReport.summary.orphan}\n`);

    // Step 6: SSOT alignment
    console.log('Step 6: Checking SSOT alignment...');
    const alignment = computeSSOTAlignment(ssot, navbarLinks, footerLinks);
    console.log(`   Navbar missing: ${alignment.navbar.missing_in_ui.length}`);
    console.log(`   Navbar extra: ${alignment.navbar.extra_in_ui.length}`);
    console.log(`   Footer missing: ${alignment.footer.missing_in_ui.length}\n`);

    // Step 7: Generate fixlist
    console.log('Step 7: Generating fixlist...');
    const fixlist = generateFixlist(depthReport, alignment);

    // Write outputs
    console.log('\nWriting reports...');

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'page_graph.json'),
        JSON.stringify(graph, null, 2)
    );
    console.log('   ✅ page_graph.json');

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'nav-depth-report.json'),
        JSON.stringify(depthReport, null, 2)
    );
    console.log('   ✅ nav-depth-report.json');

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'nav-ssot-alignment.json'),
        JSON.stringify(alignment, null, 2)
    );
    console.log('   ✅ nav-ssot-alignment.json');

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'FIXLIST-nav-depth.md'),
        fixlist
    );
    console.log('   ✅ FIXLIST-nav-depth.md');

    // Print summary
    console.log('\n==============================');
    console.log('📊 AUDIT SUMMARY');
    console.log('==============================\n');

    if (depthReport.summary.orphan > 0) {
        console.log(`❌ FAIL: ${depthReport.summary.orphan} orphan page(s) found`);
        for (const o of depthReport.pages.filter(p => p.class === 'orphan')) {
            console.log(`   - ${o.path}`);
        }
    } else {
        console.log('✅ PASS: No orphan pages');
    }

    const navIssues = alignment.navbar.missing_in_ui.length + alignment.navbar.extra_in_ui.length;
    if (navIssues > 0) {
        console.log(`⚠️  WARN: ${navIssues} navbar SSOT alignment issue(s)`);
    } else {
        console.log('✅ PASS: Navbar aligned with SSOT');
    }

    console.log(`\n📁 Reports written to: ${OUTPUT_DIR}/`);
}

main().catch(console.error);
