#!/usr/bin/env tsx

/**
 * GATE-V2-HOST-ALLOW-UI-01: Host Allowlist (UI/Registry)
 * 
 * Strictly enforced allowlist for rendering and routing surfaces.
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-HOST-ALLOW-UI-01';
const GATE_NAME = 'Host Allowlist (UI/Registry)';

// Exemption marker for legitimate host usage
const EXEMPT_MARKER = '@v2-exempt HOST_ALLOW';

// Allowed hosts
const ALLOWED_HOSTS = [
    'lab.mplp.io',
    'www.mplp.io',
    'docs.mplp.io',
    'example.com',  // Test fixtures only
];

// Forbidden hosts/patterns
// @v2-exempt HOST_ALLOW pattern-definition
const FORBIDDEN_HOSTS = [
    'localhost',          // @v2-exempt HOST_ALLOW pattern-definition
    '127.0.0.1',         // @v2-exempt HOST_ALLOW pattern-definition
    'vercel.app',        // @v2-exempt HOST_ALLOW pattern-definition
    'ngrok.io',          // @v2-exempt HOST_ALLOW pattern-definition
    'trycloudflare.com', // @v2-exempt HOST_ALLOW pattern-definition
    'preview',           // @v2-exempt HOST_ALLOW pattern-definition
    'staging',           // @v2-exempt HOST_ALLOW pattern-definition
];

// Files where hosts are defined (SSOT)
const SSOT_FILES = [
    'app/_registry/hosts.ts',
    'governance/linkmap.v2.yaml',
    'next.config.js',
];

function isSSOTFile(filePath: string): boolean {
    return SSOT_FILES.some(ssot => filePath.endsWith(ssot));
}

function findHostReferences(content: string, filePath: string): GateFailure[] {
    const failures: GateFailure[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if line has exemption marker (do this FIRST)
        const hasExempt = line.includes(EXEMPT_MARKER) || (i > 0 && lines[i - 1].includes(EXEMPT_MARKER));

        // Skip exempt lines entirely
        if (hasExempt) continue;

        // Check for forbidden hosts
        for (const forbidden of FORBIDDEN_HOSTS) {
            if (line.includes(forbidden)) {
                failures.push({
                    file: filePath,
                    line: i + 1,
                    message: `Found forbidden host: ${forbidden}`,
                    severity: 'error'
                });
            }
        }

        // @v2-exempt HOST_ALLOW pattern-check-logic
        // Check for https:// outside SSOT files
        if (line.includes('https://') && !isSSOTFile(filePath)) { // @v2-exempt HOST_ALLOW pattern-check-logic
            // Skip if it's a comment or documentation
            if (line.trim().startsWith('//') || line.trim().startsWith('*') || line.trim().startsWith('#')) {
                continue;
            }

            // @v2-exempt HOST_ALLOW pattern-check-logic
            // Check if it's an allowed host
            const hasAllowedHost = ALLOWED_HOSTS.some(host => line.includes(host)); // @v2-exempt HOST_ALLOW pattern-check-logic
            if (!hasAllowedHost) {
                // @v2-exempt HOST_ALLOW pattern-check-logic
                failures.push({
                    file: filePath,
                    line: i + 1,
                    message: 'https:// string found outside SSOT files (must use HOSTS registry)', // @v2-exempt HOST_ALLOW pattern-check-logic
                    severity: 'error'
                });
            }
        }
    }

    return failures;
}

async function execute() {
    const failures: GateFailure[] = [];
    const rootDir = path.resolve('.');

    // Scan all source files
    const files = [
        ...walkDir('app', ['.ts', '.tsx', '.js', '.jsx']),
        ...walkDir('scripts', ['.ts', '.js']).filter(f => !f.includes('scripts/gates')),
        ...walkDir('governance', ['.yaml', '.yml']),
    ];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(rootDir, file);
        const fileFailures = findHostReferences(content, relPath);
        failures.push(...fileFailures);
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'All host references are allowlisted');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} host violation(s)`,
        failures
    );
}

export const gateHostAllowUI: GateDefinition = {
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
