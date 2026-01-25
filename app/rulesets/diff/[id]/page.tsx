import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRulesetDiff, getRulesetDiffPack } from '@/lib/rulesets/loadDiff';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { resolveEvidenceRef, getEvolutionHubPath } from '@/lib/ssot/url-resolver';

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
                <Link href={getEvolutionHubPath()} className="inline-block mt-8 text-mplp-blue-soft hover:underline">
                    ← Return to Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-8 space-y-12 pb-24">
            {/* Header */}
            <div>
                <nav className="mb-8">
                    <Link href={getEvolutionHubPath()} className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 hover:text-mplp-blue-soft transition-colors flex items-center gap-2">
                        ← Evolution Hub
                    </Link>
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
                    <p className="text-3xl font-mono text-mplp-text">{diffpack.metrics.verdict_flips}</p>
                    <p className="text-[10px] text-mplp-text-muted italic">Total PASS/FAIL status changes</p>
                </div>
                <div className="p-6 bg-glass border border-mplp-border/30 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted/60">Equivalence Shift</p>
                    <p className="text-3xl font-mono text-mplp-text">
                        {diffpack.metrics.equivalence_shift.from_rate} <span className="text-sm opacity-40">→</span> {diffpack.metrics.equivalence_shift.to_rate}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted italic">
                        <span>Delta:</span>
                        <span className={diffpack.metrics.equivalence_shift.delta > 0 ? 'text-blue-400' : diffpack.metrics.equivalence_shift.delta < 0 ? 'text-amber-400' : ''}>
                            {diffpack.metrics.equivalence_shift.delta > 0 ? '+' : ''}{diffpack.metrics.equivalence_shift.delta}
                        </span>
                    </div>
                </div>
                <div className="p-6 bg-glass border border-mplp-border/30 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted/60">Sample Density</p>
                    <p className="text-3xl font-mono text-mplp-text">{diffpack.metrics.total_runs}</p>
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
                            {diffpack.clauses_changed.map((clause: any) => (
                                <tr key={clause.clause_id} className="hover:bg-mplp-blue-soft/5 transition-colors group">
                                    <td className="px-6 py-6 align-top">
                                        <div className="space-y-2">
                                            <p className="font-bold text-sm text-mplp-text">{clause.clause_id}</p>
                                            <span className={`inline-block px-2 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-wider border ${clause.change_type === 'added' ? 'bg-blue-950/40 text-blue-400 border-blue-800/50' :
                                                    clause.change_type === 'removed' ? 'bg-amber-950/40 text-amber-400 border-amber-800/50' :
                                                        'bg-zinc-800 text-zinc-400 border-zinc-700'
                                                }`}>
                                                {clause.change_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="space-y-4 max-w-xl">
                                            <p className="text-sm text-mplp-text leading-relaxed font-medium">
                                                {clause.rationale}
                                            </p>
                                            <div className="space-y-2 pt-4 border-t border-mplp-border/10">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-mplp-text-muted/40">Expected Impact</p>
                                                <p className="text-[11px] text-mplp-text-muted leading-relaxed">
                                                    {clause.expected_impact}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-mplp-text-muted/40">Affected Field Pointers</p>
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {clause.affected_evidence_pointers.map((ptr: string) => (
                                                        <code key={ptr} className="text-[10px] bg-mplp-dark-soft px-2 py-0.5 rounded text-mplp-text-muted border border-mplp-border/30">
                                                            {ptr}
                                                        </code>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 align-top">
                                        <div className="flex flex-col gap-2 min-w-[140px]">
                                            {(clause.evidence_refs || []).map((ref: string) => (
                                                <Link
                                                    key={ref}
                                                    href={resolveEvidenceRef(ref)}
                                                    className="text-[11px] text-mplp-blue-soft hover:underline font-mono truncate max-w-[160px]"
                                                    title={ref}
                                                >
                                                    {ref.includes('/') ? `📄 ${ref.split('/').pop()}` : `🏷️ ${ref}`}
                                                </Link>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reproduction Triad */}
            <div className="p-8 bg-mplp-dark-soft/30 border border-mplp-border/20 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-mplp-text-muted mb-6">Evolution Triad — Reprod. Integrity</h3>
                <div className="grid gap-6 md:grid-cols-2 text-[11px]">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="uppercase tracking-widest text-mplp-text-muted/50 font-bold">DiffPack Hash (SHA256)</p>
                            <code className="text-mplp-text/80 break-all">{diff.diffpack_hash}</code>
                        </div>
                        <div className="space-y-1">
                            <p className="uppercase tracking-widest text-mplp-text-muted/50 font-bold">Baseline Commit SHA</p>
                            <code className="text-mplp-text/80">{diff.baseline_commit_sha}</code>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="uppercase tracking-widest text-mplp-text-muted/50 font-bold">Shadow Input Hook</p>
                            <code className="text-mplp-text/80 break-all">{diff.shadow_input_sha256}</code>
                        </div>
                        <div className="space-y-1">
                            <p className="uppercase tracking-widest text-mplp-text-muted/50 font-bold">Reproduction Command</p>
                            <code className="text-mplp-blue-soft/80">npm run derive:shadow -- --from {diff.from_ruleset} --to {diff.to_ruleset}</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
