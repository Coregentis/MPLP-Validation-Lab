#!/usr/bin/env node
/**
 * Generate v0.5 Test Vector Packs
 * 
 * Creates the minimal pack structure for each vector in allowlist-v0.5.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Vector templates per domain and verdict
const TEMPLATES = {
    D1: {
        PASS: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'PASS',
        },
        FAIL: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'invalid', resource: 'token_quota' },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'FAIL',
            expected_reason_code: 'D1_OUTCOME_INVALID',
        },
    },
    D2: {
        PASS: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'PASS',
        },
        FAIL: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'invalid_terminal' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'FAIL',
            expected_reason_code: 'D2_TERMINAL_STATE_NOT_IN_ALLOWED_SET',
        },
    },
    D3: {
        PASS: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'PASS',
        },
        FAIL: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'FAIL',
            expected_reason_code: 'D3_SUBJECT_MISSING',
        },
    },
    D4: {
        PASS: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'success' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'PASS',
        },
        FAIL: {
            events: [
                { event_id: 'evt-init-001', event_type: 'agent.init', timestamp: '2026-01-18T10:00:00Z' },
                { event_id: 'evt-budget-001', event_type: 'budget.decision', timestamp: '2026-01-18T10:01:00Z', decision_kind: 'budget', outcome: 'allow', resource: 'token_quota', amount: 1000 },
                { event_id: 'evt-state-001', event_type: 'lifecycle.transition', timestamp: '2026-01-18T10:02:00Z', to_state: 'success' },
                { event_id: 'evt-authz-001', event_type: 'authz.decision', timestamp: '2026-01-18T10:03:00Z', decision_kind: 'authz', outcome: 'allow', subject: 'user-001', resource: 'doc-001', action: 'read' },
                { event_id: 'evt-terminate-001', event_type: 'termination.decision', timestamp: '2026-01-18T10:04:00Z', decision_kind: 'terminate', termination_reason: 'invalid_reason' },
                { event_id: 'evt-end-001', event_type: 'agent.end', timestamp: '2026-01-18T10:05:00Z' },
            ],
            expected_topline: 'FAIL',
            expected_reason_code: 'D4_TERMINATION_REASON_NOT_IN_ALLOWED_SET',
        },
    },
};

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Generating v0.5 Test Vector Packs');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Load allowlist
    const allowlistPath = path.join(PROJECT_ROOT, 'test-vectors/v0.5/allowlist-v0.5.yaml');
    const allowlistContent = fs.readFileSync(allowlistPath, 'utf-8');
    const allowlist = yaml.parse(allowlistContent);

    let created = 0;

    for (const domain of ['D1', 'D2', 'D3', 'D4']) {
        const domainData = allowlist[domain];
        if (!domainData) continue;

        for (const verdict of ['PASS', 'FAIL']) {
            const vectors = domainData[verdict] || [];
            const template = TEMPLATES[domain][verdict];

            for (const vec of vectors) {
                const vecDir = path.join(PROJECT_ROOT, vec.path);

                // Create directory structure
                fs.mkdirSync(path.join(vecDir, 'pack', 'trace'), { recursive: true });

                // Generate events (slightly vary each vector)
                const events = template.events.map((e, i) => ({
                    ...e,
                    event_id: `evt-${vec.vector_id}-${i}`,
                }));

                // Write events.ndjson
                const eventsPath = path.join(vecDir, 'pack', 'trace', 'events.ndjson');
                fs.writeFileSync(eventsPath, events.map(e => JSON.stringify(e)).join('\n') + '\n');

                // Write vector manifest
                const manifest = {
                    vector_id: vec.vector_id,
                    domain,
                    expected_topline: template.expected_topline,
                    expected_reason_code: template.expected_reason_code || null,
                    ruleset_ref: 'ruleset-1.2',
                    protocol_pin: '2025-draft',
                    schema_version: '1.0.0',
                    description: vec.description,
                    hash_scope: ['pack/trace/events.ndjson'],
                };
                fs.writeFileSync(path.join(vecDir, 'vector.manifest.json'), JSON.stringify(manifest, null, 2));

                // Write pack manifest
                fs.writeFileSync(path.join(vecDir, 'pack', 'manifest.json'), JSON.stringify({ trace: 'trace/events.ndjson' }, null, 2));

                // Write evidence pointers
                const pointers = {
                    pointers: [
                        { requirement_id: 'RQ-D1-01', artifact_path: 'pack/trace/events.ndjson', locator: `event_id:evt-${vec.vector_id}-1`, status: 'PRESENT' },
                        { requirement_id: 'RQ-D2-01', artifact_path: 'pack/trace/events.ndjson', locator: `event_id:evt-${vec.vector_id}-2`, status: 'PRESENT' },
                        { requirement_id: 'RQ-D3-01', artifact_path: 'pack/trace/events.ndjson', locator: `event_id:evt-${vec.vector_id}-3`, status: 'PRESENT' },
                        { requirement_id: 'RQ-D4-01', artifact_path: 'pack/trace/events.ndjson', locator: `event_id:evt-${vec.vector_id}-4`, status: 'PRESENT' },
                    ],
                };
                fs.writeFileSync(path.join(vecDir, 'evidence_pointers.json'), JSON.stringify(pointers, null, 2));

                // Write bundle manifest
                const bundleManifest = {
                    run_id: vec.vector_id,
                    pack_root: 'pack',
                    ruleset_ref: 'ruleset-1.2',
                    protocol_pin: '2025-draft',
                    schema_bundle_sha256: 'v0.5.0-vectors',
                    hash_scope: ['pack/trace/events.ndjson'],
                };
                fs.writeFileSync(path.join(vecDir, 'bundle.manifest.json'), JSON.stringify(bundleManifest, null, 2));

                console.log(`  ✅ ${vec.vector_id}`);
                created++;
            }
        }
    }

    console.log(`\n✅ Generated ${created} vector packs\n`);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
