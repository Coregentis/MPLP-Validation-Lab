/**
 * Public Surface Definitions
 * 
 * Defines which directories are considered "public surface" (visible to users/search engines)
 * versus "internal governance" (not externally visible, contains normative/policy language).
 * 
 * Gates that check for endorsement/certification language should ONLY scan public surface.
 * Internal governance docs are allowed to discuss these terms in negative/definitional context.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// Public Surface Directories (ALLOWLIST - strict)
// =============================================================================

/**
 * Directories that constitute the "public surface" - visible to external users.
 * Only these directories should be scanned for endorsement/certification language.
 */
export const PUBLIC_SURFACE_DIRS = [
    'app',           // Next.js pages and routes
    'components',    // UI components
    'public',        // Static assets and public files
] as const;

/**
 * Root-level files that are public surface.
 */
export const PUBLIC_SURFACE_FILES = [
    'README.md',     // Main readme (visible on GitHub/npm)
] as const;

// =============================================================================
// Internal Governance Directories (always excluded from public surface gates)
// =============================================================================

/**
 * Directories that are internal governance/policy.
 * These are EXCLUDED from public surface gates.
 * They are allowed to contain certification/endorsement terms in negative/definitional context.
 */
export const INTERNAL_GOVERNANCE_DIRS = [
    'governance',        // Governance documents, contracts, gates
    'adjudication',      // Adjudication model and scope definitions
    'inventory',         // Asset inventory and repo shape
    'reverification',    // Reverification bundles
    'releases',          // Immutable release snapshots
    'artifacts',         // Development artifacts, seals, logs
    'data',              // Rulesets, curated runs, policies
    'lib',               // Engine and gate code (self-reference is allowed)
    'scripts',           // Build and development scripts
    'docs',              // Internal documentation
    'fixtures',          // Test fixtures
    'packages',          // Internal packages
    'verifier',          // Verifier identity
    'node_modules',      // Dependencies
    '.next',             // Build output
    '.git',              // Git data
    'dist',              // Distribution output
    'coverage',          // Test coverage
] as const;

// =============================================================================
// Utility Functions
// =============================================================================

export interface ScanOptions {
    includeExtensions: string[];
    maxFileSizeBytes?: number;
}

/**
 * Lists all files in the public surface directories only.
 * This is the CORRECT scope for gates that check endorsement/certification language.
 */
export function listPublicSurfaceFiles(repoRoot: string, opts: ScanOptions): string[] {
    const maxSize = opts.maxFileSizeBytes ?? 2 * 1024 * 1024;
    const results: string[] = [];

    function walkDir(dir: string) {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const ent of entries) {
            const full = path.join(dir, ent.name);

            if (ent.isDirectory()) {
                // Skip node_modules inside public dirs
                if (ent.name === 'node_modules' || ent.name === '.next') continue;
                walkDir(full);
                continue;
            }

            if (!ent.isFile()) continue;

            const ext = path.extname(ent.name).toLowerCase();
            if (!opts.includeExtensions.includes(ext)) continue;

            try {
                const stat = fs.statSync(full);
                if (stat.size > maxSize) continue;
            } catch {
                continue;
            }

            results.push(full);
        }
    }

    // Walk each public surface directory
    for (const surfaceDir of PUBLIC_SURFACE_DIRS) {
        const fullPath = path.join(repoRoot, surfaceDir);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        }
    }

    // Include specific root-level files
    for (const surfaceFile of PUBLIC_SURFACE_FILES) {
        const fullPath = path.join(repoRoot, surfaceFile);
        if (fs.existsSync(fullPath)) {
            const ext = path.extname(surfaceFile).toLowerCase();
            if (opts.includeExtensions.includes(ext)) {
                results.push(fullPath);
            }
        }
    }

    return results;
}

/**
 * Checks if a path is within the public surface.
 */
export function isPublicSurface(repoRoot: string, filePath: string): boolean {
    const relativePath = path.relative(repoRoot, filePath);

    // Check root-level files
    for (const surfaceFile of PUBLIC_SURFACE_FILES) {
        if (relativePath === surfaceFile) return true;
    }

    // Check directories
    const firstDir = relativePath.split(path.sep)[0];
    return (PUBLIC_SURFACE_DIRS as readonly string[]).includes(firstDir);
}

/**
 * Checks if a path is internal governance.
 */
export function isInternalGovernance(repoRoot: string, filePath: string): boolean {
    const relativePath = path.relative(repoRoot, filePath);
    const firstDir = relativePath.split(path.sep)[0];
    return (INTERNAL_GOVERNANCE_DIRS as readonly string[]).includes(firstDir);
}
