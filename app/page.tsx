import type { Metadata } from 'next';
import Link from 'next/link';
import { loadCurrentRelease } from '@/lib/release/loadRelease';
import { VersionText } from '@/components/common/VersionBadge';
import labManifest from '@/public/_meta/lab-manifest.json';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: {
        absolute: 'MPLP Validation Lab — Evidence Viewing & Export (Non-Certification)'
    },
    description: 'Evidence-based verdict viewing and export for MPLP conformance evaluation. Not a certification program. Does not host execution.',
    alternates: {
        canonical: LAB_CANONICAL_HOST,
    },
    robots: {
        index: true,
        follow: true,
    },
    keywords: ['MPLP', 'Validation Lab', 'Evidence', 'Lifecycle Guarantees', 'Lifecycle Invariants', 'Non-certifying'],
};

export default function Home() {
    loadCurrentRelease();

    return (
        <>
            {/* Hero Section - Clean, no heavy borders */}
            <section className="relative overflow-hidden flex flex-col min-h-[60vh] justify-center">
                {/* Premium Glow Spots */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-mplp-blue-soft/10 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-mplp-indigo/10 blur-[100px] rounded-full opacity-40 pointer-events-none" />

                <div className="relative z-10 text-center pt-12 pb-16">
                    {/* Status Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mplp-blue-soft/30 bg-mplp-blue-soft/10 text-[10px] font-bold uppercase tracking-[0.2em] text-mplp-blue-soft mb-8">
                        <span className="status-dot" />
                        System Operational
                    </div>

                    {/* Wordmark */}
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-4">Multi-Agent Lifecycle Protocol</p>
                    <h1 className="font-bold text-mplp-text mb-6 leading-[1.1] tracking-tight">
                        <span className="block text-4xl sm:text-5xl lg:text-6xl text-gradient pb-2">
                            Validation Lab
                        </span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-mplp-blue-soft/90 mb-8">Evidence & Conformance Laboratory</p>

                    <p className="max-w-xl mx-auto text-base leading-relaxed text-mplp-text-muted mb-6">
                        Download evidence packs, recheck verdicts locally, and view deterministic verdict hashes.
                    </p>

                    {/* Direct Action Flow - P1-1 */}
                    <p className="max-w-lg mx-auto text-sm text-mplp-text mb-8 bg-mplp-dark-soft/60 px-4 py-2 rounded-lg border border-mplp-border/30">
                        <span className="text-mplp-blue-soft font-bold">↓</span> Download an evidence pack → verify locally → get the same verdict hash.
                    </p>

                    {/* Hard Boundary - P0-3 */}
                    <p className="text-sm font-bold text-amber-400/90 tracking-wide mb-8 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-900/10 inline-block">
                        We verify evidence integrity and determinism — not runtime performance, not certification.
                    </p>

                    {/* Primary CTAs - P0-4 */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        <Link
                            href="/validation"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-mplp-blue hover:bg-mplp-blue-soft text-white font-bold rounded-lg transition text-sm tracking-wide shadow-lg shadow-mplp-blue/20"
                        >
                            Validation Dashboard →
                        </Link>
                        <Link
                            href="/policies/cross-verified"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-mplp-emerald/10 hover:bg-mplp-emerald/20 text-mplp-emerald font-bold rounded-lg transition border border-mplp-emerald/30 text-sm tracking-wide"
                        >
                            Cross-Framework Report
                        </Link>
                    </div>

                    {/* Status Row with Human-Readable Explanations */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-mplp-border/30 max-w-2xl mx-auto">
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Protocol</p>
                            <p className="text-xs font-bold text-mplp-text">v{labManifest.protocol_version} SEAL</p>
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1">Cross-Substrate Baseline</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Integrity</p>
                            <p className="text-xs font-bold text-mplp-text">SSOT Locked</p>
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1">G-24 L1 Sealed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Series</p>
                            <p className="text-xs font-bold text-mplp-text"><VersionText variant="lab" /></p>
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1">Validation Series</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Protocol Status Bar */}
            <div className="bg-slate-950/30 border-y border-mplp-border/30 py-4 mb-16">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-mplp-text-muted">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2" title="Gate-Status: All structural gates enforced">
                            <span className="status-dot" />
                            Validation Gates: SEALED
                        </span>
                        <div className="h-3 w-px bg-mplp-border/50" />
                        <span className="text-mplp-text">Cross-Framework Equivalence Active</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/validation" className="hover:text-mplp-blue-soft transition-colors text-mplp-text">Validation Hub</Link>
                        <Link href="/policies/cross-verified" className="hover:text-mplp-blue-soft transition-colors">Cross-Verified Report</Link>
                        <Link href="/rulesets" className="hover:text-mplp-blue-soft transition-colors">Rulesets</Link>
                    </div>
                </div>
            </div>

            {/* Hard Boundary - Subtle, not boxy */}
            <section className="mb-16 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-900/5">
                <div className="flex items-center gap-3">
                    <span className="text-amber-400 text-sm">⚠</span>
                    <p className="text-sm text-mplp-text-muted">
                        <strong className="text-mplp-text">Reviewability ≠ Reproducibility.</strong>
                        {' '}The Lab rechecks evidence, not execution.
                    </p>
                </div>
            </section>

            {/* Quick Start - Enhanced with specific example */}
            <section className="mb-16 bg-mplp-dark-soft/40 border border-mplp-border/30 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mplp-blue-soft mb-4 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-mplp-blue-soft" />
                    Quick Start
                </p>
                <div className="mb-4">
                    <p className="text-sm text-mplp-text mb-2">
                        Start with: <Link href="/adjudication/gf-01-smoke" className="text-mplp-blue-soft hover:text-mplp-blue-light font-mono">gf-01-smoke</Link>
                        <span className="ml-2 text-xs text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded">ADJUDICATED + PASS</span>
                    </p>
                </div>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-mplp-text-muted overflow-x-auto">
                    <p className="text-mplp-text-muted/60 mb-2"># Verify locally (read-only)</p>
                    <p>npm run vlab:recheck-hash gf-01-smoke</p>
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                    <Link href="/runs" className="text-mplp-blue-soft hover:text-mplp-blue-light">Browse Runs →</Link>
                    <Link href="/adjudication" className="text-mplp-blue-soft hover:text-mplp-blue-light">View Adjudications →</Link>
                    <a href="https://docs.mplp.io/evaluation/conformance/reviewability" target="_blank" rel="noopener noreferrer" className="text-mplp-text-muted hover:text-mplp-text">How to Recheck Locally ↗</a>
                </div>
            </section>

            {/* Navigation Cards - Subtle borders, not boxy */}
            <section className="mb-16">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mplp-text-muted mb-6">Discovery Resources</p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Link href="/validation" className="group block p-6 rounded-2xl border border-mplp-blue-soft/30 bg-mplp-dark-soft/40 hover:border-mplp-blue-soft/50 transition-all">
                        <h3 className="text-sm font-bold text-mplp-text uppercase tracking-widest mb-3 group-hover:text-mplp-blue-soft transition-colors">Validation Hub</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">Protocol alignment, Governance gates, and structural integrity status.</p>
                    </Link>
                    <Link href="/policies/cross-verified" className="group block p-6 rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/40 hover:border-mplp-blue-soft/30 transition-all">
                        <h3 className="text-sm font-bold text-mplp-text uppercase tracking-widest mb-3 group-hover:text-mplp-blue-soft transition-colors">Cross-Verified</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">Equivalence report comparing evidence projection across substrates.</p>
                    </Link>
                    <Link href="/runs" className="group block p-6 rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/40 hover:border-mplp-blue-soft/30 transition-all">
                        <h3 className="text-sm font-bold text-mplp-text uppercase tracking-widest mb-3 group-hover:text-mplp-blue-soft transition-colors">Runs</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">Curated evidence packs including PASS, FAIL, and NOT_ADMISSIBLE.</p>
                    </Link>
                    <Link href="/rulesets" className="group block p-6 rounded-2xl border border-mplp-border/40 bg-mplp-dark-soft/40 hover:border-mplp-blue-soft/30 transition-all">
                        <h3 className="text-sm font-bold text-mplp-text uppercase tracking-widest mb-3 group-hover:text-mplp-blue-soft transition-colors">Rulesets</h3>
                        <p className="text-xs text-mplp-text-muted leading-relaxed">Evaluation rules and versioned decision logic.</p>
                    </Link>
                </div>
            </section>
        </>
    );
}
