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
import { V2RunDetailModel, loadV2RunDetail } from '@/lib/v2/evidence/load-run-evidence-model';
import { EvidenceActions } from '@/components/evidence/EvidenceActions';

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
        <Link href="/runs#legend" className="inline-block" title="What does this tier mean?">
            <span className={`px-2 py-0.5 text-xs font-mono rounded ${style.bg} ${style.text} border border-current/20 hover:opacity-80 transition-opacity`}>
                {style.label}
            </span>
        </Link>
    );
}

// V2 Run Detail Renderer (Full Parity)
function V2RunDetail({ run }: { run: V2RunDetailModel }) {
    return (
        <div className="space-y-6">
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
            <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-summary">
                <h1 className="text-2xl font-bold text-mplp-text mb-4">{run.id}</h1>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div data-testid="run-validates">
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Validates</div>
                        <div className="text-sm font-bold text-mplp-text">{run.scenario || 'General validation'}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Source</div>
                        <div className="text-sm font-bold text-purple-400">V2 Real Runner</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Host</div>
                        <div className="text-sm font-mono text-mplp-text">{run.substrate}</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Verdict</div>
                        <div
                            className={`text-sm font-bold ${run.verdict === 'PASS' ? 'text-emerald-400' : run.verdict === 'FAIL' ? 'text-red-400' : 'text-zinc-400'}`}
                            data-testid="verdict"
                        >
                            {run.verdict}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Date</div>
                        <div className="text-sm font-mono text-mplp-text">{new Date(run.timestamp).toISOString().split('T')[0]}</div>
                    </div>
                </div>
            </div>

            {/* Interop Stack */}
            {run.interop_stack && run.interop_stack.length > 0 && (
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-stack">
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

            {/* Evidence Surfaces */}
            {run.surfaces && Object.keys(run.surfaces).length > 0 && (
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-surfaces">
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

            {/* Determinism & Provenance (New Parity Section) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-provenance">
                    <h2 className="text-lg font-bold text-mplp-text mb-4 flex items-center gap-2">
                        <span className="text-emerald-400">🛡️</span> Runner Provenance
                    </h2>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-mplp-text-muted">Build ID</dt>
                            <dd className="font-mono text-mplp-text">{run.runner_seal?.build_id || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-mplp-text-muted">Digest</dt>
                            <dd className="font-mono text-mplp-text truncate max-w-[200px]" title={run.runner_seal?.image_digest}>{run.runner_seal?.image_digest || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-mplp-text-muted">Sealed</dt>
                            <dd className="font-mono text-mplp-text">{run.runner_seal?.sealed_at ? new Date(run.runner_seal.sealed_at).toLocaleString() : 'N/A'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-determinism">
                    <h2 className="text-lg font-bold text-mplp-text mb-4 flex items-center gap-2">
                        <span className="text-blue-400">⚖️</span> Determinism
                    </h2>
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-mplp-text-muted">Canonical Pointers</dt>
                            <dd className="font-mono text-mplp-text">{run.determinism?.canonical_count ?? 0}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-mplp-text-muted">Verdict Hash</dt>
                            <dd className="font-mono text-mplp-text truncate max-w-[200px]">{run.determinism?.verdict_hash || <span className="text-zinc-500 italic">NOT EVALUATED</span>}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Ruleset Adjudication (New Parity Section) */}
            {run.ruleset && (
                <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-ruleset">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-mplp-text">Adjudication</h2>
                        <Link
                            href={`/rulesets/${run.ruleset.version}`}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
                            data-testid="run-ruleset"
                        >
                            {run.ruleset.version} →
                        </Link>
                    </div>
                    {run.ruleset.clauses_triggered.length > 0 ? (
                        <div className="flex flex-wrap gap-2" data-testid="run-triggered-clauses">
                            {run.ruleset.clauses_triggered.map(c => (
                                <span key={c} className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-sm font-mono">
                                    {c}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-mplp-text-muted italic">No verification clauses triggered (Clean Pass)</div>
                    )}
                </div>
            )}

            {/* Evidence Chain - How to Verify This Run */}
            <div className="bg-gradient-to-r from-emerald-500/5 to-mplp-blue/5 rounded-2xl p-6 border border-mplp-border/30" data-testid="run-evidence-chain">
                <h2 className="text-lg font-bold text-mplp-text mb-4 flex items-center gap-2">
                    <span className="text-emerald-400">🔍</span> Verify This Run
                </h2>
                <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-xs font-bold flex items-center justify-center shrink-0">1</span>
                        <span className="text-mplp-text-muted">Download the evidence pack using the buttons above</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-xs font-bold flex items-center justify-center shrink-0">2</span>
                        <div>
                            <span className="text-mplp-text-muted">Run locally: </span>
                            <code className="bg-black/30 px-2 py-0.5 rounded text-xs font-mono text-mplp-text">npm run vlab:recheck-hash {run.id}</code>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">✓</span>
                        <span className="text-mplp-text-muted">Compare verdict hash with <Link href="/releases" className="text-mplp-blue-soft hover:underline">Release Seals</Link></span>
                    </li>
                </ol>
                {run.determinism?.verdict_hash && (
                    <div className="mt-4 p-3 bg-black/20 rounded-lg">
                        <div className="text-xs uppercase tracking-wider text-mplp-text-muted mb-1">Expected Verdict Hash</div>
                        <div className="font-mono text-sm text-mplp-text break-all">{run.determinism.verdict_hash}</div>
                    </div>
                )}
            </div>

            {/* Evidence Pack Files (Improved) */}
            <div className="bg-glass rounded-2xl p-6 border border-mplp-border/30" data-testid="v2-section-files">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-mplp-text">Evidence Pack Content</h2>
                    <div className="flex gap-2">
                        <EvidenceActions runId={run.id} source="v2" variant="minimal" />
                    </div>
                </div>
                <div className="space-y-2">
                    {run.files.map(f => (
                        <div key={f.name} className="flex items-center justify-between p-2 rounded bg-white/5 mx-[-8px]">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{f.type === 'json' ? '📄' : '📦'}</span>
                                <span className="text-sm font-mono text-mplp-text">{f.name}</span>
                            </div>
                            <span className="text-xs font-mono text-mplp-text-muted">{(f.size / 1024).toFixed(1)} KB</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-xs text-mplp-text-muted">
                    Source: <code className="px-1 py-0.5 bg-mplp-dark-soft rounded">public/_data/v2/runs/</code>
                </div>
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
        const v2Model = loadV2RunDetail(run_id);
        if (!v2Model) {
            return <div>Error loading V2 Evidence Model</div>;
        }
        return <V2RunDetail run={v2Model} />;
    }

    // V1 runs use the existing detailed renderer
    const data = getCuratedRuns();
    const run = data.runs.find(r => r.run_id === run_id);

    if (!run) {
        // This shouldn't happen if unified loader is correct, but handle gracefully
        return <V2RunDetail run={unifiedRun as unknown as V2RunDetailModel} />;
    }

    // Determine if this is a ruleset-1.1 run (v0.3 arbitration pack)
    const isRuleset11 = run.ruleset_version === 'ruleset-1.1' || run_id.toLowerCase().startsWith('arb-');

    // Find mapping index entry for this run
    const mappingEntry = runMappingIndex.runs.find((r: { run_id: string }) => r.run_id === run_id) || null;

    return (
        <div className="space-y-6">
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
                    <EvidenceActions runId={run.run_id} source="v1" variant="header" />
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
