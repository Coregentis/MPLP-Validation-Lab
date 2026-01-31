import { notFound } from 'next/navigation';
import { getRulesetDiff, getRulesetDiffPack } from '@/lib/rulesets/loadDiff';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { SmartLink } from '@/components/common/SmartLink';
import { SemanticStatusBadge } from '@/components/common/SemanticStatusBadge';

interface DiffDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function DiffDetailPage({ params }: DiffDetailPageProps) {
    const { id } = await params;
    const diff = getRulesetDiff(id);

    if (!diff) {
        notFound();
    }

    const diffpack = getRulesetDiffPack(diff.path);
    if (!diffpack) {
        return (
            <div className="pt-24 text-center">
                <h1 className="text-2xl font-bold text-mplp-text">DiffPack Data Missing</h1>
                <p className="text-mplp-text-muted mt-2">The underlying JSON asset for {id} could not be loaded.</p>
                <SmartLink anchor="ruleset_evolution_hub" className="inline-block mt-8 text-mplp-blue-soft hover:underline">
                    ← Return to Hub
                </SmartLink>
            </div>
        );
    }

    // Normalize metrics to handle both old and new diffpack schema
    const verdictFlips = diffpack.metrics.verdict_flips ?? diffpack.metrics.verdict_flips_total ?? 0;
    const equivalenceShift = diffpack.metrics.equivalence_shift;
    const totalRuns = diffpack.metrics.total_runs ?? 0;
    const clausesChanged = diffpack.clauses_changed ?? diffpack.logic_diff ?? [];

    return (
        <div className="pt-8 space-y-12 pb-24">
            {/* Header */}
            <div>
                <nav className="mb-8">
                    <SmartLink anchor="ruleset_evolution_hub" className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 hover:text-mplp-blue-soft transition-colors flex items-center gap-2">
                        ← Evolution Hub
                    </SmartLink>
                </nav>
                <h1 className="text-3xl font-bold text-mplp-text mb-4">
                    {diff.from_ruleset} <span className="text-mplp-text-muted opacity-40 mx-2">→</span> {diff.to_ruleset}
                </h1>
                <p className="text-mplp-text-muted max-w-2xl leading-relaxed">
                    Detailed analysis of adjudication deltas between ruleset versions. All results are derived from the locked shadow-verification baseline.
                </p>
            </div>

            <DisclaimerBox kind="non_certification" variant="zinc" fullWidth />

            {/* Metrics Triad */}
            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-glass border border-mplp-border/30 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted/60">Verdict Flips</p>
                    <p className="text-3xl font-mono text-mplp-text">{verdictFlips}</p>
                    <p className="text-[10px] text-mplp-text-muted italic">Total PASS/FAIL status changes</p>
                </div>
                <div className="p-6 bg-glass border border-mplp-border/30 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted/60">Equivalence Shift</p>
                    {equivalenceShift ? (
                        <>
                            <p className="text-3xl font-mono text-mplp-text">
                                {equivalenceShift.from_rate} <span className="text-sm opacity-40">→</span> {equivalenceShift.to_rate}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted italic">
                                <span>Delta:</span>
                                <span className={equivalenceShift.delta > 0 ? 'text-blue-400' : equivalenceShift.delta < 0 ? 'text-amber-400' : ''}>
                                    {equivalenceShift.delta > 0 ? '+' : ''}{equivalenceShift.delta}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <SemanticStatusBadge status="UNAVAILABLE" />
                            <p className="text-[10px] text-mplp-text-muted italic">Data not available for this diffpack version</p>
                        </>
                    )}
                </div>
                <div className="p-6 bg-glass border border-mplp-border/30 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted/60">Sample Density</p>
                    <p className="text-3xl font-mono text-mplp-text">{totalRuns}</p>
                    <p className="text-[10px] text-mplp-text-muted italic">Runs in shadow-verification set</p>
                </div>
            </div>

            {/* Clauses Changed Table */}
            <div className="space-y-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60">Rule Delta Matrix</h2>
                <div className="overflow-x-auto rounded-xl border border-mplp-border/30">
                    <table className="w-full text-left border-collapse bg-glass">
                        <thead>
                            <tr className="bg-mplp-dark-soft/50 border-b border-mplp-border/30">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-mplp-text-muted">Clause / Type</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-mplp-text-muted">Rationale & Technical Impact</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-mplp-text-muted whitespace-nowrap">Evidence Refs</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mplp-border/20">
                            {clausesChanged.map((clause: any) => (
                                <tr key={clause.clause_id} className="hover:bg-mplp-blue-soft/5 transition-colors group">
                                    <td className="px-6 py-6 align-top">
                                        <div className="space-y-2">
                                            <p className="font-bold text-sm text-mplp-text">{clause.clause_id}</p>
                                            <SemanticStatusBadge status={clause.change_type === 'added' ? 'PASS' : clause.change_type === 'removed' ? 'FAIL' : 'UNAVAILABLE'} className="!text-[8px] uppercase" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="space-y-4 max-w-xl">
                                            <p className="text-sm text-mplp-text leading-relaxed font-medium">
                                                {clause.rationale}
                                            </p>
                                            {clause.code_delta && (
                                                <p className="text-[10px] text-mplp-text-muted font-mono bg-black/20 p-2 rounded">
                                                    {clause.code_delta}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            {(clause.evidence_refs || []).map((ref: string) => (
                                                <SmartLink
                                                    key={ref}
                                                    anchor="runs"
                                                    id={ref}
                                                    className="text-[11px] text-mplp-blue-soft hover:underline font-mono truncate max-w-[160px]"
                                                >
                                                    {ref.includes('/') ? `📄 ${ref.split('/').pop()}` : `🏷️ ${ref}`}
                                                </SmartLink>
                                            ))}
                                            {(!clause.evidence_refs || clause.evidence_refs.length === 0) && (
                                                <span className="text-[10px] text-mplp-text-muted italic">—</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
