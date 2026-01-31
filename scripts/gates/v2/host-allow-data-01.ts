#!/usr/bin/env tsx

/**
 * GATE-V2-HOST-ALLOW-DATA-01: Host Allowlist (Data/Provenance)
 * 
 * Allows legitimate provenance domains (github.com, npmjs.com) within evidence packs.
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-HOST-ALLOW-DATA-01';
const GATE_NAME = 'Host Allowlist (Data/Provenance)';

// Exemption marker
const EXEMPT_MARKER = '@v2-exempt HOST_ALLOW_DATA';

// Allowed hosts for DATA (more relaxed than UI)
const ALLOWED_HOSTS = [
    'lab.mplp.io',
    'www.mplp.io',
    'docs.mplp.io',
    'github.com',
    'npmjs.org',
    'npmjs.com',
    'modelcontextprotocol.io'
];

// Forbidden hosts/patterns
const FORBIDDEN_HOSTS = [
    'localhost',
    '127.0.0.1',
    'vercel.app',
    'ngrok.io',
    'trycloudflare.com',
];

function findHostReferences(content: string, filePath: string): GateFailure[] {
    const failures: GateFailure[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.includes(EXEMPT_MARKER)) continue;

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

        // Check for unauthorized https:// strings
        if (line.includes('https://')) {
            const hasAllowedHost = ALLOWED_HOSTS.some(host => line.includes(host));
            if (!hasAllowedHost) {
                failures.push({
                    file: filePath,
                    line: i + 1,
                    message: `Unauthorized host in data pack: ${line.match(/https:\/\/[^\s'"]+/)?.[0] || 'unknown'}`,
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

    // Scan all data files (manifests only to avoid raw data noise)
    const files = [
        ...walkDir('data/runs', ['manifest.json']),
    ];

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const relPath = path.relative(rootDir, file);
        const fileFailures = findHostReferences(content, relPath);
        failures.push(...fileFailures);
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'All data provenance hosts are authorized');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} unauthorized host(s) in data packs`,
        failures
    );
}

export const gateHostAllowData: GateDefinition = {
    gate_id: GATE_ID,
    name: GATE_NAME,
    execute
};

if (require.main === module) {
    execute().then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.exit_code);
    });
}
