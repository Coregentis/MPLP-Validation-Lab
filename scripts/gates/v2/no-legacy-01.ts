#!/usr/bin/env tsx

/**
 * GATE-V2-NO-LEGACY-01: No V1 Legacy Content
 * 
 * Ensures zero V1 terminology, paths, or identifiers in V2 codebase
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-NO-LEGACY-01';
const GATE_NAME = 'No V1 Legacy Content';

// Exemption marker for legitimate V1 references
const EXEMPT_MARKER = '@v2-exempt NO_LEGACY';

// V1-specific patterns that should not appear
// @v2-exempt NO_LEGACY pattern-definition
const FORBIDDEN_PATTERNS = [
    /validation_lab_v1/i,  // @v2-exempt NO_LEGACY pattern-definition
    /validationlabv1/i,    // @v2-exempt NO_LEGACY pattern-definition
    /\bv1\.0\b/,          // @v2-exempt NO_LEGACY pattern-definition (Version references)
    /\/v1\//,             // @v2-exempt NO_LEGACY pattern-definition (Path segments)
    /_v1_/,                // @v2-exempt NO_LEGACY pattern-definition (Underscore separator)
    /-v1-/,                // @v2-exempt NO_LEGACY pattern-definition (Dash separator)
];

// Allowlisted files/patterns where V1 references are legitimate
const ALLOWLIST = [
    'PHASE_0_CORRECTIONS.md',
    'implementation_plan.md',
    'README.md',  // May reference migration
    'MIGRATION.md',
    '.md',  // Documentation files can reference V1 for context
];

function isAllowlisted(filePath: string): boolean {
    return ALLOWLIST.some(pattern => filePath.includes(pattern));
}

async function execute() {
    const failures: GateFailure[] = [];
    const rootDir = path.resolve('.');

    // Scan all source files
    const files = [
        ...walkDir('app', ['.ts', '.tsx', '.js', '.jsx']),
        ...walkDir('scripts', ['.ts', '.js']),
        ...walkDir('schemas', ['.json', '.md']),
        ...walkDir('producers', ['.ts', '.js', '.sh']).filter(f => !f.includes('node_modules')),
        ...walkDir('runners', ['.ts', '.dockerfile']),
    ];

    for (const file of files) {
        if (isAllowlisted(file)) continue;

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if line has exemption marker
            if (line.includes(EXEMPT_MARKER)) continue;

            // Also check previous line for exemption marker
            if (i > 0 && lines[i - 1].includes(EXEMPT_MARKER)) continue;

            for (const pattern of FORBIDDEN_PATTERNS) {
                if (pattern.test(line)) {
                    failures.push({
                        file: path.relative(rootDir, file),
                        line: i + 1,
                        message: `Found V1 legacy pattern: ${pattern.source}`,
                        severity: 'error'
                    });
                }
            }
        }
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'No V1 legacy content found');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} V1 legacy reference(s)`,
        failures
    );
}

export const gateNoLegacy: GateDefinition = {
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
