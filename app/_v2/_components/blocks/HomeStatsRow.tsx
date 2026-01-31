
import React from 'react';

export function HomeStatsRow({ tokens, data }: { tokens: Record<string, string>, data: any }) {
    // Fallback if data absent (though binding should provide ssot.stats)
    const stats = [
        { label: tokens.LIT_STATS_RUNS, value: data?.run_count || tokens.LIT_NOT_AVAILABLE },
        { label: tokens.LIT_STATS_RULESET, value: data?.ruleset_version || "v2.0" },
        { label: tokens.LIT_STATS_DETERMINISM, value: "100%" },
        { label: tokens.LIT_STATS_EVIDENCE_PACKS, value: data?.evidence_count || tokens.LIT_NOT_AVAILABLE },
    ];

    return (
        <div className="border-y border-gray-800 bg-gray-900/30 py-8 my-10 backdrop-blur-sm">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center text-center">
                {stats.map((stat, i) => (
                    <div key={i} className="flex-1 min-w-[150px] border-r border-gray-800 last:border-0">
                        <div className="text-3xl font-bold text-gray-100 font-mono mb-1">{stat.value}</div>
                        <div className="text-xs uppercase tracking-widest text-gray-500">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
