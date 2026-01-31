/**
 * Unified Runs Loader
 * 
 * Loads and merges runs from both V1 (curated-runs.json) and V2 (v2/runs/index.json)
 * into a single unified data structure with tier classification.
 * 
 * Ticket: VLAB-MERGE-P0-DATA-01
 */

import fs from 'fs';
import path from 'path';
import type { UnifiedRunIndexItem, UnifiedRunsData, RunTier } from './types';

const V1_PATH = 'public/_data/curated-runs.json';
const V2_PATH = 'public/_data/v2/runs/index.json';

/**
 * Derive verdict from V1 adjudication_status and run_id patterns
 */
function deriveV1Verdict(run: any): 'PASS' | 'FAIL' | 'N/A' {
    const adj = run.adjudication_status;
    const id = run.run_id || '';

    // Explicit adjudication status
    if (adj === 'ADJUDICATED') {
        // Check run_id for pass/fail hints
        if (id.includes('-fail') || id.includes('-FAIL')) return 'FAIL';
        if (id.includes('-pass') || id.includes('-PASS')) return 'PASS';
        return 'PASS'; // Default adjudicated = pass
    }
    if (adj === 'NOT_ADMISSIBLE') return 'FAIL';
    if (adj === 'NOT_ADJUDICATED') return 'N/A';

    // Fallback to run_id pattern
    if (id.includes('-fail')) return 'FAIL';
    if (id.includes('-pass')) return 'PASS';

    return 'N/A';
}

/**
 * Load V1 curated runs and normalize to unified format
 * V1 runs are all SIMULATED tier (synthetic evidence packs)
 */
function loadV1Runs(): UnifiedRunIndexItem[] {
    const fullPath = path.join(process.cwd(), V1_PATH);

    if (!fs.existsSync(fullPath)) {
        console.warn('[unified-loader] V1 curated-runs.json not found');
        return [];
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        return (data.runs || []).map((run: any): UnifiedRunIndexItem => ({
            id: run.run_id,
            source: 'v1',
            tier: 'SIMULATED', // V1 runs are all simulated
            substrate: run.substrate || 'unknown',
            scenario: run.scenario_id || run.notes?.split(':')[0] || 'unknown',
            verdict: deriveV1Verdict(run),
            ruleset: run.ruleset_version || 'N/A',
            evidence_present: !!(run.pack_root_hash && run.verdict_hash),
            href: `/runs/${run.run_id}`,
            adjudication_status: run.adjudication_status,
            tags: [],
        }));
    } catch (e) {
        console.error('[unified-loader] Failed to load V1 runs:', e);
        return [];
    }
}

/**
 * Map V2 verdict strings to normalized verdict
 */
function normalizeV2Verdict(verdict: string): 'PASS' | 'FAIL' | 'N/A' {
    if (verdict === 'PASS') return 'PASS';
    if (verdict === 'FAIL') return 'FAIL';
    return 'N/A';
}

/**
 * Map V2 tier to RunTier (V2 has more granular tiers)
 */
function normalizeV2Tier(tier: string): RunTier {
    if (tier === 'REPRODUCED') return 'REPRODUCED';
    if (tier === 'DISPUTE_READY') return 'DISPUTE_READY';
    if (tier === 'DECLARED') return 'DECLARED';
    return 'DECLARED'; // Default
}

/**
 * Load V2 runs from index.json and normalize to unified format
 */
function loadV2Runs(): UnifiedRunIndexItem[] {
    const fullPath = path.join(process.cwd(), V2_PATH);

    if (!fs.existsSync(fullPath)) {
        console.warn('[unified-loader] V2 runs/index.json not found');
        return [];
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        return (data.data?.runs || []).map((run: any): UnifiedRunIndexItem => ({
            id: run.pack_id,
            source: 'v2',
            tier: normalizeV2Tier(run.tier),
            substrate: run.substrate_id || run.substrate_name || 'unknown',
            scenario: run.scenario || 'unknown',
            verdict: normalizeV2Verdict(run.verdict),
            ruleset: 'ruleset-v2.0', // V2 uses unified ruleset
            evidence_present: true, // V2 packs always have evidence
            href: `/runs/${run.pack_id}`,
            indexability_status: run.indexability_status,
            interop_stack: run.interop_stack || [],
            surfaces: run.surfaces || {},
            tags: run.tags || [],
        }));
    } catch (e) {
        console.error('[unified-loader] Failed to load V2 runs:', e);
        return [];
    }
}

/**
 * Get all runs from both V1 and V2 sources, merged and sorted
 * 
 * Sort order: DISPUTE_READY > REPRODUCED > SIMULATED > DECLARED
 * (Real evidence with issues first, then real evidence, then synthetic)
 */
export function loadAllRuns(): UnifiedRunsData {
    const v1Runs = loadV1Runs();
    const v2Runs = loadV2Runs();

    const allRuns = [...v1Runs, ...v2Runs];

    // Sort by tier priority
    const tierOrder: Record<RunTier, number> = {
        'DISPUTE_READY': 0,
        'REPRODUCED': 1,
        'SIMULATED': 2,
        'DECLARED': 3,
    };
    allRuns.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);

    // Build facets
    const substrates = [...new Set(allRuns.map(r => r.substrate))].sort();
    const tiers = [...new Set(allRuns.map(r => r.tier))] as RunTier[];
    const verdicts = [...new Set(allRuns.map(r => r.verdict))].sort();
    const rulesets = [...new Set(allRuns.map(r => r.ruleset))].sort();

    return {
        runs: allRuns,
        facets: {
            sources: ['v1', 'v2'],
            tiers,
            substrates,
            verdicts,
            rulesets,
        },
        metadata: {
            v1_count: v1Runs.length,
            v2_count: v2Runs.length,
            total: allRuns.length,
            generated_at: new Date().toISOString(),
        },
    };
}

/**
 * Get runs filtered by tier
 */
export function getRunsByTier(tier: RunTier): UnifiedRunIndexItem[] {
    const data = loadAllRuns();
    return data.runs.filter(r => r.tier === tier);
}

/**
 * Get runs filtered by source
 */
export function getRunsBySource(source: 'v1' | 'v2'): UnifiedRunIndexItem[] {
    const data = loadAllRuns();
    return data.runs.filter(r => r.source === source);
}

/**
 * Get a single run by ID from either source
 */
export function getRunById(id: string): UnifiedRunIndexItem | null {
    const data = loadAllRuns();
    return data.runs.find(r => r.id === id) || null;
}
