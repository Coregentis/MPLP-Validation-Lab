import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

/**
 * v0.12.1 Institutional Heartbeat Contract
 * 
 * Runs all gates and appends the result to governance/heartbeat/history.json.
 * Uses the institutional schema for auditability.
 */

const VLAB_ROOT = join(process.cwd());
const HISTORY_PATH = join(VLAB_ROOT, 'governance/heartbeat/history.json');
const SEAL_PATH = join(VLAB_ROOT, 'governance/seals/SEAL-v0.12.1.md');

interface HeartbeatRecord {
    timestamp: string;
    baseline_tag: string;
    commit_sha: string;
    seal_sha256: string;
    gate_results: Record<string, 'PASS' | 'FAIL'>;
    drift: 0 | 1;
    node_version: string;
}

function getFileHash(path: string): string {
    if (!existsSync(path)) return 'NOT_FOUND';
    const content = readFileSync(path);
    return createHash('sha256').update(content).digest('hex');
}

async function runHeartbeat() {
    console.log('💓 Starting v0.12.1 Institutional Heartbeat...');

    let drift: 0 | 1 = 0;
    let commitSha = '';
    const gate_results: Record<string, 'PASS' | 'FAIL'> = {};

    // Commands to verify
    const commands = [
        { id: 'gate-all', cmd: 'npm run gate:all' },
        { id: 'rel-01', cmd: 'npm run gate:release:01' },
        { id: 'sop-01', cmd: 'npm run gate:v12-sop' }
    ];

    try {
        // 1. Run Gates
        console.log('--- Executing Institutional Audit Suite ---');
        for (const { id, cmd } of commands) {
            try {
                execSync(cmd, { stdio: 'pipe' });
                gate_results[id] = 'PASS';
            } catch {
                gate_results[id] = 'FAIL';
                drift = 1;
            }
        }

        // 2. Get Commit SHA
        commitSha = execSync('git rev-parse HEAD').toString().trim();
    } catch (error) {
        drift = 1;
        console.error('❌ Heartbeat failed during execution.');
    }

    // 3. Prepare Record
    const record: HeartbeatRecord = {
        timestamp: new Date().toISOString(),
        baseline_tag: 'vlab-v0.12.1-institution',
        commit_sha: commitSha,
        seal_sha256: getFileHash(SEAL_PATH),
        gate_results,
        drift,
        node_version: process.version,
    };

    // 4. Update History
    let history: HeartbeatRecord[] = [];
    if (existsSync(HISTORY_PATH)) {
        try {
            history = JSON.parse(readFileSync(HISTORY_PATH, 'utf-8'));
        } catch {
            history = [];
        }
    }

    history.push(record);

    // Keep only last 12 heartbeats (1 year)
    if (history.length > 12) {
        history = history.slice(-12);
    }

    if (!existsSync(join(VLAB_ROOT, 'governance/heartbeat'))) {
        execSync(`mkdir -p ${join(VLAB_ROOT, 'governance/heartbeat')}`);
    }

    writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));

    const resultText = drift === 0 ? '✅ PASS' : '⚠️ DRIFT DETECTED';
    console.log(`\n${resultText} recorded: at ${record.timestamp}`);

    if (drift === 1) {
        process.exit(1);
    }
}

runHeartbeat().catch(err => {
    console.error(err);
    process.exit(1);
});
