import { runGate, fail, pass, warn } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000';

export const gate = {
    id: 'GATE-UNIFIED-RULESET-DETAIL-CLOSURE-01',
    name: 'Unified Ruleset Detail Semantic Closure',
    run: async () => {
        // 1. Build Inventory of Expected Ruleset IDs
        const ids = new Set<string>();

        // V1
        try {
            const v1Dir = path.join(process.cwd(), 'data/rulesets');
            if (fs.existsSync(v1Dir)) {
                fs.readdirSync(v1Dir).forEach(f => {
                    const id = f.replace('.json', ''); // Filename based ID for V1
                    ids.add(id);
                });
            }
        } catch (e) { }

        // V2
        try {
            const v2Idx = path.join(process.cwd(), 'public/_data/v2/rulesets/index.json');
            if (fs.existsSync(v2Idx)) {
                const data = JSON.parse(fs.readFileSync(v2Idx, 'utf-8'));
                data.data?.rulesets?.forEach((r: any) => {
                    if (r.ruleset_id) ids.add(r.ruleset_id);
                });
            }
        } catch (e) { }

        const errors: string[] = [];
        let checked = 0;

        console.log(`Checking Detail Routes for ${ids.size} Rulesets...`);

        // 2. Verify Closure
        for (const id of ids) {
            try {
                const url = `${BASE_URL}/rulesets/${id}`;
                const res = await fetch(url);
                if (res.status !== 200) {
                    errors.push(`[${id}] Route Failed: ${url} (${res.status})`);
                } else {
                    const html = await res.text();
                    if (!html.includes(id)) {
                        errors.push(`[${id}] Semantic Mismatch: Page 200 but ID not found in content.`);
                    }
                }
            } catch (e: any) {
                errors.push(`[${id}] Fetch Error: ${e.message}`);
            }
            checked++;
        }

        if (errors.length > 0) {
            return fail(`Ruleset Closure Failed (${errors.length} violations)`, errors);
        }

        return pass(`Verified ${checked} Unified Ruleset Detail Routes`);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
