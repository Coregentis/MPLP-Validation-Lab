/**
 * Canonical Bundle Selection
 * 
 * Shared logic for selecting the canonical reverification bundle for a release.
 * Used by Gate-11, Gate-12, and Export generator.
 * 
 * RULE: For a given release (e.g., "v0.7.2"), the canonical bundle is:
 *   1. The highest +revN version if any exist (e.g., v0.7.2+rev6)
 *   2. The base bundle (e.g., v0.7.2) if no +revN exists
 *   3. null if no bundles exist for this release
 */

import { existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';

export interface CanonicalBundleResult {
    /** Bundle name (e.g., "v0.7.2+rev6") */
    bundleName: string;
    /** Absolute path to bundle directory */
    bundlePath: string;
    /** Revision number (0 for base, 2 for +rev2, etc.) */
    revision: number;
}

/**
 * Find all reverification bundles for a release.
 * Returns sorted array: base version first, then +rev2, +rev3, etc.
 */
export function findBundlesForRelease(reverificationDir: string, release: string): string[] {
    if (!existsSync(reverificationDir)) return [];

    const entries = readdirSync(reverificationDir);
    const bundles: string[] = [];

    for (const entry of entries) {
        // Match exact release or release+revN
        if (entry === release) {
            bundles.push(entry);
        } else if (entry.startsWith(`${release}+rev`)) {
            bundles.push(entry);
        }
    }

    // Sort: base version first, then +rev2, +rev3, etc.
    bundles.sort((a, b) => {
        const aRev = extractRevision(a);
        const bRev = extractRevision(b);
        return aRev - bRev;
    });

    return bundles;
}

/**
 * Extract revision number from bundle name.
 * Returns 0 for base (no +revN), N for +revN.
 */
export function extractRevision(bundleName: string): number {
    const match = bundleName.match(/\+rev(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
}

/**
 * Select the canonical reverification bundle for a release.
 * Returns the highest revision bundle, or null if none exist.
 */
export function selectCanonicalBundle(
    reverificationDir: string,
    release: string
): CanonicalBundleResult | null {
    const bundles = findBundlesForRelease(reverificationDir, release);

    if (bundles.length === 0) return null;

    // Last bundle (highest revision) is canonical
    const bundleName = bundles[bundles.length - 1];
    const bundlePath = join(reverificationDir, bundleName);
    const revision = extractRevision(bundleName);

    // Verify verdict.json exists
    const verdictPath = join(bundlePath, 'verdict.json');
    if (!existsSync(verdictPath)) return null;

    return {
        bundleName,
        bundlePath,
        revision,
    };
}

/**
 * Get all canonical bundles for all releases.
 * Scans reverification directory and returns one canonical per release.
 */
export function getAllCanonicalBundles(
    reverificationDir: string
): Map<string, CanonicalBundleResult> {
    const result = new Map<string, CanonicalBundleResult>();

    if (!existsSync(reverificationDir)) return result;

    const entries = readdirSync(reverificationDir);
    const releases = new Set<string>();

    // Extract unique base release versions
    for (const entry of entries) {
        // Skip non-version directories
        if (!entry.startsWith('v')) continue;

        // Extract base release (remove +revN suffix)
        const baseRelease = entry.replace(/\+rev\d+$/, '');
        releases.add(baseRelease);
    }

    // Find canonical for each
    for (const release of releases) {
        const canonical = selectCanonicalBundle(reverificationDir, release);
        if (canonical) {
            result.set(release, canonical);
        }
    }

    return result;
}
