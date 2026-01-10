/**
 * Navigation Component
 * 
 * Main navigation for Validation Lab.
 * Links to: Home, Runs, Rulesets, Guarantees, Contract
 * Authority Map: Protocol, Docs (external)
 */

import Link from 'next/link';

// Internal Lab navigation
const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/runs', label: 'Runs' },
    { href: '/rulesets', label: 'Rulesets' },
    { href: '/guarantees', label: 'Guarantees' },
    { href: '/policies/contract', label: 'Contract' },
];

// External links (Authority Map backlinks)
const EXTERNAL_LINKS = [
    { href: 'https://www.mplp.io', label: 'Protocol' },
    { href: 'https://docs.mplp.io', label: 'Docs' },
];

export function Nav() {
    return (
        <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-white hover:text-zinc-300 transition">
                    MPLP Validation Lab
                </Link>
                <div className="flex items-center gap-6">
                    <ul className="flex gap-6">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="text-zinc-400 hover:text-white transition text-sm"
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <span className="text-zinc-700">|</span>
                    <ul className="flex gap-4">
                        {EXTERNAL_LINKS.map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-zinc-500 hover:text-zinc-300 transition text-xs"
                                >
                                    {item.label} ↗
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}
