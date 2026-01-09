/**
 * Phase D: Evidence Pointer Utilities
 * 
 * Implements EvidencePointer construction and normalization
 * per Pointer Contract v1.0.
 * 
 * Locator specifications:
 * - file:<relpath>
 * - json:<relpath>#<json-pointer>
 * - ndjson:<relpath>#<lineIndex0>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { EvidencePointer } from './types';

// =============================================================================
// Pointer Factory Functions
// =============================================================================

/**
 * Create a file-level pointer.
 * Use when the entire file is evidence (e.g., context.json exists).
 */
export function makeFilePointer(
    artifactPath: string,
    requirementId: string,
    note?: string
): EvidencePointer {
    return normalizePointer({
        artifact_path: artifactPath,
        content_hash: '', // To be computed if needed
        locator: `file:${artifactPath}`,
        requirement_id: requirementId,
        note,
    });
}

/**
 * Create a JSON pointer (RFC 6901).
 * Use for specific fields within JSON artifacts.
 */
export function makeJsonPointer(
    artifactPath: string,
    jsonPointer: string,
    requirementId: string,
    note?: string
): EvidencePointer {
    // Ensure JSON pointer starts with /
    const normalizedPointer = jsonPointer.startsWith('/')
        ? jsonPointer
        : `/${jsonPointer}`;

    return normalizePointer({
        artifact_path: artifactPath,
        content_hash: '',
        locator: `json:${artifactPath}#${normalizedPointer}`,
        requirement_id: requirementId,
        note,
    });
}

/**
 * Create an NDJSON line pointer.
 * Use for specific events in timeline/events.ndjson.
 * 
 * @param lineIndex0 Zero-based line index
 */
export function makeNdjsonLinePointer(
    artifactPath: string,
    lineIndex0: number,
    requirementId: string,
    note?: string
): EvidencePointer {
    return normalizePointer({
        artifact_path: artifactPath,
        content_hash: '',
        locator: `ndjson:${artifactPath}#${lineIndex0}`,
        requirement_id: requirementId,
        note,
    });
}

/**
 * Create a pointer for missing evidence (per User HARD-05).
 * Used when required evidence file does not exist.
 */
export function makeMissingEvidencePointer(
    expectedPath: string,
    requirementId: string,
    note?: string
): EvidencePointer {
    return normalizePointer({
        artifact_path: expectedPath,
        content_hash: '', // Empty = evidence missing
        locator: `file:${expectedPath}`,
        requirement_id: requirementId,
        note: note || 'Evidence file not found',
    });
}

// =============================================================================
// Pointer Normalization
// =============================================================================

/**
 * Normalize a pointer to consistent format.
 * - Ensures artifact_path uses forward slashes
 * - Trims whitespace
 * - Validates locator format
 */
export function normalizePointer(pointer: EvidencePointer): EvidencePointer {
    return {
        artifact_path: normalizeArtifactPath(pointer.artifact_path),
        content_hash: pointer.content_hash || '',
        locator: normalizeLocator(pointer.locator),
        requirement_id: pointer.requirement_id.trim(),
        note: pointer.note?.trim(),
    };
}

/**
 * Normalize artifact path to consistent format.
 */
function normalizeArtifactPath(artifactPath: string): string {
    // Use forward slashes, no leading slash
    return artifactPath
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .trim();
}

/**
 * Normalize locator to consistent format.
 */
function normalizeLocator(locator: string): string {
    const trimmed = locator.trim();

    // Validate locator prefix
    const validPrefixes = ['file:', 'json:', 'ndjson:'];
    const hasValidPrefix = validPrefixes.some(p => trimmed.startsWith(p));

    if (!hasValidPrefix) {
        // Default to file: prefix if none specified
        return `file:${trimmed}`;
    }

    return trimmed;
}

// =============================================================================
// Content Hash Computation (Optional)
// =============================================================================

/**
 * Compute content hash for a file pointer.
 * Returns empty string if file doesn't exist.
 */
export function computeFileContentHash(
    packRoot: string,
    artifactPath: string
): string {
    const fullPath = path.join(packRoot, artifactPath);

    if (!fs.existsSync(fullPath)) {
        return '';
    }

    const content = fs.readFileSync(fullPath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute content hash for a JSON pointer fragment.
 * Returns hash of the canonical JSON fragment.
 */
export function computeJsonPointerContentHash(
    packRoot: string,
    artifactPath: string,
    jsonPointer: string
): string {
    const fullPath = path.join(packRoot, artifactPath);

    if (!fs.existsSync(fullPath)) {
        return '';
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);
        const fragment = resolveJsonPointer(data, jsonPointer);

        if (fragment === undefined) {
            return '';
        }

        // Canonical JSON stringify (sorted keys)
        const canonical = JSON.stringify(fragment, fragment && typeof fragment === 'object' ? Object.keys(fragment as object).sort() : undefined);
        return crypto.createHash('sha256').update(canonical, 'utf-8').digest('hex');

    } catch {
        return '';
    }
}

/**
 * Compute content hash for an NDJSON line.
 */
export function computeNdjsonLineContentHash(
    packRoot: string,
    artifactPath: string,
    lineIndex0: number
): string {
    const fullPath = path.join(packRoot, artifactPath);

    if (!fs.existsSync(fullPath)) {
        return '';
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        if (lineIndex0 < 0 || lineIndex0 >= lines.length) {
            return '';
        }

        return crypto.createHash('sha256').update(lines[lineIndex0], 'utf-8').digest('hex');

    } catch {
        return '';
    }
}

// =============================================================================
// JSON Pointer Resolution (RFC 6901)
// =============================================================================

/**
 * Resolve a JSON pointer to get the referenced value.
 */
export function resolveJsonPointer(obj: unknown, pointer: string): unknown {
    if (!pointer || pointer === '/') {
        return obj;
    }

    // Remove leading slash and split
    const parts = pointer.replace(/^\//, '').split('/');

    let current: unknown = obj;

    for (const part of parts) {
        // Unescape JSON pointer tokens
        const key = part.replace(/~1/g, '/').replace(/~0/g, '~');

        if (current === null || current === undefined) {
            return undefined;
        }

        if (Array.isArray(current)) {
            const index = parseInt(key, 10);
            if (isNaN(index) || index < 0 || index >= current.length) {
                return undefined;
            }
            current = current[index];
        } else if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return current;
}

// =============================================================================
// Pointer Sorting (for Determinism - D4)
// =============================================================================

/**
 * Sort pointers for deterministic output.
 * Order: artifact_path → locator → requirement_id
 */
export function sortPointers(pointers: EvidencePointer[]): EvidencePointer[] {
    return [...pointers].sort((a, b) => {
        // Primary: artifact_path
        const pathCompare = a.artifact_path.localeCompare(b.artifact_path);
        if (pathCompare !== 0) return pathCompare;

        // Secondary: locator
        const locatorCompare = a.locator.localeCompare(b.locator);
        if (locatorCompare !== 0) return locatorCompare;

        // Tertiary: requirement_id
        return a.requirement_id.localeCompare(b.requirement_id);
    });
}
