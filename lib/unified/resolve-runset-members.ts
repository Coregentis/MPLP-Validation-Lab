/**
 * Runset Membership Resolver
 * 
 * Resolves which runs belong to a runset using explicit/ref/alias/inferred sources.
 * Fail-closed: if no reliable membership can be determined, returns unresolved.
 */

import { loadAllRuns } from './load-all-runs';
import { getRunset, RunsetManifest } from './load-all-runsets';
import type { UnifiedRunIndexItem } from './types';
import fs from 'fs';
import path from 'path';

export type MembershipSource = 'explicit' | 'ref' | 'alias' | 'inferred' | 'unresolved';

export interface RunsetMembershipResult {
    members: UnifiedRunIndexItem[];
    explained_by: MembershipSource;
    explanation: string;
}

/**
 * Resolve runset members with fail-closed semantics
 * Priority: explicit > ref > alias > inferred (with warning) > unresolved
 */
export function resolveRunsetMembers(runsetId: string): RunsetMembershipResult {
    const runset = getRunset(runsetId);
    if (!runset) {
        return { members: [], explained_by: 'unresolved', explanation: 'Runset not found' };
    }

    const allRuns = loadAllRuns().runs;

    // 1. Check for explicit member list in runset SSOT (run_ids[] / members[])
    const explicitResult = tryExplicitMembers(runsetId, allRuns);
    if (explicitResult) return explicitResult;

    // 2. Check for runset_ref field in runs
    const refResult = tryRefMatch(runsetId, allRuns);
    if (refResult) return refResult;

    // 3. Check aliases
    const aliasResult = tryAliasMatch(runsetId, allRuns);
    if (aliasResult) return aliasResult;

    // 4. Inferred by source_index matching (with warning)
    const inferredResult = tryInferredMatch(runset, allRuns);
    if (inferredResult) return inferredResult;

    // 5. Fail-closed: unresolved
    return {
        members: [],
        explained_by: 'unresolved',
        explanation: 'No membership mapping found in SSOT. Cannot determine runs belonging to this runset.'
    };
}

function tryExplicitMembers(runsetId: string, allRuns: UnifiedRunIndexItem[]): RunsetMembershipResult | null {
    // Check if v1-curated or v2-index has explicit run list
    try {
        if (runsetId === 'v1-curated') {
            const v1Data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/_data/curated-runs.json'), 'utf-8'));
            if (v1Data.runs && Array.isArray(v1Data.runs)) {
                const runIds = new Set(v1Data.runs.map((r: { run_id: string }) => r.run_id));
                const members = allRuns.filter(r => runIds.has(r.id));
                return {
                    members,
                    explained_by: 'explicit',
                    explanation: `${members.length} runs from curated-runs.json manifest`
                };
            }
        }
        if (runsetId === 'v2-index') {
            const v2Data = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/_data/v2/runs/index.json'), 'utf-8'));
            const runs = v2Data.data?.runs || [];
            if (runs.length > 0) {
                const runIds = new Set(runs.map((r: { pack_id?: string; id?: string }) => r.pack_id || r.id));
                const members = allRuns.filter(r => runIds.has(r.id));
                return {
                    members,
                    explained_by: 'explicit',
                    explanation: `${members.length} runs from v2/runs/index.json manifest`
                };
            }
        }
    } catch { }
    return null;
}

function tryRefMatch(_runsetId: string, _allRuns: UnifiedRunIndexItem[]): RunsetMembershipResult | null {
    // Check if runs have runset_ref field matching this runset
    // Note: UnifiedRunIndexItem may not have this field yet
    return null; // Not implemented - would need SSOT change
}

function tryAliasMatch(runsetId: string, _allRuns: UnifiedRunIndexItem[]): RunsetMembershipResult | null {
    try {
        const aliasPath = path.join(process.cwd(), 'public/_data/unified/runset-aliases.json');
        if (fs.existsSync(aliasPath)) {
            const aliasData = JSON.parse(fs.readFileSync(aliasPath, 'utf-8'));
            // If this runset is an alias target, check what aliases point to it
            // Or if it's an alias, resolve to canonical and get those members
            if (aliasData.aliases) {
                for (const [alias, target] of Object.entries(aliasData.aliases)) {
                    if (target === runsetId && alias !== runsetId) {
                        // This runset is the canonical target of an alias
                        // Recursively resolve (but avoid infinite loops)
                        return null; // Skip for now
                    }
                }
            }
        }
    } catch { }
    return null;
}

