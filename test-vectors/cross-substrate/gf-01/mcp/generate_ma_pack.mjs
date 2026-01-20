#!/usr/bin/env node
/**
 * MCP Multi-Agent Pack Generator (Official Substrate)
 * Scenario: gf-01-multi-agent-lifecycle
 * 
 * Uses pure JS for deterministic output (no external MCP SDK calls)
 * 
 * Determinism Locks:
 * - Fixed timestamp: 2026-01-14T00:00:00Z
 * - Seeded UUIDs via deterministic hash
 * - Sorted JSON output
 * - No absolute paths
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Determinism constants
const FIXED_TIMESTAMP = "2026-01-14T00:00:00Z";
const SCENARIO_ID = "gf-01-multi-agent-lifecycle";
const RUN_ID = "gf-01-ma-mcp-official-v0.7.2";
const NAMESPACE = "mcp00000-1234-5678-1234-567812345678";

// Agent definitions (MCP server-client pattern)
const AGENTS = [
    { agent_id: "server", role: "coordinator" },
    { agent_id: "client", role: "executor" }
];

function seededUuid(name) {
    const hash = crypto.createHash('sha256').update(NAMESPACE + name).digest('hex');
    return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, Object.keys(data).sort(), 2) + '\n');
}

function generateContext() {
    return {
        context_id: seededUuid(`${RUN_ID}-context`),
        created_at: FIXED_TIMESTAMP,
        created_by: "server",
        project_id: seededUuid(`${RUN_ID}-project`),
        requirements: {
            agents_required: 2,
            handoff_required: true,
            summary: "Multi-agent lifecycle with MCP server-client tool invocation pattern"
        }
    };
}

function generatePlan(contextId) {
    const steps = [
        { action: "initialize_server", agent: "server", step_id: "1" },
        { action: "expose_tools", agent: "server", step_id: "2" },
        { action: "handoff_to_client", agent: "server", step_id: "3" },
        { action: "receive_tool_list", agent: "client", step_id: "4" },
        { action: "invoke_tool", agent: "client", step_id: "5" },
        { action: "return_result", agent: "client", step_id: "6" }
    ];

    return {
        approach: "Server exposes tools, hands off to client for tool invocation",
        context_ref: contextId,
        created_at: FIXED_TIMESTAMP,
        created_by: "server",
        plan_id: seededUuid(`${RUN_ID}-plan`),
        steps
    };
}

function generateTrace(contextId, planId) {
    return {
        agent_summaries: [
            { agent_id: "server", artifacts_created: ["context.json", "plan.json"], events_count: 4 },
            { agent_id: "client", artifacts_created: ["trace.json"], events_count: 4 }
        ],
        completed_by: "client",
        created_at: FIXED_TIMESTAMP,
        execution_summary: {
            handoffs: 1,
            outcome: "success",
            total_agents: 2,
            total_events: 8
        },
        plan_ref: planId,
        trace_id: seededUuid(`${RUN_ID}-trace`)
    };
}

function generateTimelineEvents(planId) {
    return [
        { agent_id: "server", event_id: "evt-001", role: "coordinator", ts: FIXED_TIMESTAMP, type: "agent.init" },
        { agent_id: "server", artifact_ref: "artifacts/context.json", artifact_type: "context", event_id: "evt-002", ts: FIXED_TIMESTAMP, type: "artifact.create" },
        { agent_id: "server", artifact_ref: "artifacts/plan.json", artifact_type: "plan", event_id: "evt-003", ts: FIXED_TIMESTAMP, type: "artifact.create" },
        { agent_id: "server", context_ref: "artifacts/plan.json", event_id: "evt-004", from_agent: "server", payload: { task: "invoke_tools" }, to_agent: "client", ts: FIXED_TIMESTAMP, type: "handoff" },
        { agent_id: "client", event_id: "evt-005", received_from: "server", role: "executor", ts: FIXED_TIMESTAMP, type: "agent.init" },
        { agent_id: "client", event_id: "evt-006", task_ref: "invoke_tools", ts: FIXED_TIMESTAMP, type: "task.start" },
        { agent_id: "client", artifact_ref: "artifacts/trace.json", artifact_type: "trace", event_id: "evt-007", ts: FIXED_TIMESTAMP, type: "artifact.create" },
        { agent_id: "client", event_id: "evt-008", outcome: "success", ts: FIXED_TIMESTAMP, type: "agent.complete" }
    ];
}

function generateManifest() {
    return {
        created_at: FIXED_TIMESTAMP,
        generator: {
            name: "mcp-multi-agent-generator",
            version: "0.7.2"
        },
        multi_agent: {
            agent_count: 2,
            agents: AGENTS,
            handoff_count: 1
        },
        pack_id: RUN_ID,
        protocol_version: "1.0.0",
        scenario_id: SCENARIO_ID,
        substrate: "mcp",
        substrate_version: "2024-11-05"
    };
}

function generateSha256sums(packDir) {
    const files = [];
    function walk(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (!['sha256sums.txt', 'pack_root_hash.txt'].includes(entry.name)) {
                files.push(fullPath);
            }
        }
    }
    walk(packDir);
    files.sort();

    const lines = [];
    for (const file of files) {
        const content = fs.readFileSync(file);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const relPath = path.relative(packDir, file);
        lines.push(`${hash}  ${relPath}`);
    }

    const sumsPath = path.join(packDir, 'integrity', 'sha256sums.txt');
    fs.mkdirSync(path.dirname(sumsPath), { recursive: true });
    fs.writeFileSync(sumsPath, lines.join('\n') + '\n');
    return sumsPath;
}

function main() {
    const args = process.argv.slice(2);
    const outIdx = args.indexOf('--out');
    const packDir = outIdx >= 0 ? args[outIdx + 1] : 'pack';

    console.log(`=== MCP Multi-Agent Pack Generator (v0.7.2) ===\n`);
    console.log(`Run ID: ${RUN_ID}`);
    console.log(`Output: ${packDir}\n`);

    // Generate artifacts
    const context = generateContext();
    writeJson(`${packDir}/artifacts/context.json`, context);
    console.log(`✓ Generated context.json (id: ${context.context_id.slice(0, 8)}...)`);

    const plan = generatePlan(context.context_id);
    writeJson(`${packDir}/artifacts/plan.json`, plan);
    console.log(`✓ Generated plan.json (id: ${plan.plan_id.slice(0, 8)}..., ${plan.steps.length} steps)`);

    const trace = generateTrace(context.context_id, plan.plan_id);
    writeJson(`${packDir}/artifacts/trace.json`, trace);
    console.log(`✓ Generated trace.json (id: ${trace.trace_id.slice(0, 8)}...)`);

    // Generate manifest
    const manifest = generateManifest();
    writeJson(`${packDir}/manifest.json`, manifest);
    console.log(`✓ Generated manifest.json`);

    // Generate timeline (NDJSON)
    const events = generateTimelineEvents(plan.plan_id);
    fs.mkdirSync(`${packDir}/timeline`, { recursive: true });
    const ndjson = events.map(e => JSON.stringify(e, Object.keys(e).sort())).join('\n') + '\n';
    fs.writeFileSync(`${packDir}/timeline/events.ndjson`, ndjson);
    console.log(`✓ Generated timeline/events.ndjson (${events.length} events)`);

    // Generate integrity hashes
    const sumsPath = generateSha256sums(packDir);
    console.log(`✓ Generated integrity/sha256sums.txt`);

    // Calculate pack_root_hash
    const sumsContent = fs.readFileSync(sumsPath);
    const packRootHash = crypto.createHash('sha256').update(sumsContent).digest('hex');
    fs.writeFileSync(`${packDir}/pack_root_hash.txt`, packRootHash + '\n');

    console.log(`\n✅ Pack generated successfully!`);
    console.log(`   pack_root_hash: ${packRootHash}`);
}

main();
