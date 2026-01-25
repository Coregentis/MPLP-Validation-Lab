import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * v0.12.1 Heartbeat History Contract
 * 
 * Runs all gates and appends the result to governance/heartbeat/history.json.
 * This ensures the dormancy phase remains auditable and environmental drift is tracked.
 */

const VLAB_ROOT = join(process.cwd());
const HISTORY_PATH = join(VLAB_ROOT, 'governance/heartbeat/history.json');

interface HeartbeatRecord {
    timestamp: string;
    commit_sha: string;
    result: 'PASS' | 'FAIL';
    node_version: string;
    artifact_hash?: string;
}

async function runHeartbeat() {
    console.log('💓 Starting v0.12.1 Institutional Heartbeat...');

    let result: 'PASS' | 'FAIL' = 'PASS';
    let commitSha = '';

    try {
        // 1. Run Gates
        console.log('--- Running All Gates ---');
        execSync('npm run gate:all && npm run gate:release:01 && npm run gate:v12-sop', { stdio: 'inherit' });

        // 2. Get Commit SHA
        commitSha = execSync('git rev-parse HEAD').toString().trim();
    } catch (error) {
        result = 'FAIL';
        console.error('❌ Heartbeat failed during gate execution.');
    }

    // 3. Prepare Record
    const record: HeartbeatRecord = {
        timestamp: new Date().toISOString(),
        commit_sha: commitSha,
        result,
        node_version: process.version,
    };

    // 4. Update History
    let history: HeartbeatRecord[] = [];
    if (existsSync(HISTORY_PATH)) {
        history = JSON.parse(readFileSync(HISTORY_PATH, 'utf-8'));
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

    console.log(`\n✅ Heartbeat recorded: ${result} at ${record.timestamp}`);

    if (result === 'FAIL') {
        process.exit(1);
    }
}

runHeartbeat().catch(err => {
    console.error(err);
    process.exit(1);
});
