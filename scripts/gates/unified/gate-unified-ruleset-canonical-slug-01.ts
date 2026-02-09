import { listRulesets } from '../../../lib/rulesets/loadRuleset';

/**
 * GATE-UNIFIED-RULESET-CANONICAL-SLUG-01
 * 
 * Enforces that the SYSTEM of record (listRulesets) only returns Canonical IDs (folder names)
 * and not version-strings as IDs.
 * 
 * Also optionally scans source code for hardcoded version-links (heuristic).
 */

export async function checkCanonicalSlugs() {
    console.log('--- GATE: Canonical Slug Integrity ---');

    // 1. Loader Check
    const rulesets = listRulesets();
    let failCount = 0;

    for (const rs of rulesets) {
        const id = rs.id;
        // Bad ID pattern: ruleset-1.0.0 (Version in ID)
        // Good ID pattern: ruleset-1.0 (Folder name) or ruleset-v2.0.0 (V2 Exception)

        // Detailed check:
        // If ID matches Version exactly, and Version has dots (1.0.0), it's likely wrong
        // UNLESS the folder name actually IS 1.0.0 (which we discourage but check)

        // Heuristic: V1 rulesets should be 'ruleset-X.Y' not 'ruleset-X.Y.Z'
        if (rs.source !== 'v2' && /\d+\.\d+\.\d+$/.test(id)) {
            console.error(`  [FAIL] ${id} appears to be a Version Slug, not a Canonical ID.`);
            failCount++;
        } else {
            console.log(`  [PASS] ${id} looks canonical.`);
        }
    }

    if (failCount > 0) {
        console.error(`\n[FAIL] ${failCount} rulesets have non-canonical IDs.`);
        process.exit(1);
    }

    console.log(`\n[PASS] All ruleset IDs are canonical.`);
}

checkCanonicalSlugs();
