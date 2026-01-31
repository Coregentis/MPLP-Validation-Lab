import { Metadata } from 'next';
import { getRulesetDiffIndex } from '@/lib/rulesets/loadDiff';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { SmartLink } from '@/components/common/SmartLink';
import { SemanticStatusBadge } from '@/components/common/SemanticStatusBadge';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Ruleset Evolution — MPLP Validation Lab',
    description: 'Track adjudication deltas and projection shifts between ruleset versions.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/rulesets/evolution`,
    },
};

export default function EvolutionHubPage() {
    const { diffs } = getRulesetDiffIndex();

    return (
        <div className="pt-8 space-y-12">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Governance Track</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Ruleset Evolution</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Institutional Explainability: Ruleset evolution is machine-verified and forensic in nature.
                    These metrics describe the structural shift in evaluation logic between bit-identical ruleset versions.
                </p>
            </div>

            <DisclaimerBox kind="non_certification" variant="amber" fullWidth>
                <p className="text-[11px] mt-2 opacity-70">
                    Evolution metrics describe the shift in deterministic outcomes between two logic sets; they do not represent framework &quot;performance&quot; or vendor-relative ordering.
                </p>
            </DisclaimerBox>

            <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60">Logic Delta Sets</h2>

                {diffs.length === 0 ? (
                    <div className="p-12 text-center bg-glass border border-mplp-border/30 rounded-2xl">
                        <SemanticStatusBadge status="UNAVAILABLE" className="mb-4" />
                        <p className="text-mplp-text-muted">No ruleset evolution data available for the v1.0 frozen series.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {diffs.map((diff) => (
                            <SmartLink
                                key={diff.diff_id}
                                anchor="ruleset_diff_base"
                                id={diff.diff_id}
                                className="group block p-8 bg-glass border border-mplp-border/40 rounded-2xl hover:border-mplp-blue-soft/40 transition-all relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                    <div className="text-6xl font-black italic select-none">Δ</div>
                                </div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="text-lg font-bold text-mplp-text tracking-tight flex items-center gap-2">
                                            <span>{diff.from_ruleset}</span>
                                            <span className="text-mplp-text-muted opacity-40">→</span>
                                            <span className="text-mplp-blue-soft">{diff.to_ruleset}</span>
                                        </div>
                                    </div>

                                    {/* Metrics Highlights */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-mplp-text-muted font-bold">Verdict Flips</p>
                                            <p className={`text-2xl font-mono ${diff.metrics.verdict_flips > 0 ? 'text-amber-400' : 'text-mplp-text opacity-40'}`}>
                                                {diff.metrics.verdict_flips}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase tracking-widest text-mplp-text-muted font-bold">Equiv. Shift</p>
                                            <p className={`text-2xl font-mono ${diff.metrics.equivalence_shift?.delta !== 0 ? 'text-blue-400' : 'text-mplp-text opacity-40'}`}>
                                                {diff.metrics.equivalence_shift?.delta > 0 ? '+' : ''}{diff.metrics.equivalence_shift?.delta || 0}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-mplp-border/30">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[9px] uppercase tracking-widest text-mplp-text-muted/60 font-bold">Baseline Anchor</p>
                                            <p className="text-[10px] font-mono text-mplp-text-muted">{diff.baseline_commit_sha.substring(0, 12)}</p>
                                        </div>
                                        <span className="text-mplp-blue-soft opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                            View Details →
                                        </span>
                                    </div>
                                </div>
                            </SmartLink>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
