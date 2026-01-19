/**
 * Ed25519 Signing and Verification
 * 
 * v0.5 Signed Proof Infrastructure
 * 
 * Uses Node.js crypto module for Ed25519 signing/verification.
 * This enables third-party verification without trusting the server.
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Types
// =============================================================================

export interface KeyPair {
    publicKey: string;  // Base64 encoded
    privateKey: string; // Base64 encoded (kept secret)
}

export interface Signature {
    algorithm: 'Ed25519';
    signature: string;  // Base64 encoded
    key_id: string;     // Reference to public key
    signed_at: string;  // ISO timestamp
}

export interface VerifierIdentity {
    verifier_name: string;
    public_key_ed25519: string;  // Base64 encoded
    key_id: string;
    valid_from: string;
    valid_until?: string;
    rotation_policy: string;
}

// =============================================================================
// Key Generation (for initial setup only)
// =============================================================================

/**
 * Generate a new Ed25519 key pair.
 * 
 * WARNING: Only use this for initial key generation.
 * Private key must be securely stored and NEVER committed to repo.
 */
export function generateKeyPair(): KeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    // Convert PEM to raw base64 for portability
    const pubKeyRaw = extractKeyFromPem(publicKey, 'PUBLIC');
    const privKeyRaw = extractKeyFromPem(privateKey, 'PRIVATE');

    return {
        publicKey: pubKeyRaw,
        privateKey: privKeyRaw,
    };
}

/**
 * Extract raw key bytes from PEM format.
 */
function extractKeyFromPem(pem: string, type: 'PUBLIC' | 'PRIVATE'): string {
    const lines = pem.split('\n');
    const keyLines = lines.filter(line =>
        !line.startsWith('-----') && line.trim().length > 0
    );
    return keyLines.join('');
}

// =============================================================================
// Signing
// =============================================================================

/**
 * Sign a message with Ed25519 private key.
 * 
 * @param message - The message to sign (will be UTF-8 encoded)
 * @param privateKeyBase64 - Base64 encoded private key
 * @param keyId - Identifier for the signing key
 */
export function signMessage(
    message: string,
    privateKeyBase64: string,
    keyId: string
): Signature {
    // Reconstruct PEM format
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`;

    const privateKeyObject = crypto.createPrivateKey(privateKeyPem);

    const signature = crypto.sign(null, Buffer.from(message, 'utf-8'), privateKeyObject);

    return {
        algorithm: 'Ed25519',
        signature: signature.toString('base64'),
        key_id: keyId,
        signed_at: new Date().toISOString(),
    };
}

/**
 * Sign a JSON payload with Ed25519.
 * The payload is first canonicalized (JSON.stringify with sorted keys).
 */
export function signPayload(
    payload: unknown,
    privateKeyBase64: string,
    keyId: string
): Signature {
    const canonicalJson = canonicalizePayload(payload);
    return signMessage(canonicalJson, privateKeyBase64, keyId);
}

// =============================================================================
// Verification
// =============================================================================

/**
 * Verify an Ed25519 signature.
 * 
 * @param message - The original message
 * @param signatureBase64 - Base64 encoded signature
 * @param publicKeyBase64 - Base64 encoded public key
 */
export function verifySignature(
    message: string,
    signatureBase64: string,
    publicKeyBase64: string
): boolean {
    try {
        // Reconstruct PEM format
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`;

        const publicKeyObject = crypto.createPublicKey(publicKeyPem);
        const signatureBuffer = Buffer.from(signatureBase64, 'base64');

        return crypto.verify(
            null,
            Buffer.from(message, 'utf-8'),
            publicKeyObject,
            signatureBuffer
        );
    } catch {
        return false;
    }
}

/**
 * Verify a signed payload.
 */
export function verifyPayload(
    payload: unknown,
    signature: Signature,
    publicKeyBase64: string
): boolean {
    const canonicalJson = canonicalizePayload(payload);
    return verifySignature(canonicalJson, signature.signature, publicKeyBase64);
}

// =============================================================================
// Canonicalization
// =============================================================================

/**
 * Canonicalize a payload for signing.
 * Uses deterministic JSON serialization with sorted keys.
 */
export function canonicalizePayload(payload: unknown): string {
    return JSON.stringify(payload, sortKeysReplacer);
}

/**
 * JSON replacer that sorts object keys for deterministic output.
 */
