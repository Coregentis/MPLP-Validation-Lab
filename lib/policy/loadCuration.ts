/**
 * Curation Policy Loader
 * 
 * Loads curation policy for Run Detail noindex/index control.
 * Used by GATE-06 and Run Detail page metadata.
 */

import * as path from 'path';
import { loadYamlStrict } from '@/lib/utils/yaml-loader';

interface CurationPolicy {
    policy_version: string;
    default_run_detail_robots: string;
    curated_runs: Array<{ run_id: string; robots?: string }>;
}

const DEFAULT_POLICY: CurationPolicy = {
    policy_version: '1.0',
    default_run_detail_robots: 'noindex,nofollow',
    curated_runs: [],
};

/**
 * Load curation policy from data/policy/curation.yaml
 */
export function loadCuration(): CurationPolicy {
    const policyPath = path.resolve(process.cwd(), 'data/policy/curation.yaml');

    try {
        return loadYamlStrict<CurationPolicy>(policyPath);
    } catch {
        return DEFAULT_POLICY;
    }
}

/**
 * Check if a run is curated (allowed to be indexed)
 */
export function isCuratedRun(runId: string): boolean {
    const policy = loadCuration();
    return policy.curated_runs.some((r) => r.run_id === runId);
}

/**
 * Get robots meta for a run
 */
export function getRunRobots(runId: string): { index: boolean; follow: boolean } {
    const curated = isCuratedRun(runId);
    return {
        index: curated,
        follow: curated,
    };
}
