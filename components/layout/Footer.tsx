/**
 * Footer Component
 * 
 * Aligned with MPLP Website Footer Design
 * Uses: 12-column grid, uppercase headers, social icons
 * 
 * P2-1: Version now uses VersionBadge component from SSOT
 */

import Link from 'next/link';
import { Logo } from "@/components/ui/logo";
import { VersionBadge } from "@/components/common/VersionBadge";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-mplp-dark text-mplp-text border-t border-mplp-border/50 relative z-10" aria-label="Site Footer">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    {/* Brand Column */}
                    <div className="md:col-span-4">
                        <Link href="/" className="mb-4 inline-block group transition hover:scale-[1.02]" aria-label="Validation Lab Home">
                            <div className="flex items-center gap-2">
                                <Logo className="h-7 w-auto" />
                                <span className="text-mplp-text-muted mt-0.5">|</span>
                                <span className="text-[13px] font-bold text-white uppercase tracking-wider mt-1">Validation Lab</span>
                            </div>
                        </Link>
                        <p className="text-mplp-text-muted text-sm leading-relaxed max-w-xs font-normal mt-4">
                            <strong>Evidence-Based Verdicts</strong><br />
                            Non-certifying, vendor-neutral conformance evaluation for MPLP lifecycle invariants.
                        </p>
                        <div className="mt-4">
                            <VersionBadge variant="lab" />
                        </div>
                    </div>

                    {/* Links Columns - 3 Column IA Structure */}
                    <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8" role="navigation" aria-label="Footer Navigation">
                        {/* Governance */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text mb-4 border-b border-mplp-border/50 pb-2">Governance</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/about" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        About (Four Boundaries)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/validation" className="text-mplp-text hover:text-mplp-blue-light text-13 transition-colors font-bold block py-0.5">
                                        Validation Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/methodology" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Methodology
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/guarantees" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Lifecycle Guarantees (LG)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/contract" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Export Contract
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/cross-verified" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Cross-Verified Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/substrate-scope" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Substrate Scope
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/intake" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Intake Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/strength" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Ruleset Strength Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Evidence */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text mb-4 border-b border-mplp-border/50 pb-2">Evidence</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link href="/adjudication" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Adjudication Bundles
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/validation/samples" className="text-mplp-text hover:text-mplp-blue-light text-13 transition-colors font-bold block py-0.5">
                                        Evidence Samples (MUST-1)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/coverage" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Test Vector Coverage
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/coverage/adjudication" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Adjudication Coverage
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/rulesets" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Rulesets
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/rulesets/evolution" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Ruleset Evolution
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/runs" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Curated Runs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/policies/fmm" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Field Mapping Matrix (FMM)
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/examples/evidence-producers" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Evidence Producers
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/builder" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Builder Guide
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Community */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text mb-4 border-b border-mplp-border/50 pb-2">Community</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="https://github.com/Coregentis/MPLP-Protocol" target="_blank" rel="noopener noreferrer" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        GitHub ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="https://www.mplp.io" target="_blank" rel="noopener noreferrer" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Protocol Website ↗
                                    </a>
                                </li>
                                <li>
                                    <a href="https://docs.mplp.io" target="_blank" rel="noopener noreferrer" className="text-mplp-text-muted hover:text-mplp-blue-light text-13 transition-colors font-medium block py-0.5">
                                        Documentation ↗
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-mplp-border/50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-mplp-text-muted text-xs">
                            <strong>Non-Certification</strong> — The Lab evaluates evidence, not agentic systems.
                        </p>
                        <p className="text-mplp-text-muted text-xs">
                            © {currentYear} Bangshi Beijing Network Technology Co., Ltd. Licensed under the{' '}
                            <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer" className="hover:text-mplp-blue-light underline">
                                Apache License, Version 2.0
                            </a>. Governed by{' '}
                            <a href="https://www.mplp.io/governance/overview" target="_blank" rel="noopener noreferrer" className="hover:text-mplp-blue-light underline">MPGC</a>.
                        </p>
                    </div>

                    {/* Social Icons */}
                    <div className="flex justify-center gap-6 mt-6">
                        <a
                            href="https://github.com/Coregentis/MPLP-Protocol"
                            className="text-mplp-text-muted hover:text-mplp-text transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MPLP on GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                        </a>
                        <a
                            href="https://x.com/mplp_io"
                            className="text-mplp-text-muted hover:text-mplp-text transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="MPLP on X"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
