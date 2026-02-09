/**
 * Rulesets Index Page
 * 
 * Lists available rulesets from data/rulesets/
 * Non-normative: only reflects what's in the ruleset files.
 */

import Link from 'next/link';
import { listRulesets } from '@/lib/rulesets/loadRuleset';
import type { Metadata } from 'next';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';

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



import fs from 'fs';
import path from 'path';
import Doclet from '@/components/doclets/Doclet';

export default async function RulesetsPage() {
    const rulesets = listRulesets();
    const versionModel = await getVersionStripModel();
    const rulesetsDocletMd = fs.readFileSync(path.join(process.cwd(), 'content/doclets/rulesets.md'), 'utf-8');

    return (
        <>
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3 flex items-center gap-2">
                    Evaluation Logic
                    <span className="w-px h-3 bg-mplp-border/50 mx-2" />
                    <span className="text-[10px] tracking-widest opacity-60 font-mono">SSOT: RULESET-REGISTRY-V{versionModel.ruleset_inventory.current_default.split('-')[1] || '1.1'}</span>
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Rulesets</h1>
                <div className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    <Doclet md={rulesetsDocletMd.split('##')[1]} model={versionModel} />
                </div>

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
                <div className="grid gap-6 md:grid-cols-2" data-testid="rulesets-unified-grid">
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
                                        <div className="flex gap-2">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rs.source === 'v2'
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                                }`}>
                                                {rs.source || 'v1'}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rs.status === 'active'
                                                ? 'bg-mplp-blue-soft/10 text-mplp-blue-soft border border-mplp-blue-soft/20'
                                                : 'bg-mplp-dark-soft text-mplp-text-muted border border-mplp-border/40'
                                                }`}>
                                                {rs.status}
                                            </span>
                                        </div>
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
        </>
    );
}
