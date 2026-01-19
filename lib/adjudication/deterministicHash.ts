/**
 * Deterministic Hash Utilities
 * 
 * Provides functions for computing deterministic hashes
 * that exclude non-deterministic fields like timestamps.
 */

import * as crypto from 'crypto';

/**
 * Fields to exclude from verdict hash computation.
 * These fields may vary between runs but don't affect semantic content.
 * verdict_hash itself must be excluded since it's set after hash computation.
 */
const NON_DETERMINISTIC_FIELDS = [
    'adjudicated_at',
    '_meta',
    'generated_at',
    'computed_at',
    'verdict_hash', // Self-referential: must be excluded
];

/**
 * Canonical JSON stringifier that:
 * 1. Sorts object keys alphabetically
 * 2. Excludes non-deterministic fields
 */
function canonicalReplacer(key: string, value: unknown): unknown {
    // Exclude non-deterministic fields
    if (NON_DETERMINISTIC_FIELDS.includes(key)) {
        return undefined;
    }

    // Sort object keys
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        const sorted: Record<string, unknown> = {};
        const keys = Object.keys(value as object).sort();
        for (const k of keys) {
            if (!NON_DETERMINISTIC_FIELDS.includes(k)) {
                sorted[k] = (value as Record<string, unknown>)[k];
            }
        }
        return sorted;
    }

    return value;
}

/**
 * Compute a deterministic hash of an object.
 * Excludes non-deterministic fields and uses canonical JSON.
 */
export function computeDeterministicHash(data: unknown): string {
    const canonical = JSON.stringify(data, canonicalReplacer);
    return crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex');
}

/**
 * Compute SHA256 hash of a string.
 */
export function hashString(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}

/**
 * Compute SHA256 hash of a file's contents.
 */
export function hashFile(filePath: string): string {
    const fs = require('fs');
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}
