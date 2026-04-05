/**
 * Evidence Pair Gallery
 * 
 * Source-bound projection over the historical cross-verified report.
 * This page only promotes pairs when the bound report also carries non-unknown
 * verdict/admission status for both sides.
 */

import type { Metadata } from 'next';
import crossVerifiedReport from '@/public/_data/cross-verified/v0.10.2-report.json';
import { ArrowRightLeft, FileJson } from 'lucide-react';
import { SmartLink } from '@/components/common/SmartLink';
import { SemanticStatusBadge } from '@/components/common/SemanticStatusBadge';



export const metadata: Metadata = {
    title: 'Evidence Gallery — MPLP Validation Lab',
    description: 'Source-bound evidence pair gallery from the historical cross-verified report. No equivalence proof is implied by this page alone.',
};

interface ReportEntry {
    run_id: string;
    substrate: string;
    scenario_family: string;
    normalized_hash: string;
    verdict_status: string;
    admission_status: string;
}

interface EquivalenceMatrix {
    left_run_id: string;
    right_run_id: string;
    equivalent: boolean;
    diff_ref: string;
}

interface CrossVerifiedReport {
    entries: ReportEntry[];
    equivalence_matrix: EquivalenceMatrix[];
}

export default function EvidenceGallery() {
    const report = crossVerifiedReport as unknown as CrossVerifiedReport;

    const heroSamples = report.equivalence_matrix.filter((m) => {
        const left = report.entries.find((e) => e.run_id === m.left_run_id);
        const right = report.entries.find((e) => e.run_id === m.right_run_id);
        if (!m.equivalent || !left || !right) return false;
        return left.verdict_status !== 'unknown'
            && right.verdict_status !== 'unknown'
            && left.admission_status !== 'unknown'
            && right.admission_status !== 'unknown';
    });
    const hasSamples = heroSamples.length > 0;

    return (
        <div className="pt-8 max-w-5xl px-4 mx-auto pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <SmartLink anchor="validation_hub" className="hover:text-mplp-blue-soft transition-colors text-mplp-text-muted">Validation</SmartLink>
                    <span>/</span>
                    <span className="text-mplp-text text-mplp-text-muted">Evidence Gallery</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-4">
                    Evidence Pair Gallery {!hasSamples && '— No promotable pairs yet'}
                </h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Source-bound snapshot over the historical cross-verified report.
                    This page only promotes pairs when both sides carry non-unknown verdict and admission status in the bound report.
                </p>
            </header>

            <div className="mb-12 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mb-2">
                    Source Boundary
                </p>
                <p className="text-sm text-mplp-text-muted">
                    The current bound report remains a historical comparison snapshot. Unknown verdict or admission status means this page must not present the pair as verified equivalence or proof.
                </p>
            </div>

            <div className="space-y-8">
                {heroSamples.map((sample, i) => {
                    const left = report.entries.find(e => e.run_id === sample.left_run_id);
                    const right = report.entries.find(e => e.run_id === sample.right_run_id);

                    if (!left || !right) return null;

                    return (
                        <div key={i} className="p-8 rounded-3xl bg-mplp-dark-soft/30 border border-mplp-border/40 overflow-hidden relative">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1 w-full">
                                    <div className="text-[10px] font-bold text-mplp-blue-soft uppercase tracking-widest mb-2">{left.substrate}</div>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-mplp-border/20">
                                        <p className="font-mono text-xs text-mplp-text truncate mb-1">{left.run_id}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted">
                                            <span>Admission: {left.admission_status}</span>
                                            <span>•</span>
                                            <span>Verdict: {left.verdict_status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 rounded-full bg-mplp-blue-soft/10 text-mplp-blue-soft shrink-0">
                                    <ArrowRightLeft size={20} />
                                </div>
                                <div className="flex-1 w-full text-right md:text-left">
                                    <div className="text-[10px] font-bold text-mplp-blue-soft uppercase tracking-widest mb-2 md:text-right">{right.substrate}</div>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-mplp-border/20">
                                        <p className="font-mono text-xs text-mplp-text truncate mb-1">{right.run_id}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted justify-end">
                                            <span>Admission: {right.admission_status}</span>
                                            <span>•</span>
                                            <span>Verdict: {right.verdict_status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-mplp-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <SemanticStatusBadge status="UNAVAILABLE" />
                                    <span className="text-[10px] text-mplp-text-muted uppercase tracking-widest">Resolved comparison pair: {left.scenario_family}</span>
                                </div>
                                <div className="flex gap-4">
                                    <SmartLink
                                        anchor="cross_verified"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mplp-blue-soft/10 text-mplp-blue-soft text-xs font-bold hover:bg-mplp-blue-soft/20 transition-all border border-mplp-blue-soft/20"
                                    >
                                        <FileJson size={14} />
                                        View Semantic Diff
                                    </SmartLink>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!hasSamples && (
                    <div className="p-16 text-center rounded-3xl border border-dashed border-mplp-border/30 bg-mplp-dark-soft/5">
                        <SemanticStatusBadge status="PENDING_NORMALIZATION" className="mb-4 inline-block" />
                        <p className="text-sm font-bold text-mplp-text mb-2 tracking-tight transition-all">Normalization Convergence in Progress</p>
                        <p className="text-xs text-mplp-text-muted max-w-sm mx-auto leading-relaxed">
                            No public pair currently qualifies as a front-door example.
                            The bound report keeps comparison rows at unknown verdict/admission status, so this page does not promote any pair as equivalence proof.
                        </p>
                        <div className="mt-8">
                            <SmartLink anchor="repo_anchor" className="text-mplp-blue-soft text-xs font-bold hover:underline">
                                How to produce the first sample →
                            </SmartLink>
                        </div>
                    </div>
                )}
            </div>

            <section className="mt-20 p-8 rounded-3xl bg-glass border border-mplp-border/20">
                <h2 className="text-xl font-bold text-mplp-text mb-4">How to Read This Snapshot</h2>
                <p className="text-sm text-mplp-text-muted leading-relaxed mb-6">
                    Historical labels such as <code>MUST-1</code> or &quot;same-scale&quot; remain lineage context only.
                    The current public page is a source-bound comparison snapshot, not an equivalence constitution.
                </p>
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-black/20 font-mono">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 1: Read the report</h3>
                        <p className="text-[10px] text-mplp-text-muted">Treat the comparison matrix as historical report output.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 font-mono">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 2: Check status fields</h3>
                        <p className="text-[10px] text-mplp-text-muted">Unknown verdict/admission status blocks stronger public proof language.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20 font-mono">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 3: Follow source links</h3>
                        <p className="text-[10px] text-mplp-text-muted">Use the report, runs, and rulesets together before making any interpretation claim.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
