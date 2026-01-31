import { runGate, fail, pass, ToolConfig } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

export const gate = {
    id: 'GATE-UNIFIED-BUILD-LINT-POLICY-01',
    name: 'Build Lint Policy Consistency',
    run: async () => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // 1. Check Config
        const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
        if (!fs.existsSync(nextConfigPath)) {
            return fail(['next.config.ts not found']);
        }

        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        const isTolerant = configContent.includes('ignoreDuringBuilds: true');

        const policyPath = path.join(process.cwd(), 'governance/build-policy.md');
        const hasPolicyDoc = fs.existsSync(policyPath);

        // 2. Enforce Consistency
        if (isTolerant) {
            if (!hasPolicyDoc) {
                errors.push('Build is configured as Lint Tolerant (ignoreDuringBuilds: true), but governance/build-policy.md is missing.');
                errors.push('You must document the reason for tolerance to prevent governance drift.');
            } else {
                warnings.push('Build is Lint Tolerant. Ensure seal takes "lint_policy: tolerant".');
            }
        } else {
            // Strict mode
            if (hasPolicyDoc) {
                // Not an error, but worth noting if we left the doc around
                warnings.push('Build is Strict, but tolerant policy doc exists. Consider deprecating the policy doc if strictness is permanent.');
            }
        }

        if (errors.length > 0) return fail('Lint Policy Check Failed', errors);

        return pass(
            'Lint Policy/Config alignment verified',
            warnings.length > 0 ? warnings : []
        );
    }
};

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
