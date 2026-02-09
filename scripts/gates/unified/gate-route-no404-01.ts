import { runGate, fail, pass } from '../_lib/gate-runner';
import { execSync } from 'child_process';

export const gate = {
    id: 'GATE-ROUTE-NO404-01',
    name: 'Route Reachability (No 404)',
    run: async () => {
        try {
            // Re-use audit script logic by invoking it
            // In a real CI, this might share code, but exec is isolating.
            execSync('npx tsx scripts/audit/http-health-crawl-01.ts', { stdio: 'inherit' });
            return pass('All critical routes are reachable.');
        } catch (e) {
            return fail('Route Reachability Check Failed', ['See crawl output above.']);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
