#!/usr/bin/env tsx

/**
 * GATE-V2-CROSSLINK-SSOT-01: Cross-Site Link SSOT
 * 
 * All cross-site links must use hosts.ts + linkmap
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-CROSSLINK-SSOT-01';
const GATE_NAME = 'Cross-Site Link SSOT';

// Patterns that indicate hardcoded cross-site links
const CROSS_SITE_PATTERNS = [
    /https:\/\/(?:www|docs)\.mplp\.io/,  // Hardcoded cross-site URLs
    /href=["']https:\/\/(?:www|docs)\.mplp\.io/,
];

// Allowed patterns (using registry)
const ALLOWED_PATTERNS = [
    /import.*HOSTS.*from.*hosts/,
    /HOSTS\.(?:WEBSITE|DOCS)/,
];

// Files exempt from this check
const EXEMPT_FILES = [
    'app/_registry/hosts.ts',
    'governance/linkmap.v2.yaml',
    'PHASE_0_CORRECTIONS.md',
    'implementation_plan.md',
    'app/_ssot/ux.generated.ts',
];

function isExempt(filePath: string): boolean {
    return EXEMPT_FILES.some(exempt => filePath.includes(exempt));
}

function hasAllowedPattern(line: string): boolean {
    return ALLOWED_PATTERNS.some(pattern => pattern.test(line));
}

async function execute() {
    const failures: GateFailure[] = [];
    const rootDir = path.resolve('.');

    // Scan UI component files
    const files = walkDir('app', ['.ts', '.tsx', '.js', '.jsx']);

    for (const file of files) {
        if (isExempt(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                continue;
            }

            // Check for cross-site patterns
            for (const pattern of CROSS_SITE_PATTERNS) {
                if (pattern.test(line) && !hasAllowedPattern(line)) {
                    failures.push({
                        file: path.relative(rootDir, file),
                        line: i + 1,
                        message: 'Hardcoded cross-site URL found (must use HOSTS registry)',
                        severity: 'error'
                    });
                }
            }
        }
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'All cross-site links use SSOT registry');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} hardcoded cross-site link(s)`,
        failures
    );
}

export const gateCrosslinkSSOT: GateDefinition = {
    gate_id: GATE_ID,
    name: GATE_NAME,
    execute
};

// CLI entry point
if (require.main === module) {
    execute().then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.exit_code);
    });
}
