"use client";

import React, { useEffect, useState } from 'react';
import fmmData from '@/public/_data/fmm.json';

export default function FMMPage() {
    const [activeSubstrate, setActiveSubstrate] = useState('langgraph');

    const substrates = Object.keys(fmmData.substrates);
    const currentMappings = fmmData.substrates[activeSubstrate]?.mappings || [];
    const coreElements = fmmData.core_elements;

    return (
        <div className="max-w-6xl mx-auto p-8">
            <header className="mb-12 border-b border-zinc-200 pb-6">
                <h1 className="text-4xl font-bold text-zinc-900 mb-2">Field Mapping Matrix (FMM)</h1>
                <p className="text-zinc-600">
                    Machine-readable cross-substrate consistency crosswalk. Verifying evidence elements against MPLP Core Standards.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <nav className="flex flex-col gap-2">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">Substrates</h3>
                        {substrates.map(id => (
                            <button
                                key={id}
                                onClick={() => setActiveSubstrate(id)}
                                className={`p-3 text-left rounded-lg transition-all ${activeSubstrate === id
                                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                        : 'hover:bg-zinc-100 text-zinc-600'
                                    }`}
                            >
                                {id.toUpperCase()}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="lg:col-span-3 bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-zinc-800">
                            {activeSubstrate.toUpperCase()} Map
                        </h2>
                        <span className="text-xs font-mono bg-zinc-200 text-zinc-600 px-2 py-1 rounded">
                            v{fmmData.version}
                        </span>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-100 text-zinc-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium uppercase tracking-tight">Core Element (Target)</th>
                                <th className="p-4 font-medium uppercase tracking-tight">Source Path</th>
                                <th className="p-4 font-medium uppercase tracking-tight">Rule</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {coreElements.map((el, i) => {
                                const mapping = currentMappings.find(m => m.target === el.pointer);
                                return (
                                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-mono text-sm text-blue-600">{el.pointer}</div>
                                            <div className="text-xs text-zinc-500 mt-1">{el.description}</div>
                                        </td>
                                        <td className="p-4 text-zinc-700 font-mono text-sm">
                                            {mapping ? mapping.source : <span className="text-red-400">× Unmapped</span>}
                                        </td>
                                        <td className="p-4">
                                            {mapping ? (
                                                <span className={`text-xs px-2 py-1 rounded ${mapping.rule === 'direct' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
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

            <footer className="mt-16 text-zinc-400 text-xs flex justify-between italic">
                <span>Generated: {new Date(fmmData.generated_at).toLocaleString()}</span>
                <span>Verified by VLAB-GATE-10</span>
            </footer>
        </div>
    );
}
