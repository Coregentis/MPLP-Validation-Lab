/**
 * Rulesets Index Page
 * 
 * Lists available rulesets from data/rulesets/
 * Non-normative: only reflects what's in the ruleset files.
 */

import Link from 'next/link';
import { listRulesets } from '@/lib/rulesets/loadRuleset';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Rulesets — MPLP Validation Lab',
    description: 'Versioned rulesets for MPLP evidence-based verdicts. Each ruleset defines requirements for Lifecycle Guarantees evaluation.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/rulesets`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RulesetsPage() {
    const rulesets = listRulesets();

    return (
        <div className="pt-8">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Evaluation Logic</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Rulesets</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Versioned rulesets for evidence-based verdicts. Each ruleset defines requirements for Lifecycle Guarantees evaluation.
                </p>

                {/* Status Legend */}
                <div className="mt-6 flex flex-wrap gap-6 text-[11px] uppercase tracking-widest font-bold">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-mplp-blue-soft ring-4 ring-mplp-blue-soft/10" />
                        <span className="text-mplp-text">Active</span>
                        <span className="text-mplp-text-muted font-normal lowercase tracking-normal">— Authoritative for official verdicts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-mplp-text-muted/40" />
                        <span className="text-mplp-text-muted">Draft</span>
                        <span className="text-mplp-text-muted/60 font-normal lowercase tracking-normal">— Proposed logic, not for adjudication</span>
                    </div>
                </div>
            </div>

            {rulesets.length === 0 ? (
                <div className="p-8 text-center border border-mplp-border/30 rounded-xl bg-mplp-dark-soft/20">
                    <p className="text-mplp-text-muted">No rulesets available.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {rulesets.map((rs) => (
                        <Link
                            key={rs.id}
                            href={`/rulesets/${rs.id}`}
                            className="group block p-8 bg-glass border border-mplp-border/40 rounded-2xl hover:border-mplp-blue-soft/40 transition-all relative overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-mplp-blue-soft/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="font-bold text-xl text-mplp-text group-hover:text-mplp-blue-soft transition-colors tracking-tight">
                                            {rs.name || rs.id}
                                        </h2>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rs.status === 'active'
                                            ? 'bg-mplp-blue-soft/10 text-mplp-blue-soft border border-mplp-blue-soft/20'
                                            : 'bg-mplp-dark-soft text-mplp-text-muted border border-mplp-border/40'
                                            }`}>
                                            {rs.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-mplp-text-muted font-mono mb-6">v{rs.version}</p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-mplp-border/30">
                                <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 group-hover:text-mplp-text-muted transition-colors">
                                    {rs.clauses?.length
                                        ? `${rs.clauses.length} Clauses`
                                        : `${rs.golden_flows?.length || 0} Lifecycle Guarantees`}
                                </span>
                                <span className="text-mplp-blue-soft opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
