/**
 * Evidence Pack Ingestion
 * 
 * Handles loading evidence packs from directory or zip.
 * IMPORTANT: No execution capability - only file reading.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { PackHandle, PackManifest, IngestOptions, EPC_CONSTANTS } from './types';

/**
 * Ingest an evidence pack from directory or zip file.
 * 
 * @param packPath Path to pack directory or zip file
 * @param options Ingestion options
 * @returns PackHandle ready for verification
 */
export async function ingest(
    packPath: string,
    options: IngestOptions = {}
): Promise<PackHandle> {
    const absolutePath = path.resolve(packPath);

    // Check if path exists
    if (!fs.existsSync(absolutePath)) {
        throw new Error(`Pack path does not exist: ${absolutePath}`);
    }

    const stats = fs.statSync(absolutePath);

    // Handle zip files
    if (stats.isFile() && absolutePath.endsWith('.zip')) {
        if (options.allow_zip === false) {
            throw new Error('Zip extraction disabled');
        }
        // TODO: Extract zip to temp directory
        throw new Error('Zip extraction not yet implemented');
    }

    // Must be a directory
    if (!stats.isDirectory()) {
        throw new Error(`Pack path must be a directory or zip file: ${absolutePath}`);
    }

    // Build file inventory
    const fileInventory = options.skip_inventory
        ? []
        : buildFileInventory(absolutePath);

    // Calculate total size
    const totalSize = calculateTotalSize(absolutePath, fileInventory);

    // Load manifest if exists
    const manifestPath = path.join(absolutePath, 'manifest.json');
    let manifestRaw: PackManifest | undefined;

    if (fs.existsSync(manifestPath)) {
        try {
            const content = fs.readFileSync(manifestPath, 'utf-8');
            manifestRaw = JSON.parse(content) as PackManifest;
        } catch (e) {
            // Manifest parse error will be caught by verify.ts
        }
    }

    // Detect layout version
    const layoutVersion = detectLayoutVersion(absolutePath, fileInventory);

    return {
        root_path: absolutePath,
        file_inventory: fileInventory,
        total_size_bytes: totalSize,
        layout_version: layoutVersion,
        manifest_raw: manifestRaw,
        from_zip: false,
    };
}

/**
 * Build file inventory (relative paths) for a pack directory.
 */
function buildFileInventory(rootPath: string, relativePath: string = ''): string[] {
    const files: string[] = [];
    const currentPath = path.join(rootPath, relativePath);

    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        const entryRelativePath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
            // Recurse into subdirectory
            files.push(...buildFileInventory(rootPath, entryRelativePath));
        } else if (entry.isFile()) {
            files.push(entryRelativePath);
        }
        // Skip symlinks and other special files (security)
    }

    return files;
}

/**
 * Calculate total size of all files in pack.
 */
function calculateTotalSize(rootPath: string, fileInventory: string[]): number {
    let total = 0;

    for (const file of fileInventory) {
        const filePath = path.join(rootPath, file);
        try {
            const stats = fs.statSync(filePath);
            total += stats.size;
        } catch {
            // Skip files that can't be read
        }
    }

    return total;
}

/**
 * Detect EPC layout version based on pack structure.
 */
function detectLayoutVersion(rootPath: string, fileInventory: string[]): string {
    // Check for EPC v1.0 required files/dirs
    const hasManifest = fileInventory.includes('manifest.json');
    const hasIntegrity = fileInventory.some(f => f.startsWith('integrity/'));
    const hasArtifacts = fileInventory.some(f => f.startsWith('artifacts/'));
    const hasTimeline = fileInventory.some(f => f.startsWith('timeline/'));

    if (hasManifest && hasIntegrity && hasArtifacts && hasTimeline) {
        return '1.0';
    }

    return 'unknown';
}

/**
 * Compute SHA-256 hash of a file.
 */
export function hashFile(filePath: string): string {
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute SHA-256 hash of string content.
 */
export function hashString(content: string): string {
    return crypto.createHash('sha256').update(content, 'utf-8').digest('hex');
}
