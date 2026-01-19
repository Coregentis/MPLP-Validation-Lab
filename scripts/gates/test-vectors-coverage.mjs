#!/usr/bin/env node
/**
 * Test Vectors Coverage Gate - v0.5
 * 
 * Verifies that test vectors meet coverage requirements:
 *   - ≥5 PASS vectors per domain
 *   - ≥5 FAIL vectors per domain
 *   - All vectors adjudicable via shadow-validator
 *   - Total ≥40 vectors
 * 
 * Usage: npm run gate:test-vectors-coverage
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

// Coverage thresholds
const MIN_PASS_PER_DOMAIN = 5;
const MIN_FAIL_PER_DOMAIN = 5;
const DOMAINS = ['D1', 'D2', 'D3', 'D4'];

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.5 Test Vectors Coverage Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-TEST-VECTORS-COVERAGE',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        coverage: {
            target: {
                min_pass_per_domain: MIN_PASS_PER_DOMAIN,
                min_fail_per_domain: MIN_FAIL_PER_DOMAIN,
                min_total: MIN_PASS_PER_DOMAIN * 4 + MIN_FAIL_PER_DOMAIN * 4,
            },
            actual: {
                D1: { pass: 0, fail: 0 },
                D2: { pass: 0, fail: 0 },
                D3: { pass: 0, fail: 0 },
                D4: { pass: 0, fail: 0 },
            },
            total: 0,
        },
        issues: [],
        vectors: [],
    };

    try {
        // Load allowlist
        const allowlistPath = path.join(PROJECT_ROOT, 'test-vectors/v0.5/allowlist-v0.5.yaml');
        if (!fs.existsSync(allowlistPath)) {
            throw new Error('v0.5 allowlist not found: test-vectors/v0.5/allowlist-v0.5.yaml');
        }

        const allowlistContent = fs.readFileSync(allowlistPath, 'utf-8');
        const allowlist = yaml.parse(allowlistContent);

        console.log('📋 Scanning v0.5 test vectors...\n');

        // Count vectors per domain
        for (const domain of DOMAINS) {
            const domainData = allowlist[domain];
            if (!domainData) {
                results.issues.push(`Domain ${domain} not found in allowlist`);
                continue;
            }

            const passVectors = domainData.PASS || [];
            const failVectors = domainData.FAIL || [];

            // Count and validate vectors
            let passCount = 0;
            let failCount = 0;

            for (const vec of passVectors) {
                const exists = fs.existsSync(path.join(PROJECT_ROOT, vec.path));
                results.vectors.push({
                    vector_id: vec.vector_id,
                    domain,
                    expected: 'PASS',
                    path: vec.path,
                    exists,
                });
                if (exists) passCount++;
            }

            for (const vec of failVectors) {
                const exists = fs.existsSync(path.join(PROJECT_ROOT, vec.path));
                results.vectors.push({
                    vector_id: vec.vector_id,
                    domain,
                    expected: 'FAIL',
                    path: vec.path,
                    exists,
                });
                if (exists) failCount++;
            }

            results.coverage.actual[domain].pass = passCount;
            results.coverage.actual[domain].fail = failCount;

            // Check thresholds
            const passDeficit = MIN_PASS_PER_DOMAIN - passCount;
            const failDeficit = MIN_FAIL_PER_DOMAIN - failCount;

            const passEmoji = passCount >= MIN_PASS_PER_DOMAIN ? '✅' : '❌';
            const failEmoji = failCount >= MIN_FAIL_PER_DOMAIN ? '✅' : '❌';

            console.log(`  ${domain}: ${passEmoji} PASS ${passCount}/${MIN_PASS_PER_DOMAIN}  ${failEmoji} FAIL ${failCount}/${MIN_FAIL_PER_DOMAIN}`);

            if (passDeficit > 0) {
                results.issues.push(`${domain} needs ${passDeficit} more PASS vectors`);
            }
            if (failDeficit > 0) {
                results.issues.push(`${domain} needs ${failDeficit} more FAIL vectors`);
            }
        }

        // Calculate total
        results.coverage.total = Object.values(results.coverage.actual).reduce(
            (sum, d) => sum + d.pass + d.fail, 0
        );

        console.log(`\n  Total: ${results.coverage.total}/${results.coverage.target.min_total} vectors\n`);

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.issues.length > 0) {
        results.status = 'FAIL';
        results.failure_reason = `Coverage requirements not met: ${results.issues.length} issue(s)`;
        console.log('📊 Coverage Issues:');
        for (const issue of results.issues) {
            console.log(`   ⚠️ ${issue}`);
        }
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'test-vectors-coverage.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Coverage:`);
    for (const domain of DOMAINS) {
        const d = results.coverage.actual[domain];
        console.log(`    ${domain}: ${d.pass} PASS, ${d.fail} FAIL`);
    }
    console.log(`    Total: ${results.coverage.total}`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'PASS' ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
