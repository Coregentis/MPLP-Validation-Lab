import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { CuratedRunsTable } from './_components/CuratedRunsTable';
import { ScenarioAwareBanner } from './_components/ScenarioAwareBanner';
import { RunsStatusSummary } from './_components/RunsStatusSummary';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';
import Link from 'next/link';

export const metadata = {
    title: 'Curated Runs | MPLP Validation Lab',
    description: 'Vendor-neutral evidence packs for third-party verification',
    robots: { index: false, follow: false }
};

export default function RunsPage() {
    const data = getCuratedRuns();

    // Split runs into v0.2 (ruleset-1.0 / GF), v0.3 (ruleset-1.1), and v0.4 (ruleset-1.2)
    const v02Runs = data.runs.filter(r => !r.run_id.startsWith('arb-'));
    const v03Runs = data.runs.filter(r => r.run_id.startsWith('arb-') && r.run_id.endsWith('-v0.3'));
    const v04Runs = data.runs.filter(r => r.run_id.startsWith('arb-') && r.run_id.endsWith('-v0.4'));

    // Count adjudicated runs (those with adjudication_status === 'ADJUDICATED')
    const adjudicatedCount = data.runs.filter(r => {
        const adjStatus = (r as unknown as Record<string, unknown>).adjudication_status;
        return adjStatus === 'ADJUDICATED';
    }).length;
    const totalRuns = data.runs.length;
    const pendingCount = totalRuns - adjudicatedCount;

    return (
        <div className="pt-8">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Resources</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Curated Runs</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Vendor-neutral evidence packs for third-party verification.
                    Packs are evaluated against their declared ruleset and can be
                    independently recomputed locally.
                </p>
            </div>

            {/* Status Summary Bar */}
            <RunsStatusSummary
                totalRuns={totalRuns}
                adjudicatedCount={adjudicatedCount}
                pendingCount={pendingCount}
            />

            <ScenarioAwareBanner />

            {/* Scope Clarification - Updated for v0.4 */}
            <div className="mb-10 pl-4 border-l-2 border-mplp-border/50">
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-mplp-text font-semibold uppercase tracking-wider text-xs mr-2">Scope Note</strong>
                    <code className="px-1.5 py-0.5 rounded bg-mplp-dark-soft border border-mplp-border/40 text-xs font-mono text-mplp-text-muted">NOT_ADJUDICATED</code> indicates the run has no applicable ruleset reference or lacks required artifacts for its declared ruleset.
                    v0.4 packs use <code className="px-1.5 py-0.5 rounded bg-mplp-dark-soft border border-mplp-border/40 text-xs font-mono text-mplp-text-muted">ruleset-1.2</code> with 12 semantic invariant clauses.
                </p>
            </div>

            {/* v0.4 Semantic Invariant Packs (Four-Domain) */}
            {v04Runs.length > 0 && (
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-mplp-text">Semantic Invariant Packs (v0.4)</h2>
                            <span className="px-2 py-0.5 text-xs font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">ruleset-1.2</span>
                        </div>
                        <code className="hidden sm:block text-xs text-mplp-text-muted/60 font-mono">12 clauses · 4 domains</code>
                    </div>

                    <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30 mb-12">
                        <CuratedRunsTable runs={v04Runs} />
                    </div>
                </section>
            )}

            {/* v0.3 Arbitration Packs (Four-Domain) */}
            {v03Runs.length > 0 && (
                <section className="mt-8">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                        <div className="flex items-center gap-3">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-mplp-text">Four-Domain Packs (v0.3)</h2>
                            <span className="px-2 py-0.5 text-xs font-mono rounded bg-green-500/10 text-green-400 border border-green-500/20">ruleset-1.1</span>
                        </div>
                        <code className="hidden sm:block text-xs text-mplp-text-muted/60 font-mono">D1/D2/D3/D4 domains</code>
                    </div>

                    <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30 mb-12">
                        <CuratedRunsTable runs={v03Runs} />
                    </div>
                </section>
            )}

            {/* v0.2 GoldenFlow Packs */}
            <section className="mt-8">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-mplp-text">GoldenFlow Packs (v0.2)</h2>
                        <span className="px-2 py-0.5 text-xs font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">ruleset-1.0</span>
                    </div>
                    <code className="hidden sm:block text-xs text-mplp-text-muted/60 font-mono">npm run vlab:recheck-hash</code>
                </div>

                <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30">
                    <CuratedRunsTable runs={v02Runs} />
                </div>
            </section>

            <div className="mt-16 pt-8 border-t border-mplp-border/30">
                <ProvenanceFooter ssot={data.ssot} />
            </div>
        </div>
    );
}

