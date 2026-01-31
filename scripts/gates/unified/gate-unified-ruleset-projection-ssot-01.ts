/**
 * GATE-UNIFIED-RULESET-PROJECTION-SSOT-01
 * Checks that Unified Ruleset Loader captures both V1 and V2
 */
import { fail, pass, runGate } from '../_lib/gate-runner';
import { listRulesets } from '../../../lib/rulesets/loadRuleset'; // Use the refactored one

export const gate = {
    id: 'GATE-UNIFIED-RULESET-PROJECTION-SSOT-01',
    name: 'Ruleset Projection Verification',
    run: async () => {
        const rulesets = listRulesets();

        const hasV1 = rulesets.some(r => r.source === 'v1');
        const hasV2 = rulesets.some(r => r.source === 'v2');
        const v2Specific = rulesets.find(r => r.id === 'ruleset-v2.0.0');

        const errors: string[] = [];
        if (!hasV1) errors.push('No V1 rulesets found in loader');
        if (!hasV2) errors.push('No V2 rulesets found in loader');
        if (!v2Specific) errors.push('Specific V2 ruleset (ruleset-v2.0.0) not found');

        if (errors.length > 0) {
            return fail('Ruleset Projection incomplete', errors);
        }

        return pass('Ruleset loader projects both V1 and V2 sources', [
            `Total Rulesets: ${rulesets.length}`,
            `Sources: ${[...new Set(rulesets.map(r => r.source))].join(', ')}`
        ]);
    }
};

runGate(gate).then(result => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.exit_code);
});
