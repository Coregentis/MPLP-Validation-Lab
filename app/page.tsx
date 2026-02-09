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

import fs from 'fs';
import path from 'path';
import Doclet from '@/components/doclets/Doclet';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';
import { LabStatusBadge } from '@/components/ssot/LabStatusBadge';
import { GateSummaryPill } from '@/components/ssot/GateSummaryPill';
import { FeaturedRunLink } from '@/components/ssot/FeaturedRunLink';

export default async function Home() {
    loadCurrentRelease();
    const versionModel = await getVersionStripModel();
    const homeDocletMd = fs.readFileSync(path.join(process.cwd(), 'content/doclets/home.md'), 'utf-8');

    return (
        <>
            {/* Hero Section - Clean, no heavy borders */}
            <section className="relative overflow-hidden flex flex-col min-h-[60vh] justify-center">
                {/* Premium Glow Spots */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-mplp-blue-soft/10 blur-[120px] rounded-full opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-[400px] h-[400px] bg-mplp-indigo/10 blur-[100px] rounded-full opacity-40 pointer-events-none" />

                <div className="relative z-10 text-center pt-12 pb-16">
                    {/* Status Pill (SSOT) */}
                    <div className="flex justify-center mb-8">
                        <LabStatusBadge statusModel={versionModel.lab.status} />
                    </div>

                    {/* Wordmark */}
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-4">Multi-Agent Lifecycle Protocol</p>
                    <h1 className="font-bold text-mplp-text mb-6 leading-[1.1] tracking-tight">
                        <span className="block text-4xl sm:text-5xl lg:text-6xl text-gradient pb-2">
                            Validation Lab
                        </span>
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-mplp-blue-soft/90 mb-8">Evidence & Conformance Laboratory</p>

                    <div className="max-w-xl mx-auto text-base leading-relaxed text-mplp-text-muted mb-6">
                        {/* Doclet: Home Introduction */}
                        <Doclet md={homeDocletMd.split('##')[1]} model={versionModel} />
                    </div>

                    {/* Direct Action Flow - P1-1 */}
                    <p className="max-w-lg mx-auto text-sm text-mplp-text mb-8 bg-mplp-dark-soft/60 px-4 py-2 rounded-lg border border-mplp-border/30">
                        <span className="text-mplp-blue-soft font-bold">↓</span> Download an evidence pack → verify locally → get the same verdict hash.
                    </p>

                    {/* Hard Boundary - P0-3 */}
                    <p className="text-sm font-bold text-amber-400/90 tracking-wide mb-8 px-4 py-2 rounded-lg border border-amber-500/30 bg-amber-900/10 inline-block">
                        We verify evidence integrity and determinism — not runtime performance, not certification.
                    </p>

                    {/* Primary Entry CTA - 3-Card System */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
                        <Link
                            href="/runsets"
                            data-testid="home-cta-runsets"
                            className="group block p-6 bg-mplp-blue/10 hover:bg-mplp-blue/20 border border-mplp-blue/30 hover:border-mplp-blue/50 rounded-xl transition-all text-center"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-blue-soft mb-2">Start Here</p>
                            <h3 className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">Browse Runsets</h3>
                            <p className="text-xs text-mplp-text-muted mt-2">Pick a run, view evidence</p>
                        </Link>
                        <Link
                            href="/releases"
                            data-testid="home-cta-release"
                            className="group block p-6 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl transition-all text-center"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/80 mb-2">Audit Trail</p>
                            <h3 className="text-lg font-bold text-mplp-text group-hover:text-emerald-400 transition-colors">Release Seals</h3>
                            <p className="text-xs text-mplp-text-muted mt-2">Verify immutable records</p>
                        </Link>
                        <Link
                            href="/rulesets"
                            data-testid="home-cta-rulesets"
                            className="group block p-6 bg-mplp-dark-soft/60 hover:bg-mplp-dark-soft/80 border border-mplp-border/30 hover:border-mplp-border/50 rounded-xl transition-all text-center"
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-mplp-text-muted mb-2">Learn</p>
                            <h3 className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">How Verdicts Work</h3>
                            <p className="text-xs text-mplp-text-muted mt-2">Ruleset logic & clauses</p>
                        </Link>
                    </div>

                    {/* Status Row with Auditable Links */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-mplp-border/30 max-w-2xl mx-auto">
                        <Link href="/governance" className="text-center group">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Protocol</p>
                            <p className="text-xs font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">v{labManifest.protocol_version} Frozen</p>
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1 group-hover:text-mplp-text-muted transition-colors">View Governance →</p>
                        </Link>
                        <Link href="/releases" className="text-center flex flex-col items-center group">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Integrity</p>
                            {/* SSOT Gate Summary */}
                            <GateSummaryPill summaryModel={versionModel.gates.summary} />
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1 group-hover:text-mplp-text-muted transition-colors">View Seals →</p>
                        </Link>
                        <Link href="/releases" className="text-center group">
                            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mplp-text-muted mb-2">Series</p>
                            <p className="text-xs font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors"><VersionText variant="lab" /></p>
                            <p className="text-[10px] text-mplp-text-muted/60 mt-1 group-hover:text-mplp-text-muted transition-colors">View History →</p>
                        </Link>
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
                        <Link href="/policies/cross-verified" className="text-mplp-text hover:text-mplp-blue-soft transition-colors">Cross-Framework Equivalence Active →</Link>
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

            {/* Quick Start - Enhanced with SSOT */}
            <section className="mb-8 bg-mplp-dark-soft/40 border border-mplp-border/30 rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mplp-blue-soft mb-4 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-mplp-blue-soft" />
                    Quick Start
                </p>
                <div className="mb-4">
                    {/* SSOT Featured Run */}
                    <div className="text-sm text-mplp-text mb-2 flex items-center gap-2">
                        Start with: <FeaturedRunLink featuredRun={versionModel.featured} />
                    </div>
                </div>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-xs text-mplp-text-muted overflow-x-auto">
                    <p className="text-mplp-text-muted/60 mb-2"># Verify locally (read-only)</p>
                    <p>npm run vlab:recheck-hash {versionModel.featured.run_id}</p>
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                    <Link href="/runsets" className="text-mplp-blue-soft hover:text-mplp-blue-light">Start with Runsets →</Link>
                    <Link href="/runs" className="text-mplp-text-muted hover:text-mplp-text">All runs</Link>
                    <a href="https://docs.mplp.io/evaluation/conformance/reviewability" target="_blank" rel="noopener noreferrer" className="text-mplp-text-muted hover:text-mplp-text">How to Recheck Locally ↗</a>
                </div>
            </section>

            {/* Audit Loop - 5-Step Verification Path */}
            <section className="mb-16 bg-gradient-to-r from-emerald-500/5 to-mplp-blue/5 border border-mplp-border/30 rounded-2xl p-6" data-testid="home-audit-loop">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" />
                    The Audit Loop
                </p>
                <p className="text-sm text-mplp-text-muted mb-6">
                    Download an evidence pack → verify locally → get the same verdict hash.
                </p>
                <ol className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
                    <li className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-sm font-bold flex items-center justify-center mb-2">1</span>
                        <Link href="/runsets" className="text-xs font-bold text-mplp-text hover:text-mplp-blue-soft transition-colors">Browse Runsets</Link>
                        <p className="text-[10px] text-mplp-text-muted mt-1">Pick a run</p>
                    </li>
                    <li className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-sm font-bold flex items-center justify-center mb-2">2</span>
                        <Link href="/runs" className="text-xs font-bold text-mplp-text hover:text-mplp-blue-soft transition-colors">View Evidence</Link>
                        <p className="text-[10px] text-mplp-text-muted mt-1">Inspect pack</p>
                    </li>
                    <li className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-sm font-bold flex items-center justify-center mb-2">3</span>
                        <Link href={`/runs/${versionModel.featured.run_id}`} className="text-xs font-bold text-mplp-text hover:text-mplp-blue-soft transition-colors">Download Pack</Link>
                        <p className="text-[10px] text-mplp-text-muted mt-1">Get JSON/Zip</p>
                    </li>
                    <li className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-mplp-blue/20 text-mplp-blue-soft text-sm font-bold flex items-center justify-center mb-2">4</span>
                        <a href="https://docs.mplp.io/evaluation/conformance/reviewability" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-mplp-text hover:text-mplp-blue-soft transition-colors">Verify Locally ↗</a>
                        <p className="text-[10px] text-mplp-text-muted mt-1">Run recheck</p>
                    </li>
                    <li className="flex flex-col items-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center justify-center mb-2">✓</span>
                        <Link href="/releases" className="text-xs font-bold text-mplp-text hover:text-emerald-400 transition-colors">Compare Hash</Link>
                        <p className="text-[10px] text-mplp-text-muted mt-1">Match Seal</p>
                    </li>
                </ol>
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
