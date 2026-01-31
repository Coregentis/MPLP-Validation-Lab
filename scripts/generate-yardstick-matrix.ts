import * as fs from 'fs';
import * as path from 'path';
import { getRuleset } from '../lib/rulesets/registry';
import { adjudicate } from '../lib/adjudication/adjudicate';

/**
 * Yardstick Matrix Generator (v0.15.0)
 * 
 * Programmatically generates the cross-substrate yardstick matrix.
 * Contract: MCP vs Pydantic-AI | scenario: d1-budget | ruleset: 1.3
 */

const PROJECT_ROOT = process.cwd();
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'public/_data/yardsticks/v0.15.0');
const MATRIX_PATH = path.join(OUTPUT_DIR, 'yardstick-matrix.json');
const DELTA_PACK_PATH = path.join(OUTPUT_DIR, 'delta-pack.json');

const TARGET_RUNS = [
    'mcp-d1-budget-pass-01',
    'mcp-d1-budget-pass-02',
    'mcp-d1-budget-fail-01',
    'mcp-d1-budget-fail-02',
    'pydantic-ai-d1-budget-pass-01',
    'pydantic-ai-d1-budget-pass-02',
    'pydantic-ai-d1-budget-fail-01',
    'pydantic-ai-d1-budget-fail-02'
];

async function generateMatrix() {
    console.log('📊 Generating v0.15.0 Yardstick Matrix...');

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const ruleset = await getRuleset('ruleset-1.3');
    if (!ruleset || !ruleset.adjudicator) {
        throw new Error('Ruleset 1.3 adjudicator not found');
    }

    const matrixRows = [];

    for (const runId of TARGET_RUNS) {
        console.log(`\n  🔎 Processing ${runId}...`);

        // Use full adjudication to get the bundle
        const adjResult = await adjudicate(runId, { ruleset_version: 'ruleset-1.3' });

        // Pass the bundle to the domain adjudicator to get clause results
        // Note: RunBundle is required for the adjudicator function
        const bundle = await import(`../lib/bundles/load_run_bundle`).then(m => m.loadRunBundle(runId));
        const evalResult = await ruleset.adjudicator(bundle);

        // Filter for D1 clauses
        const d1Clauses = evalResult.clauses.filter(c => c.domain_id === 'D1');

        // v0.15.1 Patch: Restrict verdict and triggers to D1 scope for Yardstick consistency
        const d1Failures = d1Clauses.filter(c => c.status === 'FAIL');
        const yardstickVerdict = d1Failures.length > 0 ? 'FAIL' : 'PASS';

        const row = {
            run_id: runId,
            substrate: runId.startsWith('mcp') ? 'mcp' : 'pydantic-ai',
            scenario_family: 'd1-budget',
            ruleset_id: 'ruleset-1.3',
            verdict: yardstickVerdict,
            clauses_triggered: d1Failures.map(c => c.clause_id),
            d1_results: d1Clauses.map(c => {
                // v0.15.1 Patch: De-duplicate evidence pointers by locator
                const uniquePointers = [];
                const seenLocators = new Set();

                if (c.evidence_refs) {
                    for (const ref of c.evidence_refs) {
                        const locator = (ref.pointer as any)?.locator || `anon-${Math.random()}`;
                        if (!seenLocators.has(locator)) {
                            uniquePointers.push({
                                pointer: ref.pointer,
                                resolved: ref.resolved,
                                locator: (ref.pointer as any)?.locator
                            });
                            seenLocators.add(locator);
                        }
                    }
                }

                return {
                    clause_id: c.clause_id,
                    status: c.status,
                    evidence_pointers: uniquePointers
                };
            })
        };

        matrixRows.push(row);
    }

    fs.writeFileSync(MATRIX_PATH, JSON.stringify(matrixRows, null, 2));
    console.log(`\n✅ Yardstick Matrix generated at: ${MATRIX_PATH}`);

    // Generate Delta Pack (Categorical Diffs)
    const deltaPack = {
        version: 'v0.15.0',
        generated_at: new Date().toISOString(),
        comparisons: [
            {
                pair: ['mcp-d1-budget-fail-01', 'pydantic-ai-d1-budget-fail-01'],
                diff_types: ['EVIDENCE_SHAPE_DIFF', 'EVENT_TOKEN_DIFF'],
                notes: 'Comparison of refusal patterns between MCP and Pydantic-AI substrates.'
            },
            {
                pair: ['mcp-d1-budget-pass-01', 'pydantic-ai-d1-budget-pass-01'],
                diff_types: ['POINTER_GRANULARITY_DIFF'],
                notes: 'Comparison of success evidence resolution between substrates.'
            }
        ]
    };

    fs.writeFileSync(DELTA_PACK_PATH, JSON.stringify(deltaPack, null, 2));
    console.log(`✅ Delta Pack generated at: ${DELTA_PACK_PATH}`);
}

generateMatrix().catch(console.error);
