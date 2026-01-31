/**
 * Unified Audit Report API
 * 
 * All audit scripts must use this API to report findings.
 * Outputs standardized JSON + Markdown reports.
 */

export type AuditSeverity = 'P0_BLOCKER' | 'P1_CRITICAL' | 'P2_IMPORTANT' | 'P3_COSMETIC';
export type AuditLayer =
    | 'LAYER_0_PIPELINE'
    | 'LAYER_1_SOURCE_DATA'
    | 'LAYER_2_INDEX'
    | 'LAYER_3_SSOT'
    | 'LAYER_4_CROSS_REF'
    | 'LAYER_5_UI'
    | 'LAYER_6_SCHEMA'
    | 'LAYER_7_GATES';

export interface AuditFinding {
    code: string;           // e.g. "AUDIT-04-DUPLICATE-DIFF"
    severity: AuditSeverity;
    layer: AuditLayer;
    file?: string;          // Absolute or relative path
    pointer?: string;       // JSON Pointer if applicable
    message: string;        // Human-readable description
    suggested_fix?: string; // Actionable fix suggestion
    context?: Record<string, unknown>; // Additional structured data
}

export interface AuditResult {
    audit_id: string;       // e.g. "audit-04-diff-index"
    audit_name: string;     // e.g. "Ruleset Diff Index Integrity"
    phase: 'P0' | 'P1' | 'P2';
    passed: boolean;
    findings: AuditFinding[];
    execution_time_ms: number;
    timestamp: string;
}

export interface AuditReport {
    report_version: string;
    generated_at: string;
    lab_series: string;
    summary: {
        total_audits: number;
        passed: number;
        failed: number;
        total_findings: number;
        blockers: number;      // P0 count
        critical: number;      // P1 count
        important: number;     // P2 count
        cosmetic: number;      // P3 count
    };
    audits: AuditResult[];
}

export class AuditReporter {
    private findings: AuditFinding[] = [];
    private startTime: number;

    constructor(
        private auditId: string,
        private auditName: string,
        private phase: 'P0' | 'P1' | 'P2'
    ) {
        this.startTime = Date.now();
    }

    addFinding(finding: Omit<AuditFinding, 'severity'> & { severity: AuditSeverity }): void {
        this.findings.push(finding as AuditFinding);
    }

    error(params: {
        code: string;
        severity: AuditSeverity;
        layer: AuditLayer;
        message: string;
        file?: string;
        pointer?: string;
        suggested_fix?: string;
        context?: Record<string, unknown>;
    }): void {
        this.addFinding(params);
    }

    getResult(): AuditResult {
        return {
            audit_id: this.auditId,
            audit_name: this.auditName,
            phase: this.phase,
            passed: this.findings.filter(f => f.severity === 'P0_BLOCKER').length === 0,
            findings: this.findings,
            execution_time_ms: Date.now() - this.startTime,
            timestamp: new Date().toISOString()
        };
    }

    // Convenience methods for common severities
    blocker(params: Omit<Parameters<AuditReporter['error']>[0], 'severity'>): void {
        this.error({ ...params, severity: 'P0_BLOCKER' });
    }

    critical(params: Omit<Parameters<AuditReporter['error']>[0], 'severity'>): void {
        this.error({ ...params, severity: 'P1_CRITICAL' });
    }

    important(params: Omit<Parameters<AuditReporter['error']>[0], 'severity'>): void {
        this.error({ ...params, severity: 'P2_IMPORTANT' });
    }

    cosmetic(params: Omit<Parameters<AuditReporter['error']>[0], 'severity'>): void {
        this.error({ ...params, severity: 'P3_COSMETIC' });
    }

    // Console logging for immediate feedback
    print(): void {
        const severityEmoji = {
            P0_BLOCKER: '🔴',
            P1_CRITICAL: '🟠',
            P2_IMPORTANT: '🟡',
            P3_COSMETIC: '⚪'
        };

        console.log(`\n📋 ${this.auditName} (${this.auditId})`);

        if (this.findings.length === 0) {
            console.log('✅ No issues found');
            return;
        }

        this.findings.forEach(finding => {
            const emoji = severityEmoji[finding.severity];
            console.log(`\n${emoji} [${finding.code}] ${finding.severity}`);
            console.log(`   ${finding.message}`);
            if (finding.file) {
                console.log(`   File: ${finding.file}${finding.pointer ? ` → ${finding.pointer}` : ''}`);
            }
            if (finding.suggested_fix) {
                console.log(`   💡 Fix: ${finding.suggested_fix}`);
            }
        });
    }
}

