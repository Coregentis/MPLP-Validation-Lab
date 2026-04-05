/**
 * Runsets Index Page
 *
 * Runtime sources:
 * - public/_data/curated-runs.json
 * - public/_data/v2/runs/index.json
 *
 * Upstream provenance:
 * - governance/runsets.yaml
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { loadAllRunsets } from '@/lib/unified/load-all-runsets';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Runsets',
    description: 'Manage evidence collections (Runsets) across V1 (Simulated) and V2 (Reproduced) substrates.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/runsets`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default async function RunsetsPage() {
    const runsets = loadAllRunsets();

    return (
        <>
            <div data-testid="runsets-page-root">
                <header className="mb-12">
                    <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Inventory</p>
                    <h1 className="text-4xl font-bold text-mplp-text mb-6">Runsets</h1>
                    <p className="text-xl text-mplp-text-muted max-w-2xl">
                        Unified indexes of evidence packs. Select a runset to drill down into specific validation series.
                    </p>
                    <p className="mt-3 text-xs text-mplp-text-muted/70 max-w-3xl">
                        Runtime source: <code className="font-mono">public/_data/curated-runs.json</code> + <code className="font-mono">public/_data/v2/runs/index.json</code>.
                        Upstream provenance and set relationships are governed by <code className="font-mono">governance/runsets.yaml</code>.
                    </p>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                    {runsets.map((rs) => (
                        <Link
                            key={rs.id}
                            href={rs.href}
                            className="group block p-8 bg-glass border border-mplp-border/40 rounded-2xl hover:border-mplp-blue-soft/40 transition-all relative overflow-hidden"
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-mplp-blue-soft/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h2 className="font-bold text-xl text-mplp-text group-hover:text-mplp-blue-soft transition-colors tracking-tight">
                                            {rs.title}
                                        </h2>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${rs.source === 'v2'
                                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {rs.source.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-sm font-mono text-mplp-text-muted mb-4 opacity-80">
                                        v{rs.version} • {rs.generated_at.split('T')[0]}
                                    </div>
                                    <p className="text-sm text-mplp-text-muted mb-6 line-clamp-2">
                                        {rs.description}
                                    </p>
                                </div>
                            </div>

                            <div className="relative z-10 flex items-center justify-between pt-6 border-t border-mplp-border/30">
                                <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 group-hover:text-mplp-text-muted transition-colors">
                                    {rs.run_count} Evidence Packs
                                </span>
                                <span className="text-mplp-blue-soft opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                    View Details &rarr;
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
