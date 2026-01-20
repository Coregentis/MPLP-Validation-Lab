/**
 * Release Info Loader
 * 
 * SSOT: governance/releases/release-index.yaml
 * 
 * Provides current release metadata for pages that need to display
 * version information without hardcoding.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

interface ActiveRelease {
    id: string;
    site_version: string;
    status: string;
    frozen_at: string;
    ruleset: string;
    pack_formats: string;
}

interface ReleaseIndex {
    metadata: {
        schema_version: string;
        last_updated: string;
    };
    active: ActiveRelease[];
}

interface ReleaseInfo {
    site_version: string;
    release_seal: string;
    frozen_at: string;
    export_version: string;
    status: string;
}

/**
 * Load current release info from SSOT
 * Falls back to safe defaults if SSOT unavailable
 */
export function loadCurrentRelease(): ReleaseInfo {
    try {
        const ssotPath = join(process.cwd(), 'governance', 'releases', 'release-index.yaml');

        if (!existsSync(ssotPath)) {
            console.warn('Release index not found, using fallback');
            return getFallback();
        }

        const content = readFileSync(ssotPath, 'utf-8');
        const data = yaml.parse(content) as ReleaseIndex;

        if (!data.active || data.active.length === 0) {
            return getFallback();
        }

        const current = data.active[0];

        return {
            site_version: current.site_version,
            release_seal: current.id,
            frozen_at: current.frozen_at,
            export_version: '1.2', // From EXPORT_CONTRACT_CHANGELOG.md
            status: current.status,
        };
    } catch (error) {
        console.error('Failed to load release index:', error);
        return getFallback();
    }
}

function getFallback(): ReleaseInfo {
    return {
        site_version: 'site-v0.5',
        release_seal: 'rel-lab-0.5',
        frozen_at: '2026-01-20',
        export_version: '1.2',
        status: 'frozen',
    };
}
