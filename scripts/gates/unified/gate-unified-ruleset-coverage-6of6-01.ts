import { listRulesets } from '../../../lib/rulesets/loadRuleset';

/**
 * GATE-UNIFIED-RULESET-COVERAGE-6OF6-01
 * 
 * Verifies that ALL detected rulesets have valid content in one of the two supported modes:
 * - 'clauses' (Standard): Must have non-empty clauses array + no stubs
 * - 'golden_flows' (Legacy): Must have non-empty golden_flows array
 * 
 * Failure Conditions:
 * - Ruleset has neither clauses nor golden_flows
 * - Clauses contain "placeholder" or "Clause 1" stubs
 */

export async function checkRulesetCoverage() {
    console.log('--- GATE: Ruleset Coverage (6/6 Dual Mode) ---');

    // 1. Get Inventory
    const rulesets = listRulesets();
    console.log(`Found ${rulesets.length} rulesets.`);

    if (rulesets.length < 6) {
        console.error(`[FAIL] Expected at least 6 rulesets (V1.0-1.3, V2.0.0-2.0.1), found ${rulesets.length}`);
        process.exit(1);
    }

    let failCount = 0;
    const stubPatterns = [/Clause \d+/i, /placeholder/i];

    for (const rs of rulesets) {
        // Mode Check
        const mode = rs.kind || 'clauses'; // Default to clauses if undefined
        console.log(`Checking ${rs.id} (Version: ${rs.version}, Mode: ${mode})...`);

        if (mode === 'golden_flows') {
            // Legacy Mode
            if (!rs.golden_flows || rs.golden_flows.length === 0) {
                console.error(`  [FAIL] ${rs.id} is in 'golden_flows' mode but has empty array.`);
                failCount++;
            } else {
                console.log(`  [PASS] ${rs.id}: ${rs.golden_flows.length} Golden Flows.`);
            }
        } else {
            // Standard Mode (clauses)
            if (!rs.clauses || rs.clauses.length === 0) {
                console.error(`  [FAIL] ${rs.id} is in 'clauses' mode but has empty array.`);
                failCount++;
            } else {
                // Semantic Check (No Stubs)
                const stubs = rs.clauses.filter(c => stubPatterns.some(p => p.test(c)));
                if (stubs.length > 0) {
                    console.error(`  [FAIL] ${rs.id} contains ${stubs.length} stubs: ${stubs.join(', ')}`);
                    failCount++;
                } else {
                    console.log(`  [PASS] ${rs.id}: ${rs.clauses.length} Clauses verified.`);
                }
            }
        }
    }

    if (failCount > 0) {
        console.error(`\n[FAIL] ${failCount} rulesets failed coverage check.`);
        process.exit(1);
    }

    console.log(`\n[PASS] All ${rulesets.length} rulesets have valid content.`);
}

checkRulesetCoverage();
