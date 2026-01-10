/**
 * Navigation Component
 * 
 * Main navigation for Validation Lab.
 * Links to: Home, Runs, Rulesets, Guarantees
 */

import Link from 'next/link';

const NAV_ITEMS = [
    { href: '/', label: 'Home' },
    { href: '/runs', label: 'Runs' },
    { href: '/rulesets', label: 'Rulesets' },
    { href: '/guarantees', label: 'Guarantees' },
    { href: '/policies/contract', label: 'Contract' },
];

export function Nav() {
    return (
        <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-3">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-white hover:text-zinc-300 transition">
                    MPLP Validation Lab
                </Link>
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
            </div>
        </nav>
    );
}
