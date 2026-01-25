/**
 * Cross-Verified Prototypes Page
 * 
 * P1 FIX-01: Create anchor target for lab-manifest.json
 * 
 * This page surfaces the cross-verified evidence outputs from v0.10 series:
 * - Cross-verified report (v0.10.2-report.json)
 * - Equivalence diffs (per scenario family)
 * - Normalized evidence packs
 * 
 * GOVERNANCE: This is a pointer page, not a capability claim.
 * Equivalence = evidence projection similarity, NOT endorsement/certification.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { AlertTriangle } from 'lucide-react';
import crossVerifiedReport from '@/public/_data/cross-verified/v0.10.2-report.json';

// Types for the report
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
    description: 'Evidence projection equivalence across substrates. v0.10 series cross-verification report and normalized diffs. Not a certification or endorsement.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/cross-verified`,
    },
    robots: {
        index: true,
        follow: true,
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
            {/* Header / Policy Section */}
            <div className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Link href="/" className="hover:text-mplp-blue-soft transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/validation" className="hover:text-mplp-blue-soft transition-colors text-mplp-text">Validation</Link>
                    <span>/</span>
                    <span className="text-mplp-text">Cross-Framework Equivalence</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Cross-Framework Equivalence</h1>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-2 py-1 bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 text-mplp-blue-soft rounded text-[10px] font-bold uppercase tracking-wider">{labVersion}</span>
                    <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wider">Report Viewer (Non-Authoritative)</span>
                </div>
                <p className="max-w-3xl text-mplp-text-muted leading-relaxed mb-8">
                    Equivalence measures evidence projection similarity across different substrates (frameworks) under versioned rulesets.
                    This report surfaces the delta between implementations for the same domain scenarios.
                </p>

                {/* Critical Disclaimer - Policy Boundary */}
                <DisclaimerBox kind="equivalence" className="mb-4" />

                {/* Interpretability Guardrail - P4.1 Hardening */}
                <div className="p-6 rounded-2xl bg-mplp-blue-soft/5 border border-mplp-blue-soft/20 mb-8 mt-4">
                    <div className="flex items-center gap-3 mb-3 text-mplp-blue-soft">
                        <AlertTriangle size={18} />
                        <h3 className="text-sm font-bold uppercase tracking-widest">Interpretability Guardrail</h3>
                    </div>
                    <p className="text-xs text-mplp-text-muted leading-relaxed mb-4">
                        <strong>Current Equivalence Rate: {equivalenceRate}%</strong>. This metric measures evidence-projection similarity.
                        Non-equivalence (FALSE) is <span className="text-mplp-text font-bold text-amber-500/80">expected</span> in this series
                        as substrate-specific representations are still migrating toward the <Link href="/validation" className="text-mplp-blue-soft hover:underline">Normalization Spec</Link>.
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 p-3 rounded-xl bg-black/20 border border-mplp-border/20">
                        <div className="text-[10px] text-mplp-text-muted">
                            <span className="font-bold text-mplp-text uppercase">Anchor:</span> {labManifest.anchors.cross_verified_report}
                        </div>
                        <div className="text-[10px] text-mplp-text-muted">
                            <span className="font-bold text-mplp-text uppercase">SHA256:</span> {labManifest.anchors.cross_verified_report_sha256.substring(0, 16)}...
                        </div>
                        <div className="text-[10px] text-mplp-text-muted">
                            <span className="font-bold text-mplp-text uppercase">Commit:</span> <span className="font-mono">{labManifest.baseline_commit_sha.substring(0, 8)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-500/80 italic mb-12">
                    {report.disclaimer}
                </div>

                {/* Report Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                        <p className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest mb-1">Total Pairs</p>
                        <p className="text-2xl font-bold text-mplp-text">{totalPairs}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                        <p className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest mb-1">Rate</p>
                        <p className="text-2xl font-bold text-mplp-text">{equivalenceRate}%</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                        <p className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest mb-1">Ruleset</p>
                        <p className="text-lg font-bold text-mplp-blue-soft">{report.ruleset_version}</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                        <p className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest mb-1">Core Spec</p>
                        <p className="text-lg font-bold text-mplp-text">{report.core_elements_version}</p>
                    </div>
                </div>
            </div>

            {/* Equivalence Matrix Section */}
            <section className="mb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                    <h2 className="text-xl font-bold text-mplp-text">Equivalence Matrix</h2>
                    <span className="text-[10px] font-mono text-mplp-text-muted">{report.generated_at}</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-mplp-border/40">
                                <th className="px-6 py-4 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Scenario Family</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">L-Substrate</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">R-Substrate</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Equivalent</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mplp-border/30 text-13">
                            {report.equivalence_matrix.map((matrix: EquivalenceMatrix, i: number) => {
                                const left = report.entries.find((e: ReportEntry) => e.run_id === matrix.left_run_id);
                                const right = report.entries.find((e: ReportEntry) => e.run_id === matrix.right_run_id);
                                return (
                                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded bg-mplp-blue-soft/10 text-mplp-blue-soft text-[11px] font-mono border border-mplp-blue-soft/20">
                                                {left?.scenario_family || "generic"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-mplp-text font-medium">{left?.substrate}</td>
                                        <td className="px-6 py-4 text-mplp-text font-medium">{right?.substrate}</td>
                                        <td className="px-6 py-4">
                                            {matrix.equivalent ? (
                                                <span className="text-emerald-500 flex items-center gap-1.5 font-bold">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    TRUE
                                                </span>
                                            ) : (
                                                <span className="text-mplp-text-muted/60 flex items-center gap-1.5 grayscale opacity-50 italic">
                                                    FALSE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/api/reports/diff?ref=${matrix.diff_ref}`}
                                                target="_blank"
                                                className="text-mplp-blue-soft hover:text-mplp-blue-light flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                View Diff ↗
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p className="mt-8 text-xs text-mplp-text-muted italic max-w-2xl">
                    Note: Non-equivalence (FALSE) is expected until substrate normalization converges.
                    View <Link href="/validation" className="text-mplp-blue-soft hover:underline">Normalization Spec</Link> to understand the mapping methodology.
                </p>
            </section>

            {/* Evidence Artifacts Pointers */}
            <section className="mb-20">
                <h2 className="text-lg font-bold text-mplp-text mb-6">Machine-Readable Artifacts</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <h3 className="font-bold text-mplp-text text-sm mb-2">Primary Report</h3>
                        <code className="text-[10px] text-mplp-blue-soft/80 bg-black/30 p-2 block rounded mb-3 truncate">
                            v0.10.2-report.json
                        </code>
                        <p className="text-[10px] text-mplp-text-muted">Master summary of all scenario families and substrates.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <h3 className="font-bold text-mplp-text text-sm mb-2">Equivalence Diffs</h3>
                        <code className="text-[10px] text-mplp-blue-soft/80 bg-black/30 p-2 block rounded mb-3 truncate">
                            diffs/**/*.json
                        </code>
                        <p className="text-[10px] text-mplp-text-muted">Deep JSON diffs highlighting field-level implementation variance.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <h3 className="font-bold text-mplp-text text-sm mb-2">Normalized Packs</h3>
                        <code className="text-[10px] text-mplp-blue-soft/80 bg-black/30 p-2 block rounded mb-3 truncate">
                            data/derived/normalized/
                        </code>
                        <p className="text-[10px] text-mplp-text-muted">Substrate-agnostic lifecycle event data (Canonical Scale).</p>
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
                <Link href="/validation" className="text-mplp-text hover:text-mplp-blue-soft transition-colors">
                    ← Validation Hub
                </Link>
                <Link href="/policies/fmm" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Field Mapping Matrix →
                </Link>
                <Link href="/rulesets" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Rulesets →
                </Link>
            </div>
        </div>
    );
}
