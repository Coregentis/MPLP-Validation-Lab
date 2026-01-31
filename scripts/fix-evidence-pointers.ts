import * as fs from 'fs';
import * as path from 'path';
import { eventToCanonPtr } from '../lib/evidence/canonptr';

const PROJECT_ROOT = process.cwd();
const RUNS_DIR = path.join(PROJECT_ROOT, 'public/data/runs');
const DATA_RUNS_DIR = path.join(PROJECT_ROOT, 'data/runs');

const TARGET_RUNS = [
    'mcp-d1-budget-pass-01', 'mcp-d1-budget-pass-02',
    'mcp-d1-budget-fail-01', 'mcp-d1-budget-fail-02',
    'pydantic-ai-d1-budget-pass-01', 'pydantic-ai-d1-budget-pass-02',
    'pydantic-ai-d1-budget-fail-01', 'pydantic-ai-d1-budget-fail-02'
];

async function main() {
    console.log('🛠 Fixing Evidence Pointers for Yardstick Runs...\n');

    for (const runId of TARGET_RUNS) {
        const runDir = path.join(RUNS_DIR, runId);
        const eventPath = path.join(runDir, 'pack/timeline/events.ndjson');
        const pointersPath = path.join(runDir, 'evidence_pointers.json');

        if (!fs.existsSync(eventPath) || !fs.existsSync(pointersPath)) {
            console.log(`⚠️  Skipping ${runId} (missing artifacts)`);
            continue;
        }

        // 1. Load events and generate mapping
        const traceData = fs.readFileSync(eventPath, 'utf-8');
        const events = traceData.split('\n').filter(l => l.trim()).map(l => JSON.parse(l));

        const decisionPointers: Record<string, string> = {}; // decision_kind -> canonptr
        let seq = 0;
        for (const evt of events) {
            if (evt.decision_kind) {
                const ptr = eventToCanonPtr(evt, seq);
                if (ptr) {
                    decisionPointers[evt.decision_kind] = ptr;
                    seq++;
                }
            }
        }

        // 2. Update pointers
        const pointersData = JSON.parse(fs.readFileSync(pointersPath, 'utf-8'));
        let changed = false;

        for (const p of pointersData.pointers) {
            // For budget scenario, we map RQ-D1-01 to budget decision
            if (p.requirement_id === 'RQ-D1-01') {
                const correctPtr = decisionPointers['budget'];
                if (correctPtr && p.locator !== correctPtr) {
                    console.log(`  🔗 ${runId}: ${p.locator} → ${correctPtr}`);
                    p.locator = correctPtr;
                    changed = true;
                }
            }
            // Add other domain mappings if needed
            if (p.requirement_id === 'RQ-D4-01') {
                const correctPtr = decisionPointers['terminate'];
                if (correctPtr && p.locator !== correctPtr) {
                    console.log(`  🔗 ${runId}: ${p.locator} → ${correctPtr}`);
                    p.locator = correctPtr;
                    changed = true;
                }
            }
        }

        if (changed) {
            fs.writeFileSync(pointersPath, JSON.stringify(pointersData, null, 2));

            // Sync to data/runs
            const dataRunDir = path.join(DATA_RUNS_DIR, runId);
            if (fs.existsSync(dataRunDir)) {
                fs.copyFileSync(pointersPath, path.join(dataRunDir, 'evidence_pointers.json'));
            }
            console.log(`  ✅ Updated and synced ${runId}`);
        } else {
            console.log(`  🆗 ${runId} pointers already correct`);
        }
    }

    console.log('\n✅ All Yardstick Pointers Fixed.');
}

main().catch(console.error);