/**
 * Generate Markdown report from AuditReport JSON
 */
export function generateMarkdownReport(report: AuditReport): string {
    const lines: string[] = [];

    lines.push('# Validation Lab Audit Report');
    lines.push('');
    lines.push(`**Generated**: ${report.generated_at}`);
    lines.push(`**Lab Series**: ${report.lab_series}`);
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push('| Metric | Count |');
    lines.push('|:-------|------:|');
    lines.push(`| Total Audits | ${report.summary.total_audits} |`);
    lines.push(`| Passed | ✅ ${report.summary.passed} |`);
    lines.push(`| Failed | ❌ ${report.summary.failed} |`);
    lines.push(`| Total Findings | ${report.summary.total_findings} |`);
    lines.push(`| 🔴 Blockers (P0) | ${report.summary.blockers} |`);
    lines.push(`| 🟠 Critical (P1) | ${report.summary.critical} |`);
    lines.push(`| 🟡 Important (P2) | ${report.summary.important} |`);
    lines.push(`| ⚪ Cosmetic (P3) | ${report.summary.cosmetic} |`);
    lines.push('');

    // Overall Status
    const overallPass = report.summary.blockers === 0;
    lines.push(`**Overall Status**: ${overallPass ? '✅ PASS' : '❌ FAIL'} ${overallPass ? '(No P0 blockers)' : '(P0 blockers found)'}`);
    lines.push('');

    // Failed Audits
    const failedAudits = report.audits.filter(a => !a.passed);
    if (failedAudits.length > 0) {
        lines.push('## Failed Audits');
        lines.push('');
        failedAudits.forEach(audit => {
            lines.push(`### ❌ ${audit.audit_name}`);
            lines.push(`**ID**: \`${audit.audit_id}\` | **Phase**: ${audit.phase} | **Findings**: ${audit.findings.length}`);
            lines.push('');
        });
    }

    // All Findings (grouped by severity)
    if (report.summary.total_findings > 0) {
        lines.push('## Findings by Severity');
        lines.push('');

        const severities: AuditSeverity[] = ['P0_BLOCKER', 'P1_CRITICAL', 'P2_IMPORTANT', 'P3_COSMETIC'];
        const emojiMap = {
            P0_BLOCKER: '🔴',
            P1_CRITICAL: '🟠',
            P2_IMPORTANT: '🟡',
            P3_COSMETIC: '⚪'
        };

        severities.forEach(severity => {
            const findings = report.audits.flatMap(a =>
                a.findings.filter(f => f.severity === severity)
            );

            if (findings.length === 0) return;

            lines.push(`### ${emojiMap[severity]} ${severity} (${findings.length})`);
            lines.push('');

            findings.forEach(finding => {
                lines.push(`#### \`${finding.code}\``);
                lines.push(finding.message);
                if (finding.file) {
                    lines.push(`- **File**: \`${finding.file}\``);
                }
                if (finding.pointer) {
                    lines.push(`- **Pointer**: \`${finding.pointer}\``);
                }
                if (finding.suggested_fix) {
                    lines.push(`- 💡 **Fix**: ${finding.suggested_fix}`);
                }
                lines.push('');
            });
        });
    }

    // Passed Audits
    const passedAudits = report.audits.filter(a => a.passed);
    if (passedAudits.length > 0) {
        lines.push('## Passed Audits');
        lines.push('');
        passedAudits.forEach(audit => {
            lines.push(`- ✅ ${audit.audit_name} (\`${audit.audit_id}\`)`);
        });
        lines.push('');
    }

    return lines.join('\n');
}

/**
 * Aggregate multiple AuditResults into a single AuditReport
 */
export function aggregateResults(
    results: AuditResult[],
    labSeries: string
): AuditReport {
    const allFindings = results.flatMap(r => r.findings);

    return {
        report_version: '1.0.0',
        generated_at: new Date().toISOString(),
        lab_series: labSeries,
        summary: {
            total_audits: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            total_findings: allFindings.length,
            blockers: allFindings.filter(f => f.severity === 'P0_BLOCKER').length,
            critical: allFindings.filter(f => f.severity === 'P1_CRITICAL').length,
            important: allFindings.filter(f => f.severity === 'P2_IMPORTANT').length,
            cosmetic: allFindings.filter(f => f.severity === 'P3_COSMETIC').length
        },
        audits: results
    };
}
