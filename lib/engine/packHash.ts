/**
 * Pack Hash SSOT (Single Source of Truth)
 * 
 * This module is the ONLY authoritative implementation for:
 * - Evidence pack file enumeration
 * - SHA256 sum computation and formatting
 * - Pack root hash computation
 * 
 * GOVERNANCE: All pack hash computation in the codebase MUST import from this module.
 * Do NOT implement hash logic elsewhere.
 * 
 * CONTRACT FROZEN (PR-11.3):
 * - Exclusion rules: EXCLUDED_DIRS, EXCLUDED_FILES
 * - Sort order: lexicographic (localeCompare)
 * - Format: "<64-char-hash>  <path>\n" (two spaces between hash and path)
 * - pack_root_hash: SHA256 of normalized sha256sums (no trailing newline)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// =============================================================================
// FROZEN EXCLUSION RULES (PR-11.3 Contract)
// =============================================================================

/**
 * Directories excluded from pack file enumeration.
 * - integrity/: Contains derived files (sha256sums.txt, pack.sha256)
 */
export const EXCLUDED_DIRS: readonly string[] = ['integrity'];

/**
 * Files excluded from pack file enumeration.
 * - .DS_Store: macOS metadata (cross-OS stability)
 * - Thumbs.db: Windows metadata
 * - .gitkeep: Git placeholder files
 */
export const EXCLUDED_FILES: readonly string[] = ['.DS_Store', 'Thumbs.db', '.gitkeep'];

// =============================================================================
// Core Hash Functions
// =============================================================================

/**
 * Compute SHA256 hash of a buffer or string.
 */
export function computeSha256(content: Buffer | string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA256 hash of a file.
 */
export function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return computeSha256(content);
}

// =============================================================================
// Pack File Enumeration
// =============================================================================

/**
 * List all files in a pack directory, applying frozen exclusion rules.
 * 
 * @param packDir Absolute path to pack root
 * @returns Sorted list of relative paths (lexicographic order)
 */
export function listPackFiles(packDir: string): string[] {
    const files: string[] = [];

    function walkDir(dir: string): void {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(packDir, fullPath);

            if (entry.isDirectory()) {
                // Check excluded directories
                if (!EXCLUDED_DIRS.includes(entry.name)) {
                    walkDir(fullPath);
                }
            } else {
                // Check excluded files
                if (!EXCLUDED_FILES.includes(entry.name)) {
                    files.push(relPath);
                }
            }
        }
    }

    walkDir(packDir);

    // FROZEN: lexicographic sort
    return files.sort((a, b) => a.localeCompare(b));
}

// =============================================================================
// SHA256 Sums Computation
// =============================================================================

export interface Sha256Entry {
    path: string;
    hash: string;
}

/**
 * Compute SHA256 hashes for all pack files.
 * 
 * @param packDir Absolute path to pack root
 * @param files Optional pre-computed file list (uses listPackFiles if not provided)
 * @returns Array of {path, hash} entries, sorted by path
 */
export function computeSha256Sums(packDir: string, files?: string[]): Sha256Entry[] {
    const fileList = files ?? listPackFiles(packDir);

    const entries: Sha256Entry[] = [];
    for (const relPath of fileList) {
        const fullPath = path.join(packDir, relPath);
        const hash = hashFile(fullPath);
        entries.push({ path: relPath, hash });
    }

    // Already sorted from listPackFiles, but ensure
    return entries.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Render SHA256 entries to sha256sums.txt format.
 * 
 * FORMAT (FROZEN):
 * - "<64-char-hash>  <path>\n" (two spaces between hash and path)
 * - LF line endings
 * - WITH trailing newline (for file write)
 */
export function renderSha256Sums(entries: Sha256Entry[]): string {
    return entries.map(e => `${e.hash}  ${e.path}`).join('\n') + '\n';
}

// =============================================================================
// Pack Root Hash Computation
// =============================================================================

/**
 * Compute pack_root_hash from SHA256 entries.
 * 
 * ALGORITHM (FROZEN per EPC v1.0 L185-194):
 * 1. Sort entries by path (lexicographic)
 * 2. Format: "<hash>  <path>" (two spaces)
 * 3. Join with LF
 * 4. NO trailing newline in hash input
 * 5. SHA256 of the result
 */
export function computePackRootHash(entries: Sha256Entry[]): string {
    // Sort by path (entries should already be sorted, but ensure)
    const sorted = [...entries].sort((a, b) => a.path.localeCompare(b.path));

    // FROZEN: no trailing newline for hash computation
    const normalized = sorted.map(e => `${e.hash}  ${e.path}`).join('\n');

    return computeSha256(normalized);
}

/**
 * Compute pack_root_hash directly from a pack directory.
 * Convenience wrapper that combines listPackFiles + computeSha256Sums + computePackRootHash.
 */
export function computePackRootHashFromDir(packDir: string): {
    entries: Sha256Entry[];
    packRootHash: string;
    sha256sumsText: string;
} {
    const entries = computeSha256Sums(packDir);
    const packRootHash = computePackRootHash(entries);
    const sha256sumsText = renderSha256Sums(entries);

    return { entries, packRootHash, sha256sumsText };
}

// =============================================================================
// Integrity File I/O
// =============================================================================

/**
 * Write integrity files to a pack directory.
 * 
 * Creates/updates:
 * - integrity/sha256sums.txt
 * - integrity/pack.sha256
 * 
 * FORMAT for pack.sha256 (FROZEN):
 * "<64-char-hash>  pack\n"
 */
export function writeIntegrityFiles(
    packDir: string,
    entries: Sha256Entry[],
    packRootHash: string
): void {
    const integrityDir = path.join(packDir, 'integrity');

    // Ensure integrity directory exists
    if (!fs.existsSync(integrityDir)) {
        fs.mkdirSync(integrityDir, { recursive: true });
    }

    // Write sha256sums.txt
    const sha256sumsPath = path.join(integrityDir, 'sha256sums.txt');
    const sha256sumsText = renderSha256Sums(entries);
    fs.writeFileSync(sha256sumsPath, sha256sumsText);

    // Write pack.sha256 (format expected by verify.ts)
    const packHashPath = path.join(integrityDir, 'pack.sha256');
    fs.writeFileSync(packHashPath, `${packRootHash}  pack\n`);
}

/**
 * Read and parse sha256sums.txt from a pack directory.
 * Returns null if file doesn't exist.
 */
export function readSha256Sums(packDir: string): Sha256Entry[] | null {
    const sha256sumsPath = path.join(packDir, 'integrity/sha256sums.txt');

    if (!fs.existsSync(sha256sumsPath)) {
        return null;
    }

    const content = fs.readFileSync(sha256sumsPath, 'utf-8');
    const lines = content.trim().split('\n');

    const entries: Sha256Entry[] = [];
    for (const line of lines) {
        const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
        if (match) {
            entries.push({ hash: match[1], path: match[2] });
        }
    }

    return entries.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Read pack.sha256 from a pack directory.
 * Returns null if file doesn't exist.
 */
export function readPackRootHash(packDir: string): string | null {
    const packHashPath = path.join(packDir, 'integrity/pack.sha256');

    if (!fs.existsSync(packHashPath)) {
        return null;
    }

    const content = fs.readFileSync(packHashPath, 'utf-8');
    const match = content.match(/^([a-f0-9]{64})/);

    return match ? match[1] : null;
}
