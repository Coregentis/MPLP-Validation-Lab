
import React from 'react';

export function HomePrimaryCtas({ tokens }: { tokens: Record<string, string> }) {
    const cards = [
        {
            title: tokens.LIT_CTA_CURATED_RUNS_TITLE,
            desc: tokens.LIT_CTA_CURATED_RUNS_DESC,
            href: "/cases",
            color: "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
        },
        {
            title: tokens.LIT_CTA_START_BY_ROLE_TITLE,
            desc: tokens.LIT_CTA_START_BY_ROLE_DESC,
            href: "/start",
            color: "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10"
        },
        {
            title: tokens.LIT_CTA_LOCAL_REPRO_TITLE,
            desc: tokens.LIT_CTA_LOCAL_REPRO_DESC,
            href: "/docs/repro", // Assuming this route or external link, but we'll use local placeholder
            color: "border-green-500/30 bg-green-500/5 hover:bg-green-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 container mx-auto px-4">
            {cards.map((card, i) => (
                <a key={i} href={card.href} className={`block p-6 rounded-xl border transition ${card.color}`}>
                    <h3 className="text-xl font-bold mb-2 text-gray-100">{card.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{card.desc}</p>
                </a>
            ))}
        </div>
    );
}
