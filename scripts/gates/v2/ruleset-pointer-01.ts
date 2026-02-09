import fs from 'fs';
import path from 'path';

interface GateResult {
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: string[];
}

interface Gate {
    id: string;
    name: string;
    description: string;
    run(): Promise<GateResult>;
}

export const gateRulesetPointer: Gate = {
    id: 'GATE-V2-RULESET-POINTER-01',
    name: 'Ruleset Pointer Check',
    description: 'Verifies existence of ruleset definitions.',
    async run() {
        const rulesetsDir = path.join(process.cwd(), 'data/rulesets');
        if (!fs.existsSync(rulesetsDir)) {
            return { status: 'FAIL', message: 'data/rulesets directory missing' };
        }

        const rulesets = fs.readdirSync(rulesetsDir).filter(dir => fs.statSync(path.join(rulesetsDir, dir)).isDirectory());
        if (rulesets.length === 0) {
            return { status: 'WARN', message: 'No rulesets found in data/rulesets' };
        }

        return { status: 'PASS', message: `Found ${rulesets.length} ruleset definitions` };
    }
};
