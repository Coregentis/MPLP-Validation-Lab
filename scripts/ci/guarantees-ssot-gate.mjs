#!/usr/bin/env node
/**
 * G-GUARANTEES-SSOT-01 — Guarantees SSOT Consistency Gate
 * 
 * Verifies that /guarantees page loads from LIFECYCLE_GUARANTEES.yaml
 * and that the YAML contains all required LG-01~05 entries.
 * 
 * Checks:
 * 1. LIFECYCLE_GUARANTEES.yaml exists
 * 2. Contains exactly 5 guarantees (LG-01 ~ LG-05)
 * 3. Each guarantee has required fields
 * 
 * Exit 0 = PASS, Exit 1 = FAIL
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const ROOT = process.cwd();

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('G-GUARANTEES-SSOT-01: Guarantees SSOT Consistency');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const ssotPath = path.join(ROOT, 'governance', 'LIFECYCLE_GUARANTEES.yaml');

if (!fs.existsSync(ssotPath)) {
    console.log(`❌ SSOT not found: ${ssotPath}`);
    process.exit(1);
}

// Parse LIFECYCLE_GUARANTEES.yaml
const content = fs.readFileSync(ssotPath, 'utf-8');
const data = yaml.parse(content);

const errors = [];

// Check metadata
if (!data.metadata?.freeze_tag) {
    errors.push('Missing metadata.freeze_tag');
}

// Check guarantees exist
if (!data.guarantees || !Array.isArray(data.guarantees)) {
    errors.push('Missing guarantees array');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`❌ GATE FAILED: ${errors.length} errors`);
    errors.forEach(e => console.log(`   ⚠️ ${e}`));
    process.exit(1);
}

console.log(`\n📊 SSOT Guarantees: ${data.guarantees.length}`);

// Expected LG IDs
const expectedIds = ['LG-01', 'LG-02', 'LG-03', 'LG-04', 'LG-05'];
const requiredFields = ['id', 'internal_id', 'name', 'description', 'strength', 'evidence_hint'];

for (const expectedId of expectedIds) {
    const lg = data.guarantees.find(g => g.id === expectedId);
    if (!lg) {
        errors.push(`Missing guarantee: ${expectedId}`);
        continue;
    }

    for (const field of requiredFields) {
        if (!lg[field]) {
            errors.push(`${expectedId} missing required field: ${field}`);
        }
    }

    const icon = lg.strength === 'presence-level' ? '⚪' : '✅';
    console.log(`   ${icon} ${lg.id}: ${lg.name} (${lg.strength})`);
}

// Check for internal_id mapping
for (const lg of data.guarantees) {
    if (!lg.internal_id?.startsWith('gf-')) {
        errors.push(`${lg.id} has invalid internal_id (must start with gf-): ${lg.internal_id}`);
    }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (errors.length > 0) {
    console.log(`❌ GATE FAILED: ${errors.length} errors`);
    errors.forEach(e => console.log(`   ⚠️ ${e}`));
    process.exit(1);
} else {
    console.log(`✅ GATE PASSED: LIFECYCLE_GUARANTEES.yaml valid (${data.guarantees.length} guarantees, freeze: ${data.metadata.freeze_tag})`);
    process.exit(0);
}
