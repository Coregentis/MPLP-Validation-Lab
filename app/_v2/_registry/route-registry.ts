/**
 * SSOT for route → projection → facets mapping
 * 
 * Defines which projection data each route consumes and which facets are available
 * 
 * CRITICAL: Projection paths are RUNTIME paths (/_data/v2/...), not filesystem paths.
 * The public/ directory maps to / at runtime.
 */

import { FACET_KEYS, type FacetKey } from './facets';

export interface RouteConfig {
    /** Projection file path - RUNTIME path starting with /_data/v2/ */
    projection: string;

    /** Available facets for this route */
    facets: FacetKey[];

    /** Default filter values */
    defaultFilters?: Record<string, string | string[]>;

    /** Whether this route is dynamic (contains [...slug] or [id]) */
    isDynamic?: boolean;
}

/**
 * Route registry
 * 
 * Maps each route to its projection data source and facet configuration
 */
export const ROUTE_REGISTRY: Record<string, RouteConfig> = {
    '/runs': {
        projection: '/_data/v2/runs/index.json',
        facets: [
            FACET_KEYS.SUBSTRATE,
            FACET_KEYS.VERDICT,
            FACET_KEYS.INDEXABILITY_STATUS,
            FACET_KEYS.SCENARIO,
        ],
        defaultFilters: {
            [FACET_KEYS.INDEXABILITY_STATUS]: 'INDEXABLE_REAL',
        },
    },

    '/runs/[run_id]': {
        projection: '/_data/v2/runs/[run_id].json',
        facets: [],
        isDynamic: true,
    },

    '/rulesets': {
        projection: '/_data/v2/rulesets/index.json',
        facets: [
            FACET_KEYS.RULESET_VERSION,
        ],
        defaultFilters: {},
    },

    '/rulesets/[ruleset_id]': {
        projection: '/_data/v2/rulesets/[ruleset_id].json',
        facets: [],
        isDynamic: true,
    },

    '/rulesets/evolution': {
        projection: '/_data/v2/rulesets/evolution/timeline.json',
        facets: [],
    },

    '/rulesets/evolution/diff/[diff_id]': {
        projection: '/_data/v2/rulesets/evolution/diff/[diff_id].json',
        facets: [],
        isDynamic: true,
    },

    '/policies/fmm': {
        projection: '/_data/v2/fmm/mappings.json',
        facets: [
            FACET_KEYS.SUBSTRATE,
            FACET_KEYS.INDEXABILITY_STATUS,
        ],
        defaultFilters: {
            [FACET_KEYS.INDEXABILITY_STATUS]: 'INDEXABLE_REAL',
        },
    },

    '/policies/contract': {
        projection: '/_data/v2/contract/definition.json',
        facets: [],
    },

    '/coverage': {
        projection: '/_data/v2/coverage/matrix.json',
        facets: [
            FACET_KEYS.SUBSTRATE,
            FACET_KEYS.INDEXABILITY_STATUS,
        ],
        defaultFilters: {
            [FACET_KEYS.INDEXABILITY_STATUS]: 'INDEXABLE_REAL',
        },
    },
} as const;

/**
 * Get route configuration
 */
export function getRouteConfig(route: string): RouteConfig | undefined {
    return ROUTE_REGISTRY[route];
}

/**
 * Resolve dynamic projection path
 * 
 * @example
 * resolveProjectionPath('runs/[run_id].json', { run_id: 'pass-basic-01' })
 * // => 'runs/pass-basic-01.json'
 */
export function resolveProjectionPath(
    projectionPath: string,
    params: Record<string, string>
): string {
    let resolved = projectionPath;

    for (const [key, value] of Object.entries(params)) {
        resolved = resolved.replace(`[${key}]`, value);
    }

    return resolved;
}
