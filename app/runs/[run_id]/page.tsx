/**
 * Unified Run Detail Page
 * 
 * Dispatches to V1 or V2 detail renderer based on run source.
 * Supports both V1 curated-runs and V2 real runner packs.
 * 
 * Ticket: VLAB-MERGE-P0-ROUTE-02
 */

import { getRunById, loadAllRuns } from '@/lib/unified/load-all-runs';
import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import Link from 'next/link';
import { RunSummaryCard } from './_components/RunSummaryCard';
import { VerificationPanel } from './_components/VerificationPanel';
import { RulesetEvaluationSection } from './_components/RulesetEvaluationSection';
import { EvidencePackBrowser } from './_components/EvidencePackBrowser';
import { GovernancePanel } from './_components/GovernancePanel';
import { MappingProjectionPanel } from '../_components/MappingProjectionPanel';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';
import runMappingIndex from '@/public/_data/run-mapping-index.json';

// GATE-06: Default to noindex for run detail pages
export const metadata = {
    robots: { index: false, follow: false }
};

// Required for fs-based loaders (loadRunBundle, etc.)
export const runtime = 'nodejs';

// Generate static params for both V1 and V2 runs
export async function generateStaticParams() {
    const data = loadAllRuns();
    return data.runs.map(run => ({ run_id: run.id }));
}

// Tier badge component for V2 runs
function TierBadge({ tier }: { tier: string }) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        DISPUTE_READY: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dispute Ready' },
        REPRODUCED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Reproduced' },
        SIMULATED: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Simulated' },
        DECLARED: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Declared' },
    };
    const style = styles[tier] || styles.DECLARED;
    return (
        <span className={`px-2 py-0.5 text-xs font-mono rounded ${style.bg} ${style.text} border border-current/20`}>
            {style.label}
        </span>
    );
}

