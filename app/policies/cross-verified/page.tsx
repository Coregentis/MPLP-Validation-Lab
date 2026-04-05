/**
 * Cross-Verified Prototypes Page
 * 
 * Runtime report data comes from cross-verified report JSON; manifest anchors provide stable navigation metadata.
 * This page is a source-bound projection over that report and must not imply
 * stronger proof than the report's own fields support.
 */

import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';
import { SmartLink } from '@/components/common/SmartLink';
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
    title: 'Cross-Verification Report — MPLP Validation Lab',
    description: 'Source-bound cross-verification report snapshot from the v0.10 series. No equivalence proof is implied by this page alone.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/cross-verified`,
    },
};

export default function CrossVerifiedPage() {
    const labVersion = labManifest.lab_series;
    const report = crossVerifiedReport as unknown as CrossVerifiedReport;
    const totalPairs = report.equivalence_matrix.length;
    const unknownStatusCount = report.entries.filter((entry) =>
        entry.verdict_status === 'unknown' || entry.admission_status === 'unknown'
    ).length;

    return (
        <div className="pt-8 max-w-6xl px-4 mx-auto pb-20">
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <SmartLink anchor="lab_anchor" className="hover:text-mplp-blue-soft transition-colors">Home</SmartLink>
                    <span>/</span>
                    <SmartLink anchor="validation_hub" className="hover:text-mplp-blue-soft transition-colors text-mplp-text">Validation</SmartLink>
                    <span>/</span>
                    <span className="text-mplp-text">Cross-Verification Report</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Cross-Verification Report</h1>
                <div className="flex items-center gap-4 mb-6 text-[10px]">
                    <span className="px-2 py-1 bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 text-mplp-blue-soft rounded font-bold uppercase tracking-wider">{labVersion}</span>
                </div>
                <p className="max-w-3xl text-mplp-text-muted leading-relaxed mb-8">
                    Source-bound projection over a historical cross-verification report.
                    This page exposes report rows and report metadata; it does not convert unknown-status comparisons into equivalence proof or official verdict authority.
                </p>

                <div className="p-6 rounded-2xl bg-mplp-blue-soft/5 border border-mplp-blue-soft/20 mb-8 mt-4">
                    <div className="flex items-center gap-3 mb-3 text-mplp-blue-soft">
                        <AlertTriangle size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Source Boundary</h3>
                    </div>
                    <p className="text-xs text-mplp-text-muted leading-relaxed mb-4">
                        This report currently contains <strong>{totalPairs} comparison rows</strong> and <strong>{unknownStatusCount} entries with unknown verdict/admission status</strong>.
                        Because the underlying report does not carry resolved verdict/admission status, this page does not present equivalence proof or a public &quot;match rate&quot; claim.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-xl bg-black/20 border border-mplp-border/20 text-[10px] text-mplp-text-muted font-mono">
                        <div><span className="font-bold text-mplp-text uppercase">Ruleset:</span> {report.ruleset_version}</div>
                        <div><span className="font-bold text-mplp-text uppercase">Rows:</span> {totalPairs}</div>
                        <div><span className="font-bold text-mplp-text uppercase">SHA256:</span> {labManifest.anchors.cross_verified_report_sha256.substring(0, 16)}...</div>
                        <div><span className="font-bold text-mplp-text uppercase">Commit:</span> {labManifest.baseline_commit_sha.substring(0, 8)}</div>
                    </div>
                </div>
            </header>

            <section className="mb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                    <h2 className="text-xl font-bold text-mplp-text">Comparison Matrix (Report Snapshot)</h2>
                    <span className="text-[10px] font-mono text-mplp-text-muted">{report.generated_at}</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-mplp-border/40 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">
                                <th className="px-6 py-4">Scenario Family</th>
                                <th className="px-6 py-4">L-Substrate</th>
                                <th className="px-6 py-4">R-Substrate</th>
                                <th className="px-6 py-4">Report Status</th>
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
                                            <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-mplp-dark-soft text-mplp-text-muted border border-mplp-border/40">
                                                {left?.verdict_status === 'unknown' || right?.verdict_status === 'unknown'
                                                    ? 'source statuses unknown'
                                                    : matrix.equivalent
                                                        ? 'reported match flag'
                                                        : 'reported delta flag'}
                                            </span>
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
