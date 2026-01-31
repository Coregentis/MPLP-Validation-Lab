#!/usr/bin/env tsx

/**
 * GATE-V2-DET-01: Determinism Proof
 * 
 * Validates that multiple runs of the same scenario yield identical canonical hashes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { walkDir } from '../_lib/io';
import { type GateDefinition, pass, fail, type GateFailure } from '../_lib/gate-runner';

const GATE_ID = 'GATE-V2-DET-01';
const GATE_NAME = 'Determinism Proof';

async function execute() {
    const failures: GateFailure[] = [];
    const rootDir = path.resolve('.');

    // Group runs by substrate and scenario
    const runGroups: Record<string, string[]> = {};

    // Find all real runs
    const realDir = 'data/runs/v2/real';
    if (!fs.existsSync(realDir)) {
        return pass(GATE_ID, GATE_NAME, 'No real runs found to verify');
    }

    const substrates = fs.readdirSync(realDir);
    for (const substrate of substrates) {
        const substratePath = path.join(realDir, substrate);
        if (!fs.statSync(substratePath).isDirectory()) continue;

        const runs = fs.readdirSync(substratePath);
        for (const run of runs) {
            const manifestPath = path.join(substratePath, run, 'manifest.json');
            if (fs.existsSync(manifestPath)) {
                try {
                    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                    const scenarioId = manifest.scenario_id;
                    const groupKey = `${substrate}/${scenarioId}`;

                    if (!runGroups[groupKey]) runGroups[groupKey] = [];
                    runGroups[groupKey].push(manifestPath);
                } catch (e) {
                    // Ignore malformed manifests here
                }
            }
        }
    }

    // Check convergence for each group
    for (const [group, manifests] of Object.entries(runGroups)) {
        if (manifests.length < 2) {
            console.warn(`⚠️  Group ${group} has only ${manifests.length} run(s). Minimum 2 required for DET proof.`);
            continue;
        }

        const hashes: Record<string, string[]> = {};
        for (const mPath of manifests) {
            const manifest = JSON.parse(fs.readFileSync(mPath, 'utf-8'));
            const canonicalHash = manifest.hashes?.canonical_pack_root_hash;

            if (!canonicalHash) {
                failures.push({
                    file: mPath,
                    line: 1,
                    message: `Missing canonical_pack_root_hash in manifest`,
                    severity: 'error'
                });
                continue;
            }

            if (!hashes[canonicalHash]) hashes[canonicalHash] = [];
            hashes[canonicalHash].push(mPath);
        }

        const uniqueHashes = Object.keys(hashes);
        if (uniqueHashes.length > 1) {
            const hashList = uniqueHashes.map(h => `${h} (${hashes[h].length} runs)`).join(', ');
            failures.push({
                file: group, // Use group ID as pseudo-file
                line: 0,
                message: `Divergent canonical hashes in group ${group}: ${hashList}`,
                severity: 'error'
            });
        }
    }

    if (failures.length === 0) {
        return pass(GATE_ID, GATE_NAME, 'All multi-run scenarios have converged canonical hashes');
    }

    return fail(
        GATE_ID,
        GATE_NAME,
        `Found ${failures.length} determinism violation(s)`,
        failures
    );
}

export const gateDeterminism: GateDefinition = {
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
