import type { CuratedRunRecord } from '@/lib/curated/types';

export function RunSummaryCard({ run }: { run: CuratedRunRecord }) {
    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-mplp-text mb-6">{run.run_id}</h1>

            <dl className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-1">Substrate</dt>
                    <dd className="text-sm font-semibold text-mplp-text">{run.substrate}</dd>
                </div>
                <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-1">Claim Level</dt>
                    <dd className="mt-1">
                        {run.substrate_claim_level === 'reproduced' ? (
                            <span className="bg-mplp-emerald/20 text-mplp-emerald px-2.5 py-1 rounded-full text-xs font-bold">
                                Reproduced ✓
                            </span>
                        ) : (
                            <span className="bg-mplp-text-muted/10 text-mplp-text-muted px-2.5 py-1 rounded-full text-xs font-bold">
                                Declared (Specimen)
                            </span>
                        )}
                        <div className="text-[11px] text-mplp-text-muted/60 mt-2 font-mono">
                            Exec: {run.substrate_execution} / Inf: {run.inference_mode}
                        </div>
                    </dd>
                </div>
                <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-1">Scenario</dt>
                    <dd className="text-sm font-semibold text-mplp-text">{run.scenario_id}</dd>
                </div>
                <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-1">Ruleset</dt>
                    <dd className="text-sm text-mplp-text">
                        <span className="font-semibold">{run.ruleset_version}</span>
                        <span className="text-xs text-mplp-text-muted ml-2">(presence-level)</span>
                    </dd>
                </div>
            </dl>
        </section>
    );
}
