#!/usr/bin/env tsx
/**
 * Audit Orchestrator - Unified Entry Point
 * 
 * Usage:
 *   npm run audit:p0      # Run only P0 blocking audits
 *   npm run audit:p1      # Run P0 + P1 audits
 *   npm run audit:all     # Run all audits (P0 + P1 + P2)
 */

import * as fs from 'fs';
import * as path from 'path';
import { AuditReporter, aggregateResults, generateMarkdownReport, type AuditResult } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/_meta');
const REPORT_JSON = path.join(OUTPUT_DIR, 'audit-report.json');
const REPORT_MD = path.join(OUTPUT_DIR, 'audit-report.md');

// Audit registry with phase classification
const AUDIT_REGISTRY = {
    P0: [
        { id: 'audit-03', name: 'Curated Runs Index Integrity', script: './audit-03-curated-index' },
        { id: 'audit-04', name: 'Ruleset Diff Index Integrity', script: './audit-04-diff-index' },
        { id: 'audit-06', name: 'Version Consistency', script: './audit-06-version-consistency' },
        { id: 'audit-07', name: 'Evidence Reference Resolution', script: './audit-07-evidence-refs' },
        { id: 'audit-12', name: 'Data Pollution Detection', script: './audit-12-data-pollution' },
        { id: 'audit-13', name: 'SEAL Format Compliance', script: './audit-13-seal-format' },
    ],
    P1: [
        { id: 'audit-01', name: 'Run Completeness', script: './audit-01-run-completeness' },
        { id: 'audit-02', name: 'Diffpack Schema Validation', script: './audit-02-diffpack-schema' },
        { id: 'audit-05', name: 'Manifest Anchor Resolution', script: './audit-05-manifest-anchors' },
    ],
    P2: [
        { id: 'audit-08', name: 'SmartLink Resolution', script: './audit-08-smartlink-resolution' },
    ]
};

async function runAudit(
    id: string,
    name: string,
    scriptPath: string,
    phase: 'P0' | 'P1' | 'P2'
): Promise<AuditResult> {
    console.log(`\n🔍 Running ${name} (${id})...`);

    try {
        // Dynamically import the audit script
        const auditModule = await import(scriptPath);

        if (typeof auditModule.default !== 'function') {
            throw new Error(`Audit script ${scriptPath} must export default function`);
        }

        const reporter = new AuditReporter(id, name, phase);
        await auditModule.default(reporter);

        const result = reporter.getResult();
        reporter.print();

        return result;
    } catch (error) {
        // If audit script fails to load/execute, treat as critical failure
        const reporter = new AuditReporter(id, name, phase);
        reporter.blocker({
            code: `${id.toUpperCase()}-EXECUTION-FAILURE`,
            layer: 'LAYER_7_GATES',
            message: `Audit script failed to execute: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: `Check audit script at ${scriptPath} for syntax/runtime errors`
        });

        return reporter.getResult();
    }
}

async function main() {
    const args = process.argv.slice(2);
    const phase = args[0] || 'p0'; // Default to P0 only

    console.log('═'.repeat(60));
    console.log('🛡️  Validation Lab Unified Audit');
    console.log('═'.repeat(60));
    console.log(`Phase: ${phase.toUpperCase()}`);
    console.log(`Time: ${new Date().toISOString()}`);
    console.log('═'.repeat(60));

    // Determine which audits to run based on phase
    let auditsToRun: Array<{ id: string; name: string; script: string; phase: 'P0' | 'P1' | 'P2' }> = [];

    switch (phase.toLowerCase()) {
        case 'p0':
            auditsToRun = AUDIT_REGISTRY.P0.map(a => ({ ...a, phase: 'P0' as const }));
            break;
        case 'p1':
            auditsToRun = [
                ...AUDIT_REGISTRY.P0.map(a => ({ ...a, phase: 'P0' as const })),
                ...AUDIT_REGISTRY.P1.map(a => ({ ...a, phase: 'P1' as const }))
            ];
            break;
        case 'all':
        case 'p2':
            auditsToRun = [
                ...AUDIT_REGISTRY.P0.map(a => ({ ...a, phase: 'P0' as const })),
                ...AUDIT_REGISTRY.P1.map(a => ({ ...a, phase: 'P1' as const })),
                ...AUDIT_REGISTRY.P2.map(a => ({ ...a, phase: 'P2' as const }))
            ];
            break;
        default:
            console.error(`❌ Unknown phase: ${phase}. Use p0, p1, or all`);
            process.exit(1);
    }

    console.log(`\nRunning ${auditsToRun.length} audits...\n`);

    // Run all audits
    const results: AuditResult[] = [];
    for (const audit of auditsToRun) {
        const result = await runAudit(audit.id, audit.name, audit.script, audit.phase);
        results.push(result);
    }

    // Load lab series from manifest
    const manifestPath = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');
    let labSeries = 'v0.17.0'; // Default
    try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        labSeries = manifest.lab_series || labSeries;
    } catch {
        console.warn('⚠️  Could not read lab_series from manifest, using default');
    }

    // Aggregate results
    const report = aggregateResults(results, labSeries);

    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // Write JSON report
    fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2));
    console.log(`\n📄 JSON report written to: ${REPORT_JSON}`);

    // Write Markdown report
    const markdown = generateMarkdownReport(report);
    fs.writeFileSync(REPORT_MD, markdown);
    console.log(`📄 Markdown report written to: ${REPORT_MD}`);

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 AUDIT SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total Audits:   ${report.summary.total_audits}`);
    console.log(`Passed:         ✅ ${report.summary.passed}`);
    console.log(`Failed:         ❌ ${report.summary.failed}`);
    console.log(`Total Findings: ${report.summary.total_findings}`);
    console.log(`  🔴 Blockers:  ${report.summary.blockers}`);
    console.log(`  🟠 Critical:  ${report.summary.critical}`);
    console.log(`  🟡 Important: ${report.summary.important}`);
    console.log(`  ⚪ Cosmetic:  ${report.summary.cosmetic}`);
    console.log('═'.repeat(60));

    // Exit with error if blockers found
    if (report.summary.blockers > 0) {
        console.log('\n❌ AUDIT FAILED: P0 blockers detected');
        process.exit(1);
    } else {
        console.log('\n✅ AUDIT PASSED: No P0 blockers');
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Fatal error in audit orchestrator:', err);
    process.exit(1);
});
