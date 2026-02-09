/**
 * GATE-UNIFIED-SURFACE-NO-404-01
 * aka VLAB-SURFACE-LINK-AUDIT-01
 * 
 * Systematically audits internal links on key "Surface Pages" to ensure NO 404s.
 * 
 * Scope:
 * - Home (/)
 * - Governance (/governance) & subpages (/runsets, /rulesets)
 * - Runsets Index & Detail
 * - Rulesets Index & Detail
 * 
 * Methodology:
 * 1. Extract links from these pages via fetch + regex (simple static analysis of rendered HTML via Next.js dev server).
 * 2. Validate distinct internal links return 200 OK.
 * 
 * Note: This relies on the dev server running at localhost:3000.
 */

const BASE_URL = 'http://localhost:3000';
const ENTRY_POINTS = [
    '/',
    '/governance',
    '/runs',
    '/runsets',
    '/rulesets'
];

// Simple regex to find href="..."
// We look for href="/..." or href="http://localhost:3000/..."
const HREF_REGEX = /href=["'](\/[^"']*)["']|href=["'](http:\/\/localhost:3000[^"']*)["']/g;

const CHECKED = new Set<string>();
const FAILURES: string[] = [];

async function getLinksOnPage(url: string): Promise<string[]> {
    try {
        const res = await fetch(url);
        if (res.status !== 200) {
            FAILURES.push(`${url} (Page Itself) -> ${res.status}`);
            return [];
        }
        const html = await res.text();
        const links: string[] = [];
        let match;
        while ((match = HREF_REGEX.exec(html)) !== null) {
            const path = match[1] || match[2];
            // Filter out empty, fragments, or external
            if (!path || path.startsWith('#') || path === '/' || path.includes('//')) continue;
            // Normalize
            const cleanPath = path.startsWith('http') ? path.replace(BASE_URL, '') : path;
            if (cleanPath.startsWith('/')) links.push(cleanPath);
        }
        return links;
    } catch (e) {
        FAILURES.push(`${url} (Fetch Error) -> ${(e as Error).message}`);
        return [];
    }
}

async function checkLink(path: string) {
    if (CHECKED.has(path)) return;
    CHECKED.add(path);

    try {
        const res = await fetch(`${BASE_URL}${path}`);
        if (res.status !== 200) {
            console.error(`[FAIL] ${path} -> ${res.status}`);
            FAILURES.push(`${path} -> ${res.status}`);
        } else {
            // console.log(`[PASS] ${path}`);
        }
    } catch (e) {
        console.error(`[FAIL] ${path} -> Network Error`);
        FAILURES.push(`${path} -> Network Error`);
    }
}

export const gate = {
    id: 'GATE-UNIFIED-SURFACE-NO-404-01',
    name: 'Surface Link Integrity Audit',
    run: async () => {
        console.log(`Starting Crawl on ${ENTRY_POINTS.length} entry points...`);

        let allLinks = new Set<string>();

        // 1. Collect Links
        for (const entry of ENTRY_POINTS) {
            const links = await getLinksOnPage(`${BASE_URL}${entry}`);
            links.forEach(l => allLinks.add(l));
        }

        console.log(`Found ${allLinks.size} unique internal links to verify.`);

        // 2. Verify Links
        for (const link of allLinks) {
            await checkLink(link);
        }

        if (FAILURES.length > 0) {
            console.error('Link Failures Detected:');
            FAILURES.forEach(f => console.error(`- ${f}`));
            return false;
        }

        console.log('All surface links verified (200 OK).');
        return true;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => process.exit(pass ? 0 : 1));
}
