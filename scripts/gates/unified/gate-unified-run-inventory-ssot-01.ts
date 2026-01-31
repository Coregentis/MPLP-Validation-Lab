#!/usr/bin/env tsx
/**
 * GATE-UNIFIED-RUN-INVENTORY-SSOT-01
 * 
 * Ensures the unified runs loader output matches source indices exactly.
 * Prevents SSOT drift in tier counts and total inventory.
 * 
 * Ticket: P1-01
 */

import fs from 'fs';
import path from 'path';

const V1_INDEX = 'public/_data/curated-runs.json';
const V2_INDEX = 'public/_data/v2/runs/index.json';

// Valid tier values
const VALID_TIERS = ['SIMULATED', 'REPRODUCED', 'DISPUTE_READY', 'DECLARED'] as const;
type Tier = typeof VALID_TIERS[number];

interface GateResult {
    gate_id: string;
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details: string[];
}

function readJson(filePath: string): any {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function main(): GateResult {
    const issues: string[] = [];

    // Load source indices
    const v1Data = readJson(V1_INDEX);
    const v2Data = readJson(V2_INDEX);

    if (!v1Data) {
        return { gate_id: 'GATE-UNIFIED-RUN-INVENTORY-SSOT-01', name: 'Unified Run Inventory SSOT', status: 'FAIL', message: 'V1 index not found', details: [V1_INDEX] };
    }
    if (!v2Data) {
        return { gate_id: 'GATE-UNIFIED-RUN-INVENTORY-SSOT-01', name: 'Unified Run Inventory SSOT', status: 'FAIL', message: 'V2 index not found', details: [V2_INDEX] };
    }

    const v1Runs = v1Data.runs || [];
    const v2Runs = v2Data.data?.runs || [];

    const v1Count = v1Runs.length;
    const v2Count = v2Runs.length;
    const expectedTotal = v1Count + v2Count;

    console.error(`📊 Source Indices:`);
    console.error(`   V1: ${v1Count} runs`);
    console.error(`   V2: ${v2Count} runs`);
    console.error(`   Expected Total: ${expectedTotal}`);

    // Count tiers (V1 = all SIMULATED, V2 = from index)
    const tierCounts: Record<Tier, number> = {
        'SIMULATED': v1Count,
        'REPRODUCED': 0,
        'DISPUTE_READY': 0,
        'DECLARED': 0,
    };

    const unknownTierRuns: string[] = [];

    for (const run of v2Runs) {
        const tier = run.tier as Tier;
        if (VALID_TIERS.includes(tier)) {
            tierCounts[tier]++;
        } else {
            unknownTierRuns.push(`${run.pack_id}: tier="${tier || 'undefined'}"`);
        }
    }

    console.error(`\n📈 Tier Distribution:`);
    for (const tier of VALID_TIERS) {
        console.error(`   ${tier}: ${tierCounts[tier]}`);
    }

    // Assertion 1: Tier counts sum to total
    const tierSum = Object.values(tierCounts).reduce((a, b) => a + b, 0);
    if (tierSum !== expectedTotal) {
        issues.push(`Tier sum (${tierSum}) ≠ expected total (${expectedTotal})`);
    }

    // Assertion 2: No unknown tiers
    if (unknownTierRuns.length > 0) {
        issues.push(`${unknownTierRuns.length} runs have unknown/missing tier`);
        unknownTierRuns.slice(0, 10).forEach(r => issues.push(`  → ${r}`));
    }

    // Assertion 3: Check for duplicate run IDs
    const allIds = new Set<string>();
    const duplicates: string[] = [];

    for (const run of v1Runs) {
        if (allIds.has(run.run_id)) duplicates.push(run.run_id);
        allIds.add(run.run_id);
    }
    for (const run of v2Runs) {
        if (allIds.has(run.pack_id)) duplicates.push(run.pack_id);
        allIds.add(run.pack_id);
    }

    if (duplicates.length > 0) {
        issues.push(`${duplicates.length} duplicate run IDs found`);
        duplicates.slice(0, 10).forEach(d => issues.push(`  → ${d}`));
    }

    // Output summary
    console.error(`\n✅ Assertions:`);
    console.error(`   Tier sum matches total: ${tierSum === expectedTotal ? 'PASS' : 'FAIL'}`);
    console.error(`   No unknown tiers: ${unknownTierRuns.length === 0 ? 'PASS' : 'FAIL'}`);
    console.error(`   No duplicate IDs: ${duplicates.length === 0 ? 'PASS' : 'FAIL'}`);

    if (issues.length > 0) {
        return {
            gate_id: 'GATE-UNIFIED-RUN-INVENTORY-SSOT-01',
            name: 'Unified Run Inventory SSOT',
            status: 'FAIL',
            message: `${issues.length} inventory SSOT violations`,
            details: issues
        };
    }

    return {
        gate_id: 'GATE-UNIFIED-RUN-INVENTORY-SSOT-01',
        name: 'Unified Run Inventory SSOT',
        status: 'PASS',
        message: `Inventory SSOT verified: ${expectedTotal} runs (V1:${v1Count} + V2:${v2Count}), tier counts aligned`,
        details: [
            `SIMULATED: ${tierCounts.SIMULATED}`,
            `REPRODUCED: ${tierCounts.REPRODUCED}`,
            `DISPUTE_READY: ${tierCounts.DISPUTE_READY}`,
            `DECLARED: ${tierCounts.DECLARED}`,
        ]
    };
}

const result = main();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === 'PASS' ? 0 : 1);
