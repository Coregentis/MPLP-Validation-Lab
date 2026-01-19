#!/usr/bin/env node
/**
 * Key Policy Gate - v0.6
 * 
 * Verifies that VERIFIER_IDENTITY.json has a valid key policy:
 * 1. All required fields present
 * 2. Active key exists and is valid
 * 3. Key statuses are in allowed set
 * 4. No expired active keys
 * 5. Revocations properly formatted
 * 
 * Usage: npm run gate:key-policy
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');

const REQUIRED_KEY_FIELDS = ['algorithm', 'key_id', 'public_key_ed25519', 'not_before', 'not_after', 'status'];
const VALID_STATUSES = ['active', 'grace', 'retired', 'revoked', 'pending'];
const VALID_TIERS = ['root', 'online'];

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  v0.6 Key Policy Gate');
    console.log('═══════════════════════════════════════════════════════════\n');

    const startTime = Date.now();
    const results = {
        gate_id: 'GATE-KEY-POLICY',
        executed_at: new Date().toISOString(),
        status: 'PASS',
        checks: {
            identity_exists: false,
            schema_version: null,
            key_policy_exists: false,
            active_key_valid: false,
            all_keys_valid: false,
            no_expired_active: false,
            revocations_valid: false,
        },
        issues: [],
        keys_summary: [],
    };

    try {
        // Load identity
        const identityPath = path.join(PROJECT_ROOT, 'verifier/VERIFIER_IDENTITY.json');
        if (!fs.existsSync(identityPath)) {
            throw new Error('VERIFIER_IDENTITY.json not found');
        }
        results.checks.identity_exists = true;

        const identity = JSON.parse(fs.readFileSync(identityPath, 'utf-8'));
        results.checks.schema_version = identity.schema_version;

        console.log(`📋 Identity: ${identity.verifier_id}`);
        console.log(`📋 Schema: v${identity.schema_version}\n`);

        // Check key_policy exists
        if (!identity.key_policy) {
            results.issues.push('Missing key_policy section');
        } else {
            results.checks.key_policy_exists = true;
            console.log(`✅ key_policy.version: ${identity.key_policy.version}`);
            console.log(`   accepted_statuses: ${identity.key_policy.accepted_statuses?.join(', ')}`);
            console.log(`   grace_period_days: ${identity.key_policy.grace_period_days}`);
            console.log(`   rotation_policy: ${identity.key_policy.rotation_policy}\n`);
        }

        // Check signing_keys
        const keys = identity.signing_keys || {};
        const keyIds = Object.keys(keys);
        console.log(`📋 Signing Keys: ${keyIds.length}\n`);

        let allKeysValid = true;
        const now = new Date();

        for (const keyId of keyIds) {
            const key = keys[keyId];
            const keyIssues = [];

            // Check required fields
            for (const field of REQUIRED_KEY_FIELDS) {
                if (!key[field]) {
                    keyIssues.push(`missing ${field}`);
                }
            }

            // Check status
            if (key.status && !VALID_STATUSES.includes(key.status)) {
                keyIssues.push(`invalid status: ${key.status}`);
            }

            // Check dates
            const notBefore = key.not_before ? new Date(key.not_before) : null;
            const notAfter = key.not_after ? new Date(key.not_after) : null;

            const isActive = key.status === 'active';
            const isExpired = notAfter && now > notAfter;
            const isNotYetValid = notBefore && now < notBefore;

            if (isActive && isExpired) {
                keyIssues.push('active key has expired');
            }
            if (isActive && isNotYetValid) {
                keyIssues.push('active key not yet valid');
            }

            // Summary
            const statusEmoji = keyIssues.length === 0 ? '✅' : '❌';
            const tierStr = key.tier ? ` [${key.tier}]` : '';
            console.log(`  ${statusEmoji} ${keyId}${tierStr}`);
            console.log(`     status: ${key.status}, purpose: ${key.purpose || 'unspecified'}`);
            console.log(`     valid: ${key.not_before?.slice(0, 10)} → ${key.not_after?.slice(0, 10)}`);

            if (keyIssues.length > 0) {
                console.log(`     issues: ${keyIssues.join(', ')}`);
                results.issues.push(`${keyId}: ${keyIssues.join(', ')}`);
                allKeysValid = false;
            }

            results.keys_summary.push({
                key_id: keyId,
                status: key.status,
                tier: key.tier,
                purpose: key.purpose,
                not_before: key.not_before,
                not_after: key.not_after,
                issues: keyIssues,
            });
        }

        results.checks.all_keys_valid = allKeysValid;

        // Check active_signing_key
        const activeKeyId = identity.active_signing_key;
        if (!activeKeyId) {
            results.issues.push('No active_signing_key specified');
        } else if (!keys[activeKeyId]) {
            results.issues.push(`active_signing_key "${activeKeyId}" not found in signing_keys`);
        } else {
            const activeKey = keys[activeKeyId];
            if (activeKey.status !== 'active') {
                results.issues.push(`active_signing_key "${activeKeyId}" has status "${activeKey.status}" (expected "active")`);
            } else {
                results.checks.active_key_valid = true;
                console.log(`\n✅ Active key: ${activeKeyId}`);
            }
        }

        // Check revocations
        const revocations = identity.revocations || [];
        results.checks.revocations_valid = Array.isArray(revocations);
        if (revocations.length > 0) {
            console.log(`\n📋 Revocations: ${revocations.length}`);
            for (const rev of revocations) {
                console.log(`   - ${rev.key_id}: ${rev.reason} (${rev.revoked_at})`);
            }
        }

        // Check no expired active keys
        const expiredActive = results.keys_summary.filter(
            k => k.status === 'active' && k.issues.some(i => i.includes('expired'))
        );
        results.checks.no_expired_active = expiredActive.length === 0;

    } catch (e) {
        results.status = 'ERROR';
        results.error = e.message;
        console.error('\n❌ Gate execution error:', e.message);
    }

    // Determine status
    if (results.issues.length > 0) {
        results.status = 'FAIL';
        results.failure_reason = `${results.issues.length} policy issue(s)`;
    }

    results.duration_ms = Date.now() - startTime;

    // Write report
    const artifactsDir = path.join(PROJECT_ROOT, 'artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }
    const reportPath = path.join(artifactsDir, 'key-policy.report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  Gate Status: ${results.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Checks:`);
    console.log(`    - Identity exists: ${results.checks.identity_exists ? '✓' : '✗'}`);
    console.log(`    - Key policy exists: ${results.checks.key_policy_exists ? '✓' : '✗'}`);
    console.log(`    - Active key valid: ${results.checks.active_key_valid ? '✓' : '✗'}`);
    console.log(`    - All keys valid: ${results.checks.all_keys_valid ? '✓' : '✗'}`);
    console.log(`    - No expired active: ${results.checks.no_expired_active ? '✓' : '✗'}`);
    console.log(`  Issues: ${results.issues.length}`);
    console.log(`  Duration: ${results.duration_ms}ms`);
    console.log(`  Report: ${reportPath}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(results.status === 'PASS' ? 0 : 1);
}

main().catch(e => {
    console.error('Fatal error:', e);
    process.exit(1);
});
