/**
 * Security Allowlist for Run Artifact Downloads
 * 
 * Defines which files can be downloaded from run directories.
 * Implements path safety checks to prevent directory traversal.
 * 
 * SECURITY: All download requests must pass through these checks.
 */

import * as path from 'path';
import * as fs from 'fs';

/** Files allowed for download from run directories */
export const ALLOWED_FILES = [
    'verify.report.json',
    'evaluation.report.json',
    'manifest.yaml',
    'manifest.json',
    'sha256sums.txt',
] as const;

/** Max file size for download (5MB) */
export const MAX_DOWNLOAD_SIZE = 5 * 1024 * 1024;

/** Max file size for preview (2MB) */
export const MAX_PREVIEW_SIZE = 2 * 1024 * 1024;

/** Allowed run_id pattern */
export const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;

/**
 * Check if a run_id is valid
 */
export function isValidRunId(runId: string): boolean {
    if (!runId || runId.length > 100) return false;
    return RUN_ID_PATTERN.test(runId);
}

/**
 * Check if a filename is in the allowlist
 */
export function isAllowedFile(filename: string): boolean {
    return ALLOWED_FILES.includes(filename as typeof ALLOWED_FILES[number]);
}

/**
 * Safely join paths and verify containment within root
 * Returns null if path escapes root or is invalid
 */
export function safeJoinPath(root: string, ...segments: string[]): string | null {
    // Reject segments with suspicious patterns
    for (const seg of segments) {
        if (!seg) return null;
        if (seg.includes('..')) return null;
        if (seg.startsWith('/')) return null;
        if (seg.includes('\\')) return null;
        // Block URL-encoded path traversal attempts
        if (seg.includes('%')) return null;
    }

    const resolved = path.resolve(root, ...segments);
    const normalizedRoot = path.resolve(root);

    // Ensure resolved path is within root
    if (!resolved.startsWith(normalizedRoot + path.sep) && resolved !== normalizedRoot) {
        return null;
    }

    return resolved;
}

/**
 * Get file stats safely, returns null if file doesn't exist or is not a file
 */
export function safeGetFileStats(filePath: string): fs.Stats | null {
    try {
        const stats = fs.statSync(filePath);
        if (!stats.isFile()) return null;
        return stats;
    } catch {
        return null;
    }
}

/**
 * Read file content with size limit
 */
export function readFileWithLimit(filePath: string, maxSize: number): Buffer | null {
    const stats = safeGetFileStats(filePath);
    if (!stats) return null;
    if (stats.size > maxSize) return null;

    try {
        return fs.readFileSync(filePath);
    } catch {
        return null;
    }
}

/**
 * Get Content-Type for file based on extension
 */
export function getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.json':
            return 'application/json';
        case '.yaml':
        case '.yml':
            return 'text/yaml';
        case '.txt':
            return 'text/plain';
        case '.ndjson':
            return 'application/x-ndjson';
        default:
            return 'application/octet-stream';
    }
}
