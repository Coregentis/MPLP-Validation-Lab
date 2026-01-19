#!/usr/bin/env node
/**
 * Fix v0.4 Packs - Multi-domain Evidence
 * 
 * Each v0.4 pack needs all 4 domain pointers so clause-01 passes for all domains,
 * allowing the specific clause-02/03 to be the failure point.
 */

import * as fs from 'fs';
import * as path from 'path';

const PACKS = [
    {
        run_id: 'arb-d1-budget-fail-outcome-invalid-v0.4',
        target_clause: 'CL-D1-02',
        d1_event: 'evt-budget-001',
    },
    {
        run_id: 'arb-d1-budget-fail-deny-missing-gate-v0.4',
        target_clause: 'CL-D1-03',
        d1_event: 'evt-budget-001',
    },
    {
        run_id: 'arb-d2-lifecycle-fail-terminal-state-invalid-v0.4',
        target_clause: 'CL-D2-02',
        d2_event: 'evt-state-001',
    },
    {
        run_id: 'arb-d2-lifecycle-fail-post-terminal-exec-v0.4',
        target_clause: 'CL-D2-03',
        d2_event: 'evt-state-001',
    },
    {
        run_id: 'arb-d3-authz-fail-sra-incomplete-v0.4',
        target_clause: 'CL-D3-02',
        d3_event: 'evt-authz-001',
    },
    {
        run_id: 'arb-d3-authz-fail-deny-no-confirm-v0.4',
        target_clause: 'CL-D3-03',
        d3_event: 'evt-authz-001',
    },
    {
        run_id: 'arb-d4-termination-fail-reason-invalid-v0.4',
        target_clause: 'CL-D4-02',
        d4_event: 'evt-terminate-001',
    },
    {
        run_id: 'arb-d4-termination-fail-uncontrolled-recovery-v0.4',
        target_clause: 'CL-D4-03',
        d4_event: 'evt-terminate-001',
    },
];

const RUNS_DIR = path.join(process.cwd(), 'data', 'runs');

for (const pack of PACKS) {
    const packDir = path.join(RUNS_DIR, pack.run_id);
    const eventsPath = path.join(packDir, 'pack', 'trace', 'events.ndjson');

    // Read existing events
    let events = fs.readFileSync(eventsPath, 'utf-8');

    // Add missing domain events (keeping the target domain's specific failure intact)
    const allDomainEvents = [];

    // D1 Budget event (valid for clause-01/02, invalid only for D1 packs if needed)
    if (!pack.d1_event) {
        allDomainEvents.push({
            event_id: 'evt-budget-001',
            event_type: 'budget.decision',
            timestamp: '2026-01-18T10:01:00Z',
            decision_kind: 'budget',
            outcome: 'allow',
            resource: 'token_quota',
            amount: 1000,
        });
    }

    // D2 Lifecycle event (valid terminal state)
    if (!pack.d2_event) {
        allDomainEvents.push({
            event_id: 'evt-state-001',
            event_type: 'lifecycle.transition',
            timestamp: '2026-01-18T10:02:00Z',
            to_state: 'success',
            agent_id: 'agent-001',
        });
    }

    // D3 Authz event (complete S/R/A with allow)
    if (!pack.d3_event) {
        allDomainEvents.push({
            event_id: 'evt-authz-001',
            event_type: 'authz.decision',
            timestamp: '2026-01-18T10:03:00Z',
            decision_kind: 'authz',
            outcome: 'allow',
            subject: 'user-123',
            resource: 'document-abc',
            action: 'read',
        });
    }

    // D4 Termination event (valid reason, no post-term execution)
    if (!pack.d4_event) {
        allDomainEvents.push({
            event_id: 'evt-terminate-001',
            event_type: 'termination.decision',
            timestamp: '2026-01-18T10:04:00Z',
            decision_kind: 'terminate',
            termination_reason: 'timeout',
        });
    }

    // Rebuild events file: init, new domain events, original domain events (minus init), end
    const existingLines = events.trim().split('\n').filter(l => l.trim());
    const initEvent = existingLines.find(l => l.includes('"agent.init"'));
    const endEvents = existingLines.filter(l => l.includes('"agent.end"'));
    const domainEvents = existingLines.filter(l => !l.includes('"agent.init"') && !l.includes('"agent.end"'));

    const newEvents = [
        initEvent,
        ...allDomainEvents.map(e => JSON.stringify(e)),
        ...domainEvents,
        ...endEvents,
    ].join('\n') + '\n';

    fs.writeFileSync(eventsPath, newEvents);

    // Update evidence pointers to include all 4 domains
    const pointers = {
        pointers: [
            {
                requirement_id: 'RQ-D1-01',
                artifact_path: 'pack/trace/events.ndjson',
                locator: 'event_id:evt-budget-001',
                status: 'PRESENT',
            },
            {
                requirement_id: 'RQ-D2-01',
                artifact_path: 'pack/trace/events.ndjson',
                locator: 'event_id:evt-state-001',
                status: 'PRESENT',
            },
            {
                requirement_id: 'RQ-D3-01',
                artifact_path: 'pack/trace/events.ndjson',
                locator: 'event_id:evt-authz-001',
                status: 'PRESENT',
            },
            {
                requirement_id: 'RQ-D4-01',
                artifact_path: 'pack/trace/events.ndjson',
                locator: 'event_id:evt-terminate-001',
                status: 'PRESENT',
            },
        ],
    };
    fs.writeFileSync(
        path.join(packDir, 'evidence_pointers.json'),
        JSON.stringify(pointers, null, 2)
    );

    console.log(`✅ Fixed: ${pack.run_id} (target: ${pack.target_clause})`);
}

console.log(`\n✅ Fixed multi-domain evidence for ${PACKS.length} packs`);
