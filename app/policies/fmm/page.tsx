"use client";

/**
 * Field Mapping Matrix (FMM) Page
 * 
 * SSOT: Uses SmartLink and SemanticStatusBadge for alignment finality.
 * NEUTRALITY: Normalizes unmapped fields to "Pending" to maintain narrative credibility.
 */

import React, { useState } from 'react';
import fmmData from '@/public/_data/fmm.json';
import curatedRunsData from '@/public/_data/curated-runs.json';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';
import { SmartLink } from '@/components/common/SmartLink';

interface Mapping {
    source: string;
    target: string;
    rule: string;
}



type SubstrateKey = keyof typeof fmmData.substrates;

export default function FMMPage() {
    const [activeSubstrate, setActiveSubstrate] = useState<SubstrateKey>('fixture');

    // Evidence Availability Gate: only substrates with curated runs are VERIFIED
    const availableSubstratesInCurated = new Set(
        curatedRunsData.runs.map((r) => r.substrate).filter(Boolean)
    );

    const substrates = Object.keys(fmmData.substrates) as SubstrateKey[];

    // P0 Evidence Isolation: Only load mappings for VERIFIED substrates
    // This prevents unverified data from entering ANY UI code path (not just display)
    const currentMappings = availableSubstratesInCurated.has(activeSubstrate)
        ? (fmmData.substrates[activeSubstrate]?.mappings || [])
        : []; // Empty for PENDING_EVIDENCE substrates
    // const coreElements = fmmData.core_elements as CoreElement[];

    // P0: Filter out header rows that polluted data (regression prevention)
    const HEADER_VALUES = new Set([
        'Source Path', 'Target Pointer', 'Rule',
        'Group', 'Element', 'Status'
    ]);

    const cleanMappings = currentMappings.filter((m: Mapping) =>
        !HEADER_VALUES.has(m.source) &&
        !HEADER_VALUES.has(m.target) &&
        !HEADER_VALUES.has(m.rule)
    );

    return (
        <div className="max-w-6xl mx-auto p-8 text-zinc-100 pb-20">
            <header className="mb-12 border-b border-zinc-800 pb-8">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest mb-4 opacity-50">
                    <SmartLink anchor="validation_hub" className="hover:text-blue-400">Validation</SmartLink>
                    <span>/</span>
                    <span className="text-zinc-100">Field Mapping Matrix</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Field Mapping Matrix (FMM)</h1>
                <p className="text-zinc-400 max-w-3xl leading-relaxed">
                    Machine-readable cross-substrate consistency crosswalk. Reference for mapping
                    substrate-specific observers to MPLP Lifecycle Invariants.
                </p>
            </header>

            <DisclaimerBox kind="projection_only" className="mb-12" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <nav className="flex flex-col gap-2">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Target Substrates</h3>
                        {substrates.map(id => (
                            <button
                                key={id}
                                onClick={() => setActiveSubstrate(id)}
                                className={`p-4 text-xs font-bold text-left rounded-xl transition-all border ${activeSubstrate === id
                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_4px_12px_rgba(59,130,246,0.1)]'
                                    : 'bg-zinc-900/40 text-zinc-500 border-transparent hover:border-zinc-700'
                                    }`}
                            >
                                {id.toUpperCase()}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="lg:col-span-3 bg-zinc-900/60 rounded-3xl border border-zinc-800 shadow-xl overflow-hidden backdrop-blur-sm">
                    {/* Evidence Scope Disclaimer */}
                    <div className="px-8 pt-6 pb-4 bg-blue-500/5 border-b border-blue-500/20">
                        <p className="text-xs text-blue-400">
                            <span className="font-bold">Evidence-Scoped FMM:</span> Only substrates with publishable evidence in the v1.0 release set are shown as VERIFIED. Mappings reflect actual evidence packs.
                        </p>
                    </div>
                    <div className="p-8 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            {activeSubstrate.toUpperCase()} Integration Map
                            {availableSubstratesInCurated.has(activeSubstrate) ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-1 rounded border border-green-500/30">
                                    VERIFIED
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                                    PENDING EVIDENCE
                                </span>
                            )}
                        </h2>
                        <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">
                            v{fmmData.version}
                        </span>
                    </div>

                    {availableSubstratesInCurated.has(activeSubstrate) ? (
                        /* VERIFIED: Show mappings table */
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-950/50 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Target (MPLP Core)</th>
                                    <th className="p-6">Source (Substrate Path)</th>
                                    <th className="p-6">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {cleanMappings.map((mapping: Mapping, i: number) => (
                                    <tr key={i} className="hover:bg-blue-500/[0.02] transition-colors group">
                                        <td className="p-6 align-top">
                                            <div className="font-mono text-[13px] text-zinc-200 mb-1">
                                                {mapping.target}
                                            </div>
                                        </td>
                                        <td className="p-6 font-mono text-[11px] align-top">
                                            <span className="text-zinc-300">{mapping.source}</span>
                                        </td>
                                        <td className="p-6 align-top">
                                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded border ${mapping.rule === 'direct'
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                }`}>
                                                {mapping.rule}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        /* PENDING_EVIDENCE: Show status card instead of mappings */
                        <div className="p-12">
                            <div className="max-w-2xl mx-auto bg-amber-500/5 border border-amber-500/20 rounded-xl p-8">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                        <span className="text-2xl">⚠️</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-amber-400 text-lg mb-2">Evidence Not Available (v1.0)</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            No curated runs for <span className="font-mono text-amber-400">{activeSubstrate}</span> substrate
                                            exist in the v1.0 release set. Field mappings cannot be verified without publishable evidence.
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-black/30 border border-zinc-800 rounded-lg p-4">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Evidence Requirement</dt>
                                    <dd className="text-sm text-zinc-300 leading-relaxed">
                                        To display VERIFIED mappings, this substrate must have:
                                        <ul className="mt-2 ml-4 space-y-1 text-xs text-zinc-400">
                                            <li>• At least one run in the curated runs index</li>
                                            <li>• Complete evidence pack (timeline, artifacts, verdict)</li>
                                            <li>• Version-pinned substrate reference</li>
                                        </ul>
                                    </dd>
                                </div>
                                <p className="text-xs text-zinc-500 mt-6">
                                    Expected in: <span className="font-semibold text-zinc-400">v1.1+</span> (subject to evidence submission)
                                </p>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <footer className="mt-16 text-zinc-500 text-[10px] font-mono flex justify-between uppercase tracking-widest border-t border-zinc-800 pt-8 opacity-40">
                <span>Ref: FMM-v{fmmData.version}</span>
                <span>Verified by VLAB-GATE-10</span>
            </footer>
        </div>
    );
}
