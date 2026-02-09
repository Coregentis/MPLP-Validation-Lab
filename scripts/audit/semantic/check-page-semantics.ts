
/**
 * 🔍 R1 Semantic Auditor - AppShell & DOM Checker (Dependency-Free Version)
 * 
 * Verifies that key pages:
 * 1. Exist and return 200 OK.
 * 2. Contain critical semantic boundaries (data-testid).
 * 3. Adhere to the Single AppShell architecture.
 * 
 * Target: http://localhost:3005 (or BASE_URL)
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
const REPORT_PATH = path.join(process.cwd(), 'audit/semantic/gaps-report.md');
const JSON_REPORT_PATH = path.join(process.cwd(), 'audit/semantic/gaps.json');

// Contract: All pages must have these IDs
const GLOBAL_CONTRACTS = [
    'global-nav',          // GATE-SHELL-NAV-PRESENCE-01
    'app-shell-container'  // GATE-SHELL-CONTAINER-UNIFIED-01
];

// Page-specific contracts
const PAGE_CONTRACTS: Record<string, string[]> = {
    '/': ['home-cta-runsets', 'non-certification-notice'],
    '/methodology': ['methodology-page', 'methodology-non-certification', 'methodology-self-audit-path'],
    '/governance': [], // Just shell
    '/releases': ['releases-legend'],
    '/runs': ['runs-index-header'],
    '/coverage': [],
    '/adjudication': []
};

async function fetchUrl(url: string): Promise<{ status: number, body: string }> {
    try {
        const res = await fetch(url);
        const body = await res.text();
        return { status: res.status, body };
    } catch (e) {
        return { status: 0, body: '' };
    }
}

async function checkUrl(url: string, requiredIds: string[]): Promise<{ pass: boolean; missing: string[] }> {
    try {
        const { status, body } = await fetchUrl(url);

        if (status !== 200) {
            console.error(`❌ ${url} returned ${status}`);
            return { pass: false, missing: [`HTTP ${status}`] };
        }

        const missing: string[] = [];

        // Simple Regex Check for data-testid="..."
        // This is robust enough for presence checks without JSDOM overhead
        const hasId = (id: string) => {
            const regex = new RegExp(`data-testid=["']${id}["']`);
            return regex.test(body);
        };

        // Check Global Contracts
        for (const id of GLOBAL_CONTRACTS) {
            if (!hasId(id)) {
                missing.push(`GLOBAL:${id}`);
            }
        }

        // Check Page Contracts
        for (const id of requiredIds) {
            if (!hasId(id)) {
                missing.push(id);
            }
        }

        // Check for Nested Shells (Anti-pattern)
        // Count occurrences of app-shell-container
        const shellMatch = body.match(/data-testid=["']app-shell-container["']/g);
        if (shellMatch && shellMatch.length > 1) {
            missing.push('DUPLICATE-SHELL-DETECTED');
        }

        return { pass: missing.length === 0, missing };

    } catch (error) {
        console.error(`❌ Failed to fetch ${url}:`, error);
        return { pass: false, missing: ['FETCH_ERROR'] };
    }
}

async function runAudit() {
    console.log(`\n🔍 R1 Semantic Auditor - AppShell & DOM Checker`);
    console.log(`==============================================`);

    // Wait for server
    let attempts = 0;
    while (attempts < 5) {
        try {
            const { status } = await fetchUrl(BASE_URL);
            if (status === 200) {
                console.log(`✅ Server ready after ${attempts + 1} attempts`);
                break;
            }
            throw new Error('Not ready');
        } catch (e) {
            attempts++;
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (attempts === 5) {
        console.error('❌ Server not available');
        process.exit(1);
    }

    console.log(`\n✅ Server available at ${BASE_URL}\n`);

    const results: Record<string, string[]> = {};
    let totalPass = 0;
    let totalFail = 0;

    for (const [route, ids] of Object.entries(PAGE_CONTRACTS)) {
        process.stdout.write(`   Checking ${route}... `);
        const { pass, missing } = await checkUrl(`${BASE_URL}${route}`, ids);

        if (pass) {
            console.log('✅');
            totalPass++;
        } else {
            console.log(`❌ Missing: ${missing.join(', ')}`);
            results[route] = missing;
            totalFail++;
        }
    }

    // Generate Reports
    const reportContent = `# Semantic & AppShell Audit Report
Date: ${new Date().toISOString()}
Base URL: ${BASE_URL}

## Summary
- **Total Checked**: ${totalPass + totalFail}
- **Passed**: ${totalPass}
- **Failed**: ${totalFail}

## Failures
${Object.entries(results).map(([route, missing]) => `### ${route}
- Missing IDs:
${missing.map(m => `  - ${m}`).join('\n')}
`).join('\n')}
`;

    fs.writeFileSync(REPORT_PATH, reportContent);
    fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(results, null, 2));

    console.log(`\n📊 Results:`);
    console.log(`   Checked URLs: ${totalPass + totalFail}`);
    console.log(`   Passed: ${totalPass}`);
    console.log(`   Gaps: ${totalFail}`);

    console.log(`\n✅ Report: ${REPORT_PATH}`);

    if (totalFail > 0) {
        process.exit(1);
    }
}

runAudit();
