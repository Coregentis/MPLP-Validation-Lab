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
        'REGISTERED': 'bg-mplp-dark-soft text-mplp-text-muted',
        'EVIDENCE_READY': 'bg-blue-600 text-white',
        'NOT_EVALUATED': 'bg-mplp-dark text-mplp-text-muted/50',
    };

    const cell = (
        <span className={`px-2 py-1 rounded text-xs font-bold ${colors[status] || 'bg-mplp-dark-soft text-mplp-text-muted'}`}>
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
        <div className="pt-8">
            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Evidence</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Adjudication Coverage Matrix</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                        Tier-0 Substrate × Domain coverage from{' '}
                        <code className="text-xs bg-mplp-dark-soft px-2 py-1 rounded font-mono border border-mplp-border/40">substrate-index.yaml</code>
                    </p>
                    <Link
                        href="/policies/substrate-scope"
                        className="text-sm text-mplp-blue-soft hover:underline whitespace-nowrap"
                    >
                        Admission criteria →
                    </Link>
                </div>
            </div>

            {/* Boundary Statement */}
            <div className="mb-10 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mb-2">
                    Governance Boundary
                </p>
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-amber-400">Non-certification</strong> · This matrix shows <em>adjudication coverage</em>, not framework capability ·{' '}
                    <Link href="/about" className="text-mplp-blue-soft hover:underline">Full statement →</Link>
                </p>
            </div>

            {/* Current Coverage Summary */}
            <div className="bg-glass border border-mplp-border/30 rounded-2xl p-6 mb-10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">📊</span>
                    <span className="text-sm font-semibold text-mplp-text">Current Recheckable Verdicts</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 text-sm">
                    <div>
                        <p className="text-xs text-mplp-text-muted uppercase tracking-wider mb-2">ADJUDICATED (Recheckable)</p>
                        <p className="text-green-400 font-medium">MCP, LangChain — GF-01</p>
                        <p className="text-xs text-mplp-text-muted/60 mt-1">Has verdict.json with deterministic verdict_hash</p>
                    </div>
                    <div>
                        <p className="text-xs text-mplp-text-muted uppercase tracking-wider mb-2">REGISTERED (Pending)</p>
                        <p className="text-mplp-text-muted font-medium">LangGraph, AutoGen, Semantic Kernel, A2A</p>
                        <p className="text-xs text-mplp-text-muted/60 mt-1">Admissible but not yet adjudicated; no recheckable verdict</p>
                    </div>
                </div>
                <p className="text-xs text-mplp-text-muted/50 mt-4 pt-4 border-t border-mplp-border/30">
                    REGISTERED ≠ PASS. It means evidence pack is eligible for adjudication, not that the substrate passes any guarantee.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
                    <p className="text-2xl font-bold text-mplp-text">{tier0Substrates.length}</p>
                    <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">Tier-0 Substrates</p>
                </div>
                <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
                    <p className="text-2xl font-bold text-green-400">{adjudicatedCount}</p>
                    <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">Adjudicated</p>
                </div>
                <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
                    <p className="text-2xl font-bold text-mplp-text-muted">{registeredCount}</p>
                    <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">Registered</p>
                </div>
                <div className="bg-glass rounded-2xl p-5 text-center border border-mplp-border/30">
                    <p className="text-2xl font-bold text-mplp-text">{domains.length}</p>
                    <p className="text-xs text-mplp-text-muted uppercase tracking-wider mt-1">Domains</p>
                </div>
            </div>

            {/* Coverage Matrix */}
            <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30 mb-10">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-mplp-dark-soft/50">
                            <tr>
                                <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Substrate</th>
                                <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Type</th>
                                <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Level</th>
                                {domains.map(d => (
                                    <th key={d} className="text-center p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">{d}</th>
                                ))}
                                <th className="text-center p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">LG-01</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tier0Substrates.map((substrate) => (
                                <tr key={substrate.id} className="border-b border-mplp-border/20 hover:bg-mplp-blue-soft/5 transition-colors">
                                    <td className="p-4 font-semibold text-mplp-text">{substrate.display_name}</td>
                                    <td className="p-4 text-sm text-mplp-text-muted">{substrate.type}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-xs ${substrate.current_level === 'reproduced'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-mplp-dark-soft text-mplp-text-muted'
                                            }`}>
                                            {substrate.current_level}
                                        </span>
                                    </td>
                                    {domains.map(d => (
                                        <td key={d} className="p-4 text-center">
                                            <StatusCell
                                                status={matrix[substrate.id]?.[d]?.status || 'NOT_EVALUATED'}
                                                runId={matrix[substrate.id]?.[d]?.runId}
                                            />
                                        </td>
                                    ))}
                                    <td className="p-4 text-center">
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
            </div>

            {/* Legend */}
            <div className="p-6 bg-glass rounded-2xl border border-mplp-border/30 mb-10">
                <h3 className="font-bold mb-4 text-mplp-text">Status Legend</h3>
                <div className="flex flex-wrap gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-green-600 text-white">✓</span>
                        <span className="text-mplp-text-muted">ADJUDICATED (clickable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-red-600 text-white">✗</span>
                        <span className="text-mplp-text-muted">NOT_ADMISSIBLE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-mplp-dark-soft text-mplp-text-muted">○</span>
                        <span className="text-mplp-text-muted">REGISTERED (pending)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-mplp-dark text-mplp-text-muted/50">○</span>
                        <span className="text-mplp-text-muted">NOT_EVALUATED</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
                <Link href="/coverage" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Test Vector Coverage →
                </Link>
                <Link href="/adjudication" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    All Adjudications →
                </Link>
                <Link href="/policies/intake" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Intake Policy →
                </Link>
            </div>
        </div>
    );
}
