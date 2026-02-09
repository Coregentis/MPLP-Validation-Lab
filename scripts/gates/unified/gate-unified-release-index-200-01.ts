/**
 * GATE-UNIFIED-RELEASE-INDEX-200-01
 * 
 * Verifies that the Release Index Page and Detail Page for the LATEST release
 * return HTTP 200.
 */

// import fetch from 'node-fetch'; // Native in Node 18+
import { listUniqueReleases } from '../../../lib/releases/loadRelease';

const BASE_URL = 'http://localhost:3000';

async function probe(path: string) {
    try {
        const res = await fetch(`${BASE_URL}${path}`);
        if (res.status === 200) {
            console.log(`  [PASS] ${path} -> 200 OK`);
            return true;
        } else {
            console.error(`  [FAIL] ${path} -> ${res.status}`);
            return false;
        }
    } catch (e) {
        const err = e as Error;
        console.error(`  [FAIL] ${path} -> Error: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log('--- GATE: Release Index & Detail Availability ---');

    // 1. Check Index
    let pass = await probe('/releases');

    // 2. Check Latest Detail
    const releases = listUniqueReleases();
    if (releases.length > 0) {
        const latest = releases[0];
        console.log(`  Probing latest release: ${latest.build_id}`);
        pass = (await probe(`/releases/${latest.build_id}`)) && pass;
    } else {
        console.warn('  [WARN] No releases found to probe.');
    }

    if (!pass) process.exit(1);
    console.log('\n[PASS] Release UI is reachable.');
}

run();
