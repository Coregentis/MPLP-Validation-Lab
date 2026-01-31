/**
 * Cross-Verified Prototypes Page
 * 
 * SSOT: All links and terms bound to lab-manifest.json.
 * ALIGNMENT FINALITY: Neutral status normalization for phased v1.0 release.
 */

import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { SmartLink } from '@/components/common/SmartLink';
import { SemanticStatusBadge } from '@/components/common/SemanticStatusBadge';
import { AlertTriangle } from 'lucide-react';
import crossVerifiedReport from '@/public/_data/cross-verified/v0.10.2-report.json';

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
    generated_at: string;
    ruleset_version: string;
    core_elements_version: string;
    entries: ReportEntry[];
    equivalence_matrix: EquivalenceMatrix[];
    disclaimer: string;
}

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Cross-Verified Prototypes — MPLP Validation Lab',
    description: 'Evidence projection equivalence across substrates. v0.10 series cross-verification report.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/cross-verified`,
    },
};

export default function CrossVerifiedPage() {
    const labVersion = labManifest.lab_series;
    const report = crossVerifiedReport as unknown as CrossVerifiedReport;
    const totalPairs = report.equivalence_matrix.length;
    const equivalentCount = report.equivalence_matrix.filter((m: EquivalenceMatrix) => m.equivalent).length;
    const equivalenceRate = ((equivalentCount / totalPairs) * 100).toFixed(1);

    return (
        <div className="pt-8 max-w-6xl px-4 mx-auto pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <SmartLink anchor="lab_anchor" className="hover:text-mplp-blue-soft transition-colors">Home</SmartLink>
                    <span>/</span>
                    <SmartLink anchor="validation_hub" className="hover:text-mplp-blue-soft transition-colors text-mplp-text">Validation</SmartLink>
                    <span>/</span>
                    <span className="text-mplp-text">Cross-Framework Equivalence</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Cross-Framework Equivalence</h1>
                <div className="flex items-center gap-4 mb-6 text-[10px]">
                    <SemanticStatusBadge status="CONFORMANCE_CLAIM" />
                    <span className="px-2 py-1 bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 text-mplp-blue-soft rounded font-bold uppercase tracking-wider">{labVersion}</span>
                </div>
                <p className="max-w-3xl text-mplp-text-muted leading-relaxed mb-8">
                    Equivalence measures evidence projection similarity across different substrates.
                    This report surfaces the delta between implementations for identical domain scenarios.
                </p>

                <DisclaimerBox kind="equivalence" className="mb-4" />

                <div className="p-6 rounded-2xl bg-mplp-blue-soft/5 border border-mplp-blue-soft/20 mb-8 mt-4">
                    <div className="flex items-center gap-3 mb-3 text-mplp-blue-soft">
                        <AlertTriangle size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Normalization Strategy</h3>
                    </div>
                    <p className="text-xs text-mplp-text-muted leading-relaxed mb-4">
                        <strong>Current Match Rate: {equivalenceRate}%</strong>.
                        Neutral status is <span className="text-mplp-text font-bold text-amber-500/80">expected</span> in this series
                        as substrate-specific representations are still migrating toward the <SmartLink anchor="validation_hub" className="text-mplp-blue-soft hover:underline font-bold">Normalization Spec</SmartLink>.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-xl bg-black/20 border border-mplp-border/20 text-[10px] text-mplp-text-muted font-mono">
                        <div><span className="font-bold text-mplp-text uppercase">SHA256:</span> {labManifest.anchors.cross_verified_report_sha256.substring(0, 16)}...</div>
                        <div><span className="font-bold text-mplp-text uppercase">Commit:</span> {labManifest.baseline_commit_sha.substring(0, 8)}</div>
                    </div>
                </div>
            </header>

            <section className="mb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                    <h2 className="text-xl font-bold text-mplp-text">Equivalence Matrix</h2>
                    <span className="text-[10px] font-mono text-mplp-text-muted">{report.generated_at}</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-mplp-border/40 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">
                                <th className="px-6 py-4">Scenario Family</th>
                                <th className="px-6 py-4">L-Substrate</th>
                                <th className="px-6 py-4">R-Substrate</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Evidence</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mplp-border/30 text-13">
                            {report.equivalence_matrix.map((matrix, i) => {
                                const left = report.entries.find(e => e.run_id === matrix.left_run_id);
                                const right = report.entries.find(e => e.run_id === matrix.right_run_id);
                                return (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-[11px] text-mplp-blue-soft">{left?.scenario_family || "generic"}</td>
                                        <td className="px-6 py-4 text-mplp-text font-medium">{left?.substrate}</td>
                                        <td className="px-6 py-4 text-mplp-text font-medium">{right?.substrate}</td>
                                        <td className="px-6 py-4 leading-none">
                                            <SemanticStatusBadge status={matrix.equivalent ? 'PASS' : 'PENDING_NORMALIZATION'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <SmartLink anchor="runs" id={matrix.left_run_id} className="text-mplp-blue-soft hover:underline text-[11px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Pack ↗
                                            </SmartLink>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="mt-12 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-wider">
                <SmartLink anchor="validation_hub" className="text-mplp-text hover:text-mplp-blue-soft">← Validation Hub</SmartLink>
                <SmartLink anchor="fmm" className="text-mplp-text-muted hover:text-mplp-blue-soft">Field Mapping Matrix →</SmartLink>
            </div>
        </div>
    );
}
