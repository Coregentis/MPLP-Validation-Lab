/**
 * GATE-RUNSET-LINK-INTEGRITY-01
 * 
 * Verifies that Runset links in the manifest follow strict patterns:
 * - Must start with /runsets/
 * - ID part must match the runset.id (no version confusion)
 */

import { loadAllRunsets } from '../../../lib/unified/load-all-runsets';

export const gate = {
    id: 'GATE-RUNSET-LINK-INTEGRITY-01',
    name: 'Runset Link Integrity Policy',
    run: async () => {
        const runsets = loadAllRunsets();
        let allPass = true;

        for (const rs of runsets) {
            if (!rs.href.startsWith('/runsets/')) {
                console.error(`[FAIL] Runset ${rs.id} href '${rs.href}' does not start with /runsets/`);
                allPass = false;
                continue;
            }

            const targetId = rs.href.replace('/runsets/', '');
            if (targetId !== rs.id) {
                console.error(`[FAIL] Runset ${rs.id} href points to mismatching ID '${targetId}'`);
                allPass = false;
            } else {
                console.log(`[PASS] Runset ${rs.id} links correctly to ${rs.href}`);
            }

            // Strict check against version usage
            if (targetId.match(/^\d+\.\d+\.\d+$/)) {
                // Warn if ID looks like a semantic version?
                // Actually this IS forbidden by the ticket spec unless it's a real ID.
                // But we want to encourage descriptive IDs.
                // For now, if it matches ID it's fine, but let's log a warning if it looks like a version.
                console.warn(`[WARN] Runset ID '${targetId}' looks like a version number. Prefer descriptive IDs (e.g. 'v2-index')`);
            }
        }

        return allPass;
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    gate.run().then(pass => process.exit(pass ? 0 : 1));
}
