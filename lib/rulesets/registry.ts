/**
 * Ruleset Registry
 * 
 * Maps ruleset IDs to their adjudicators.
 * Supports ruleset-1.0 (GoldenFlow), ruleset-1.1 (Four-Domain), and ruleset-1.2 (Semantic Invariants).
 * 
 * Usage:
 *   const ruleset = await getRuleset('ruleset-1.1');
 *   if (ruleset?.adjudicator) {
 *     const result = await ruleset.adjudicator(bundle);
 *   }
 */

import { loadRuleset, RulesetManifest, RulesetData, rulesetExists } from './loadRuleset';
import type { RunBundle } from '@/lib/bundles/types';

// Re-export types for convenience
export type { RulesetManifest, RulesetData };

// =============================================================================
// Registry Types (Generic Evaluation Output Contract)
// =============================================================================

/**
 * Domain metadata for UI grouping.
 * Optional - if provided, UI can group clauses by domain.
 */
export interface DomainMeta {
    domain_id: string;
    domain_name: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
}

/**
 * Result structure from ruleset evaluation.
 * This is the OUTPUT CONTRACT for all adjudicators.
 * UI should ONLY depend on this interface, not ruleset-specific types.
 */
export interface RulesetEvalResult {
    ruleset_id: string;
    run_id: string;
    evaluated_at: string;
    topline_verdict: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string | null;

    /** Domain grouping metadata (optional, for UI display) */
    domain_meta?: DomainMeta[];

    /** Individual clause results */
    clauses: ClauseResult[];
}

/**
 * Individual clause evaluation result.
 */
export interface ClauseResult {
    clause_id: string;
    requirement_id: string;
    status: 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';
    reason_code?: string;

    /** Domain this clause belongs to (for grouping) */
    domain_id?: string;

    /** Resolved evidence references */
    evidence_refs?: Array<{
        pointer: unknown;
        resolved: 'event' | 'snapshot' | 'none';
        /** Optional: resolved content for UI drilldown */
        content?: Record<string, unknown>;
    }>;

    notes?: string[];
}


export interface RegisteredRuleset {
    id: string;
    manifest: RulesetManifest;
    /** Adjudicator function (null if not implemented) */
    adjudicator: AdjudicatorFn | null;
}

/** 
 * Typed adjudicator signature.
 * All adjudicators take RunBundle and return RulesetEvalResult.
 */
export type AdjudicatorFn = (bundle: RunBundle) => Promise<RulesetEvalResult>;

// =============================================================================
// Registry Implementation
// =============================================================================

const SUPPORTED_RULESETS = ['ruleset-1.0', 'ruleset-1.1', 'ruleset-1.2', 'ruleset-1.3'] as const;
type SupportedRulesetId = typeof SUPPORTED_RULESETS[number];

// Manifest cache to avoid repeated file I/O
const manifestCache = new Map<string, RulesetManifest>();

/** 
 * Check if a ruleset ID is supported.
 */
export function isSupportedRuleset(id: string): id is SupportedRulesetId {
    return SUPPORTED_RULESETS.includes(id as SupportedRulesetId);
}

/**
 * Get a registered ruleset by ID.
 * Returns null if ruleset not found or not loadable.
 * Uses caching to avoid repeated disk reads.
 */
export async function getRuleset(id: string): Promise<RegisteredRuleset | null> {
    if (!isSupportedRuleset(id)) {
        return null;
    }

    // Check if ruleset directory exists
    if (!rulesetExists(id)) {
        return null;
    }

    // Check cache first
    let manifest = manifestCache.get(id);
    if (!manifest) {
        const data = loadRuleset(id);
        if (!data.manifest) {
            return null;
        }
        manifest = data.manifest;
        manifestCache.set(id, manifest);
    }

    return {
        id,
        manifest,
        adjudicator: await getAdjudicator(id),
    };
}

/**
 * List all available rulesets.
 */
export async function listRegisteredRulesets(): Promise<RegisteredRuleset[]> {
    const results: RegisteredRuleset[] = [];
    for (const id of SUPPORTED_RULESETS) {
        const ruleset = await getRuleset(id);
        if (ruleset) {
            results.push(ruleset);
        }
    }
    return results;
}

/**
 * Clear manifest cache (for testing).
 */
export function clearManifestCache(): void {
    manifestCache.clear();
}

// =============================================================================
// Adjudicator Mapping (Lazy-loaded)
// =============================================================================

async function getAdjudicator(id: SupportedRulesetId): Promise<AdjudicatorFn | null> {
    switch (id) {
        case 'ruleset-1.0': {
            // GoldenFlow adjudicator - wraps existing verdict into RulesetEvalResult
            const { adjudicatorFn } = await import('./ruleset-1.0/adjudicate');
            return adjudicatorFn;
        }
        case 'ruleset-1.1': {
            // Four-domain adjudicator - dynamically imported
            const { adjudicatorFn } = await import('./ruleset-1.1/adjudicate');
            return adjudicatorFn;
        }
        case 'ruleset-1.2': {
            // v0.4 Semantic invariant adjudicator - 12 clauses
            const { adjudicatorFn } = await import('./ruleset-1.2/adjudicate');
            return adjudicatorFn;
        }
        case 'ruleset-1.3': {
            // v0.13.1 Phased Evolution - refined CL-D1-03
            const { adjudicatorFn } = await import('./ruleset-1.3/adjudicate');
            return adjudicatorFn;
        }
        default:
            return null;
    }
}

