/**
 * Adjudication Coverage Matrix Page
 * 
 * Shows Substrate × Domain coverage matrix for adjudication bundles.
 * Answers: "Which substrates have been adjudicated, for which domains?"
 * 
 * SSOT: substrate-index.yaml + adjudication-index.json
 * 
 * GOVERNANCE: Non-certification. This shows adjudication coverage, not capability.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Adjudication Coverage — MPLP Validation Lab',
    description: 'Substrate × Domain coverage matrix showing adjudicated evidence packs.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/coverage/adjudication`,
    },
    robots: { index: true, follow: true },
};

interface SubstrateRun {
    run_id: string;
    gfs: string[];
    status: string;
    adjudication_ref?: string;
}

interface Substrate {
    id: string;
    display_name: string;
    type: string;
    tier: number;
    current_level: string;
    runs: SubstrateRun[];
}

interface SubstrateIndex {
    substrates: Substrate[];
}

function loadSubstrateIndex(): SubstrateIndex {
    const indexPath = join(process.cwd(), 'data', 'curated-runs', 'substrate-index.yaml');
    const content = readFileSync(indexPath, 'utf-8');
    return yaml.parse(content) as SubstrateIndex;
}

function StatusCell({ status, runId }: { status: string; runId?: string }) {
    const colors: Record<string, string> = {
        'ADJUDICATED': 'bg-green-600 text-white',
        'NOT_ADMISSIBLE': 'bg-red-600 text-white',
        'REGISTERED': 'bg-zinc-700 text-zinc-300',
        'EVIDENCE_READY': 'bg-blue-600 text-white',
        'NOT_EVALUATED': 'bg-zinc-800 text-zinc-500',
    };

    const cell = (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-zinc-700 text-zinc-300'}`}>
            {status === 'ADJUDICATED' ? '✓' : status === 'NOT_ADMISSIBLE' ? '✗' : '○'}
        </span>
    );

    if (status === 'ADJUDICATED' && runId) {
        return (
            <Link href={`/adjudication/${runId}`} className="hover:opacity-80 transition-opacity">
                {cell}
            </Link>
        );
    }
    return cell;
}

export default function AdjudicationCoveragePage() {
    const index = loadSubstrateIndex();

    // Filter to Tier-0 substrates only for the main matrix
    const tier0Substrates = index.substrates.filter(s => s.tier === 0);
    const domains = ['D1', 'D2', 'D3', 'D4'];
    const gfs = ['GF-01', 'GF-02', 'GF-03', 'GF-04', 'GF-05'];

    // Build coverage matrix
    type CellData = { status: string; runId?: string };
    const matrix: Record<string, Record<string, CellData>> = {};

    for (const substrate of tier0Substrates) {
        matrix[substrate.id] = {};
        for (const domain of [...domains, ...gfs]) {
            matrix[substrate.id][domain] = { status: 'NOT_EVALUATED' };
        }

        for (const run of substrate.runs) {
            for (const gf of run.gfs) {
                if (run.status === 'ADJUDICATED' || matrix[substrate.id][gf].status === 'NOT_EVALUATED') {
                    matrix[substrate.id][gf] = { status: run.status, runId: run.run_id };
                }
            }
        }
    }

    // Summary stats
    const adjudicatedCount = tier0Substrates.reduce((acc, s) =>
        acc + s.runs.filter(r => r.status === 'ADJUDICATED').length, 0
    );
    const registeredCount = tier0Substrates.reduce((acc, s) =>
        acc + s.runs.filter(r => r.status === 'REGISTERED').length, 0
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Boundary Banner */}
                <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg p-4 mb-6">
                    <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mb-2">
                        Governance Boundary
                    </p>
                    <p className="text-sm text-amber-100/80">
                        <strong className="text-amber-400">Non-certification</strong> · This matrix shows <em>adjudication coverage</em>, not framework capability ·{' '}
                        <Link href="/about" className="text-blue-400 hover:underline">Full statement →</Link>
                    </p>
                </div>

                {/* Current Coverage Summary */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">📊</span>
                        <span className="text-sm font-semibold text-mplp-text">Current Recheckable Verdicts</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-mplp-text-muted uppercase tracking-wider mb-1">ADJUDICATED (Recheckable)</p>
                            <p className="text-green-400 font-medium">MCP, LangChain — GF-01</p>
                            <p className="text-xs text-mplp-text-muted/60 mt-1">Has verdict.json with deterministic verdict_hash</p>
                        </div>
                        <div>
                            <p className="text-xs text-mplp-text-muted uppercase tracking-wider mb-1">REGISTERED (Pending)</p>
                            <p className="text-zinc-400 font-medium">LangGraph, AutoGen, Semantic Kernel, A2A</p>
                            <p className="text-xs text-mplp-text-muted/60 mt-1">Admissible but not yet adjudicated; no recheckable verdict</p>
                        </div>
                    </div>
                    <p className="text-xs text-mplp-text-muted/50 mt-3 pt-2 border-t border-slate-700/50">
                        REGISTERED ≠ PASS. It means evidence pack is eligible for adjudication, not that the substrate passes any guarantee.
                    </p>
                </div>

                {/* Header */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Adjudication Coverage Matrix</h1>
                        <p className="text-gray-400">
                            Tier-0 Substrate × Domain coverage from{' '}
                            <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                                substrate-index.yaml
                            </code>
                        </p>
                    </div>
                    <Link
                        href="/policies/substrate-scope"
                        className="text-sm text-blue-400 hover:underline whitespace-nowrap"
                    >
                        Admission criteria →
                    </Link>
                </div>


                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{tier0Substrates.length}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Tier-0 Substrates</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-400">{adjudicatedCount}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Adjudicated</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-zinc-400">{registeredCount}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Registered</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold">{domains.length}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Domains</p>
                    </div>
                </div>

                {/* Coverage Matrix */}
                <div className="overflow-x-auto mb-8">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Substrate</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Level</th>
                                {domains.map(d => (
                                    <th key={d} className="text-center py-3 px-2 text-gray-400 font-medium">{d}</th>
                                ))}
                                <th className="text-center py-3 px-2 text-gray-400 font-medium">LG-01</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tier0Substrates.map((substrate) => (
                                <tr key={substrate.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="py-3 px-4 font-semibold">{substrate.display_name}</td>
                                    <td className="py-3 px-4 text-sm text-gray-400">{substrate.type}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-0.5 rounded text-xs ${substrate.current_level === 'reproduced'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-zinc-800 text-zinc-400'
                                            }`}>
                                            {substrate.current_level}
                                        </span>
                                    </td>
                                    {domains.map(d => (
                                        <td key={d} className="py-3 px-2 text-center">
                                            <StatusCell
                                                status={matrix[substrate.id]?.[d]?.status || 'NOT_EVALUATED'}
                                                runId={matrix[substrate.id]?.[d]?.runId}
                                            />
                                        </td>
                                    ))}
                                    <td className="py-3 px-2 text-center">
                                        <StatusCell
                                            status={matrix[substrate.id]?.['GF-01']?.status || 'NOT_EVALUATED'}
                                            runId={matrix[substrate.id]?.['GF-01']?.runId}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Legend */}
                <div className="p-4 bg-gray-800/50 rounded-lg mb-8">
                    <h3 className="font-bold mb-3 text-gray-300">Status Legend</h3>
                    <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-green-600 text-white">✓</span>
                            <span className="text-gray-400">ADJUDICATED (clickable)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-red-600 text-white">✗</span>
                            <span className="text-gray-400">NOT_ADMISSIBLE</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-zinc-700 text-zinc-300">○</span>
                            <span className="text-gray-400">REGISTERED (pending)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-zinc-800 text-zinc-500">○</span>
                            <span className="text-gray-400">NOT_EVALUATED</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="text-center text-gray-500 text-sm">
                    <Link href="/coverage" className="text-blue-400 hover:underline">Test Vector Coverage</Link>
                    {' | '}
                    <Link href="/adjudication" className="text-blue-400 hover:underline">All Adjudications</Link>
                    {' | '}
                    <Link href="/policies/intake" className="text-blue-400 hover:underline">Intake Policy</Link>
                </div>
            </div>
        </div>
    );
}
