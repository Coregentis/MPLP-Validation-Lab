import { runGate, fail, pass, warn, ToolConfig } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

const DEADLINE = new Date('2026-06-30T23:59:59Z');

export const gate = {
    id: 'GATE-UNIFIED-LINT-STRICT-DEADLINE-01',
    name: 'Lint Policy Deadline Check',
    run: async () => {
        const now = new Date();
        const nextConfigPath = path.join(process.cwd(), 'next.config.ts');

        // 1. Check if we are tolerant
        let isTolerant = false;
        if (fs.existsSync(nextConfigPath)) {
            const content = fs.readFileSync(nextConfigPath, 'utf8');
            if (content.includes('ignoreDuringBuilds: true')) {
                isTolerant = true;
            }
        }

        if (!isTolerant) {
            return pass('Build is Strict. Deadline does not apply.');
        }

        // 2. Check Deadline
        if (now > DEADLINE) {
            return fail(
                `Lint Tolerance Deadline Exceeded (${DEADLINE.toISOString().split('T')[0]})`,
                ['Current Policy: TOLERANT', 'Action: Must revert to STRICT immediately.']
            );
        }

        const daysRemaining = Math.ceil((DEADLINE.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        return pass(
            `Lint Tolerance Active. ${daysRemaining} days remaining until deadline.`,
            [`Deadline: ${DEADLINE.toISOString().split('T')[0]}`]
        );
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
