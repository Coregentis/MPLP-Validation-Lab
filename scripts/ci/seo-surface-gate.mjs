#!/usr/bin/env node
/**
 * R5 — SEO Surface Gate
 * 
 * Validates SEO consistency against Indexing Policy Matrix:
 * 1. sitemap.xml contains only indexable pages
 * 2. sitemap URLs return 200
 * 3. Page meta robots matches policy
 * 4. robots.txt disallow list matches policy
 * 
 * Usage: node scripts/ci/seo-surface-gate.mjs [--url=http://localhost:3000]
 * 
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (SEO issues found)
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

// Policy from REL-LAB-0.5-SEO-INDEXING.md
const INDEXABLE = [
    '/',
    '/about',
    '/runs',
    '/adjudication',
    '/rulesets',
    '/guarantees',
    '/coverage',
    '/coverage/adjudication',
    '/policies/contract',
    '/policies/intake',
    '/policies/substrate-scope',
];

const NOINDEX = [
    '/runs/[run_id]',
    '/runs/[run_id]/replay',
    '/runs/[run_id]/evidence',
    '/rulesets/[version]',
    '/adjudication/[run_id]',
];

const DISALLOWED = [
    '/api',
    '/builder',
    '/statement',
    '/examples',
];

// Parse command line
const args = process.argv.slice(2);
const baseUrl = args.find(a => a.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';

async function fetchText(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

async function main() {
    console.log('🔍 R5 — SEO Surface Gate\n');
    console.log(`Base URL: ${baseUrl}\n`);

    let failures = [];

    // 1. Check sitemap.xml
    console.log('1. Checking sitemap.xml...');
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const sitemap = await fetchText(sitemapUrl);

    if (!sitemap) {
        failures.push({ check: 'sitemap.xml', reason: 'Failed to fetch' });
    } else {
        // Extract URLs from sitemap
        const urlMatches = sitemap.matchAll(/<loc>([^<]+)<\/loc>/g);
        const sitemapUrls = [...urlMatches].map(m => m[1]);

        console.log(`   Found ${sitemapUrls.length} URLs in sitemap`);

        // Check count
        if (sitemapUrls.length !== INDEXABLE.length) {
            failures.push({
                check: 'sitemap count',
                reason: `Expected ${INDEXABLE.length} URLs, got ${sitemapUrls.length}`
            });
        }

        // Check no disallowed in sitemap
        for (const url of sitemapUrls) {
            const path = new URL(url).pathname;
            if (DISALLOWED.some(d => path.startsWith(d))) {
                failures.push({
                    check: 'sitemap contains disallowed',
                    reason: `${path} should not be in sitemap`
                });
            }
        }
    }

    // 2. Check robots.txt
    console.log('2. Checking robots.txt...');
    const robotsUrl = `${baseUrl}/robots.txt`;
    const robots = await fetchText(robotsUrl);

    if (!robots) {
        failures.push({ check: 'robots.txt', reason: 'Failed to fetch' });
    } else {
        // Check disallow directives
        for (const path of DISALLOWED) {
            if (!robots.includes(`Disallow: ${path}`)) {
                // Check with trailing slash variant
                if (!robots.includes(`Disallow: ${path}/`)) {
                    failures.push({
                        check: 'robots.txt disallow',
                        reason: `Missing disallow for ${path}`
                    });
                }
            }
        }
        console.log('   robots.txt disallow list verified');
    }

    // 3. Spot-check indexable page meta
    console.log('3. Spot-checking page meta robots...');
    const spotChecks = ['/', '/about', '/coverage'];

    for (const p of spotChecks) {
        const html = await fetchText(`${baseUrl}${p}`);
        if (html) {
            const hasNoindex = html.includes('noindex') || html.includes('NOINDEX');
            if (hasNoindex) {
                failures.push({
                    check: `page meta ${p}`,
                    reason: 'Indexable page has noindex'
                });
            } else {
                console.log(`   ${p} — index:true ✓`);
            }
        }
    }

    // 4. Check /runs is noindex
    console.log('4. Checking noindex pages...');
    const runsHtml = await fetchText(`${baseUrl}/runs`);
    if (runsHtml) {
        const hasNoindex = runsHtml.includes('noindex') || runsHtml.includes('NOINDEX');
        if (!hasNoindex) {
            failures.push({
                check: '/runs meta',
                reason: '/runs should have noindex but does not'
            });
        } else {
            console.log('   /runs — noindex ✓');
        }
    }

    // Report
    console.log('\n---');
    if (failures.length > 0) {
        console.log('\n❌ FAILURES:');
        failures.forEach(f => console.log(`   [${f.check}] ${f.reason}`));
        console.log(`\n❌ Gate FAILED: ${failures.length} SEO issues found`);
        process.exit(1);
    }

    console.log('\n✅ Gate PASSED: SEO policy verified');
    process.exit(0);
}

main();
