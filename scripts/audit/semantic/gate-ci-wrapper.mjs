#!/usr/bin/env node
/**
 * R1 Semantic Gate — CI Wrapper
 * 
 * Runs the complete semantic audit pipeline for CI:
 * 1. Build
 * 2. Start server (background)
 * 3. Run semantic checker
 * 4. Kill server
 * 5. Exit with appropriate code
 * 
 * Usage: npm run gate:semantic:ci
 */

import { spawn, execSync, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

console.log('🔍 R1 Semantic Gate — CI Mode');
console.log('='.repeat(40));
console.log('');

async function main() {
    let serverProcess = null;

    try {
        // Step 1: Build
        console.log('📦 Step 1/4: Building...');
        execSync('npm run build', { stdio: 'inherit' });
        console.log('');

        // Step 2: Generate PSC and samples
        console.log('📋 Step 2/4: Generating PSC and samples...');
        execSync('npm run audit:semantic:psc', { stdio: 'inherit' });
        execSync('npm run audit:semantic:sample', { stdio: 'inherit' });
        console.log('');

        // Step 3: Start server in background
        console.log(`🚀 Step 3/4: Starting server on port ${PORT}...`);
        serverProcess = spawn('npm', ['run', 'start'], {
            env: { ...process.env, PORT: String(PORT) },
            detached: true,
            stdio: 'ignore'
        });
        serverProcess.unref();

        // Wait for server to be ready
        let ready = false;
        for (let i = 0; i < 30; i++) {
            try {
                const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(2000) });
                if (res.ok) {
                    ready = true;
                    console.log(`✅ Server ready after ${i + 1} attempts`);
                    break;
                }
            } catch {
                // Retry
            }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!ready) {
            throw new Error('Server failed to start within 30 seconds');
        }
        console.log('');

        // Step 4: Run semantic checker
        console.log('🔍 Step 4/4: Running semantic checker...');
        try {
            execSync(`BASE_URL=${BASE_URL} npm run audit:semantic:check`, { stdio: 'inherit' });
        } catch (checkError) {
            // Checker failed - gaps detected
            console.error('');
            console.error('❌ GATE-SEMANTIC-0GAPS-01: FAILED');
            console.error('   Semantic gaps detected. Review audit/semantic/gaps-report.md');
            process.exitCode = 1;
        }

        // Verify report was generated
        const reportPath = path.join(process.cwd(), 'audit/semantic/gaps-report.md');
        if (!fs.existsSync(reportPath)) {
            console.error('');
            console.error('❌ GATE-SEMANTIC-REPORT-ARTIFACT-01: FAILED');
            console.error('   gaps-report.md was not generated');
            process.exitCode = 1;
        } else {
            console.log('');
            console.log('✅ GATE-SEMANTIC-REPORT-ARTIFACT-01: PASSED');

            // Check if 0 gaps
            const report = fs.readFileSync(reportPath, 'utf-8');
            if (report.includes('Gaps: 0') || report.includes('Total Gaps**: 0')) {
                console.log('✅ GATE-SEMANTIC-0GAPS-01: PASSED');
            } else if (process.exitCode !== 1) {
                console.error('❌ GATE-SEMANTIC-0GAPS-01: FAILED');
                console.error('   Review audit/semantic/gaps-report.md');
                process.exitCode = 1;
            }
        }

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exitCode = 1;
    } finally {
        // Kill server
        console.log('');
        console.log('🛑 Cleaning up server process...');
        try {
            execSync('pkill -f "next start" 2>/dev/null || true', { stdio: 'ignore' });
        } catch {
            // Ignore
        }

        console.log('');
        if (process.exitCode === 1) {
            console.log('❌ R1 SEMANTIC GATE: FAILED');
        } else {
            console.log('✅ R1 SEMANTIC GATE: PASSED');
        }
    }
}

main();
