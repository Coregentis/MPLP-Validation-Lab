#!/usr/bin/env node
/**
 * R4 — Internal Link Integrity Gate
 * 
 * Validates that all navigation links in NAVIGATION_MAP.yaml:
 * 1. Resolve to existing Next.js routes
 * 2. Do not include disallowed paths
 * 3. External links have proper rel attributes (checked at build time)
 * 
 * Usage: node scripts/ci/link-integrity-gate.mjs
 * 
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (link issues found)
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const ROOT = process.cwd();
const NAV_MAP_PATH = path.join(ROOT, 'governance', 'NAVIGATION_MAP.yaml');
const APP_DIR = path.join(ROOT, 'app');

// Load navigation map
function loadNavigationMap() {
    if (!fs.existsSync(NAV_MAP_PATH)) {
        console.error('❌ NAVIGATION_MAP.yaml not found');
        process.exit(1);
    }
    return yaml.parse(fs.readFileSync(NAV_MAP_PATH, 'utf-8'));
}

// Check if a route exists in app directory
function routeExists(href) {
    if (href === '/') {
        return fs.existsSync(path.join(APP_DIR, 'page.tsx'));
    }

    const routePath = href.replace(/^\//, '');
    const possiblePaths = [
        path.join(APP_DIR, routePath, 'page.tsx'),
        path.join(APP_DIR, routePath + '.tsx'),
    ];

    return possiblePaths.some(p => fs.existsSync(p));
}

// Collect all internal links from navigation map
function collectInternalLinks(navMap) {
    const links = [];

    // Navbar internal
    if (navMap.navbar?.internal) {
        navMap.navbar.internal.forEach(item => links.push(item.href));
    }

    // Footer columns
    ['governance', 'evidence', 'community'].forEach(col => {
        if (navMap.footer?.[col]?.links) {
            navMap.footer[col].links.forEach(item => {
                if (!item.external) links.push(item.href);
            });
        }
    });

    // Home cards
    ['resource_cards', 'governance_cards'].forEach(group => {
        if (navMap.home_cards?.[group]) {
            navMap.home_cards[group].forEach(item => links.push(item.href));
        }
    });

    // Coverage cards
    if (navMap.coverage_cards) {
        navMap.coverage_cards.forEach(item => links.push(item.href));
    }

    return [...new Set(links)]; // Dedupe
}

// Main validation
function main() {
    console.log('🔗 R4 — Internal Link Integrity Gate\n');

    const navMap = loadNavigationMap();
    const disallowed = navMap.disallowed_routes || [];
    const internalLinks = collectInternalLinks(navMap);

    let failures = [];
    let passes = [];

    console.log(`Checking ${internalLinks.length} internal links...\n`);

    for (const href of internalLinks) {
        // Check disallowed
        if (disallowed.some(d => href.startsWith(d))) {
            failures.push({ href, reason: 'Links to disallowed path' });
            continue;
        }

        // Check route exists
        if (!routeExists(href)) {
            failures.push({ href, reason: 'Route does not exist' });
            continue;
        }

        passes.push(href);
    }

    // Report
    console.log('✅ PASS:');
    passes.forEach(p => console.log(`   ${p}`));

    if (failures.length > 0) {
        console.log('\n❌ FAIL:');
        failures.forEach(f => console.log(`   ${f.href} — ${f.reason}`));
        console.log(`\n❌ Gate FAILED: ${failures.length} link issues found`);
        process.exit(1);
    }

    console.log(`\n✅ Gate PASSED: All ${passes.length} links valid`);
    process.exit(0);
}

main();
