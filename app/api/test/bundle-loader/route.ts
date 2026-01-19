/**
 * Test endpoint for PR-1/2/3/4/5/6 verification
 * 
 * GET /api/test/bundle-loader?run_id=gf-01-a2a-pass
 */

import { NextResponse } from 'next/server';
import { loadRunBundle } from '@/lib/bundles/load_run_bundle';
import { getRuleset } from '@/lib/rulesets/registry';
import { checkV02G2 } from '@/lib/gates/gate-v02-g2-bundle-closure';
import { adjudicateRuleset11 } from '@/lib/rulesets/ruleset-1.1/adjudicate';
import { detectApplicableClauses } from '@/lib/rulesets/ruleset-1.1/applicability';


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const runId = url.searchParams.get('run_id') || 'gf-01-a2a-pass';

        // Test PR-2: loadRunBundle
        const bundle = loadRunBundle(runId);

        // Test PR-1: registry
        const ruleset10 = await getRuleset('ruleset-1.0');
        const ruleset11 = await getRuleset('ruleset-1.1');

        // Test PR-3: V02-G2 gate
        const gateResult = checkV02G2(bundle, { strict: false });

        // Test PR-5/6: ruleset-1.1 adjudication (uses domain-specific detection)
        const clauseIds = detectApplicableClauses(runId);
        const adjResult = adjudicateRuleset11(bundle, { clauseIds });

        return NextResponse.json({
            pr1_registry: {
                ruleset_1_0_found: !!ruleset10,
                ruleset_1_0_golden_flows: ruleset10?.manifest?.golden_flows,
                ruleset_1_1_found: !!ruleset11,
                ruleset_1_1_four_domain_clauses: ruleset11?.manifest?.four_domain_clauses,
                ruleset_1_1_adjudicator_available: !!ruleset11?.adjudicator,
            },
            pr2_bundle: {
                run_id: bundle.run_id,
                load_status: bundle.load_status,
                verdict_topline: bundle.verdict?.topline,
                verdict_admission: bundle.verdict?.admission,
                gf_verdicts_count: bundle.verdict?.gf_verdicts?.length,
                errors_count: bundle.load_errors.length,
                errors: bundle.load_errors,
            },
            pr3_gate: {
                gate_id: gateResult.gate_id,
                status: gateResult.status,
                artifacts: gateResult.artifacts,
                reason_code_required: gateResult.reason_code_required,
                reason_code_present: gateResult.reason_code_present,
                errors: gateResult.errors,
            },
            pr5_adjudication: {
                ruleset_id: adjResult.ruleset_id,
                topline: adjResult.topline,
                reason_code: adjResult.reason_code,
                applicable_clauses: clauseIds ?? 'all',
                domain_verdicts: adjResult.domain_verdicts.map(d => ({
                    domain: d.domain,
                    domain_name: d.domain_name,
                    status: d.status,
                })),
                clause_results: adjResult.clause_results.map(c => ({
                    clause_id: c.clause_id,
                    requirement_id: c.requirement_id,
                    status: c.status,
                    reason_code: c.reason_code,
                    pointer_count: c.evidence.pointers.length,
                    resolved_count: c.evidence.resolved_count,
                    notes: c.notes,
                })),
            },
        });
    } catch (error) {
        return NextResponse.json({
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        }, { status: 500 });
    }
}
