
import React from 'react';

export function HomeResourcesMatrix({ tokens }: { tokens: Record<string, string> }) {
    const links = [
        { label: tokens.LIT_NAV_CASES, href: "/cases" },
        { label: tokens.LIT_NAV_LAWS, href: "/laws" },
        { label: tokens.LIT_NAV_COMPLIANCE, href: "/policies/reg-mapping" },
        { label: tokens.LIT_NAV_RULESETS, href: "/rulesets" },
        { label: tokens.LIT_NAV_RELEASES, href: "/releases" }
    ];

    return (
        <div className="container mx-auto px-4 py-16 text-center">
            <h3 className="uppercase tracking-widest text-xs font-bold text-gray-500 mb-6">{tokens.LIT_RESOURCES_TITLE}</h3>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                {links.map((link, i) => (
                    <a key={i} href={link.href} className="text-gray-400 hover:text-white transition text-sm">
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
}
