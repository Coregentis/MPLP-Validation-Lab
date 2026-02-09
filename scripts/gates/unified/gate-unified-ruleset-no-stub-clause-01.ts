/**
 * Gate P4-D2 (Refactor): Unified Ruleset No Stub Clause
 * 
 * Verifies that all rulesets (V1 and V2) returned by `listRulesets()`:
 * 1. Have authentic clauses (length > 0)
 * 2. Do NOT contain placeholder text like "Clause 1", "Clause 2"
 * 3. Do NOT contain "placeholder" values
 * 
 * This prevents the "Layout degradation" where rulesets appear but lack content.
 */

import { listRulesets, loadRuleset } from '../../../lib/rulesets/loadRuleset';

export const gate = {
    id: 'GATE-UNIFIED-RULESET-NO-STUB-CLAUSE-01',
    description: 'Verify all rulesets have real content (No Stubs)',
    run: async () => {
        let pass = true;

        console.log('[INFO] Listing all rulesets...');
        const rulesets = listRulesets(); // This uses the unified loader

        if (rulesets.length === 0) {
            console.error('[FAIL] No rulesets found!');
            return false;
        }

        console.log(`[INFO] Found ${rulesets.length} rulesets. Auditing content...`);

        for (const manifest of rulesets) {
            const id = manifest.id;
            const version = manifest.version;

            console.log(`[INFO] Checking ${id} (${version})...`);

            // 1. Check Manifest Clauses
            if (!manifest.clauses || manifest.clauses.length === 0) {
                console.error(`[FAIL] ${id}: Clauses array is empty/missing.`);
                pass = false;
                continue;
            }

            // 2. Check for Stub/Placeholder Patterns
            const stubPatterns = [
                /^Clause \d+$/,
                /^placeholder$/i,
                /^stub$/i
            ];

            let stubCount = 0;
            for (const clause of manifest.clauses) {
                // Determine checking logic based on if clause is string or object (V2 asset might be object)
                let text = '';
                if (typeof clause === 'string') {
                    text = clause;
                } else if (typeof clause === 'object' && (clause as any).id) {
                    // If it's an object with ID, that's already a good sign it's real
                    text = (clause as any).id;
                } else {
                    text = JSON.stringify(clause);
                }

                if (stubPatterns.some(p => p.test(text))) {
                    stubCount++;
                }
            }

            if (stubCount > 0) {
                console.error(`[FAIL] ${id}: Contain ${stubCount} stub/placeholder clauses.`);
                pass = false;
            } else {
                console.log(`[PASS] ${id}: ${manifest.clauses.length} clauses verified authentic.`);
            }

            // 3. Load full details to check requirements (optional deeper check)
            const detail = loadRuleset(version);
            if (detail.missing.length > 0) {
                console.error(`[FAIL] ${id}: Load errors: ${detail.missing.join(', ')}`);
                pass = false;
            }
        }

        return pass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then((passed) => {
        if (passed) {
            console.log(`[PASS] ${gate.id}`);
            process.exit(0);
        } else {
            console.error(`[FAIL] ${gate.id}`);
            process.exit(1);
        }
    });
}
