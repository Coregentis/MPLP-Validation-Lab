/**
 * Gate P4-D2: Unified Ruleset V2 Asset Coverage (Refactored)
 * 
 * Verifies that every ruleset declared in the V2 Unified Index has 
 * a corresponding SSOT asset file in public/_data/v2/rulesets/ruleset-${version}.json.
 * 
 * Uses the EXISTING asset structure (not bundles).
 */

import fs from 'fs';
import path from 'path';

const V2_INDEX_PATH = path.join(process.cwd(), 'public/_data/v2/rulesets/index.json');
const V2_ASSET_DIR = path.join(process.cwd(), 'public/_data/v2/rulesets');

export const gate = {
    id: 'GATE-UNIFIED-RULESET-V2-BUNDLE-COVERAGE-01',
    description: 'Verify all V2 rulesets have SSOT asset files',
    run: async () => {
        let pass = true;

        if (!fs.existsSync(V2_INDEX_PATH)) {
            console.error('[FAIL] V2 Index missing!');
            return false;
        }

        try {
            const index = JSON.parse(fs.readFileSync(V2_INDEX_PATH, 'utf-8'));
            if (!index.data || !Array.isArray(index.data.rulesets)) {
                console.error('[FAIL] Invalid V2 Index structure');
                return false;
            }

            const rulesets = index.data.rulesets;
            console.log(`[INFO] Found ${rulesets.length} V2 rulesets in index`);

            for (const rs of rulesets) {
                // Expected Asset Filename: ruleset-${version}.json
                const assetFilename = `ruleset-${rs.version}.json`;
                const assetPath = path.join(V2_ASSET_DIR, assetFilename);

                if (!fs.existsSync(assetPath)) {
                    console.error(`[FAIL] Missing asset for ${rs.id} (${rs.version}): expected ${assetFilename}`);
                    pass = false;
                } else {
                    // Quick smoke test of asset content
                    try {
                        const raw = JSON.parse(fs.readFileSync(assetPath, 'utf-8'));
                        // Adapter logic test
                        const data = raw.data ? raw.data : raw;

                        if (!data.clauses || data.clauses.length === 0) {
                            console.error(`[FAIL] Asset ${assetFilename} has no clauses!`);
                            pass = false;
                        } else {
                            console.log(`[PASS] Asset verified: ${assetFilename} (${data.clauses.length} clauses)`);
                        }
                    } catch (e) {
                        console.error(`[FAIL] Asset ${assetFilename} parse error`, e);
                        pass = false;
                    }
                }
            }

        } catch (e) {
            console.error('[FAIL] SSOT Error', e);
            pass = false;
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
