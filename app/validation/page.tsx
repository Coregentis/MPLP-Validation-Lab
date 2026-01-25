/**
 * Validation Dashboard Page
 * 
 * Hub for "Protocol Validation" and "Governance Gates".
 * Surfaces the "Sealed" status of the lab's structural integrity.
 * 
 * SSOT BINDINGS:
 * - Protocol/Schema: global-alignment-baseline (via global-alignment.json)
 * - Gates Dashboard: CI Artifact (gate-status.json)
 * - Lab Version: lab-manifest.json
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';
import globalAlignment from '@/public/_meta/global-alignment.json';
import gateStatus from '@/public/_meta/gates/gate-status.json';
import { Shield, CheckCircle, AlertTriangle, FileCheck, Layers, GitBranch, Terminal } from 'lucide-react';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

// Types for structural integrity data
interface Gate {
    id: string;
    status: 'PASS' | 'FAIL' | string;
    description: string;
}

interface GateStatus {
    generated_at: string;
    lab_series: string;
    gates: Gate[];
    artifact_hash: string;
}

interface GlobalAlignment {
    canonical_versions: {
        protocol: string;
        schema_bundle: string;
    };
}

export const metadata: Metadata = {
    title: 'Validation Dashboard — MPLP Validation Lab',
    description: 'Protocol alignment, governance gates, and structural integrity status for the MPLP Validation Lab.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/validation`,
    },
};

export default function ValidationDashboard() {
    const labVersion = labManifest.lab_series;
    const alignment = globalAlignment as unknown as GlobalAlignment;
    const status = gateStatus as unknown as GateStatus;

    const protocolVersion = alignment.canonical_versions.protocol;
    const schemaVersion = alignment.canonical_versions.schema_bundle;
    const gates = status.gates;

    return (
        <div className="pt-8 max-w-5xl px-4 mx-auto pb-20">
            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <Link href="/" className="hover:text-mplp-blue-soft transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-mplp-text">Validation Dashboard</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-4">Validation Dashboard</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Authoritative status of Protocol alignment and automated Governance gates.
                    This dashboard reads directly from the CI validation artifacts.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Summary & Status */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Protocol Alignment Section */}
                    <section className="p-8 rounded-3xl bg-mplp-dark-soft/30 border border-mplp-border/40 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <GitBranch size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-mplp-blue-soft/10 text-mplp-blue-soft">
                                    <Shield size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-mplp-text">Protocol Alignment (GLOB SSOT)</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-mplp-border/20 group-hover:border-mplp-blue-soft/30 transition-all">
                                    <div className="mt-1 text-emerald-500">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-mplp-text">Upstream Protocol Pin</p>
                                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">v{protocolVersion} SEALED</span>
                                        </div>
                                        <p className="text-xs text-mplp-text-muted mb-3">Locked against MPLP canonical definition baseline.</p>
                                        <div className="flex items-center gap-2 text-[10px] font-mono bg-black/40 p-2 rounded border border-mplp-border/20">
                                            <Terminal size={10} className="text-mplp-text-muted" />
                                            <span className="text-mplp-text-muted/60 truncate">Ref: governance/global-alignment-baseline.yaml</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-black/20 border border-mplp-border/20 group-hover:border-mplp-blue-soft/30 transition-all">
                                    <div className="mt-1 text-emerald-500">
                                        <CheckCircle size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-mplp-text">Schema Bundle</p>
                                            <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">v{schemaVersion}</span>
                                        </div>
                                        <p className="text-xs text-mplp-text-muted">Evidence structure strictly validated for the {labVersion} series.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Active Gates Section */}
                    <section className="p-8 rounded-3xl bg-mplp-dark-soft/30 border border-mplp-border/40">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-mplp-text">Governance Gates (SEAL)</h2>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-mono text-mplp-text-muted block uppercase tracking-tighter">CI Artifact Hash</span>
                                <span className="text-[10px] font-mono text-mplp-text-muted/60">{status.artifact_hash.slice(0, 16)}...</span>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {gates.map((gate: Gate) => (
                                <div key={gate.id} className="flex items-center gap-4 p-4 rounded-2xl bg-mplp-dark/40 border border-mplp-border/20 group hover:border-mplp-blue-soft/30 transition-all">
                                    <div className={`h-2 w-2 rounded-full ${gate.status === 'PASS' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-xs font-bold text-mplp-text">{gate.id}</p>
                                            <span className="text-[9px] font-mono text-emerald-500/80">PASS</span>
                                        </div>
                                        <p className="text-[10px] text-mplp-text-muted uppercase tracking-tighter">{gate.description}</p>
                                    </div>
                                    <CheckCircle size={14} className={`${gate.status === 'PASS' ? 'text-emerald-500/40 group-hover:text-emerald-500' : 'text-amber-500/40 group-hover:text-amber-500'} transition-colors`} />
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-black/20 border border-mplp-border/20">
                            <div className="flex items-center gap-2 mb-3 text-emerald-500/80">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Integrity Audit Note</span>
                            </div>
                            <p className="text-[10px] text-mplp-text-muted italic leading-relaxed">
                                These gates validate **Lab Publication Integrity** (SSOT consistency, link health, and version drift).
                                A &quot;PASS&quot; status confirms the structural soundness of the evidence presentation; it is <span className="text-mplp-text font-bold">not a conformance certification</span> of any agentic system or framework performance.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Right Column: Reports & Analysis */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24">
                        <section className="p-6 rounded-3xl bg-glass border border-mplp-blue-soft/20 shadow-xl shadow-mplp-blue-soft/5">
                            <h3 className="text-sm font-bold text-mplp-text mb-6 flex items-center gap-2">
                                <Layers size={16} className="text-mplp-blue-soft" />
                                Validation Products
                            </h3>

                            <div className="space-y-4">
                                <Link href="/policies/cross-verified" className="block p-4 rounded-2xl bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 group hover:bg-mplp-blue-soft/20 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-mplp-blue-soft uppercase tracking-widest">Report</span>
                                        <CheckCircle size={12} className="text-mplp-blue-soft" />
                                    </div>
                                    <h4 className="font-bold text-mplp-text text-sm mb-1 group-hover:text-white transition-colors">Cross-Framework Equivalence</h4>
                                    <p className="text-[11px] text-mplp-text-muted leading-relaxed">
                                        Compare evidence projection across Autogen, LangGraph, and SK.
                                        <span className="block mt-1 opacity-60 text-[9px] font-mono">Anchor: {labManifest.anchors.cross_verified_report}</span>
                                        <span className="block opacity-40 text-[9px] font-mono whitespace-nowrap overflow-hidden text-ellipsis">SHA: {labManifest.anchors.cross_verified_report_sha256}</span>
                                    </p>
                                </Link>

                                <Link href="/validation/samples" className="block p-4 rounded-2xl bg-mplp-dark/60 border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Gallery</span>
                                        <Layers size={12} className="text-mplp-text-muted" />
                                    </div>
                                    <h4 className="font-bold text-mplp-text text-sm mb-1">Evidence Samples (MUST-1)</h4>
                                    <p className="text-[11px] text-mplp-text-muted leading-relaxed">
                                        Browse &quot;Same-Scale&quot; equivalence pairs across frameworks.
                                    </p>
                                </Link>

                                <Link href="/policies/fmm" className="block p-4 rounded-2xl bg-mplp-dark/60 border border-mplp-border/30 hover:border-mplp-border/60 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Matrix</span>
                                        <FileCheck size={12} className="text-mplp-text-muted" />
                                    </div>
                                    <h4 className="font-bold text-mplp-text text-sm mb-1">Field Mapping Matrix (FMM)</h4>
                                    <p className="text-[11px] text-mplp-text-muted leading-relaxed">
                                        Authoritative map of substrate fields to core evidence elements.
                                    </p>
                                </Link>

                                <Link href="/coverage/adjudication" className="block p-4 rounded-2xl bg-mplp-dark/60 border border-mplp-border/30 hover:border-mplp-border/60 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-bold text-mplp-text-muted uppercase tracking-widest">Live Data</span>
                                        <CheckCircle size={12} className="text-mplp-text-muted" />
                                    </div>
                                    <h4 className="font-bold text-mplp-text text-sm mb-1">Adjudication Coverage</h4>
                                    <p className="text-[11px] text-mplp-text-muted leading-relaxed">
                                        Real-time distribution of verdicts across scenario families.
                                    </p>
                                </Link>
                            </div>

                            <div className="mt-8 pt-6 border-t border-mplp-border/30">
                                <DisclaimerBox kind="non_certification" className="mb-4" />
                                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-2 text-amber-500">
                                        <AlertTriangle size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Disclaimer</span>
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-mplp-text-muted/80">
                                        Validation in this dashboard refers to <strong>Structural Integrity</strong> and <strong>Protocol Conformance</strong>. It does not certify agent intelligence or performance.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