function tryInferredMatch(runset: RunsetManifest, allRuns: UnifiedRunIndexItem[]): RunsetMembershipResult | null {
    // Inferred by source matching - BUT mark as inferred so user knows
    const sourceMatch = runset.source; // 'v1' or 'v2'
    const members = allRuns.filter(r => r.source === sourceMatch);

    if (members.length > 0) {
        return {
            members,
            explained_by: 'inferred',
            explanation: `${members.length} runs inferred from source="${sourceMatch}" (not explicit membership)`
        };
    }
    return null;
}

/**
 * Aggregate validates info from runs
 */
export interface ValidatesAggregation {
    topScenarios: string[];
    rulesets: string[];
    interopProtocols: string[];
    summary: string;
}

export function aggregateValidates(members: UnifiedRunIndexItem[]): ValidatesAggregation {
    if (members.length === 0) {
        return {
            topScenarios: [],
            rulesets: [],
            interopProtocols: [],
            summary: 'No runs to analyze'
        };
    }

    // Count scenarios
    const scenarioCounts: Record<string, number> = {};
    const rulesetSet = new Set<string>();
    const interopSet = new Set<string>();

    for (const run of members) {
        if (run.scenario) {
            scenarioCounts[run.scenario] = (scenarioCounts[run.scenario] || 0) + 1;
        }
        if (run.ruleset) {
            rulesetSet.add(run.ruleset);
        }
        if (run.interop_stack) {
            run.interop_stack.forEach(p => interopSet.add(p));
        }
    }

    // Sort scenarios by count
    const sortedScenarios = Object.entries(scenarioCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([s]) => s);

    const rulesets = [...rulesetSet].sort();
    const interopProtocols = [...interopSet].sort();

    // Build summary
    let summary = '';
    if (interopProtocols.length > 0) {
        summary = `Interop validation: ${interopProtocols.join(', ')}`;
    } else if (sortedScenarios.length > 0) {
        summary = `Primary scenarios: ${sortedScenarios.join(', ')}`;
    } else {
        summary = 'General conformance verification';
    }

    return { topScenarios: sortedScenarios, rulesets, interopProtocols, summary };
}

/**
 * Select featured run with deterministic logic
 * Priority: PASS > tier (REPRODUCED > DISPUTE_READY > DECLARED > SIMULATED) > interop > run_id
 */
export interface FeaturedRunResult {
    run: UnifiedRunIndexItem | null;
    reason: string;
}

export function selectFeaturedRun(members: UnifiedRunIndexItem[]): FeaturedRunResult {
    if (members.length === 0) {
        return { run: null, reason: 'No runs in this set' };
    }

    const tierOrder: Record<string, number> = {
        'REPRODUCED': 0,
        'DISPUTE_READY': 1,
        'DECLARED': 2,
        'SIMULATED': 3,
    };

    // Sort by: PASS first, then tier, then interop, then run_id
    const sorted = [...members].sort((a, b) => {
        // PASS priority
        const aPass = a.verdict === 'PASS' ? 0 : 1;
        const bPass = b.verdict === 'PASS' ? 0 : 1;
        if (aPass !== bPass) return aPass - bPass;

        // Tier priority
        const aTier = tierOrder[a.tier] ?? 99;
        const bTier = tierOrder[b.tier] ?? 99;
        if (aTier !== bTier) return aTier - bTier;

        // Interop priority (has interop_stack)
        const aInterop = (a.interop_stack?.length ?? 0) > 0 ? 0 : 1;
        const bInterop = (b.interop_stack?.length ?? 0) > 0 ? 0 : 1;
        if (aInterop !== bInterop) return aInterop - bInterop;

        // Stable sort by run_id
        return a.id.localeCompare(b.id);
    });

    const featured = sorted[0];
    const reasons: string[] = [];

    if (featured.verdict === 'PASS') reasons.push('PASS verdict');
    else reasons.push(`${featured.verdict} verdict`);

    reasons.push(`${featured.tier} tier`);

    if ((featured.interop_stack?.length ?? 0) > 0) {
        reasons.push(`interop: ${featured.interop_stack!.join('+')}`);
    }

    return {
        run: featured,
        reason: reasons.join(', ')
    };
}
