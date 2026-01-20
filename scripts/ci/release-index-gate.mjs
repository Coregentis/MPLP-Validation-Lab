#!/usr/bin/env node
/**
 * G-REL-01 — Release Index Integrity Gate
 * 
 * Validates that all release seals are registered in release-index.yaml
 * and that active seals have required proof artifacts.
 * 
 * Rules:
 * 1. Any governance/releases/ directory except archive must be in release-index
 * 2. Active seals must have their seal_path file present
 * 3. Archived seals must have archive_path matching actual location
 * 
 * Usage: node scripts/ci/release-index-gate.mjs
 * 
 * Exit codes:
 * 0 = PASS
 * 1 = FAIL(release index issues found)
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

const ROOT = process.cwd();
const RELEASE_INDEX_PATH = path.join(ROOT, 'governance', 'releases', 'release-index.yaml');
const GOVERNANCE_RELEASES_DIR = path.join(ROOT, 'governance', 'releases');

function loadReleaseIndex() {
    if (!fs.existsSync(RELEASE_INDEX_PATH)) {
        console.error('❌ release-index.yaml not found at governance/releases/');
        process.exit(1);
    }
    return yaml.parse(fs.readFileSync(RELEASE_INDEX_PATH, 'utf-8'));
}

function main() {
    console.log('📋 G-REL-01 — Release Index Integrity Gate\n');

    const index = loadReleaseIndex();
    let failures = [];
    let passes = [];

    // 1. Check active seals have seal_path present
    console.log('1. Checking active seal artifacts...');
    if (index.active) {
        for (const seal of index.active) {
            if (seal.seal_path) {
                const sealFile = path.join(ROOT, seal.seal_path);
                if (fs.existsSync(sealFile)) {
                    passes.push(`Active seal ${seal.id}: seal_path exists`);
                } else {
                    failures.push({
                        check: `active seal ${seal.id}`,
                        reason: `seal_path not found: ${seal.seal_path}`
                    });
                }
            }
        }
    }

    // 2. Check archived seals have valid archive_path
    console.log('2. Checking archived seal paths...');
    if (index.archived) {
        for (const seal of index.archived) {
            if (seal.archive_path) {
                const archiveDir = path.join(ROOT, seal.archive_path);
                if (fs.existsSync(archiveDir)) {
                    passes.push(`Archived seal ${seal.id}: archive_path exists`);
                } else {
                    failures.push({
                        check: `archived seal ${seal.id}`,
                        reason: `archive_path not found: ${seal.archive_path}`
                    });
                }
            }
        }
    }

    // 3. Check governance/releases/ directories are registered
    console.log('3. Checking unregistered seal directories...');
    const releaseIndexIds = [
        ...(index.active || []).map(s => s.id),
        ...(index.archived || []).map(s => s.id),
    ];

    // Scan governance/releases/ for REL-* directories
    if (fs.existsSync(GOVERNANCE_RELEASES_DIR)) {
        const entries = fs.readdirSync(GOVERNANCE_RELEASES_DIR);
        for (const entry of entries) {
            const fullPath = path.join(GOVERNANCE_RELEASES_DIR, entry);
            if (fs.statSync(fullPath).isDirectory() && entry.startsWith('REL-')) {
                // Extract id from directory name (REL-LAB-0.5-* -> rel-lab-0.5)
                const match = entry.match(/^REL-LAB-(\d+\.\d+)/i);
                if (match) {
                    const expectedId = `rel-lab-${match[1]}`;
                    if (!releaseIndexIds.includes(expectedId)) {
                        failures.push({
                            check: `unregistered seal`,
                            reason: `Directory ${entry} not registered in release-index.yaml`
                        });
                    }
                }
            }
        }
    }

    // Report
    console.log('\n---');
    console.log(`✅ PASS: ${passes.length}`);
    passes.forEach(p => console.log(`   ${p}`));

    if (failures.length > 0) {
        console.log(`\n❌ FAIL: ${failures.length}`);
        failures.forEach(f => console.log(`   [${f.check}] ${f.reason}`));
        console.log(`\n❌ Gate FAILED: Release index integrity issues`);
        process.exit(1);
    }

    console.log(`\n✅ Gate PASSED: Release index integrity verified`);
    process.exit(0);
}

main();
