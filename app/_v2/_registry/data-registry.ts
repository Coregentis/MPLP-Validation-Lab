/**
 * SSOT for projection data access
 * 
 * CRITICAL: This is the ONLY way UI components may access data.
 * Direct imports from data/runs/ are FORBIDDEN.
 * 
 * Data access uses fetch() for server components to ensure consistent behavior
 * across development and production environments.
 * 
 * Enforced by: GATE-V2-PROJ-01
 */

import { CANONICAL_HOST } from './hosts';

/**
 * Base URL for all projection data (runtime path)
 */
const PROJECTION_BASE_URL = '/_data/v2';

/**
 * Type-safe projection paths
 */
const PROJECTION_PATHS = {
    RUNS_INDEX: 'runs/index.json',
    RUN_DETAIL: (runId: string) => `runs/${runId}.json`,
    RULESETS_INDEX: 'rulesets/index.json',
    RULESET_DETAIL: (rulesetId: string) => `rulesets/${rulesetId}.json`,
    RULESET_EVOLUTION: 'rulesets/evolution/timeline.json',
    RULESET_DIFF: (diffId: string) => `rulesets/evolution/diff/${diffId}.json`,
    FMM: 'fmm/mappings.json',
    COVERAGE_MATRIX: 'coverage/matrix.json',
    SITE_LINKS: 'site-links.json',
} as const;

/**
 * Read a projection file using fetch (server component safe)
 * 
 * Uses force-cache to ensure static behavior during build
 */
async function readProjection<T = unknown>(relativePath: string): Promise<T> {
    // @v2-exempt HOST_ALLOW localhost dev-only
    // Construct full URL - use localhost in dev, canonical host in prod
    const baseUrl = process.env.NODE_ENV === 'development' // @v2-exempt HOST_ALLOW localhost dev-only
        ? 'http://localhost:3000' // @v2-exempt HOST_ALLOW localhost dev-only
        : CANONICAL_HOST;

    const url = `${baseUrl}${PROJECTION_BASE_URL}/${relativePath}`;

    try {
        const response = await fetch(url, {
            cache: 'force-cache'
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Projection not found: ${relativePath}`);
            }
            throw new Error(`Failed to fetch projection: ${response.statusText}`);
        }

        return await response.json() as T;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Unknown error fetching projection: ${relativePath}`);
    }
}

/**
 * Get runs index
 */
export async function getRunsIndex() {
    return readProjection(PROJECTION_PATHS.RUNS_INDEX);
}

/**
 * Get run detail by ID
 */
export async function getRunDetail(runId: string) {
    return readProjection(PROJECTION_PATHS.RUN_DETAIL(runId));
}

/**
 * Get rulesets index
 */
export async function getRulesetsIndex() {
    return readProjection(PROJECTION_PATHS.RULESETS_INDEX);
}

/**
 * Get ruleset detail by ID
 */
export async function getRulesetDetail(rulesetId: string) {
    return readProjection(PROJECTION_PATHS.RULESET_DETAIL(rulesetId));
}

/**
 * Get ruleset evolution timeline
 */
export async function getRulesetEvolution() {
    return readProjection(PROJECTION_PATHS.RULESET_EVOLUTION);
}

/**
 * Get ruleset diff by ID
 */
export async function getRulesetDiff(diffId: string) {
    return readProjection(PROJECTION_PATHS.RULESET_DIFF(diffId));
}

/**
 * Get Field Mapping Matrix
 */
export async function getFMM() {
    return readProjection(PROJECTION_PATHS.FMM);
}

/**
 * Get coverage matrix
 */
export async function getCoverageMatrix() {
    return readProjection(PROJECTION_PATHS.COVERAGE_MATRIX);
}

/**
 * Get cross-site links
 */
export async function getSiteLinks() {
    return readProjection(PROJECTION_PATHS.SITE_LINKS);
}

/**
 * Check if a projection exists
 */
export async function projectionExists(relativePath: string): Promise<boolean> {
    // @v2-exempt HOST_ALLOW localhost dev-only
    const baseUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:3000' // @v2-exempt HOST_ALLOW localhost dev-only
        : CANONICAL_HOST;

    const url = `${baseUrl}${PROJECTION_BASE_URL}/${relativePath}`;

    try {
        const response = await fetch(url, {
            method: 'HEAD',
            cache: 'force-cache'
        });
        return response.ok;
    } catch {
        return false;
    }
}

