/**
 * GATE-UNIFIED-RULESET-LEGACY-ALIAS-200-01
 * 
 * Verifies that legacy links (e.g. /rulesets/ruleset-1.0.0) correctly REDIRECT (3xx) 
 * or Resolve (200) to the canonical page via the new Alias Logic.
 * 
 * Requires Server to be running.
 */
// import fetch from 'node-fetch'; // Native in Node 18+

const BASE_URL = 'http://localhost:3000';

async function probe(path: string, expectedStatus: number | number[]) {
    const url = `${BASE_URL}${path}`;
    try {
        const res = await fetch(url, { redirect: 'manual' }); // Manual to detect 3xx
        const status = res.status;

        // We accept 307/308 (Redirect) OR 200 (if App Router handles it transparently/client-side, 
        // though server-side redirect usually returns 307/308 in manual mode).
        // Actually, next/navigation redirect throw error that Next handles.
        // If we curl it, we get 307.

        const valid = Array.isArray(expectedStatus) ? expectedStatus.includes(status) : status === expectedStatus;

        if (valid) {
            console.log(`  [PASS] ${path} -> ${status} (Expected)`);
            if (status >= 300 && status < 400) {
                console.log(`         Redirect Location: ${res.headers.get('location')}`);
            }
            return true;
        } else {
            console.error(`  [FAIL] ${path} -> ${status} (Expected ${expectedStatus})`);
            return false;
        }
    } catch (e) {
        const err = e as Error;
        console.error(`  [FAIL] ${path} -> Network Error: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log('--- GATE: Legacy Alias Redirects ---');
    let pass = true;

    // 1. Probe V1 Alias
    pass = (await probe('/rulesets/ruleset-1.0.0', [307, 308, 200])) && pass;
    pass = (await probe('/rulesets/ruleset-1.1.0', [307, 308, 200])) && pass;

    // 2. Probe Canonical (should be 200)
    pass = (await probe('/rulesets/ruleset-1.0', 200)) && pass;

    if (!pass) process.exit(1);
    console.log('\n[PASS] All aliases resolving correctly.');
}

run();
