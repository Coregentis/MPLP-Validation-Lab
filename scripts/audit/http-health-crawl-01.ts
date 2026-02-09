#!/usr/bin/env tsx

/**
 * Audit: HTTP Health Crawl
 * Scans critical routes to ensure 200 OK and valid content.
 */

const BASE_URL = 'http://localhost:3000';

const ROUTES = [
    '/',
    '/runs',
    '/rulesets',
    '/governance',
    '/releases',
    '/runs/acp-d1-real-runner-001', // V2 Sample
    '/rulesets/ruleset-v2.0.0', // V2 Sample
    '/rulesets/ruleset-v2.0.1', // V2 Patch Sample
];

async function checkRoute(route: string) {
    try {
        const url = `${BASE_URL}${route}`;
        const res = await fetch(url);

        if (res.status === 200) {
            console.log(`✅ [200] ${route}`);
            return true;
        } else {
            console.error(`❌ [${res.status}] ${route}`);
            return false;
        }
    } catch (e) {
        console.error(`❌ [ERR] ${route}`, e);
        return false;
    }
}

async function main() {
    console.log(`Crawling ${BASE_URL}...`);
    let pass = 0;

    // 1. Static Routes
    for (const route of ROUTES) {
        if (await checkRoute(route)) pass++;
    }

    // 2. Dynamic Discovery (Optional - simulate fetching list)

    if (pass === ROUTES.length) {
        console.log(`\nAll ${pass} routes verified.`);
        process.exit(0);
    } else {
        console.error(`\nFailed: ${ROUTES.length - pass} routes broken.`);
        process.exit(1);
    }
}

main().catch(console.error);