// V2 Run Detail Stub (minimal renderer until full V2 components are wired)
function V2RunDetail({ run }: { run: any }) {
    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header with back link */}
            <div className="flex items-center justify-between">
                <Link
                    href="/runs?tier=REPRODUCED"
                    className="text-sm text-mplp-text-muted hover:text-mplp-text transition-colors"
                >
                    ← Back to Real Runs
                </Link>
                <TierBadge tier={run.tier} />
            </div>

            {/* Run Summary */}
            <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                <h1 className="text-2xl font-bold text-mplp-text mb-4">{run.id}</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Source</div>
                        <div className="text-sm font-bold text-purple-400">V2 Real Runner</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Substrate</div>
                        <div className="text-sm font-mono text-mplp-text">{run.substrate}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Verdict</div>
                        <div className={`text-sm font-bold ${run.verdict === 'PASS' ? 'text-emerald-400' : run.verdict === 'FAIL' ? 'text-red-400' : 'text-zinc-400'}`}>
                            {run.verdict}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Tier</div>
                        <TierBadge tier={run.tier} />
                    </div>
                </div>
            </div>

            {/* Interop Stack (V2-specific) */}
            {run.interop_stack && run.interop_stack.length > 0 && (
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                    <h2 className="text-lg font-bold text-mplp-text mb-4">Interoperability Stack</h2>
                    <div className="flex flex-wrap gap-2">
                        {run.interop_stack.map((item: string) => (
                            <span key={item} className="px-3 py-1 text-sm font-mono bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Evidence Surfaces (V2-specific) */}
            {run.surfaces && Object.keys(run.surfaces).length > 0 && (
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                    <h2 className="text-lg font-bold text-mplp-text mb-4">Evidence Surfaces</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(run.surfaces).map(([surface, present]) => (
                            <div key={surface} className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${present ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                                <span className="text-sm font-mono text-mplp-text-muted">{surface}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Evidence Links */}
            <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                <h2 className="text-lg font-bold text-mplp-text mb-4">Evidence Pack</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    V2 evidence packs are stored in <code className="px-1 py-0.5 bg-mplp-dark-soft rounded text-xs">public/_data/v2/runs/</code>
                </p>
                <div className="flex gap-4">
                    <a
                        href={`/api/v2/runs/${run.id}`}
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-mplp-blue text-white hover:bg-mplp-blue/80 transition-colors"
                    >
                        View JSON
                    </a>
                    <a
                        href={`/api/v2/runs/${run.id}/evidence`}
                        className="px-4 py-2 text-sm font-bold rounded-lg bg-transparent border border-mplp-border text-mplp-text-muted hover:bg-white/5 transition-colors"
                    >
                        Download Evidence
                    </a>
                </div>
            </div>

            {/* Tier Disclaimer */}
            <div className="pl-4 border-l-2 border-mplp-border/50">
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-mplp-text">Tier: {run.tier}</strong> — This run was produced by a V2 real runner and contains
                    {run.tier === 'REPRODUCED' ? ' independently reproducible evidence.' :
                        run.tier === 'DISPUTE_READY' ? ' evidence ready for formal dispute resolution via FMM.' :
                            ' declared evidence (not yet reproduced).'}
                </p>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-mplp-border/30">
                <Link
                    href="/runs"
                    className="text-sm text-mplp-text-muted hover:text-mplp-text transition-colors"
                >
                    ← Back to All Runs
                </Link>
            </div>
        </div>
    );
}

export default async function RunDetailPage({ params }: { params: Promise<{ run_id: string }> }) {
    const { run_id } = await params;

    // First check unified index for the run
    const unifiedRun = getRunById(run_id);

    if (!unifiedRun) {
        // Run not found - return friendly not found page instead of throwing
        return (
            <div className="container max-w-6xl mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold text-mplp-text mb-4">Run Not Found</h1>
                <p className="text-mplp-text-muted mb-8">
                    The run <code className="px-2 py-1 bg-mplp-dark-soft rounded font-mono">{run_id}</code> was not found in either V1 or V2 data sources.
                </p>
                <Link
                    href="/runs"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-mplp-blue text-white rounded-lg hover:bg-mplp-blue/80 transition-colors"
                >
                    Browse All Runs
                </Link>
            </div>
        );
    }

    // Dispatch based on source
    if (unifiedRun.source === 'v2') {
        // V2 runs use the simplified V2 renderer
        return <V2RunDetail run={unifiedRun} />;
    }

    // V1 runs use the existing detailed renderer
    const data = getCuratedRuns();
    const run = data.runs.find(r => r.run_id === run_id);

    if (!run) {
        // This shouldn't happen if unified loader is correct, but handle gracefully
        return <V2RunDetail run={unifiedRun} />;
    }

    // Determine if this is a ruleset-1.1 run (v0.3 arbitration pack)
    const isRuleset11 = run.ruleset_version === 'ruleset-1.1' || run_id.toLowerCase().startsWith('arb-');

    // Find mapping index entry for this run
    const mappingEntry = runMappingIndex.runs.find((r: any) => r.run_id === run_id) || null;

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
            {/* Header with tier badge for V1 runs */}
            <div className="flex items-center justify-between">
                <Link
                    href="/runs?tier=SIMULATED"
                    className="text-sm text-mplp-text-muted hover:text-mplp-text transition-colors"
                >
                    ← Back to Simulated Runs
                </Link>
                <div className="flex items-center gap-4">
                    <TierBadge tier="SIMULATED" />
                    <Link
                        href={`/runs/${run.run_id}/replay`}
                        className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg bg-mplp-blue-soft/10 border border-mplp-blue-soft/30 text-mplp-blue-soft hover:bg-mplp-blue-soft/20 hover:border-mplp-blue-soft/50 transition-all"
                    >
                        View Replay →
                    </Link>
                </div>
            </div>
            <RunSummaryCard run={run} />
            <VerificationPanel run={run} />

            {/* Ruleset-1.1 Four-Domain Evaluation (v0.3 arbitration packs) */}
            {isRuleset11 && (
                <RulesetEvaluationSection runId={run.run_id} />
            )}

            {/* P0: Mapping & Projection Panel */}
            <MappingProjectionPanel runId={run.run_id} mappingIndex={mappingEntry} />

            <EvidencePackBrowser runId={run.run_id} />
            <GovernancePanel />
            <ProvenanceFooter ssot={data.ssot} />
        </div>
    );
}
