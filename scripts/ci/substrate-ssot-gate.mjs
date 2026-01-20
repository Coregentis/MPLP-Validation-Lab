#!/usr/bin/env node
/**
 * G-SSOT-SUBSTRATE-01 — Substrate SSOT Consistency Gate
 * 
 * Verifies that METHOD-VLAB-01 substrate snapshot matches substrate-index.yaml SSOT.
 * 
 * Checks:
 * 1. All Tier-0 substrates in SSOT are present in METHOD doc snapshot
 * 2. Status values match (ADJUDICATED/REGISTERED)
 * 3. No substrates in METHOD doc that don't exist in SSOT
 * 
 * Exit 0 = PASS, Exit 1 = FAIL
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const ROOT = process.cwd();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('G-SSOT-SUBSTRATE-01: Substrate SSOT Consistency');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Load SSOT
const ssotPath = path.join(ROOT, 'data/curated-runs/substrate-index.yaml');
const methodPath = path.join(ROOT, 'governance/METHOD-VLAB-01_EVALUATION_METHOD.md');

if (!fs.existsSync(ssotPath)) {
    console.log(`❌ SSOT not found: ${ssotPath}`);
    process.exit(1);
}

if (!fs.existsSync(methodPath)) {
    console.log(`❌ METHOD doc not found: ${methodPath}`);
    process.exit(1);
}

// Parse substrate-index.yaml
const ssotContent = fs.readFileSync(ssotPath, 'utf-8');
const ssotData = yaml.parse(ssotContent);

// Extract Tier-0 substrates from SSOT
const tier0Substrates = ssotData.substrates
    .filter(s => s.tier === 0)
    .map(s => {
        // Determine status: any ADJUDICATED run = ADJUDICATED, else REGISTERED
        const hasAdjudicated = s.runs?.some(r => r.status === 'ADJUDICATED');
        return {
            id: s.id,
            display_name: s.display_name,
            type: s.type,
            status: hasAdjudicated ? 'ADJUDICATED' : 'REGISTERED'
        };
    });

console.log(`\n📊 SSOT Tier-0 Substrates: ${tier0Substrates.length}`);
tier0Substrates.forEach(s => {
    const icon = s.status === 'ADJUDICATED' ? '✅' : '⚪';
    console.log(`   ${icon} ${s.display_name} (${s.type}) — ${s.status}`);
});

// Parse METHOD doc - extract snapshot table
const methodContent = fs.readFileSync(methodPath, 'utf-8');

// Find the Tier-0 Substrate Snapshot section
const snapshotMatch = methodContent.match(/### Tier-0 Substrate Snapshot[\s\S]*?\| Substrate \| Type \| Status \|([\s\S]*?)(?=\n\n|\n>|\n-{3})/);

if (!snapshotMatch) {
    console.log('\n⚠️ No Tier-0 Substrate Snapshot table found in METHOD doc');
    console.log('   Gate SKIPPED (no snapshot to verify)');
    process.exit(0);
}

// Parse the table rows
const tableContent = snapshotMatch[1];
const rows = tableContent.split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('|') && !line.includes('---'))
    .map(line => {
        const cells = line.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length >= 3) {
            return {
                display_name: cells[0],
                type: cells[1],
                status: cells[2].includes('ADJUDICATED') ? 'ADJUDICATED' : 'REGISTERED'
            };
        }
        return null;
    })
    .filter(r => r !== null);

console.log(`\n📄 METHOD Doc Snapshot: ${rows.length} substrates`);
rows.forEach(r => {
    const icon = r.status === 'ADJUDICATED' ? '✅' : '⚪';
    console.log(`   ${icon} ${r.display_name} (${r.type}) — ${r.status}`);
});

// Compare
let errors = [];

// Check all SSOT substrates are in METHOD doc
for (const ssotSub of tier0Substrates) {
    const docSub = rows.find(r =>
        r.display_name.toLowerCase() === ssotSub.display_name.toLowerCase()
    );

    if (!docSub) {
        errors.push(`MISSING in METHOD: ${ssotSub.display_name} (${ssotSub.status})`);
    } else if (docSub.status !== ssotSub.status) {
        errors.push(`STATUS MISMATCH: ${ssotSub.display_name} — SSOT=${ssotSub.status}, DOC=${docSub.status}`);
    }
}

// Check no extra substrates in METHOD doc
for (const docSub of rows) {
    const ssotSub = tier0Substrates.find(s =>
        s.display_name.toLowerCase() === docSub.display_name.toLowerCase()
    );

    if (!ssotSub) {
        errors.push(`EXTRA in METHOD (not in SSOT): ${docSub.display_name}`);
    }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (errors.length > 0) {
    console.log(`❌ GATE FAILED: ${errors.length} inconsistencies`);
    console.log('\nDiscrepancies:');
    errors.forEach(e => console.log(`   ⚠️ ${e}`));
    console.log('\nFix: Update METHOD-VLAB-01.md Section 8 snapshot to match substrate-index.yaml');
    process.exit(1);
} else {
    console.log('✅ GATE PASSED: METHOD doc snapshot matches SSOT');
    process.exit(0);
}
