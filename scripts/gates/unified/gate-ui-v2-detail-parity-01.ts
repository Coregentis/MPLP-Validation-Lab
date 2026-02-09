import { runGate, fail, pass } from '../_lib/gate-runner';

const TARGET_ID = 'acp-d1-real-runner-001';
const UI_URL = `http://localhost:3000/runs/${TARGET_ID}`;

const REQUIRED_SECTIONS = [
    'v2-section-summary',
    'v2-section-stack',
    'v2-section-surfaces',
    'v2-section-provenance',
    'v2-section-determinism',
    'v2-section-ruleset',
    'v2-section-files'
];

export const gate = {
    id: 'GATE-UI-V2-DETAIL-PARITY-01',
    name: 'V2 Detail UI Parity Check',
    run: async () => {
        try {
            const res = await fetch(UI_URL);
            if (!res.ok) {
                return fail(`UI returned ${res.status}`, [`URL: ${UI_URL}`]);
            }

            const html = await res.text();
            const missing: string[] = [];

            REQUIRED_SECTIONS.forEach(id => {
                if (!html.includes(`data-testid="${id}"`)) {
                    missing.push(id);
                }
            });

            if (missing.length > 0) {
                return fail(`Missing required parity sections`, missing);
            }

            return pass(`UI Parity Verified. All ${REQUIRED_SECTIONS.length} sections present.`);
        } catch (e: any) {
            return fail(`Fetch failed: ${e.message}`, ['Ensure server is running on port 3000']);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
