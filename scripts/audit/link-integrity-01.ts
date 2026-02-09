import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

/**
 * VLAB Link Integrity Audit (C0)
 * 
 * 1. Builds Route Inventory (SSOT).
 * 2. Crawls Inventory Routes.
 * 3. Extracts Internal Links from HTML.
 * 4. Verifies Link Reachability (200 OK).
 */

const BASE_URL = 'http://localhost:3000';
const OUT_FILE = path.join(process.cwd(), 'reports/link-integrity-01.json');

// Types
interface ScanResult {
    url: string;
    status: number;
    contentType?: string | null;
    links: string[];
    error?: string;
}

interface BrokenLink {
    source: string;
    target: string;
    status: number | string;
}

// Global State
const checkedRoutes = new Set<string>();
const results: Record<string, ScanResult> = {};
const brokenLinks: BrokenLink[] = [];

// --- Inventory Builders ---

function getV1Runs(): string[] {
    try {
        const p = path.join(process.cwd(), 'public/_data/curated-runs.json');
        if (!fs.existsSync(p)) return [];
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return data.map((r: any) => `/runs/${r.id}`);
    } catch { return []; }
}

function getV2Runs(): string[] {
    try {
        const p = path.join(process.cwd(), 'public/_data/v2/runs/index.json');
        if (!fs.existsSync(p)) return [];
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return data.runs.map((r: any) => `/runs/${r.id}`);
    } catch { return []; }
}

function getV1Rulesets(): string[] {
    try {
        const dir = path.join(process.cwd(), 'data/rulesets');
        if (!fs.existsSync(dir)) return [];
        return fs.readdirSync(dir)
            .filter(f => fs.statSync(path.join(dir, f)).isDirectory())
            .map(v => `/rulesets/${v}`); // V1 uses version as ID usually
    } catch { return []; }
}

function getV2Rulesets(): string[] {
    try {
        const p = path.join(process.cwd(), 'public/_data/v2/rulesets/index.json');
        if (!fs.existsSync(p)) return [];
        const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return data.data.rulesets.map((r: any) => `/rulesets/${r.ruleset_id}`);
    } catch { return []; }
}

function getGovernance(): string[] {
    return ['/governance', '/policies', '/audit', '/gates', '/releases'];
}

// --- Crawler ---

async function checkUrl(url: string, source: string = 'ROOT'): Promise<void> {
    if (checkedRoutes.has(url)) return;
    checkedRoutes.add(url);

    // Filter external or static assets (optional, but requested to check internal logic)
    if (url.startsWith('http') && !url.startsWith(BASE_URL)) return; // Skip external

    console.log(`Checking: ${url} (from ${source})`);

    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;

    try {
        const res = await fetch(fullUrl);
        const ct = res.headers.get('content-type');

        // Record status
        if (res.status >= 400) {
            brokenLinks.push({ source, target: url, status: res.status });
            results[url] = { url, status: res.status, links: [] };
            return;
        }

        // Parse content if HTML
        const links: string[] = [];
        if (ct && ct.includes('text/html')) {
            const html = await res.text();
            const $ = cheerio.load(html);

            $('a').each((_, el) => {
                let href = $(el).attr('href');
                if (href) {
                    // Normalize
                    if (href.startsWith('/')) {
                        links.push(href);
                    } else if (href.startsWith(BASE_URL)) {
                        links.push(href.replace(BASE_URL, ''));
                    }
                }
            });
        }

        results[url] = { url, status: res.status, contentType: ct, links };

        // Recursively check discovered links (Depth 1 for now, or queue?)
        // The Prompt asks for "Link Closure" - checking if links on pages are valid.
        // We will queue them.
        for (const link of links) {
            if (!checkedRoutes.has(link)) {
                await checkUrl(link, url);
            }
        }

    } catch (e: any) {
        brokenLinks.push({ source, target: url, status: `ERR: ${e.message}` });
        results[url] = { url, status: 0, links: [], error: e.message };
    }
}

async function main() {
    // 1. Build Inventory
    const inventory = [
        '/',
        ...getGovernance(),
        '/runs',
        '/rulesets',
        ...getV1Runs(),
        ...getV2Runs(),
        ...getV1Rulesets(),
        ...getV2Rulesets()
    ];

    console.log(`Inventory Size: ${inventory.length}`);

    // 2. Start Crawl on Inventory
    for (const route of inventory) {
        await checkUrl(route, 'INVENTORY');
    }

    // 3. Report
    const report = {
        scan_time: new Date().toISOString(),
        checked_count: checkedRoutes.size,
        broken_count: brokenLinks.length,
        broken_links: brokenLinks,
        results
    };

    if (!fs.existsSync(path.dirname(OUT_FILE))) fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

    console.log(`\nAudit Complete.`);
    console.log(`Checked: ${checkedRoutes.size}`);
    console.log(`Broken: ${brokenLinks.length}`);

    if (brokenLinks.length > 0) {
        console.error('Violations found:');
        brokenLinks.forEach(b => console.error(`  ${b.source} -> ${b.target} [${b.status}]`));
        process.exit(1);
    } else {
        process.exit(0);
    }
}

main().catch(console.error);
