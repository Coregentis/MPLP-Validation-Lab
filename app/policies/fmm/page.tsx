"use client";

import React, { useState } from 'react';
import fmmData from '@/public/_data/fmm.json';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';

// Type definitions for FMM data
interface Mapping {
    source: string;
    target: string;
    rule: string;
}

interface SubstrateData {
    mappings: Mapping[];
}

interface CoreElement {
    pointer: string;
    description: string;
}

type SubstrateKey = keyof typeof fmmData.substrates;

export default function FMMPage() {
    const [activeSubstrate, setActiveSubstrate] = useState<SubstrateKey>('langgraph');

    const substrates = Object.keys(fmmData.substrates) as SubstrateKey[];
    const currentMappings = (fmmData.substrates as any)[activeSubstrate]?.mappings || [];
    const coreElements = fmmData.core_elements as CoreElement[];

    return (
        <div className="max-w-6xl mx-auto p-8 text-zinc-100">
            <header className="mb-8 border-b border-zinc-800 pb-6">
                <h1 className="text-4xl font-bold text-white mb-2">Field Mapping Matrix (FMM)</h1>
                <p className="text-zinc-400">
                    Machine-readable cross-substrate consistency crosswalk. Verifying evidence elements against MPLP Core Standards.
                </p>
            </header>

            <DisclaimerBox kind="projection_only" className="mb-12" />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <nav className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">Substrates</h3>
                        {substrates.map(id => (
                            <button
                                key={id}
                                onClick={() => setActiveSubstrate(id)}
                                className={`p-3 text-left rounded-lg transition-all ${activeSubstrate === id
                                    ? 'bg-blue-900/30 text-blue-400 border-l-4 border-blue-600'
                                    : 'hover:bg-zinc-900 text-zinc-400'
                                    }`}
                            >
                                {id.toUpperCase()}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="lg:col-span-3 bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                            {activeSubstrate.toUpperCase()} Map
                        </h2>
                        <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                            v{fmmData.version}
                        </span>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-950 text-zinc-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium uppercase tracking-tight">Core Element (Target)</th>
                                <th className="p-4 font-medium uppercase tracking-tight">Source Path</th>
                                <th className="p-4 font-medium uppercase tracking-tight">Rule</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {coreElements.map((el, i) => {
                                const mapping = currentMappings.find((m: Mapping) => m.target === el.pointer);
                                return (
                                    <tr key={i} className="hover:bg-zinc-800/50 transition-colors text-sm">
                                        <td className="p-4">
                                            <div className="font-mono text-zinc-200">{el.pointer}</div>
                                            <div className="text-xs text-zinc-500 mt-1">{el.description}</div>
                                        </td>
                                        <td className="p-4 text-zinc-300 font-mono">
                                            {mapping ? mapping.source : <span className="text-red-400 opacity-80">× Unmapped</span>}
                                        </td>
                                        <td className="p-4">
                                            {mapping ? (
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${mapping.rule === 'direct' ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                                                    }`}>
                                                    {mapping.rule}
                                                </span>
                                            ) : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </main>
            </div>

            <footer className="mt-16 text-zinc-500 text-xs flex justify-between italic border-t border-zinc-800 pt-8">
                <span>Generated: {new Date(fmmData.generated_at).toLocaleString()}</span>
                <span>Verified by VLAB-GATE-10</span>
            </footer>
        </div>
    );
}
