#!/usr/bin/env node
/**
 * MCP Producer - v0.12.0
 * 
 * Generates evidence packs from Model Context Protocol (MCP) execution.
 * Minimal stimulation-grade producer for v0.12 Sustainability Release.
 * 
 * Naming Contract: mcp-d1-budget-[pass/fail]-[id]
 * Scenario Family: d1-budget
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const PRODUCER_ID = 'mcp';
const PRODUCER_VERSION = '0.12.0';
const SUBSTRATE = 'mcp';
const RULESET_REF = 'ruleset-1.1'; // Start with 1.1, evolution exercise will move to 1.2

function computeSemanticDigest(fields) {
    const sortedKeys = Object.keys(fields).sort();
    const canonical = sortedKeys
        .filter(k => fields[k] !== undefined)
        .map(k => `${k}:${fields[k]}`)
        .join('|');
    return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 8);
}

function eventToCanonPtr(event, seq, domain) {
    const decisionKind = event.decision_kind;
    if (!decisionKind) return null;

    const semanticFields = { decision_kind: decisionKind };
    if (event.outcome) semanticFields.outcome = event.outcome;
    if (event.resource) semanticFields.resource = event.resource;
    if (event.to_state) semanticFields.to_state = event.to_state;
    if (event.subject) semanticFields.subject = event.subject;
    if (event.action) semanticFields.action = event.action;
    if (event.termination_reason) semanticFields.termination_reason = event.termination_reason;

    const seqStr = String(seq).padStart(3, '0');
    const digest = computeSemanticDigest(semanticFields);
    return `canonptr:v1:${domain}:${decisionKind}:${seqStr}:${digest}`;
}

const SCENARIOS = {
    'mcp-d1-budget-pass-01': {
        domain: 'D1',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'mcp-tool-quota', amount: 50 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'mcp-d1-budget-pass-02': {
        domain: 'D1',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'mcp-tool-quota', amount: 100 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'mcp-d1-budget-fail-01': {
        domain: 'D1',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D1_OUTCOME_INVALID',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'negative_allow', resource: 'mcp-tool-quota' },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'mcp-d1-budget-fail-02': {
        domain: 'D1',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D1_OVERSPEND',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'deny', resource: 'mcp-tool-quota' },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'failure' },
            { event_type: 'agent.end' },
        ],
    },
};

function generatePack(runId, scenario) {
    const outputDir = path.join(PROJECT_ROOT, 'public/data/runs', runId);
    const adjudicationDir = path.join(PROJECT_ROOT, 'data/runs', runId);
    const traceDir = path.join(outputDir, 'pack/timeline');

    fs.mkdirSync(traceDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'pack/snapshots'), { recursive: true });
    fs.mkdirSync(adjudicationDir, { recursive: true });

    const baseTime = new Date('2026-01-25T10:00:00Z');
    const events = scenario.events.map((e, i) => ({
        ...e,
        event_id: `evt-mcp-${String(i).padStart(3, '0')}`,
        timestamp: new Date(baseTime.getTime() + i * 1000).toISOString(),
    }));

    fs.writeFileSync(
        path.join(traceDir, 'events.ndjson'),
        events.map(e => JSON.stringify(e)).join('\n') + '\n'
    );

    const packManifest = {
        schema_version: '2.0.0',
        substrate: SUBSTRATE,
        run_id: runId,
        timeline: 'timeline/events.ndjson',
        snapshots: 'snapshots/'
    };

    fs.writeFileSync(path.join(outputDir, 'pack/manifest.json'), JSON.stringify(packManifest, null, 2));

    fs.writeFileSync(path.join(outputDir, 'bundle.manifest.json'), JSON.stringify({
        run_id: runId,
        pack_root: 'pack',
        ruleset_ref: RULESET_REF,
        generated_at: new Date().toISOString()
    }, null, 2));

    // Legacy input.pointer.json for adjudicate.ts
    fs.writeFileSync(path.join(adjudicationDir, 'input.pointer.json'), JSON.stringify({
        pack_path: `public/data/runs/${runId}`,
        pack_layout: "1.0",
        notes: `MCP Substrate - v0.12 Sustainability Sample (${scenario.expected_verdict})`
    }, null, 2));

    let seq = 0;
    const pointers = scenario.events
        .filter(e => e.decision_kind)
        .map(e => ({
            requirement_id: `RQ-${scenario.domain}-01`,
            artifact_path: 'pack/timeline/events.ndjson',
            locator: eventToCanonPtr(e, seq++, scenario.domain),
            status: 'PRESENT'
        }));

    fs.writeFileSync(path.join(outputDir, 'evidence_pointers.json'), JSON.stringify({
        schema_version: '1.1',
        canonptr_version: 'v1',
        pointers,
    }, null, 2));

    return runId;
}

function main() {
    console.log('🛡️  MCP Producer v0.12.0...');
    for (const [runId, scenario] of Object.entries(SCENARIOS)) {
        generatePack(runId, scenario);
        console.log(`  ✅ ${runId}`);
    }
}

main();