function sortKeysReplacer(key: string, value: unknown): unknown {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sorted: Record<string, unknown> = {};
        for (const k of Object.keys(value as object).sort()) {
            sorted[k] = (value as Record<string, unknown>)[k];
        }
        return sorted;
    }
    return value;
}

// =============================================================================
// Verifier Identity Management
// =============================================================================

const VERIFIER_IDENTITY_PATH = 'verifier/VERIFIER_IDENTITY.json';

/**
 * Load the verifier identity from repo.
 */
export function loadVerifierIdentity(projectRoot: string): VerifierIdentity | null {
    const identityPath = path.join(projectRoot, VERIFIER_IDENTITY_PATH);
    if (!fs.existsSync(identityPath)) {
        return null;
    }
    const content = fs.readFileSync(identityPath, 'utf-8');
    const rawIdentity = JSON.parse(content);

    // Handle new signing_keys structure (v1.1+)
    if (rawIdentity.signing_keys && rawIdentity.active_signing_key) {
        const activeKeyId = rawIdentity.active_signing_key;
        const activeKey = Object.values(rawIdentity.signing_keys).find(
            (k: any) => k.key_id === activeKeyId
        ) as any;

        // SECURITY: Check if active key is revoked (should never happen, but defense in depth)
        if (activeKey && activeKey.status === 'revoked') {
            console.error(`❌ SECURITY: Active key ${activeKeyId} is marked as revoked!`);
            return null;
        }

        if (activeKey) {
            return {
                verifier_name: rawIdentity.description || 'MPLP Validation Lab',
                public_key_ed25519: activeKey.public_key_ed25519,
                key_id: activeKey.key_id,
                valid_from: activeKey.not_before || activeKey.valid_from,
                valid_until: activeKey.not_after || activeKey.valid_until,
                rotation_policy: activeKey.note || 'See governance docs',
            };
        }
    }

    // Fallback to direct fields (legacy)
    return rawIdentity as VerifierIdentity;
}

/**
 * Check if a key_id is in the revocations list.
 */
export function isKeyRevoked(keyId: string, projectRoot: string): boolean {
    const identityPath = path.join(projectRoot, VERIFIER_IDENTITY_PATH);
    if (!fs.existsSync(identityPath)) {
        return false;
    }

    const content = fs.readFileSync(identityPath, 'utf-8');
    const rawIdentity = JSON.parse(content);

    // Check revocations array
    const revocations = rawIdentity.revocations || [];
    return revocations.some((r: any) => r.key_id === keyId);
}

/**
 * Get public key for a specific key_id, rejecting revoked keys.
 */
export function getPublicKeyForKeyId(keyId: string, projectRoot: string): string | null {
    const identityPath = path.join(projectRoot, VERIFIER_IDENTITY_PATH);
    if (!fs.existsSync(identityPath)) {
        return null;
    }

    const content = fs.readFileSync(identityPath, 'utf-8');
    const rawIdentity = JSON.parse(content);

    // Check if key is revoked
    if (isKeyRevoked(keyId, projectRoot)) {
        console.error(`❌ SECURITY: Key ${keyId} is REVOKED - verification rejected`);
        return null;
    }

    // Find key in signing_keys
    const key = rawIdentity.signing_keys?.[keyId] ||
        Object.values(rawIdentity.signing_keys || {}).find((k: any) => k.key_id === keyId);

    if (key && (key as any).public_key_ed25519) {
        // Check status
        const status = (key as any).status;
        const acceptedStatuses = rawIdentity.key_policy?.accepted_statuses || ['active'];

        if (!acceptedStatuses.includes(status)) {
            console.error(`❌ SECURITY: Key ${keyId} has status "${status}" which is not accepted`);
            return null;
        }

        return (key as any).public_key_ed25519;
    }

    return null;
}

/**
 * Check if a key_id matches the current verifier identity.
 */
export function isValidKeyId(keyId: string, identity: VerifierIdentity): boolean {
    return identity.key_id === keyId;
}

/**
 * Check if the verifier identity is currently valid.
 */
export function isIdentityValid(identity: VerifierIdentity): boolean {
    const now = new Date();
    const validFrom = new Date(identity.valid_from);

    if (now < validFrom) {
        return false;
    }

    if (identity.valid_until) {
        const validUntil = new Date(identity.valid_until);
        if (now > validUntil) {
            return false;
        }
    }

    return true;
}
