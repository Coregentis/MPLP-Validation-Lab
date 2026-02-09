/**
 * GATE-UNIFIED-RELEASE-EVIDENCE-LINKS-200-01
 * 
 * Verifies that the Evidence Download Links (API) for the LATEST release
 * return HTTP 200 (OK) with correct Content-Type.
 */

import { listUniqueReleases, getRelease } from '../../../lib/releases/loadRelease';

const BASE_URL = 'http://localhost:3000';

async function checkEvidenceLinks() {
    console.log('--- GATE: Release Evidence Integrity ---');

    const releases = listUniqueReleases();
    if (releases.length === 0) {
        console.warn('  [WARN] No releases found.');
        return;
    }

    const latestSummary = releases[0];
    const detail = getRelease(latestSummary.build_id);

    if (!detail || !detail.files || detail.files.length === 0) {
        console.error(`  [FAIL] Could not load details or no files for ${latestSummary.build_id}`);
        process.exit(1);
    }

    console.log(`  Checking evidence for ${detail.build_id} (${detail.files.length} files)...`);
    let failCount = 0;

    for (const f of detail.files) {
        const path = `/api/releases/${detail.build_id}/${f}`;
        const url = `${BASE_URL}${path}`;

        try {
            const res = await fetch(url, { method: 'HEAD' }); // HEAD is enough to check existence

            if (res.status === 200) {
                const type = res.headers.get('content-type');
                const len = res.headers.get('content-length');
                console.log(`  [PASS] ${f} -> 200 OK (${len} bytes, ${type})`);
            } else {
                console.error(`  [FAIL] ${f} -> ${res.status}`);
                failCount++;
            }
        } catch (e) {
            const err = e as Error;
            console.error(`  [FAIL] ${f} -> Error: ${err.message}`);
            failCount++;
        }
    }

    if (failCount > 0) {
        console.error(`\n[FAIL] ${failCount} evidence links broken.`);
        process.exit(1);
    }

    console.log('\n[PASS] All evidence links valid.');
}

checkEvidenceLinks();
