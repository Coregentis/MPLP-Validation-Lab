import { runGate, fail, pass, warn } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

// NOTE: This gate requires 'releases/unified/index.json' to find history.
// If index doesn't exist, it skips (Warn).

const INDEX_PATH = path.join(process.cwd(), 'releases/unified/index.json');
const CURRENT_AUDIT = path.join(process.cwd(), 'reports/lint-audit.json');

export const gate = {
    id: 'GATE-UNIFIED-LINT-DEBT-TREND-01',
    name: 'Lint Debt Trend Analysis',
    run: async () => {
        // 1. Get Current Debt
        if (!fs.existsSync(CURRENT_AUDIT)) {
            return warn('No current lint-audit.json found. Skipping trend check.');
        }
        const currentData = JSON.parse(fs.readFileSync(CURRENT_AUDIT, 'utf8'));
        const currentErrors = currentData.total_errors || 0;

        // 2. Get Previous Debt
        if (!fs.existsSync(INDEX_PATH)) {
            return pass('No release history index found. Baseline established.', [`Current Errors: ${currentErrors}`]);
        }

        try {
            const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
            const releases = index.releases || [];

            // Find valid releases with lint data, sorted by date desc
            const history = releases
                .filter((r: any) => r.status === 'VALID' && r.artifacts?.lint_audit)
                .sort((a: any, b: any) => b.id.localeCompare(a.id));

            if (history.length === 0) {
                return pass('No historical lint data found using new schema. Baseline established.', [`Current Errors: ${currentErrors}`]);
            }

            // Compare with latest
            const latest = history[0];
            const previousErrors = latest.metrics?.lint_errors;

            if (previousErrors === undefined) {
                return pass('Latest release missing lint metrics. Baseline established.', [`Current Errors: ${currentErrors}`]);
            }

            // 3. Evaluate Trend
            // We allow equality, but warn on increase.
            if (currentErrors > previousErrors) {
                return warn(
                    `Lint Debt Increased! (${previousErrors} -> ${currentErrors})`,
                    ['Governance: Debt should adhere to non-increasing trend.']
                );
            } else if (currentErrors < previousErrors) {
                return pass(
                    `Lint Debt Decreased (${previousErrors} -> ${currentErrors})`,
                    ['Good job! Continuing towards Strict Compliance.']
                );
            } else {
                return pass(
                    `Lint Debt Stable (${currentErrors})`,
                    ['No increase detected.']
                );
            }

        } catch (e: any) {
            return warn(`Failed to parse release index: ${e.message}`);
        }
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
