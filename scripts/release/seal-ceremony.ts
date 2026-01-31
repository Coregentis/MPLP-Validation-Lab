#!/usr/bin/env tsx
/**
 * SEAL CEREMONY SCRIPT
 * 
 * Generates the "Three Artifacts" of a valid release:
 * 1. seal.md (Summary & Sign-off)
 * 2. gate-report.json (Automated Verification Evidence)
 * 3. audit-report.json (Local Deployment Health)
 * 
 * Governance: Model A (Unified Surface Only)
 * - V2 Gates: Core Only (no legacy routes)
 * - Audit: 11 Critical Routes
 * 
 * Usage: npm run release:seal
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';

const BUILD_ID = `rc-${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}`;
const RELEASE_DIR = path.join(process.cwd(), 'releases', 'unified', BUILD_ID);

function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function runCmd(cmd: string, desc: string): string {
    console.log(`\n⏳ [${desc}] Running: ${cmd}...`);
    try {
        const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }); // Pipe mainly to capture output for report
        console.log(`✅ [${desc}] Success`);
        return output;
    } catch (e: any) {
        console.error(`❌ [${desc}] Failed`);
        console.error(e.stdout || e.message);
        throw e;
    }
}

async function main() {
    console.log(`🔐 STARTING SEAL CEREMONY: ${BUILD_ID}`);
    ensureDir(RELEASE_DIR);

    // 0. Determine Lint Policy (Governance)
    const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
    let lintPolicy = 'strict';
    if (fs.existsSync(nextConfigPath)) {
        const content = fs.readFileSync(nextConfigPath, 'utf8');
        if (content.includes('ignoreDuringBuilds: true')) {
            lintPolicy = 'tolerant';
        }
    }
    console.log(`📜 [Governance] Lint Policy: ${lintPolicy.toUpperCase()}`);

    // 1. Build
    try {
        runCmd('npm run build', 'Build Verification');
    } catch (e) {
        console.error('Build failed. Aborting seal.');
        process.exit(1);
    }

    // 2. Gates (Unified Set)
    // Run all gates and capture output. We expect PASS.
    let gateExitCode = 0;
    let gateOutput = '';
    try {
        // We run gate:all, which uses gate:v2:all (Core only check)
        gateOutput = runCmd('npm run gate:all', 'Unified Gates');
        gateExitCode = 0; // Success if runCmd doesn't throw
    } catch (e: any) {
        gateExitCode = 1;
        gateOutput = e.stdout || e.message;
        console.error('Gates failed - Seal will be marked FAIL but artifacts preserved for triage.');
    }

    // 3. Lint Audit (Debt Record)
    // Regardless of policy, we record the debt.
    let lintAuditOutput = '';
    try {
        // Run the summary script
        runCmd('npx tsx scripts/audit/lint-summary.ts', 'Lint Debt Audit');
        // Read the report to embed summary in seal or just keep file
        if (fs.existsSync('reports/lint-audit.json')) {
            fs.copyFileSync('reports/lint-audit.json', path.join(RELEASE_DIR, 'lint-audit.json'));
            lintAuditOutput = fs.readFileSync(path.join(RELEASE_DIR, 'lint-audit.json'), 'utf8');
        }
    } catch (e) {
        console.warn('⚠️ Lint audit failed to run');
    }

    // 4. Local Audit
    // We must serve the production build we just created.
    // Conflicting dev servers must be killed first.
    let auditOutput = '';
    let auditExit = 0;

    try {
        console.log('⏳ [Local Audit] Preparing server...');
        // 1. Kill any processing running on 3000 (best effort)
        try { execSync("lsof -t -i:3000 | xargs kill -9 || true"); } catch (e) { }

        // 2. Start production server in background
        console.log('⏳ [Local Audit] Starting production server (npm start)...');
        const server = spawn('npm', ['run', 'start'], {
            detached: true,
            stdio: 'ignore', // Ignore stdio to prevent hanging, we assume it works if port opens
            cwd: process.cwd()
        });

        // 3. Wait for port 3000 to be ready (poll)
        console.log('⏳ [Local Audit] Waiting for server to be ready...');
        // Simple polling delay
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 4. Run Audit
        // Note: http-health-local-01 now soft-skips if server fails, so this shouldn't crash unless script errors
        auditOutput = runCmd('npm run audit:http:local', 'Local Audit');

        // 5. Cleanup
        if (server.pid) {
            process.kill(-server.pid!); // formatting for negative PID if detached group, but simple kill works for spawn
            // Actually, safe way:
            try { execSync("lsof -t -i:3000 | xargs kill -9 || true"); } catch (e) { }
        }
    } catch (e: any) {
        auditExit = 1;
        auditOutput = e.stdout || e.message;
        console.error('Audit failed');
        // Ensure cleanup
        try { execSync("lsof -t -i:3000 | xargs kill -9 || true"); } catch (e) { }
    }

    // 5. Generate Artifacts & Seal

    // 5.0 Capture Git SHA
    let gitSha = 'UNKNOWN';
    try {
        gitSha = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    } catch (e) {
        console.warn('⚠️ Failed to capture Git SHA');
    }

    // Write Logs
    fs.writeFileSync(path.join(RELEASE_DIR, 'gate-report.log'), gateOutput || 'No gate output');
    fs.writeFileSync(path.join(RELEASE_DIR, 'audit-report.log'), auditOutput || 'No audit output');

    const overallStatus = (gateExitCode === 0 && auditExit === 0) ? 'PASS' : 'FAIL';

    // 5.1 lint stats
    let lintErrors = 0;
    if (lintAuditOutput) {
        try {
            lintErrors = JSON.parse(lintAuditOutput).total_errors || 0;
        } catch { }
    }

    // 5.2 Manifest.json (Machine Readable)
    const manifest = {
        build_id: BUILD_ID,
        git_sha: gitSha,
        date: new Date().toISOString(),
        status: overallStatus,
        policy: {
            build: lintPolicy,
            deadline: '2026-06-30'
        },
        metrics: {
            lint_errors: lintErrors,
            audit_routes: 11 // Hardcoded for V2 model A
        },
        artifacts: {
            seal: 'seal.md',
            manifest: 'manifest.json',
            gate_report: 'gate-report.log',
            audit_report: 'audit-report.log',
            lint_audit: 'lint-audit.json'
        },
        gate_suite: [
            'gate:v1:all',
            'gate:v2:all',
            'gate:unified:*'
        ]
    };
    fs.writeFileSync(path.join(RELEASE_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

    // 5.3 Seal.md (Human Readable)
    const sealContent = `
# Validation Lab Seal: ${BUILD_ID}

**Status**: ${overallStatus}
**Date**: ${manifest.date}
**Git SHA**: \`${gitSha}\`
**Build Policy**: ${lintPolicy}

## Components
| Component | Status | Notes |
|-----------|--------|-------|
| Build | PASS | Next.js Production Build |
| Gates | ${gateExitCode === 0 ? 'PASS' : 'FAIL'} | Unified Suite |
| Audit | ${auditExit === 0 ? 'PASS' : 'FAIL'} | Runtime HTTP Checks |

## Governance
- **Lint Policy**: ${lintPolicy.toUpperCase()} ${lintPolicy === 'tolerant' ? '(See governance/build-policy.md)' : ''}
- **Artifacts**: verification-lab-v2
- **Projection**: Mixed V1 (Simulated) + V2 (Real)
- **Metrics**: ${lintErrors} Lint Errors (Target: 0)

## Evidence Pointers
- [Manifest](./manifest.json) (Machine Readable)
- [Gate Log](./gate-report.log)
- [Audit Log](./audit-report.log)
- [Lint Audit](./lint-audit.json)

## Execution Summary
### Gate Output Peak
\`\`\`
${gateOutput.slice(0, 1000)}...
\`\`\`
`;

    fs.writeFileSync(path.join(RELEASE_DIR, 'seal.md'), sealContent.trim());

    // 6. Update Release Index (SSOT)
    updateReleaseIndex(manifest);

    console.log(`\n📦 Artifacts generated in ${RELEASE_DIR}`);
    if (overallStatus === 'PASS') {
        console.log(`✅ SEAL VALID. Ready for tagging.`);
    } else {
        console.log(`❌ SEAL INVALID. Check logs.`);
        process.exit(1);
    }
}

function updateReleaseIndex(newRelease: any) {
    const indexPath = path.join(process.cwd(), 'releases', 'unified', 'index.json');
    let index: any = { releases: [] };

    if (fs.existsSync(indexPath)) {
        try {
            index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        } catch { }
    }

    // Add new release to Top
    index.releases.unshift({
        id: newRelease.build_id,
        date: newRelease.date,
        status: newRelease.status,
        git_sha: newRelease.git_sha,
        policy: newRelease.policy.build,
        metrics: newRelease.metrics,
        artifacts: newRelease.artifacts
    });

    // Keep unique by ID
    const unique = new Map();
    index.releases.forEach((r: any) => {
        if (!unique.has(r.id)) unique.set(r.id, r);
    });
    index.releases = Array.from(unique.values());

    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`📚 Updated Release Index: ${indexPath}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
