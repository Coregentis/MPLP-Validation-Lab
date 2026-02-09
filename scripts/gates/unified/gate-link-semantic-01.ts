import { runGate, fail, pass, warn } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

export const gate = {
    id: 'GATE-LINK-SEMANTIC-01',
    name: 'Link & Route Semantic Closure',
    run: async () => {
        const v2Index = path.join(process.cwd(), 'public/_data/v2/rulesets/index.json');
        if (!fs.existsSync(v2Index)) return warn('No V2 Ruleset Index found');

        const index = JSON.parse(fs.readFileSync(v2Index, 'utf-8'));
        const errors: string[] = [];

        // Check Ruleset Index entries
        index.data.rulesets.forEach((rs: any, i: number) => {
            // Rule 1: ID cannot be same as Version (prevents ambiguity)
            if (rs.ruleset_id === rs.version) {
                errors.push(`Row ${i}: ruleset_id (${rs.ruleset_id}) equals version. Must use canonical ID (e.g. ruleset-v2.0.0).`);
            }

            // Rule 2: ID must start with canonical prefix
            if (!rs.ruleset_id.startsWith('ruleset-') && !rs.ruleset_id.startsWith('rs-')) {
                errors.push(`Row ${i}: ruleset_id (${rs.ruleset_id}) invalid prefix. Expected 'ruleset-' or 'rs-'.`);
            }

            // Rule 3: Version must be valid SemVer-ish
            if (!/^\d+\.\d+\.\d+/.test(rs.version)) {
                errors.push(`Row ${i}: version (${rs.version}) invalid format.`);
            }
        });

        if (errors.length > 0) {
            return fail('Semantic Violations in Ruleset Index', errors);
        }

        return pass('All Ruleset Links are Semantically Valid');
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
