
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
import { getVersionStripModel } from '@/lib/unified/version-strip-model';
import fs from 'fs';
import path from 'path';
import Doclet from '@/components/doclets/Doclet';

// DOMAIN_LABELS and TIER_STYLES import
import { TierLegend, TierBadge, DOMAIN_LABELS, TIER_STYLES } from '@/components/unified/TierLegend';

// Verdict badge styling
const VERDICT_STYLES: Record<string, { bg: string; text: string }> = {
    PASS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    FAIL: { bg: 'bg-red-500/10', text: 'text-red-400' },
    'N/A': { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

// ... Formatting Helpers (Same as before) ...
const HOST_DISPLAY_MAP: Record<string, string> = {
    'langgraph': 'LangGraph',
    'langchain': 'LangChain',
    'crewai': 'CrewAI',
    'magentic-one': 'Magentic-One',
    'magneticone': 'Magentic-One',
    'magentic_one': 'Magentic-One',
    'magnetic-one': 'Magentic-One',
    'magnetic_one': 'Magentic-One',
    'autogen': 'AutoGen',
    'semantickernel': 'Semantic Kernel',
    'semantic_kernel': 'Semantic Kernel',
    'semantic-kernel': 'Semantic Kernel',
    'mcp': 'MCP',
    'a2a': 'A2A',
    'acp': 'ACP',
};

const INTEROP_DISPLAY_MAP: Record<string, string> = {
    'mcp': 'MCP',
    'a2a': 'A2A',
    'acp': 'ACP',
};

function formatHostLabel(substrate: string | undefined): string {
    if (!substrate) return '—';
    const key = substrate.toLowerCase().replace(/[\s_-]+/g, '');
    return HOST_DISPLAY_MAP[key] || substrate;
}

function formatInteropLabel(protocol: string): string {
    const key = protocol.toLowerCase();
    return INTEROP_DISPLAY_MAP[key] || protocol.toUpperCase();
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
        <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${source === 'v2' ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
            {source}
        </span>
    );
}

function extractDomain(scenario: string | undefined): { key: string; label: string; desc: string } | null {
    if (!scenario) return null;
    const match = scenario.match(/^(d[1-4])/i);
    if (match) {
        const key = match[1].toLowerCase();
        return DOMAIN_LABELS[key] ? { key, ...DOMAIN_LABELS[key] } : null;
    }
    return null;
}

function getValidatesSnippet(run: UnifiedRunIndexItem): string {
    const domain = extractDomain(run.scenario);
    if (domain) {
        return domain.desc;
    }
    if (run.interop_stack?.length) {
        return `Interop validation: ${run.interop_stack.join(', ')}`;
    }
    return 'General conformance';
}

function DomainChip({ domain, ruleset }: { domain: { key: string; label: string; desc: string }; ruleset?: string }) {
    if (!ruleset) {
        return (
            <span
                className="px-2 py-0.5 text-[10px] font-bold bg-zinc-500/10 text-zinc-400 rounded uppercase cursor-not-allowed opacity-60"
                title="Ruleset missing for this run — cannot link to domain"
                data-testid={`domain-chip-${domain.key}`}
            >
                {domain.key}
            </span>
        );
    }

    const href = `/rulesets/${ruleset}#${domain.key}`;
    return (
        <Link
            href={href}
            className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase hover:bg-amber-500/20 transition-colors cursor-pointer"
            title={`${domain.desc} — Click to see domain clauses`}
            data-testid={`domain-chip-${domain.key}`}
        >
            {domain.key}
        </Link>
    );
}

function RunRow({ run }: { run: UnifiedRunIndexItem }) {
    const domain = extractDomain(run.scenario);
    const validates = getValidatesSnippet(run);

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
            <td className="py-3 px-4" data-testid="run-scenario">
                <div className="flex items-center gap-2">
                    {domain && <DomainChip domain={domain} ruleset={run.ruleset} />}
                    <span className="text-sm text-mplp-text">{run.scenario || '—'}</span>
                </div>
                <div className="text-[10px] text-mplp-text-muted mt-0.5" data-testid="run-validates-snippet">{validates}</div>
            </td>
            <td className="py-3 px-4">
                <TierBadge tier={run.tier} />
            </td>
            <td className="py-3 px-4">
                <SourceBadge source={run.source} />
            </td>
            <td className="py-3 px-4">
                <span className="text-sm text-mplp-text-muted">{formatHostLabel(run.substrate)}</span>
                {run.interop_stack && run.interop_stack.length > 0 && (
                    <span className="ml-2 inline-flex gap-1">
                        {run.interop_stack.map((p: string) => (
                            <span key={p} className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-400 rounded" title="Interop Protocol">
                                {formatInteropLabel(p)}
                            </span>
                        ))}
                    </span>
                )}
            </td>
            <td className="py-3 px-4">
                <VerdictBadge verdict={run.verdict} />
            </td>
            <td className="py-3 px-4">
                <Link href={`/rulesets/${run.ruleset}`} className="text-xs text-mplp-text-muted hover:text-mplp-blue-soft font-mono transition-colors">
                    {run.ruleset}
                </Link>
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
    const runsDocletMd = fs.readFileSync(path.join(process.cwd(), 'content/doclets/runs.md'), 'utf-8');

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

    const tierCounts = data.facets.tiers.reduce((acc, tier) => {
        acc[tier] = data.runs.filter(r => r.tier === tier).length;
        return acc;
    }, {} as Record<RunTier, number>);

    return (
        <div>
            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3 flex items-center gap-2">
                    Resources
                    <span className="w-px h-3 bg-mplp-border/50 mx-2" />
                    <span className="text-[10px] tracking-widest opacity-60 font-mono">SSOT: RUN-INDEX-V{versionModel.run_inventory.v1_version}</span>
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6" data-testid="runs-index-header">All Runs</h1>
                <div className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    <Doclet md={runsDocletMd.split('##')[1]} model={versionModel} />
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                    <div className="text-2xl font-bold text-mplp-text">{data.metadata.total}</div>
                    <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Total Runs</div>
                </div>
                <div className="bg-glass rounded-xl p-4 border border-mplp-border/30" data-testid="runs-v2-stats">
                    <div className="text-2xl font-bold text-emerald-400">{tierCounts.REPRODUCED || 0}</div>
                    <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Reproduced (V2)</div>
                </div>
                <div className="bg-glass rounded-xl p-4 border border-mplp-border/30" data-testid="runs-v1-stats">
                    <div className="text-2xl font-bold text-blue-400">{tierCounts.SIMULATED || 0}</div>
                    <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Simulated (V1)</div>
                </div>
                <div className="bg-glass rounded-xl p-4 border border-mplp-border/30">
                    <div className="text-2xl font-bold text-red-400">{tierCounts.DISPUTE_READY || 0}</div>
                    <div className="text-xs uppercase tracking-wide text-mplp-text-muted">Dispute Ready</div>
                </div>
            </div>

            {/* Legend - ALWAYS VISIBLE */}
            <TierLegend />

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
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">
                                    Scenario
                                    <span className="ml-1 text-[10px] font-normal text-mplp-text-muted/60">(Domain + Validates)</span>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted" title="Evidence maturity level">
                                    Tier <span className="text-[10px] font-normal">ⓘ</span>
                                </th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Source</th>
                                <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted" title="Host = Orchestration framework. Interop = Protocol stack.">
                                    Host + Interop <span className="text-[10px] font-normal">ⓘ</span>
                                </th>
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
    );
}
