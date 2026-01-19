/**
 * Export Contract Page (v1.2)
 * 
 * Public compatibility contract for the export/ directory.
 * This is the SINGLE SOURCE OF TRUTH for contract surface.
 * 
 * NON-NORMATIVE: This is Lab governance, not MPLP protocol spec.
 * GATE-04 COMPLIANCE: No certification/endorsement language.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Export Contract — v1.2 — MPLP Validation Lab',
    description: 'Public compatibility contract for the export/ directory (v1.2). Curated runs, adjudication linking, verdict hashes. Non-normative.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/contract`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ContractPage() {
    return (
        <div className="pt-8 max-w-4xl">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Policy & Governance</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Export Contract</h1>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-2 py-1 bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 text-mplp-blue-soft rounded text-[10px] font-bold uppercase tracking-wider">v1.2 Stable</span>
                    <span className="px-2 py-1 bg-mplp-dark-soft border border-mplp-border/40 text-mplp-text-muted rounded text-[10px] font-bold uppercase tracking-wider">SSOT Locked</span>
                </div>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Public compatibility contract for the <code className="font-mono text-sm mx-1">export/</code> directory.
                    This defines the stable surface for external consumers.
                </p>
            </div>

            {/* Scope - Flowing */}
            <div className="mb-16">
                <h2 className="text-lg font-bold text-mplp-text mb-6 flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-mplp-blue-soft animate-pulse" />
                    Scope & Non-Goals
                </h2>
                <div className="pl-4 border-l-2 border-mplp-border/30 space-y-4">
                    <p className="text-sm text-mplp-text-muted leading-relaxed">
                        This contract governs the <strong>public-facing export/ directory</strong> — the contract surface for external consumers.
                    </p>
                    <ul className="space-y-2 text-xs text-mplp-text-muted/80">
                        <li className="flex gap-2">
                            <span className="text-mplp-blue-soft">•</span>
                            <span>This is NOT an MPLP protocol specification.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-mplp-blue-soft">•</span>
                            <span>For authoritative definitions, see the <a href="https://docs.mplp.io" className="text-mplp-blue-soft hover:underline">MPLP Protocol Documentation</a>.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-mplp-blue-soft">•</span>
                            <span>Contract versions follow MAJOR.MINOR semantics.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* v1.2 Additions - Table with transparency */}
            <div className="mb-16">
                <h2 className="text-lg font-bold text-mplp-text mb-2">v1.2 Additions</h2>
                <p className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 mb-6">PR-8 Feature Set</p>

                <div className="bg-glass border border-mplp-border/30 rounded-2xl overflow-hidden p-1">
                    <table className="w-full text-sm">
                        <thead className="bg-mplp-dark-soft/40">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Field</th>
                                <th className="text-left p-4 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Type</th>
                                <th className="text-left p-4 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mplp-border/20">
                            <tr className="hover:bg-mplp-blue-soft/5 transition-colors">
                                <td className="p-4 font-mono text-mplp-blue-soft text-xs">adjudication_status</td>
                                <td className="p-4 text-mplp-text-muted text-xs">enum</td>
                                <td className="p-4 text-mplp-text-muted/80">ADJUDICATED | NOT_ADMISSIBLE | NOT_ADJUDICATED</td>
                            </tr>
                            <tr className="hover:bg-mplp-blue-soft/5 transition-colors">
                                <td className="p-4 font-mono text-mplp-blue-soft text-xs">adjudication_verdict_hash</td>
                                <td className="p-4 text-mplp-text-muted text-xs">string?</td>
                                <td className="p-4 text-mplp-text-muted/80">64-char hex, present if adjudicated</td>
                            </tr>
                            <tr className="hover:bg-mplp-blue-soft/5 transition-colors">
                                <td className="p-4 font-mono text-mplp-blue-soft text-xs">adjudication_ruleset</td>
                                <td className="p-4 text-mplp-text-muted text-xs">string?</td>
                                <td className="p-4 text-mplp-text-muted/80">Ruleset version used</td>
                            </tr>
                            <tr className="hover:bg-mplp-blue-soft/5 transition-colors">
                                <td className="p-4 font-mono text-mplp-blue-soft text-xs">adjudication_protocol_pin</td>
                                <td className="p-4 text-mplp-text-muted text-xs">string?</td>
                                <td className="p-4 text-mplp-text-muted/80">Protocol version pinned</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gates as Contract - Minimal Flow */}
            <div className="mb-16">
                <h2 className="text-lg font-bold text-mplp-text mb-6">Contract Enforcement</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 block">Gate-14</span>
                        <h3 className="font-bold text-mplp-text mb-2">Adjudication Consistency</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">bundle ↔ export alignment</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 block">Gate-15</span>
                        <h3 className="font-bold text-mplp-text mb-2">Curated Closure</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">curated runs → adjudication required</p>
                    </div>
                </div>
            </div>

            {/* Compatibility - Columns */}
            <div className="mb-16">
                <h2 className="text-lg font-bold text-mplp-text mb-6">Compatibility Commitments</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="pl-4 border-l-2 border-emerald-500/30">
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4">✅ Allowed (MINOR)</h3>
                        <ul className="text-xs text-mplp-text-muted space-y-2">
                            <li>• Add optional field</li>
                            <li>• Add new index entry</li>
                            <li>• Add new export file</li>
                            <li>• Add new adjudication bundle</li>
                        </ul>
                    </div>
                    <div className="pl-4 border-l-2 border-red-500/30">
                        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">❌ Prohibited (MAJOR)</h3>
                        <ul className="text-xs text-mplp-text-muted space-y-2">
                            <li>• Remove field</li>
                            <li>• Change field semantics</li>
                            <li>• Change enum value set</li>
                            <li>• Change hash algorithm</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Invariants - Clean List */}
            <div className="mb-16">
                <h2 className="text-lg font-bold text-mplp-text mb-6">Path Invariants</h2>
                <div className="bg-amber-900/5 border border-amber-500/20 rounded-2xl p-6">
                    <ul className="space-y-3 text-sm text-mplp-text-muted">
                        <li className="flex gap-3">
                            <span className="text-red-400 font-bold">✗</span>
                            <span><strong>No absolute paths</strong> permitted in reports.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-red-400 font-bold">✗</span>
                            <span><strong>YAML variants</strong> (manifest.yaml) are NOT contract.</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-red-400 font-bold">✗</span>
                            <span><strong>Alternative timelines</strong> are NOT recognized.</span>
                        </li>
                    </ul>
                    <p className="text-[10px] text-amber-500/60 uppercase tracking-wider mt-4 pt-4 border-t border-amber-500/10">
                        Violation triggers GATE-07 (PII/Path Lint) failure.
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
                <Link href="/policies/strength" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Ruleset Strength Policy →
                </Link>
                <Link href="/guarantees" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    View Guarantees →
                </Link>
                <Link href="/adjudication" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Adjudication Bundles →
                </Link>
            </div>
        </div>
    );
}
