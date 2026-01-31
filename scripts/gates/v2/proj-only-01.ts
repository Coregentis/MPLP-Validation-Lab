#!/usr/bin/env tsx

/**
 * GATE-V2-PROJ-01: UI Projection-Only
 * 
 * UI components only access data through projection registry
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-PROJ-01';
const GATE_NAME = 'UI Projection-Only Data Access';

// Forbidden patterns (direct raw data access)
const FORBIDDEN_PATTERNS = [
    /from ['"].*data\/runs\//,  // Direct import from data/runs/
    /import.*['"].*data\/runs\//,
    /require\(['"].*data\/runs\//,
    /fs\.read.*public\/_data/,  // Direct filesystem reads of projection data
];

// Allowed patterns (using registry)
const ALLOWED_PATTERNS = [
    /from ['"].*\/_registry\/data-registry['"]/,
    /import.*from ['"].*\/_registry\/data-registry['"]/,
    /getRunsIndex|getRunDetail|getCoverageMatrix|getFMM/,  // Registry functions
];

// Files exempt from this check
const EXEMPT_FILES = [
    'app/_registry/data-registry.ts',  // This IS the registry
    'scripts/',  // Build scripts can access raw data
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

    // Scan UI component files only
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

            // Check for forbidden patterns
            for (const pattern of FORBIDDEN_PATTERNS) {
                if (pattern.test(line) && !hasAllowedPattern(content)) {
                    failures.push({
                        file: path.relative(rootDir, file),
                        line: i + 1,
                        message: 'Direct raw data access found (must use data-registry)',
                        severity: 'error'
                    });
                }
            }
        }
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'All UI data access uses projection registry');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} direct data access violation(s)`,
        failures
    );
}

export const gateProjectionOnly: GateDefinition = {
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
