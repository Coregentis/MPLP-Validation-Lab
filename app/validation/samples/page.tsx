/**
 * Evidence Samples Gallery (MUST-1)
 * 
 * Showcases "Same-Scale" equivalence pairs across substrates.
 * Demonstrates semantic projection consistency.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import crossVerifiedReport from '@/public/_data/cross-verified/v0.10.2-report.json';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { CheckCircle, ArrowRightLeft, FileJson, AlertTriangle } from 'lucide-react';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Evidence Gallery — MPLP Validation Lab',
    description: 'MUST-1: Cross-substrate same-scale evidence samples comparing identical scenarios.',
};

interface ReportEntry {
    run_id: string;
    substrate: string;
    scenario_family: string;
    normalized_hash: string;
    verdict_status: string;
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

    // Filter for "Hero Samples" (Equivalent pairs)
    const heroSamples = report.equivalence_matrix.filter(m => m.equivalent);

    return (
        <div className="pt-8 max-w-5xl px-4 mx-auto pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Link href="/validation" className="hover:text-mplp-blue-soft transition-colors">Validation</Link>
                    <span>/</span>
                    <span className="text-mplp-text">Evidence Gallery</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-4">Evidence Gallery (MUST-1)</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Compare identical scenarios across different frameworks (substrates).
                    These samples demonstrate semantic equivalence despite substrate-specific evidence representations.
                </p>
            </header>

            <DisclaimerBox kind="equivalence" className="mb-12" />

            <div className="space-y-8">
                {heroSamples.map((sample, i) => {
                    const left = report.entries.find(e => e.run_id === sample.left_run_id);
                    const right = report.entries.find(e => e.run_id === sample.right_run_id);

                    if (!left || !right) return null;

                    return (
                        <div key={i} className="p-8 rounded-3xl bg-mplp-dark-soft/30 border border-mplp-border/40 overflow-hidden relative">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                {/* Left Substrate */}
                                <div className="flex-1 w-full">
                                    <div className="text-[10px] font-bold text-mplp-blue-soft uppercase tracking-widest mb-2">{left.substrate}</div>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-mplp-border/20">
                                        <p className="font-mono text-xs text-mplp-text truncate mb-1">{left.run_id}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted">
                                            <CheckCircle size={10} className="text-emerald-500" />
                                            <span>Admission: PASS</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Comparison Icon */}
                                <div className="p-3 rounded-full bg-mplp-blue-soft/10 text-mplp-blue-soft shrink-0">
                                    <ArrowRightLeft size={20} />
                                </div>

                                {/* Right Substrate */}
                                <div className="flex-1 w-full text-right md:text-left">
                                    <div className="text-[10px] font-bold text-mplp-blue-soft uppercase tracking-widest mb-2 md:text-right">{right.substrate}</div>
                                    <div className="p-4 rounded-2xl bg-black/40 border border-mplp-border/20">
                                        <p className="font-mono text-xs text-mplp-text truncate mb-1">{right.run_id}</p>
                                        <div className="flex items-center gap-2 text-[10px] text-mplp-text-muted justify-end">
                                            <CheckCircle size={10} className="text-emerald-500" />
                                            <span>Admission: PASS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-mplp-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                        Equivalent Result
                                    </span>
                                    <span className="text-[10px] text-mplp-text-muted uppercase tracking-widest">{left.scenario_family}</span>
                                </div>
                                <div className="flex gap-4">
                                    <a
                                        href={`https://lab.mplp.io/public/_data/cross-verified/${sample.diff_ref}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-mplp-blue-soft/10 text-mplp-blue-soft text-xs font-bold hover:bg-mplp-blue-soft/20 transition-all border border-mplp-blue-soft/20"
                                    >
                                        <FileJson size={14} />
                                        View Semantic Diff
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {heroSamples.length === 0 && (
                    <div className="p-12 text-center rounded-3xl border border-dashed border-mplp-border/40 text-mplp-text-muted">
                        <AlertTriangle className="mx-auto mb-4 opacity-40" size={32} />
                        <p className="text-sm font-medium">No hero equivalence samples available in the current series.</p>
                        <p className="text-xs mt-1">Check back as normalization convergence increases.</p>
                    </div>
                )}
            </div>

            {/* Same-Scale Explanation */}
            <section className="mt-20 p-8 rounded-3xl bg-glass border border-mplp-border/20">
                <h2 className="text-xl font-bold text-mplp-text mb-4">About Same-Scale Samples</h2>
                <p className="text-sm text-mplp-text-muted leading-relaxed mb-6">
                    MUST-1 ensures that the Validation Lab can compare disparate agent frameworks on an identical scale.
                    While substrate code structure varies, the <strong>Protocol Evidence Extension</strong> maps internal events to canonical MPLP elements.
                </p>
                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="p-4 rounded-xl bg-black/20">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 1</h3>
                        <p className="text-[10px] text-mplp-text-muted">Substrate events are captured via framework-specific observers.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 2</h3>
                        <p className="text-[10px] text-mplp-text-muted">Fields are normalized using the Field Mapping Matrix (FMM).</p>
                    </div>
                    <div className="p-4 rounded-xl bg-black/20">
                        <h3 className="text-xs font-bold text-mplp-text mb-2 uppercase tracking-wider">Step 3</h3>
                        <p className="text-[10px] text-mplp-text-muted">A semantic hash is computed protecting Lifecycle Invariants.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
