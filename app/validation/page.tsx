/**
 * Validation Dashboard Page
 * 
 * Hub for "Institutional Integrity" and "Governance Gates".
 * All links derived from lab-manifest.json (SSOT).
 */

import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';
import globalAlignment from '@/public/_meta/global-alignment.json';
import gateStatus from '@/public/_meta/gates/gate-status.json';
import { Shield, CheckCircle, AlertTriangle, XCircle, Layers, GitBranch, Terminal } from 'lucide-react';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { SmartLink } from '@/components/common/SmartLink';
import { SemanticStatusBadge } from '@/components/common/SemanticStatusBadge';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

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

export const metadata: Metadata = {
    title: 'Validation Dashboard — MPLP Validation Lab',
    description: 'Protocol alignment, governance gates, and structural integrity status for the MPLP Validation Lab.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/validation`,
    },
};

export default function ValidationDashboard() {
    const labVersion = labManifest.lab_series;
    const status = gateStatus as unknown as GateStatus;
    const gates = status.gates;

    return (
        <div className="pt-8 max-w-5xl px-4 mx-auto pb-20">
            {/* Header */}
            <header className="mb-12">
                <div className="flex items-center gap-2 text-mplp-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">
                    <SmartLink anchor="lab_anchor" className="hover:text-mplp-blue-soft transition-colors">Home</SmartLink>
                    <span>/</span>
                    <span className="text-mplp-text">Validation Dashboard</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-4">Validation Dashboard</h1>
                <div className="flex flex-wrap gap-4 mb-6">
                    <SemanticStatusBadge status="UNAVAILABLE" className="opacity-80" />
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Shield size={10} />
                        Publication Integrity Verified
                    </div>
                </div>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Authoritative status of Protocol alignment and automated Publication Integrity gates.
                    This release ({labVersion}) is cryptographically anchored and audited.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* Governance Gates Section */}
                    <section className="p-8 rounded-3xl bg-mplp-dark-soft/30 border border-mplp-border/40">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-mplp-border/30">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                    <CheckCircle size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-mplp-text">Governance Gates (SEAL)</h2>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            {gates.map((gate: Gate) => (
                                <div key={gate.id} className="flex items-center gap-4 p-4 rounded-2xl bg-mplp-dark/40 border border-mplp-border/20 group hover:border-mplp-blue-soft/30 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <p className="text-xs font-bold text-mplp-text">{gate.id}</p>
                                            <SemanticStatusBadge status={gate.status} />
                                        </div>
                                        <p className="text-[10px] text-mplp-text-muted uppercase tracking-tighter">{gate.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebars strictly derived from SSOT */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="p-6 rounded-3xl bg-glass border border-mplp-blue-soft/20 shadow-xl shadow-mplp-blue-soft/5">
                        <h3 className="text-sm font-bold text-mplp-text mb-6 flex items-center gap-2">
                            <Layers size={16} className="text-mplp-blue-soft" />
                            Validation Products
                        </h3>

                        <div className="space-y-4">
                            <SmartLink anchor="cross_verified" className="block p-4 rounded-2xl bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 group hover:bg-mplp-blue-soft/20 transition-all text-left">
                                <h4 className="font-bold text-mplp-text text-sm mb-1">Cross-Framework Equivalence</h4>
                                <SemanticStatusBadge status="PENDING_NORMALIZATION" className="mt-2" />
                            </SmartLink>

                            <SmartLink anchor="fmm" className="block p-4 rounded-2xl bg-mplp-dark/60 border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all text-left">
                                <h4 className="font-bold text-mplp-text text-sm mb-1">Field Mapping Matrix (FMM)</h4>
                                <SemanticStatusBadge status="UNAVAILABLE" className="mt-2" />
                            </SmartLink>
                        </div>

                        <div className="mt-8 pt-6 border-t border-mplp-border/30">
                            <h3 className="text-xs font-bold text-mplp-text mb-4 flex items-center gap-2">
                                <Terminal size={14} className="text-mplp-text-muted" />
                                Institutional Anchors
                            </h3>
                            <div className="p-3 rounded-xl bg-mplp-blue-soft/5 border border-mplp-blue-soft/20">
                                <SmartLink anchor="repo_anchor" showExternalIcon className="text-[10px] font-bold text-mplp-blue-soft hover:underline flex items-center gap-1">
                                    View Master Repository
                                </SmartLink>
                            </div>
                            <div className="mt-4">
                                <DisclaimerBox kind="non_certification" />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
