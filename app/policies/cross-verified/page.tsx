/**
 * Cross-Verified Prototypes Page
 * 
 * P1 FIX-01: Create anchor target for lab-manifest.json
 * 
 * This page surfaces the cross-verified evidence outputs from v0.10 series:
 * - Cross-verified report (v0.10.2-report.json)
 * - Equivalence diffs (per scenario family)
 * - Normalized evidence packs
 * 
 * GOVERNANCE: This is a pointer page, not a capability claim.
 * Equivalence = evidence projection similarity, NOT endorsement/certification.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import labManifest from '@/public/_meta/lab-manifest.json';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Cross-Verified Prototypes — MPLP Validation Lab',
    description: 'Evidence projection equivalence across substrates. v0.10 series cross-verification report and normalized diffs. Not a certification or endorsement.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/cross-verified`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function CrossVerifiedPage() {
    const labVersion = labManifest.lab_series;

    return (
        <div className="pt-8 max-w-4xl">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Policy & Governance</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Cross-Verified Prototypes</h1>
                <div className="flex items-center gap-4 mb-6">
                    <span className="px-2 py-1 bg-mplp-blue-soft/10 border border-mplp-blue-soft/20 text-mplp-blue-soft rounded text-[10px] font-bold uppercase tracking-wider">{labVersion}</span>
                    <span className="px-2 py-1 bg-mplp-dark-soft border border-mplp-border/40 text-mplp-text-muted rounded text-[10px] font-bold uppercase tracking-wider">Evidence Pointer</span>
                </div>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Cross-verification compares evidence projection across different substrates (frameworks)
                    using the same domain scenarios. This demonstrates that MPLP lifecycle invariants
                    evaluate consistently regardless of implementation.
                </p>
            </div>

            {/* Critical Disclaimer */}
            <section className="mb-12 px-4 py-3 rounded-xl border border-amber-500/20 bg-amber-900/5">
                <div className="flex items-start gap-3">
                    <span className="text-amber-400 text-sm mt-0.5">⚠</span>
                    <div className="text-sm text-mplp-text-muted">
                        <p className="mb-2">
                            <strong className="text-mplp-text">Equivalence ≠ Endorsement.</strong>
                        </p>
                        <ul className="text-xs space-y-1 text-mplp-text-muted/80">
                            <li>• Equivalence means <em>evidence projection similarity</em>, not framework capability comparison.</li>
                            <li>• This is <strong>not</strong> certification, compliance, or quality rating.</li>
                            <li>• Verdicts are evidence-based outputs under versioned rulesets only.</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Evidence Pointers */}
            <section className="mb-12">
                <h2 className="text-lg font-bold text-mplp-text mb-6 flex items-center gap-3">
                    <span className="h-1 w-1 rounded-full bg-mplp-blue-soft animate-pulse" />
                    Evidence Artifacts
                </h2>

                <div className="grid gap-4">
                    {/* Cross-Verified Report */}
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-mplp-blue-soft">Report</span>
                            <span className="text-xs text-mplp-text-muted">{labVersion}</span>
                        </div>
                        <h3 className="font-bold text-mplp-text mb-2">Cross-Verified Report</h3>
                        <p className="text-xs text-mplp-text-muted mb-3">
                            Machine-readable summary of all cross-verified pairs, diff counts, and scenario families.
                        </p>
                        <code className="text-xs text-mplp-blue-soft/80 break-all">
                            public/_data/cross-verified/v0.10.2-report.json
                        </code>
                    </div>

                    {/* Equivalence Diffs */}
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2 block">Diffs</span>
                        <h3 className="font-bold text-mplp-text mb-2">Equivalence Diffs</h3>
                        <p className="text-xs text-mplp-text-muted mb-3">
                            Per-pair JSON diff files showing field-level equivalence across substrates.
                        </p>
                        <code className="text-xs text-mplp-blue-soft/80 break-all">
                            public/_data/cross-verified/diffs/
                        </code>
                    </div>

                    {/* Normalized Evidence */}
                    <div className="p-6 rounded-2xl bg-mplp-dark-soft/20 border border-mplp-border/30">
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2 block">Normalized</span>
                        <h3 className="font-bold text-mplp-text mb-2">Normalized Evidence</h3>
                        <p className="text-xs text-mplp-text-muted mb-3">
                            Substrate-agnostic projections of evidence packs (11 core elements).
                        </p>
                        <code className="text-xs text-mplp-blue-soft/80 break-all">
                            data/derived/normalized/
                        </code>
                    </div>
                </div>
            </section>

            {/* Related Links */}
            <section className="mb-12">
                <h2 className="text-lg font-bold text-mplp-text mb-4">Related Policies</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <Link href="/policies/fmm" className="p-4 rounded-xl border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all">
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">FMM</span>
                        <span className="text-sm text-mplp-text">Field Mapping Matrix</span>
                    </Link>
                    <Link href="/runs" className="p-4 rounded-xl border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all">
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Runs</span>
                        <span className="text-sm text-mplp-text">Curated Evidence Packs</span>
                    </Link>
                </div>
            </section>

            {/* Navigation */}
            <div className="mt-12 pt-8 border-t border-mplp-border/30 flex flex-wrap gap-6 text-xs font-bold uppercase tracking-wider">
                <Link href="/policies/contract" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Export Contract →
                </Link>
                <Link href="/policies/fmm" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Field Mapping Matrix →
                </Link>
                <Link href="/rulesets" className="text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    Rulesets →
                </Link>
            </div>
        </div>
    );
}
