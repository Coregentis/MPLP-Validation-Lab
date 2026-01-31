/**
 * Unified Runs Page
 * 
 * Single entry point for all runs (V1 SIMULATED + V2 REPRODUCED/DISPUTE_READY).
 * Supports faceted filtering via query params: ?tier=, ?substrate=, ?verdict=
 * 
 * Ticket: VLAB-MERGE-P0-ROUTE-01
 */

import Link from 'next/link';
import { loadAllRuns } from '@/lib/unified/load-all-runs';
import type { RunTier, UnifiedRunIndexItem } from '@/lib/unified/types';
import { VersionStrip } from '@/components/VersionStrip';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';
import { Nav } from '@/components/Nav';

// Tier badge styling
const TIER_STYLES: Record<RunTier, { bg: string; text: string; label: string }> = {
    DISPUTE_READY: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dispute Ready' },
    REPRODUCED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Reproduced' },
    SIMULATED: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Simulated' },
    DECLARED: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Declared' },
};

// Verdict badge styling
const VERDICT_STYLES: Record<string, { bg: string; text: string }> = {
    PASS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    FAIL: { bg: 'bg-red-500/10', text: 'text-red-400' },
    'N/A': { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

function TierBadge({ tier }: { tier: RunTier }) {
    const style = TIER_STYLES[tier];
    return (
        <span className={`px-2 py-0.5 text-xs font-mono rounded ${style.bg} ${style.text} border border-current/20`}>
            {style.label}
        </span>
    );
}

function VerdictBadge({ verdict }: { verdict: string }) {
    const style = VERDICT_STYLES[verdict] || VERDICT_STYLES['N/A'];
    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${style.bg} ${style.text}`}>
            {verdict}
        </span>
    );
}

function SourceBadge({ source }: { source: 'v1' | 'v2' }) {
    return (
        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${source === 'v2' ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-500/10 text-zinc-400'
            }`}>
            {source}
        </span>
    );
}

function RunRow({ run }: { run: UnifiedRunIndexItem }) {
    return (
        <tr className="border-b border-mplp-border/20 hover:bg-white/5 transition-colors">
            <td className="py-3 px-4">
                <Link
                    href={run.href}
                    className="font-mono text-sm text-mplp-text hover:text-mplp-blue transition-colors"
                >
                    {run.id}
                </Link>
            </td>
            <td className="py-3 px-4">
                <TierBadge tier={run.tier} />
            </td>
            <td className="py-3 px-4">
                <SourceBadge source={run.source} />
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-mplp-text-muted">{run.substrate}</span>
            </td>
            <td className="py-3 px-4">
                <VerdictBadge verdict={run.verdict} />
            </td>
            <td className="py-3 px-4">
                <code className="text-xs text-mplp-text-muted font-mono">{run.ruleset}</code>
            </td>
        </tr>
    );
}

interface PageProps {
    searchParams?: Promise<{ tier?: string; substrate?: string; verdict?: string }>;
}

export default async function UnifiedRunsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const data = loadAllRuns();
    const versionModel = await getVersionStripModel();

    // Apply filters from query params
    let filteredRuns = data.runs;

    const tierFilter = params?.tier as RunTier | undefined;
    const substrateFilter = params?.substrate;
    const verdictFilter = params?.verdict;


    if (tierFilter && data.facets.tiers.includes(tierFilter)) {
        filteredRuns = filteredRuns.filter(r => r.tier === tierFilter);
    }
    if (substrateFilter) {
        filteredRuns = filteredRuns.filter(r => r.substrate === substrateFilter);
    }
    if (verdictFilter) {
        filteredRuns = filteredRuns.filter(r => r.verdict === verdictFilter);
    }

    // Calculate counts by tier
    const tierCounts = data.facets.tiers.reduce((acc, tier) => {
        acc[tier] = data.runs.filter(r => r.tier === tier).length;
        return acc;
    }, {} as Record<RunTier, number>);

    return (
        <main className="min-h-screen bg-mplp-dark-bg text-mplp-text">
            <Nav />
            <VersionStrip {...versionModel} />
            <div className="max-w-[1600px] mx-auto p-6">
                {/* Header */}
                <div className="mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Resources</p>
                    <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">All Runs</h1>
                    <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                        Unified view of all evidence packs from V1 (simulated) and V2 (real runner) sources.
                        Filter by tier to see different evidence levels.
                    </p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                        <div className="text-2xl font-bold text-mplp-text">{data.metadata.total}</div>
                        <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Total Runs</div>
                    </div>
                    <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                        <div className="text-2xl font-bold text-emerald-400">{tierCounts.REPRODUCED || 0}</div>
                        <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Reproduced (V2)</div>
                    </div>
                    <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                        <div className="text-2xl font-bold text-blue-400">{tierCounts.SIMULATED || 0}</div>
                        <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Simulated (V1)</div>
                    </div>
                    <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                        <div className="text-2xl font-bold text-red-400">{tierCounts.DISPUTE_READY || 0}</div>
                        <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Dispute Ready</div>
                    </div>
                </div>

                {/* Tier Facet Filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link
                        href="/runs"
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${!tierFilter
                            ? 'bg-mplp-blue text-white border-mplp-blue'
                            : 'bg-transparent text-mplp-text-muted border-mplp-border hover:bg-white/5'
                            }`}
                    >
                        All ({data.metadata.total})
                    </Link>
                    {(Object.keys(TIER_STYLES) as RunTier[]).map(tier => (
                        <Link
                            key={tier}
                            href={`/runs?tier=${tier}`}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${tierFilter === tier
                                ? `${TIER_STYLES[tier].bg} ${TIER_STYLES[tier].text} border-current`
                                : 'bg-transparent text-mplp-text-muted border-mplp-border hover:bg-white/5'
                                }`}
                        >
                            {TIER_STYLES[tier].label} ({tierCounts[tier] || 0})
                        </Link>
                    ))}
                </div>

                {/* Runs Table */}
                <div className="bg-glass border border-mplp-border/30 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-mplp-dark-soft/50 border-b border-mplp-border/30">
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">ID</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Tier</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Source</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Substrate</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Verdict</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Ruleset</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-mplp-border/10">
                                {filteredRuns.map((run) => (
                                    <RunRow key={run.id} run={run} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}
