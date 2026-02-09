import { runGate, fail, pass, warn } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

export const gate = {
    id: 'GATE-UNIFIED-V2-EVIDENCE-API-01',
    name: 'V2 Evidence API Integrity',
    run: async () => {
        const indexFile = path.join(process.cwd(), 'public/_data/v2/runs/index.json');
        if (!fs.existsSync(indexFile)) return fail('V2 Run Index Missing');

        const index = JSON.parse(fs.readFileSync(indexFile, 'utf-8'));
        const runs = index.data?.runs || [];
        const errors: string[] = [];
        let checked = 0;

        console.log(`Checking API endpoints for ${runs.length} V2 runs...`);

        for (const run of runs) {
            const id = run.pack_id;

            // 1. Check JSON Endpoint
            try {
                const res = await fetch(`${BASE_URL}/api/v2/runs/${id}`);
                if (res.status !== 200) {
                    errors.push(`[${id}] JSON API Failed: ${res.status}`);
                } else {
                    await res.json(); // Verify JSON parse
                }
            } catch (e: any) {
                errors.push(`[${id}] JSON API Error: ${e.message}`);
            }

            // 2. Check Download Endpoint
            try {
                const res = await fetch(`${BASE_URL}/api/v2/runs/${id}/evidence`);
                if (res.status !== 200) {
                    errors.push(`[${id}] Evidence Download Failed: ${res.status}`);
                } else {
                    const ct = res.headers.get('content-type');
                    if (!ct?.includes('zip')) {
                        errors.push(`[${id}] Evidence Download Content-Type Invalid: ${ct}`);
                    }
                    // Optional: Check size > 0
                    const blob = await res.arrayBuffer();
                    if (blob.byteLength === 0) {
                        errors.push(`[${id}] Evidence Download Empty`);
                    }
                }
            } catch (e: any) {
                errors.push(`[${id}] Evidence Download Error: ${e.message}`);
            }

            checked++;
        }

        if (errors.length > 0) {
            return fail(`V2 Evidence API Integrity Failed (${errors.length} violations)`, errors);
        }

        return pass(`Verified ${checked} V2 Runs (JSON + ZIP endpoints)`);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
