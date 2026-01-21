#!/usr/bin/env node
/**
 * Generate v0.4 Pack Metadata
 * 
 * Creates bundle.manifest.json, evidence_pointers.json, verdict.json, and pack/manifest.json
 * for all 8 new v0.4 FAIL packs.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'js-yaml';

const PACKS = [
    {
        run_id: 'arb-d1-budget-fail-outcome-invalid-v0.4',
        domain: 'D1',
        clause_id: 'CL-D1-02',
        requirement_id: 'RQ-D1-01',
        event_id: 'evt-budget-001',
        expected_reason: 'D1_OUTCOME_INVALID',
        description: 'Invalid budget outcome (maybe_later)',
    },
    {
        run_id: 'arb-d1-budget-fail-deny-missing-gate-v0.4',
        domain: 'D1',
        clause_id: 'CL-D1-03',
        requirement_id: 'RQ-D1-01',
        event_id: 'evt-budget-001',
        expected_reason: 'D1_BUDGET_DENY_WITHOUT_GATE',
        description: 'Deny outcome without gate enforcement',
    },
    {
        run_id: 'arb-d2-lifecycle-fail-terminal-state-invalid-v0.4',
        domain: 'D2',
        clause_id: 'CL-D2-02',
        requirement_id: 'RQ-D2-01',
        event_id: 'evt-state-001',
        expected_reason: 'D2_TERMINAL_STATE_NOT_IN_ALLOWED_SET',
        description: 'Terminal state not in allowed set (pending_review)',
    },
    {
        run_id: 'arb-d2-lifecycle-fail-post-terminal-exec-v0.4',
        domain: 'D2',
        clause_id: 'CL-D2-03',
        requirement_id: 'RQ-D2-01',
        event_id: 'evt-state-001',
        expected_reason: 'D2_POST_TERMINAL_EXECUTION_DETECTED',
        description: 'Execution after terminal state',
    },
    {
        run_id: 'arb-d3-authz-fail-sra-incomplete-v0.4',
        domain: 'D3',
        clause_id: 'CL-D3-02',
        requirement_id: 'RQ-D3-01',
        event_id: 'evt-authz-001',
        expected_reason: 'D3_SUBJECT_RESOURCE_ACTION_INCOMPLETE',
        description: 'S/R/A triple incomplete',
    },
    {
        run_id: 'arb-d3-authz-fail-deny-no-confirm-v0.4',
        domain: 'D3',
        clause_id: 'CL-D3-03',
        requirement_id: 'RQ-D3-01',
        event_id: 'evt-authz-001',
        expected_reason: 'D3_DENY_WITHOUT_CONFIRM_GATE',
        description: 'Deny without confirm gate',
    },
    {
        run_id: 'arb-d4-termination-fail-reason-invalid-v0.4',
        domain: 'D4',
        clause_id: 'CL-D4-02',
        requirement_id: 'RQ-D4-01',
        event_id: 'evt-terminate-001',
        expected_reason: 'D4_TERMINATION_REASON_NOT_IN_ALLOWED_SET',
        description: 'Invalid termination reason category',
    },
    {
        run_id: 'arb-d4-termination-fail-uncontrolled-recovery-v0.4',
        domain: 'D4',
        clause_id: 'CL-D4-03',
        requirement_id: 'RQ-D4-01',
        event_id: 'evt-terminate-001',
        expected_reason: 'D4_POST_TERMINATION_EXECUTION_DETECTED',
        description: 'Uncontrolled execution after termination',
    },
];

const RUNS_DIR = path.join(process.cwd(), 'data', 'runs');

for (const pack of PACKS) {
    const packDir = path.join(RUNS_DIR, pack.run_id);

    // bundle.manifest.json
    const manifest = {
        run_id: pack.run_id,
        pack_root: 'pack',
        ruleset_ref: 'ruleset-1.2',
        protocol_pin: '2025-draft',
        schema_bundle_sha256: 'v0.4.0-placeholder',
        hash_scope: ['verdict.json', 'pack/trace/events.ndjson'],
        reason_code: null,
        scenario_meta: {
            domain: pack.domain,
            clause_id: pack.clause_id,
            privileged_action: false,
            termination_case: pack.domain === 'D4',
        },
    };
    fs.writeFileSync(
        path.join(packDir, 'bundle.manifest.json'),
        JSON.stringify(manifest, null, 2)
    );

    // evidence_pointers.json
    const pointers = {
        pointers: [
            {
                requirement_id: pack.requirement_id,
                artifact_path: 'pack/trace/events.ndjson',
                locator: `event_id:${pack.event_id}`,
                status: 'PRESENT',
            },
        ],
    };
    fs.writeFileSync(
        path.join(packDir, 'evidence_pointers.json'),
        JSON.stringify(pointers, null, 2)
    );

    // verdict.json
    const verdict = {
        run_id: pack.run_id,
        scenario_id: `${pack.domain.toLowerCase()}-fail-${pack.clause_id.toLowerCase()}-scenario`,
        admission: 'ADMISSIBLE',
        topline: 'FAIL',
        gf_verdicts: [],
        domain_verdicts: [
            {
                domain: pack.domain,
                clause_id: pack.clause_id,
                status: 'FAIL',
                reason_code: pack.expected_reason,
            },
        ],
        versions: {
            protocol: '2025-draft',
            schema: 'v0.4.0',
            ruleset: 'ruleset-1.2',
        },
        evaluated_at: new Date().toISOString(),
        reason_code: pack.expected_reason,
    };
    // Mock reports
    const verifyReport = { status: 'COMPLETE', evaluated_at: verdict.evaluated_at };
    const verifyReportJson = JSON.stringify(verifyReport, null, 2);
    const evaluationReport = { status: pack.outcome, evaluated_at: verdict.evaluated_at };
    const evaluationReportJson = JSON.stringify(evaluationReport, null, 2);

    // Write files
    fs.writeFileSync(path.join(packDir, 'verify.report.json'), verifyReportJson);
    fs.writeFileSync(path.join(packDir, 'evaluation.report.json'), evaluationReportJson);

    // Generate scenario
    const scenario = {
        scenario_id: verdict.scenario_id,
        name: `v0.4 ${pack.domain} ${pack.clause_id} FAIL Fixture`,
        domain: pack.domain,
        requirements: [{ id: pack.requirement_id, title: `Requirement ${pack.requirement_id}` }]
    };
    fs.mkdirSync(path.join(process.cwd(), 'data/scenarios'), { recursive: true });
    fs.writeFileSync(path.join(process.cwd(), 'data/scenarios', `${verdict.scenario_id}.yaml`), yaml.dump(scenario));

    // Generate integrity hashes (minimal for v0.4)
    const hashScope = {
        'verdict.json': JSON.stringify(verdict, null, 2),
        'verify.report.json': verifyReportJson,
        'evaluation.report.json': evaluationReportJson,
    };
    const integrity = Object.entries(hashScope).map(([p, c]) => {
        const hash = crypto.createHash('sha256').update(c).digest('hex');
        return `${hash}  ${p}`;
    }).join('\n') + '\n';
    fs.mkdirSync(path.join(packDir, 'integrity'), { recursive: true });
    fs.writeFileSync(path.join(packDir, 'integrity', 'sha256sums.txt'), integrity);

    console.log(`✅ Generated: ${pack.run_id}`);
}

console.log(`\n✅ Generated metadata for ${PACKS.length} packs`);
