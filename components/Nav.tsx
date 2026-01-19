/**
 * Navigation Component
 * 
 * Aligned with MPLP Website Header Design
 * Uses: bg-glass, text-[13px], max-w-7xl
 */

import Link from 'next/link';

// Internal Lab navigation
const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/runs', label: 'Runs' },
    { href: '/adjudication', label: 'Adjudication' },
    { href: '/rulesets', label: 'Rulesets' },
    { href: '/guarantees', label: 'Guarantees' },
    { href: '/policies/contract', label: 'Contract' },
];

// External links (Ecosystem backlinks)
const EXTERNAL_LINKS = [
    { href: 'https://www.mplp.io', label: 'Protocol' },
    { href: 'https://docs.mplp.io', label: 'Docs' },
];

export function Nav() {
    return (
        <header className="sticky top-0 z-50 bg-glass transition-all">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px]" aria-label="Main navigation">
                <div className="flex items-center justify-between h-full">
                    {/* Logo - Premium hover */}
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group transition hover:scale-[1.02]" aria-label="Validation Lab Home">
                            <span className="text-lg font-bold text-mplp-blue-soft">MPLP</span>
                            <span className="text-mplp-text-muted">|</span>
                            <span className="text-lg font-bold text-white">Validation Lab</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="px-3 py-1.5 text-13 font-semibold text-mplp-text-muted hover:text-mplp-text hover:bg-white/5 transition-all rounded-lg"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Secondary Navigation / External Links */}
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-4">
                            {EXTERNAL_LINKS.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-13 font-medium text-mplp-text-muted hover:text-mplp-text transition-colors flex items-center gap-1"
                                >
                                    {item.label}
                                    <span className="text-mplp-text-muted opacity-50">↗</span>
                                </a>
                            ))}
                        </div>

                        {/* GitHub Button */}
                        <a
                            href="https://github.com/Coregentis/MPLP-Protocol"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 text-13 font-medium text-mplp-text-muted bg-mplp-dark-soft border border-mplp-border rounded-lg hover:bg-mplp-border hover:text-mplp-text transition-all"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>
        </header>
    );
}
