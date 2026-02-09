import { runGate, fail, pass } from '../_lib/gate-runner';

// Target a known stable V2 run from the index
const TARGET_ID = 'acp-d1-real-runner-001';
const API_URL = `http://localhost:3000/api/v2/runs/${TARGET_ID}`;

export const gate = {
    id: 'GATE-API-V2-EVIDENCE-JSON-01',
    name: 'V2 Evidence JSON API Availability',
    run: async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                return fail(`API returned ${res.status}`, [`URL: ${API_URL}`]);
            }

            const json = await res.json();
            // Data is wrapped in "data" property
            const actualId = json.data?.pack_id || json.id; // Support both just in case
            if (actualId !== TARGET_ID) {
                return fail('API response ID mismatch', [`Expected ${TARGET_ID}, got ${actualId}`]);
            }

            return pass(`API Operational. Returned valid JSON for ${TARGET_ID}.`);
        } catch (e: any) {
            return fail(`Fetch failed: ${e.message}`, ['Ensure server is running on port 3000']);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
