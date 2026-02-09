import { runGate, fail, pass } from '../_lib/gate-runner';

const TARGET_ID = 'acp-d1-real-runner-001';
const API_URL = `http://localhost:3000/api/v2/runs/${TARGET_ID}/evidence`;

export const gate = {
    id: 'GATE-API-V2-EVIDENCE-DOWNLOAD-01',
    name: 'V2 Evidence Zip API Availability',
    run: async () => {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) {
                return fail(`API returned ${res.status}`, [`URL: ${API_URL}`]);
            }

            const type = res.headers.get('content-type');
            if (type !== 'application/zip') {
                return fail('Invalid Content-Type', [`Expected application/zip, got ${type}`]);
            }

            const blob = await res.blob();
            if (blob.size < 100) {
                return fail('Zip file too small (<100b)', [`Size: ${blob.size} bytes`]);
            }

            return pass(`API Operational. Returned valid Zip (${blob.size} bytes).`);
        } catch (e: any) {
            return fail(`Fetch failed: ${e.message}`, ['Ensure server is running on port 3000']);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
