#!/usr/bin/env node
/**
 * Generate 8 v0.3 Arbitration Packs
 * 
 * Creates complete ABMC four-piece set for each domain (D1-D4) x outcome (PASS/FAIL).
 * 
 * Usage: node scripts/generate-v03-packs.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const RUNS_ROOT = path.resolve(process.cwd(), 'data/runs');

// =============================================================================
// Pack Definitions
// =============================================================================

const PACKS = [
    // D1: Budget Decision Record
    {
        run_id: 'arb-d1-budget-pass-fixture-v0.3',
        domain: 'D1',
        clause_id: 'CL-D1-01',
        requirement_id: 'RQ-D1-01',
        outcome: 'PASS',
        event: {
            event_id: 'evt-budget-001',
            event_type: 'budget.decision',
            timestamp: '2026-01-17T10:00:00Z',
            decision_kind: 'budget',
            outcome: 'allow',
            resource: 'token_quota',
            amount: 1000,
        },
    },
    {
        run_id: 'arb-d1-budget-fail-fixture-v0.3',
        domain: 'D1',
        clause_id: 'CL-D1-01',
        requirement_id: 'RQ-D1-01',
        outcome: 'FAIL',
        // No valid pointer - will fail with BUNDLE-POINTER-MISSING
    },

    // D2: Terminal Lifecycle State
    {
        run_id: 'arb-d2-lifecycle-state-pass-fixture-v0.3',
        domain: 'D2',
        clause_id: 'CL-D2-01',
        requirement_id: 'RQ-D2-01',
        outcome: 'PASS',
        event: {
            event_id: 'evt-lifecycle-001',
            event_type: 'lifecycle.state_transition',
            timestamp: '2026-01-17T10:05:00Z',
            from_state: 'running',
            to_state: 'success',
            agent_id: 'agent-001',
        },
    },
    {
        run_id: 'arb-d2-lifecycle-state-fail-fixture-v0.3',
        domain: 'D2',
        clause_id: 'CL-D2-01',
        requirement_id: 'RQ-D2-01',
        outcome: 'FAIL',
    },

    // D3: Authorization Decision
    {
        run_id: 'arb-d3-authz-decision-pass-fixture-v0.3',
        domain: 'D3',
        clause_id: 'CL-D3-01',
        requirement_id: 'RQ-D3-01',
        outcome: 'PASS',
        event: {
            event_id: 'evt-authz-001',
            event_type: 'authorization.decision',
            timestamp: '2026-01-17T10:02:00Z',
            decision_kind: 'authz',
            outcome: 'allow',
            action: 'file_write',
            resource: '/data/output.json',
        },
    },
    {
        run_id: 'arb-d3-authz-decision-fail-fixture-v0.3',
        domain: 'D3',
        clause_id: 'CL-D3-01',
        requirement_id: 'RQ-D3-01',
        outcome: 'FAIL',
    },

    // D4: Termination Decision
    {
        run_id: 'arb-d4-termination-recovery-pass-fixture-v0.3',
        domain: 'D4',
        clause_id: 'CL-D4-01',
        requirement_id: 'RQ-D4-01',
        outcome: 'PASS',
        event: {
            event_id: 'evt-terminate-001',
            event_type: 'termination.decision',
            timestamp: '2026-01-17T10:10:00Z',
            decision_kind: 'terminate',
            reason: 'user_requested',
            agent_id: 'agent-001',
        },
    },
    {
        run_id: 'arb-d4-termination-recovery-fail-fixture-v0.3',
        domain: 'D4',
        clause_id: 'CL-D4-01',
        requirement_id: 'RQ-D4-01',
        outcome: 'FAIL',
    },
];

// =============================================================================
// File Generators
// =============================================================================

function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function generateVerdict(pack) {
    return {
        run_id: pack.run_id,
        scenario_id: `${pack.domain.toLowerCase()}-${pack.outcome.toLowerCase()}-scenario`,
        admission: 'ADMISSIBLE',
        topline: pack.outcome,
        gf_verdicts: [],
        domain_verdicts: [
            {
                domain: pack.domain,
                clause_id: pack.clause_id,
                status: pack.outcome,
                reason_code: pack.outcome === 'FAIL'
                    ? `BUNDLE-POINTER-MISSING-${pack.requirement_id}`
                    : undefined,
            },
        ],
        versions: {
            protocol: '2025-draft',
            schema: 'v0.3.0',
            ruleset: 'ruleset-1.1',
        },
        evaluated_at: new Date().toISOString(),
        reason_code: pack.outcome === 'FAIL'
            ? `BUNDLE-POINTER-MISSING-${pack.requirement_id}`
            : null,
    };
}

function generateBundleManifest(pack) {
    return {
        run_id: pack.run_id,
        pack_root: 'pack',
        ruleset_ref: 'ruleset-1.1',
        protocol_pin: '2025-draft',
        schema_bundle_sha256: 'v0.3.0-placeholder',
        hash_scope: ['verdict.json', 'pack/trace/events.ndjson'],
        reason_code: pack.outcome === 'FAIL'
            ? `BUNDLE-POINTER-MISSING-${pack.requirement_id}`
            : null,
        scenario_meta: {
            domain: pack.domain,
            clause_id: pack.clause_id,
            privileged_action: pack.domain === 'D3',
            termination_case: pack.domain === 'D4',
        },
    };
}

function generateEvidencePointers(pack) {
    if (pack.outcome === 'FAIL') {
        // FAIL packs have no pointers for their requirement
        return { pointers: [] };
    }

    return {
        pointers: [
            {
                requirement_id: pack.requirement_id,
                artifact_path: 'pack/trace/events.ndjson',
                locator: `event_id:${pack.event.event_id}`,
                status: 'PRESENT',
            },
        ],
    };
}

function generatePackManifest(pack) {
    return {
        pack_id: pack.run_id,
        version: '0.3.0',
        substrate: 'fixture',
        created_at: new Date().toISOString(),
        trace_format: 'ndjson',
        files: ['trace/events.ndjson'],
    };
}

function generateEvents(pack) {
    const events = [];

    // Add init event
    events.push({
        event_id: 'evt-init-001',
        event_type: 'agent.init',
        timestamp: '2026-01-17T09:59:00Z',
        agent_id: 'agent-001',
    });

    // Add domain-specific event if PASS
    if (pack.event) {
        events.push(pack.event);
    }

    // Add end event
    events.push({
        event_id: 'evt-end-001',
        event_type: 'agent.end',
        timestamp: '2026-01-17T10:15:00Z',
        agent_id: 'agent-001',
    });

    return events;
}

function generateIntegrity(files) {
    const lines = [];
    for (const [filePath, content] of Object.entries(files)) {
        const hash = sha256(content);
        lines.push(`${hash}  ${filePath}`);
    }
    return lines.join('\n') + '\n';
}

// =============================================================================
// Main Generator
// =============================================================================

function generatePack(pack) {
    const runDir = path.join(RUNS_ROOT, pack.run_id);

    console.log(`Generating: ${pack.run_id}`);

    // Create directories
    fs.mkdirSync(path.join(runDir, 'pack', 'trace'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'integrity'), { recursive: true });

    // Generate files
    const verdict = generateVerdict(pack);
    const verdictJson = JSON.stringify(verdict, null, 2);

    const bundleManifest = generateBundleManifest(pack);
    const bundleManifestJson = JSON.stringify(bundleManifest, null, 2);

    const evidencePointers = generateEvidencePointers(pack);
    const evidencePointersJson = JSON.stringify(evidencePointers, null, 2);

    const packManifest = generatePackManifest(pack);
    const packManifestJson = JSON.stringify(packManifest, null, 2);

    const events = generateEvents(pack);
    const eventsNdjson = events.map(e => JSON.stringify(e)).join('\n') + '\n';

    // Write files
    fs.writeFileSync(path.join(runDir, 'verdict.json'), verdictJson);
    fs.writeFileSync(path.join(runDir, 'bundle.manifest.json'), bundleManifestJson);
    fs.writeFileSync(path.join(runDir, 'evidence_pointers.json'), evidencePointersJson);
    fs.writeFileSync(path.join(runDir, 'pack', 'manifest.json'), packManifestJson);
    fs.writeFileSync(path.join(runDir, 'pack', 'trace', 'events.ndjson'), eventsNdjson);

    // Generate integrity hashes
    const hashScope = {
        'verdict.json': verdictJson,
        'pack/trace/events.ndjson': eventsNdjson,
    };
    const integrity = generateIntegrity(hashScope);
    fs.writeFileSync(path.join(runDir, 'integrity', 'sha256sums.txt'), integrity);

    console.log(`  ✓ Created: verdict.json, bundle.manifest.json, evidence_pointers.json`);
    console.log(`  ✓ Created: pack/manifest.json, pack/trace/events.ndjson`);
    console.log(`  ✓ Created: integrity/sha256sums.txt`);
}

// Main
console.log('=== Generating v0.3 Arbitration Packs ===\n');

for (const pack of PACKS) {
    generatePack(pack);
    console.log('');
}

console.log('=== Done ===');
console.log(`Generated ${PACKS.length} packs in ${RUNS_ROOT}`);
