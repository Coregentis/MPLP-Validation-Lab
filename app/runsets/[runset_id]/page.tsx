import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getRunset } from '@/lib/unified/load-all-runsets';
import { resolveRunsetMembers, aggregateValidates, selectFeaturedRun } from '@/lib/unified/resolve-runset-members';

import { ArrowLeft } from 'lucide-react';
import fs from 'fs';
import path from 'path';
import type { UnifiedRunIndexItem, RunTier } from '@/lib/unified/types';

interface PageProps {
    params: Promise<{ runset_id: string }>;
}

// Tier badge styling (reused from /runs)
const TIER_STYLES: Record<RunTier, { bg: string; text: string; label: string }> = {
    DISPUTE_READY: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dispute Ready' },
    REPRODUCED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Reproduced' },
    SIMULATED: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Simulated' },
    DECLARED: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Declared' },
};

function TierBadge({ tier }: { tier: RunTier }) {
    const style = TIER_STYLES[tier] || TIER_STYLES.DECLARED;
    return (
        <span className={`px-2 py-0.5 text-xs font-mono rounded ${style.bg} ${style.text} border border-current/20`}>
            {style.label}
        </span>
    );
}

function VerdictBadge({ verdict }: { verdict: string }) {
    const styles: Record<string, { bg: string; text: string }> = {
        PASS: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
        FAIL: { bg: 'bg-red-500/10', text: 'text-red-400' },
        'N/A': { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
    };
    const style = styles[verdict] || styles['N/A'];
    return (
        <span className={`px-2 py-0.5 text-xs font-bold rounded ${style.bg} ${style.text}`}>
            {verdict}
        </span>
    );
}

export default async function RunsetDetailPage({ params }: PageProps) {
    const { runset_id } = await params;

    // Check aliases
    let redirectTarget: string | null = null;
    try {
        const aliasPath = path.join(process.cwd(), 'public/_data/unified/runset-aliases.json');
        if (fs.existsSync(aliasPath)) {
            const aliasData = JSON.parse(fs.readFileSync(aliasPath, 'utf-8'));
            if (aliasData.aliases && aliasData.aliases[runset_id]) {
                redirectTarget = aliasData.aliases[runset_id];
            }
        }
    } catch { }

    if (redirectTarget) {
        redirect(redirectTarget);
    }

    const runset = getRunset(runset_id);
    if (!runset) {
        notFound();
    }

    // Resolve membership with fail-closed semantics
    const membership = resolveRunsetMembers(runset_id);
    const validates = aggregateValidates(membership.members);
    const featured = selectFeaturedRun(membership.members);

    return (
        <>
            <div data-testid="runset-page-root">
                <Link href="/runsets" className="inline-flex items-center gap-2 text-sm text-mplp-text-muted hover:text-mplp-blue-soft mb-8 transition-colors">
                    <ArrowLeft size={14} />
                    Back to Runsets
                </Link>

                {/* Runset Summary Card */}
                <div className="bg-glass border border-mplp-border/40 rounded-2xl p-8 mb-8" data-testid="runset-summary">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-mplp-text mb-2">{runset.title}</h1>
                            <div className="flex gap-3 text-sm font-mono text-mplp-text-muted">
                                <span>ID: {runset.id}</span>
                                <span>•</span>
                                <span>Version: {runset.version}</span>
                                <span>•</span>
                                <span>{runset.run_count} runs</span>
                            </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${runset.source === 'v2'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                            {runset.source} SOURCE
                        </span>
                    </div>

                    <p className="text-mplp-text-muted leading-relaxed mb-6 max-w-3xl">
                        {runset.description}
                    </p>

                    {/* Membership explanation */}
                    <div className="text-xs text-mplp-text-muted/60 mt-2 flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded ${membership.explained_by === 'explicit' ? 'bg-emerald-500/10 text-emerald-400' : membership.explained_by === 'inferred' ? 'bg-amber-500/10 text-amber-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                            {membership.explained_by}
                        </span>
                        <span>{membership.explanation}</span>
                    </div>
                </div>

                {/* Validates Section */}
                <div className="bg-glass border border-mplp-border/40 rounded-2xl p-6 mb-8" data-testid="runset-validates">
                    <h2 className="text-lg font-bold text-mplp-text mb-4">What This Set Validates</h2>
                    <p className="text-mplp-text-muted mb-4">{validates.summary}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {validates.topScenarios.length > 0 && (
                            <div data-testid="runset-validates-scenarios">
                                <div className="text-xs uppercase tracking-wider text-mplp-text-muted/60 mb-2">Top Scenarios</div>
                                <div className="flex flex-wrap gap-2">
                                    {validates.topScenarios.map((s: string) => (
                                        <span key={s} className="px-2 py-1 bg-mplp-dark-soft rounded text-mplp-text font-mono text-xs">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {validates.rulesets.length > 0 && (
                            <div data-testid="runset-validates-rulesets">
                                <div className="text-xs uppercase tracking-wider text-mplp-text-muted/60 mb-2">Rulesets</div>
                                <div className="flex flex-wrap gap-2">
                                    {validates.rulesets.map((r: string) => (
                                        <Link key={r} href={`/rulesets/${r}`} className="px-2 py-1 bg-mplp-dark-soft hover:bg-mplp-blue/10 rounded text-mplp-blue-soft font-mono text-xs transition-colors">{r}</Link>
                                    ))}
                                </div>
                            </div>
                        )}
                        {validates.interopProtocols.length > 0 && (
                            <div data-testid="runset-validates-interop">
                                <div className="text-xs uppercase tracking-wider text-mplp-text-muted/60 mb-2">Interop Protocols</div>
                                <div className="flex flex-wrap gap-2">
                                    {validates.interopProtocols.map((p: string) => (
                                        <span key={p} className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded font-mono text-xs">{p}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured Run - Start Here */}
                {featured.run && (
                    <div className="bg-gradient-to-r from-mplp-blue/10 to-emerald-500/10 border border-mplp-border/40 rounded-2xl p-6 mb-8" data-testid="runset-featured-run">
                        <h2 className="text-lg font-bold text-mplp-text mb-2">🚀 Start Here</h2>
                        <p className="text-sm text-mplp-text-muted mb-4" data-testid="runset-featured-reason">
                            Recommended: {featured.reason}
                        </p>
                        <Link
                            href={featured.run.href}
                            className="inline-flex items-center gap-3 px-6 py-3 bg-mplp-blue hover:bg-mplp-blue-soft text-white font-bold rounded-lg transition-all shadow-lg"
                        >
                            <span className="font-mono">{featured.run.id}</span>
                            <VerdictBadge verdict={featured.run.verdict} />
                            <span>→</span>
                        </Link>
                    </div>
                )}

                {/* Verify This Set - 4 Step Loop */}
                <div className="bg-glass border border-mplp-border/40 rounded-2xl p-6 mb-8" data-testid="runset-verify-loop">
                    <h2 className="text-lg font-bold text-mplp-text mb-4">Verification Path</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-mplp-dark-soft/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                            <div className="text-sm font-bold text-mplp-text mb-1">Pick a Run</div>
                            <p className="text-xs text-mplp-text-muted">Choose from table below</p>
                        </div>
                        <div className="text-center p-4 bg-mplp-dark-soft/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                            <div className="text-sm font-bold text-mplp-text mb-1">View Evidence</div>
                            <p className="text-xs text-mplp-text-muted">Inspect verdict & clauses</p>
                        </div>
                        <div className="text-center p-4 bg-mplp-dark-soft/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                            <div className="text-sm font-bold text-mplp-text mb-1">Download Pack</div>
                            <p className="text-xs text-mplp-text-muted">Get JSON/ZIP artifacts</p>
                        </div>
                        <div className="text-center p-4 bg-emerald-500/10 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 text-sm font-bold">✓</div>
                            <div className="text-sm font-bold text-mplp-text mb-1">Compare Seal</div>
                            <Link href="/releases" className="text-xs text-mplp-blue-soft hover:underline">Check Release Seals</Link>
                        </div>
                    </div>
                </div>

                {/* Membership Unresolved Warning (fail-closed) */}
                {membership.explained_by === 'unresolved' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8" data-testid="runset-membership-unresolved">
                        <h2 className="text-lg font-bold text-amber-400 mb-2">⚠️ Membership Unresolved</h2>
                        <p className="text-mplp-text-muted">{membership.explanation}</p>
                        <p className="text-sm text-mplp-text-muted mt-2">Cannot display runs table without verified membership mapping.</p>
                    </div>
                )}

                {/* Runs Table */}
                {membership.explained_by !== 'unresolved' && membership.members.length > 0 && (
                    <div className="bg-glass border border-mplp-border/40 rounded-2xl overflow-hidden mb-8" data-testid="runset-runs-table">
                        <div className="p-4 border-b border-mplp-border/30">
                            <h2 className="text-lg font-bold text-mplp-text">Runs in This Set ({membership.members.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-mplp-dark-soft/50 border-b border-mplp-border/30">
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">ID</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Scenario</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Tier</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Host</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Verdict</th>
                                        <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-mplp-text-muted">Ruleset</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-mplp-border/10">
                                    {membership.members.slice(0, 20).map((run: UnifiedRunIndexItem) => (
                                        <tr key={run.id} className="hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4">
                                                <Link href={run.href} className="font-mono text-sm text-mplp-text hover:text-mplp-blue transition-colors">
                                                    {run.id}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-mplp-text">{run.scenario || '—'}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <TierBadge tier={run.tier} />
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-mplp-text-muted">{run.substrate}</span>
                                                {run.interop_stack && run.interop_stack.length > 0 && (
                                                    <span className="ml-2 inline-flex gap-1">
                                                        {run.interop_stack.map((p: string) => (
                                                            <span key={p} className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-purple-500/10 text-purple-400 rounded">{p}</span>
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
                                    ))}
                                </tbody>
                            </table>
                            {membership.members.length > 20 && (
                                <div className="p-4 text-center text-sm text-mplp-text-muted border-t border-mplp-border/30">
                                    Showing 20 of {membership.members.length} runs. <Link href={`/runs?source=${runset.source}`} className="text-mplp-blue-soft hover:underline">View all →</Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Closure Links */}
                <nav className="flex flex-wrap gap-4 mb-12" data-testid="runset-closure-links">
                    <Link href="/runs" className="px-4 py-2 bg-mplp-dark-soft hover:bg-mplp-blue/10 border border-mplp-border/30 rounded-lg text-sm text-mplp-text hover:text-mplp-blue-soft transition-colors">
                        ← All Runs
                    </Link>
                    <Link href="/rulesets" className="px-4 py-2 bg-mplp-dark-soft hover:bg-mplp-blue/10 border border-mplp-border/30 rounded-lg text-sm text-mplp-text hover:text-mplp-blue-soft transition-colors">
                        Rulesets
                    </Link>
                    <Link href="/releases" className="px-4 py-2 bg-mplp-dark-soft hover:bg-mplp-blue/10 border border-mplp-border/30 rounded-lg text-sm text-mplp-text hover:text-mplp-blue-soft transition-colors">
                        Releases
                    </Link>
                </nav>

                {/* About doclet */}
                <div className="prose prose-invert prose-sm max-w-none text-mplp-text-muted/80">
                    <h3>About this Runset</h3>
                    <p>
                        A Runset is a snapshot of evidence packs at a specific point in time.
                        The content here reflects the state of the <code>{runset.source === 'v1' ? 'curated-runs.json' : 'v2/runs/index.json'}</code> source file.
                    </p>
                </div>
            </div>
        </>
    );
}
