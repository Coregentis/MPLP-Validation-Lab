#!/usr/bin/env node
/**
 * Generate Ed25519 Keypair for v0.5 Signing
 * 
 * Generates a test keypair for gate verification.
 * PUBLIC KEY: Can be committed to repo (goes in VERIFIER_IDENTITY.json)
 * PRIVATE KEY: Should be stored as env var or CI secret
 * 
 * Usage: node tools/gen-ed25519.mjs
 */

import { generateKeyPairSync } from 'crypto';

const { publicKey, privateKey } = generateKeyPairSync('ed25519');

// Export in DER format (more portable) as base64
const pubDer = publicKey.export({ format: 'der', type: 'spki' });
const privDer = privateKey.export({ format: 'der', type: 'pkcs8' });

const pubBase64 = pubDer.toString('base64');
const privBase64 = privDer.toString('base64');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Ed25519 Keypair Generated');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('PUBLIC KEY (for VERIFIER_IDENTITY.json):');
console.log(`"public_key_ed25519": "${pubBase64}"\n`);

console.log('PRIVATE KEY (for CI secret / env var):');
console.log(`VLAB_SIGNING_PRIVATE_KEY="${privBase64}"\n`);

console.log('───────────────────────────────────────────────────────────');
console.log('IMPORTANT: This is a TEST keypair for development/CI.');
console.log('Production keys require a formal Key Ceremony.');
console.log('───────────────────────────────────────────────────────────\n');

// Output as JSON for easy copy
console.log('JSON format:');
console.log(JSON.stringify({
    public_key_ed25519: pubBase64,
    private_key_ed25519: privBase64,
    purpose: 'test',
    generated_at: new Date().toISOString(),
    note: 'NOT FOR PRODUCTION - Test keypair for v0.5 development',
}, null, 2));
