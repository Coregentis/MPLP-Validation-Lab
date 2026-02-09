#!/usr/bin/env tsx
/**
 * Surface Coverage Auditor - Step 0: Runtime Route Crawler
 * 
 * Crawls the running site from homepage, extracting all internal links.
 * 
 * Prerequisites: npm run build && npm run start (server must be running)
 * Output: audit/surface/routes.runtime.json
 * 
 * Usage: npx tsx scripts/audit/surface/scan-routes-runtime.ts
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const MAX_PAGES = 500;
const TIMEOUT_MS = 5000;

interface RuntimeRoute {
    url: string;                 // Full URL
    path: string;                // Path only
    status: number;              // HTTP status
    discovered_from: string[];   // Pages that linked to this
    is_internal: boolean;
    content_type?: string;
}

interface RuntimeInventory {
    generated_at: string;
    base_url: string;
    total_discovered: number;
    internal_pages: number;
    external_links: number;
    errors: number;
    routes: RuntimeRoute[];
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            redirect: 'follow'
        });
        clearTimeout(timeout);
        return response;
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
}

function extractLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];

    // Match href attributes
    const hrefRegex = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
        const href = match[1];
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
            links.push(href);
        }
    }

    return links;
}

function normalizeUrl(href: string, currentUrl: string): string | null {
    try {
        // Handle relative URLs
        if (href.startsWith('/')) {
            return new URL(href, BASE_URL).href;
        }
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return href;
        }
        // Relative to current page
        return new URL(href, currentUrl).href;
    } catch {
        return null;
    }
}

function isInternal(url: string): boolean {
    try {
        const parsed = new URL(url);
        const base = new URL(BASE_URL);
        return parsed.host === base.host;
    } catch {
        return false;
    }
}

async function crawl(): Promise<RuntimeInventory> {
    const visited = new Set<string>();
    const queue: { url: string; from: string }[] = [{ url: BASE_URL, from: 'entry' }];
    const routes: RuntimeRoute[] = [];
    const linkSources = new Map<string, string[]>();

    console.log(`🕷️  Starting crawl from ${BASE_URL}`);
    console.log(`   Max pages: ${MAX_PAGES}`);
    console.log('');

    while (queue.length > 0 && visited.size < MAX_PAGES) {
        const item = queue.shift()!;
        const url = item.url.split('#')[0]; // Remove fragment

        if (visited.has(url)) {
            // Track additional sources
            const existing = linkSources.get(url) || [];
            if (!existing.includes(item.from)) {
                existing.push(item.from);
                linkSources.set(url, existing);
            }
            continue;
        }

        visited.add(url);
        linkSources.set(url, [item.from]);

        const internal = isInternal(url);

        // Only crawl internal pages
        if (!internal) {
            routes.push({
                url,
                path: url,
                status: -1, // Not fetched
                discovered_from: [item.from],
                is_internal: false,
            });
            continue;
        }

        try {
            const response = await fetchWithTimeout(url, TIMEOUT_MS);
            const contentType = response.headers.get('content-type') || '';
            const parsedUrl = new URL(url);

            routes.push({
                url,
                path: parsedUrl.pathname,
                status: response.status,
                discovered_from: linkSources.get(url) || [item.from],
                is_internal: true,
                content_type: contentType.split(';')[0],
            });

            process.stdout.write(`   [${response.status}] ${parsedUrl.pathname}\r`);

            // Only parse HTML content
            if (contentType.includes('text/html')) {
                const html = await response.text();
                const links = extractLinks(html, url);

                for (const href of links) {
                    const normalized = normalizeUrl(href, url);
                    if (normalized && !visited.has(normalized.split('#')[0])) {
                        queue.push({ url: normalized, from: parsedUrl.pathname });
                    }
                }
            }
        } catch (e) {
            routes.push({
                url,
                path: new URL(url).pathname,
                status: -2, // Error
                discovered_from: linkSources.get(url) || [item.from],
                is_internal: true,
            });
            console.log(`   [ERR] ${url}: ${e}`);
        }
    }

    console.log('\n');

    // Deduplicate and merge sources
    const routeMap = new Map<string, RuntimeRoute>();
    for (const route of routes) {
        const key = route.path;
        const existing = routeMap.get(key);
        if (existing) {
            existing.discovered_from = [...new Set([...existing.discovered_from, ...route.discovered_from])];
        } else {
            routeMap.set(key, route);
        }
    }

    const finalRoutes = Array.from(routeMap.values()).sort((a, b) => a.path.localeCompare(b.path));

    return {
        generated_at: new Date().toISOString(),
        base_url: BASE_URL,
        total_discovered: finalRoutes.length,
        internal_pages: finalRoutes.filter(r => r.is_internal && r.status === 200).length,
        external_links: finalRoutes.filter(r => !r.is_internal).length,
        errors: finalRoutes.filter(r => r.status < 0 || r.status >= 400).length,
        routes: finalRoutes,
    };
}

async function main() {
    console.log('🔍 Surface Coverage Auditor - Runtime Route Crawler');
    console.log('===================================================\n');

    const inventory = await crawl();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'audit/surface');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'routes.runtime.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(`📊 Crawl Results:`);
    console.log(`   Total Discovered: ${inventory.total_discovered}`);
    console.log(`   Internal Pages (200): ${inventory.internal_pages}`);
    console.log(`   External Links: ${inventory.external_links}`);
    console.log(`   Errors: ${inventory.errors}`);

    if (inventory.errors > 0) {
        console.log('\n⚠️  Errors:');
        for (const route of inventory.routes.filter(r => r.status >= 400 || r.status < 0)) {
            console.log(`   [${route.status}] ${route.path}`);
            console.log(`      From: ${route.discovered_from.slice(0, 3).join(', ')}`);
        }
    }

    console.log(`\n✅ Output: ${outputPath}`);
}

main().catch(console.error);
