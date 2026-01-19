#!/usr/bin/env node
/**
 * LangGraph Producer - v0.5
 * 
 * Generates evidence packs from LangGraph/LangChain execution.
 * This is a MINIMAL producer that generates deterministic packs
 * without actually running LangGraph (for reproducibility).
 * 
 * In production: would wrap real LangGraph execution.
 * For v0.5: generates compliant packs for matrix scenarios.
 * 
 * Usage: node producers/langgraph/run.mjs <scenario>
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const PRODUCER_ID = 'semantic-kernel';
const PRODUCER_VERSION = '0.5.2';
const SUBSTRATE = 'sk';
const RULESET_REF = 'ruleset-1.2';

// CanonPtr v1 helper - portable evidence pointer
// Format: canonptr:v1:<domain>:<decision_kind>:<seq>:<digest>
import * as crypto from 'crypto';

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

// Scenario templates for each domain/verdict combination
const SCENARIOS = {
    'd1-budget-allow': {
        domain: 'D1',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd1-outcome-invalid': {
        domain: 'D1',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D1_OUTCOME_INVALID',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'maybe', resource: 'token_quota' },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd2-terminal-success': {
        domain: 'D2',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd2-invalid-terminal': {
        domain: 'D2',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D2_TERMINAL_STATE_NOT_IN_ALLOWED_SET',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'maybe_done' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd3-authz-allow': {
        domain: 'D3',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd3-subject-missing': {
        domain: 'D3',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D3_SUBJECT_MISSING',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd4-reason-success': {
        domain: 'D4',
        expected_verdict: 'PASS',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'success' },
            { event_type: 'agent.end' },
        ],
    },
    'd4-reason-invalid': {
        domain: 'D4',
        expected_verdict: 'FAIL',
        expected_reason_code: 'D4_TERMINATION_REASON_NOT_IN_ALLOWED_SET',
        events: [
            { event_type: 'agent.init' },
            { event_type: 'budget.decision', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
            { event_type: 'lifecycle.transition', to_state: 'success' },
            { event_type: 'authz.decision', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
            { event_type: 'termination.decision', decision_kind: 'terminate', termination_reason: 'pizza' },
            { event_type: 'agent.end' },
        ],
    },
};

function generateRunId(scenario, verdict) {
    const verdictStr = verdict === 'PASS' ? 'pass' : 'fail';
    return `v05-${scenario.domain.toLowerCase()}-${SUBSTRATE}-${verdictStr}-${scenario.domain.toLowerCase()}-${Date.now() % 10000}`;
}

function generatePack(scenarioId, scenario) {
    const runId = `v05-${scenario.domain.toLowerCase()}-${SUBSTRATE}-${scenario.expected_verdict.toLowerCase()}-${scenarioId.split('-').slice(1).join('-')}`;
    const outputDir = path.join(PROJECT_ROOT, 'data/runs', runId);
    const traceDir = path.join(outputDir, 'pack/trace');

    // Create directories
    fs.mkdirSync(traceDir, { recursive: true });

    // Generate events with timestamps
    const baseTime = new Date('2026-01-18T10:00:00Z');
    const events = scenario.events.map((e, i) => ({
        ...e,
        event_id: `evt-${runId}-${String(i).padStart(3, '0')}`,
        timestamp: new Date(baseTime.getTime() + i * 60000).toISOString(),
    }));

    // Write events.ndjson
    fs.writeFileSync(
        path.join(traceDir, 'events.ndjson'),
        events.map(e => JSON.stringify(e)).join('\n') + '\n'
    );

    // Write bundle.manifest.json
    fs.writeFileSync(path.join(outputDir, 'bundle.manifest.json'), JSON.stringify({
        run_id: runId,
        pack_root: 'pack',
        ruleset_ref: RULESET_REF,
        protocol_pin: '2025-draft',
        schema_bundle_sha256: `v0.5.0-${SUBSTRATE}`,
        hash_scope: ['pack/trace/events.ndjson'],
    }, null, 2));

    // Write evidence_pointers.json with canonptr locators
    // Generate canonptr for each decision event
    let seq = 0;
    const pointers = [];
    const DOMAIN_TO_REQ = { 'D1': 'RQ-D1-01', 'D2': 'RQ-D2-01', 'D3': 'RQ-D3-01', 'D4': 'RQ-D4-01' };
    const DECISION_TO_DOMAIN = { 'budget': 'D1', 'lifecycle': 'D2', 'authz': 'D3', 'terminate': 'D4' };

    for (const event of events) {
        if (event.decision_kind) {
            const domain = DECISION_TO_DOMAIN[event.decision_kind] || scenario.domain;
            const canonptr = eventToCanonPtr(event, seq, domain);
            if (canonptr) {
                pointers.push({
                    requirement_id: DOMAIN_TO_REQ[domain],
                    artifact_path: 'pack/trace/events.ndjson',
                    locator: canonptr,
                    status: 'PRESENT'
                });
                seq++;
            }
        }
    }

    fs.writeFileSync(path.join(outputDir, 'evidence_pointers.json'), JSON.stringify({
        schema_version: '1.1',
        canonptr_version: 'v1',
        pointers,
    }, null, 2));

    // Write pack/manifest.json
    fs.writeFileSync(path.join(outputDir, 'pack/manifest.json'), JSON.stringify({
        trace: 'trace/events.ndjson',
    }, null, 2));

    // Write producer-run.manifest.json
    fs.writeFileSync(path.join(outputDir, 'producer-run.manifest.json'), JSON.stringify({
        producer_id: PRODUCER_ID,
        substrate: SUBSTRATE,
        version: PRODUCER_VERSION,
        substrate_version: 'langgraph@0.2.0',
        run_id: runId,
        generated_at: new Date().toISOString(),
        ruleset_ref: RULESET_REF,
        scenario: scenarioId,
        expected_verdict: scenario.expected_verdict,
        expected_reason_code: scenario.expected_reason_code || null,
        environment: {
            node_version: process.version,
            platform: process.platform,
            deterministic_seed: 42,
        },
        repro_command: `node producers/langgraph/run.mjs ${scenarioId}`,
    }, null, 2));

    return runId;
}

function main() {
    const targetScenario = process.argv[2];

    console.log('═══════════════════════════════════════════════════════════');
    console.log('  LangGraph Producer v0.5');
    console.log('═══════════════════════════════════════════════════════════\n');

    if (targetScenario === '--all' || !targetScenario) {
        // Generate all scenarios
        console.log('📋 Generating all scenarios...\n');
        for (const [scenarioId, scenario] of Object.entries(SCENARIOS)) {
            const runId = generatePack(scenarioId, scenario);
            console.log(`  ✅ ${scenarioId} → ${runId}`);
        }
        console.log(`\n✅ Generated ${Object.keys(SCENARIOS).length} packs`);
    } else if (SCENARIOS[targetScenario]) {
        const runId = generatePack(targetScenario, SCENARIOS[targetScenario]);
        console.log(`✅ Generated: ${runId}`);
    } else {
        console.error(`❌ Unknown scenario: ${targetScenario}`);
        console.log('Available scenarios:', Object.keys(SCENARIOS).join(', '));
        process.exit(1);
    }
}

main();
