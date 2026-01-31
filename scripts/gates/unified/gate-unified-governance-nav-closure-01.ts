/**
 * GATE-UNIFIED-GOVERNANCE-NAV-CLOSURE-01
 * Static check for governance page links and /v2/ leaks
 */
import fs from 'fs';
import path from 'path';
import { fail, pass, runGate } from '../_lib/gate-runner';

export const gate = {
    id: 'GATE-UNIFIED-GOVERNANCE-NAV-CLOSURE-01',
    name: 'Governance Nav Closure & Safety',
    run: async () => {
        const govPagePath = path.join(process.cwd(), 'app/governance/page.tsx');
        if (!fs.existsSync(govPagePath)) return fail('Governance page not found');

        const content = fs.readFileSync(govPagePath, 'utf8');
        const errors: string[] = [];

        // 1. Check for required links (based on dynamic injection or static content)
        // We injected them dynamically via `const dynamicSections` in the code, so we search for that code.
        if (!content.includes('gov-runsets') && !content.includes('/runs')) {
            errors.push('Missing Runset link in Governance page');
        }
        if (!content.includes('gov-rulesets') && !content.includes('/rulesets')) {
            errors.push('Missing Ruleset link in Governance page');
        }

        // 2. Safety Check: No /v2/ leaks
        // Quick scan of the file for user-facing links starting with /v2/
        if (content.match(/href=["']\/v2\//)) {
            errors.push('Found forbidden /v2/ link in Governance page');
        }

        if (errors.length > 0) {
            return fail('Governance Navigation Gaps found', errors);
        }

        return pass('Governance Nav verified');
    }
};

runGate(gate).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.exit_code);
});
