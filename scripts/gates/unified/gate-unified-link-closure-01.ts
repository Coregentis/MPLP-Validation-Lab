import { runGate, fail, pass } from '../_lib/gate-runner';
import { execSync } from 'child_process';
import path from 'path';

export const gate = {
    id: 'GATE-UNIFIED-LINK-CLOSURE-01',
    name: 'Unified Link & Route Closure',
    run: async () => {
        try {
            // Run the audit script
            // Ensure tsx is available or use npx
            const scriptPath = path.join(process.cwd(), 'scripts/audit/link-integrity-01.ts');
            execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });

            return pass('All route surfaces and internal links are 200 OK.');
        } catch (e) {
            return fail('Link Integrity Audit Failed', ['See audit output for broken links list.']);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
