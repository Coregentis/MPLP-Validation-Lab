/**
 * RunsStatusSummary Component
 * 
 * Displays a status bar with counts for Runs page.
 * Purpose: Improve external perception by explaining run status distribution.
 * 
 * Governance: Non-certification language only.
 */

import Link from 'next/link';

interface RunsStatusSummaryProps {
    totalRuns: number;
    adjudicatedCount: number;
    pendingCount: number;
    indexableCount: number;
    archivedCount: number;
}

export function RunsStatusSummary({ totalRuns, adjudicatedCount, pendingCount, indexableCount, archivedCount }: RunsStatusSummaryProps) {
    return (
        <div className="mb-8 p-4 bg-mplp-dark-soft/30 border border-mplp-border/30 rounded-xl">
            <div className="flex flex-wrap items-center gap-6 text-sm">
                {/* Total */}
                <div className="flex items-center gap-2">
                    <span className="text-mplp-text-muted">Curated Runs:</span>
                    <span className="font-bold text-mplp-text">{totalRuns}</span>
                </div>

                {/* Adjudicated */}
                <Link href="/adjudication" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-mplp-text-muted">Adjudicated:</span>
                    <span className="font-bold text-green-400">{adjudicatedCount}</span>
                </Link>

                {/* Pending */}
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    <span className="text-mplp-text-muted">Registered (Not Evaluated):</span>
                    <span className="font-bold text-zinc-400">{pendingCount}</span>
                </div>

                {/* Divider */}
                <div className="h-4 w-px bg-mplp-border/50" />

                {/* Indexable */}
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-mplp-text-muted">Indexable:</span>
                    <span className="font-bold text-green-400">{indexableCount}</span>
                </div>

                {/* Archived */}
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span className="text-mplp-text-muted">Archived:</span>
                    <span className="font-bold text-zinc-500">{archivedCount}</span>
                </div>
            </div>

            {/* Explanation */}
            <p className="mt-3 text-xs text-mplp-text-muted/80">
                Runs are curated references from <code className="px-1 py-0.5 rounded bg-mplp-dark-soft text-mplp-text-muted font-mono text-[10px]">runsets.yaml</code>.
                Only runs with an adjudication bundle have deterministic <code className="px-1 py-0.5 rounded bg-mplp-dark-soft text-mplp-text-muted font-mono text-[10px]">verdict_hash</code> and can be rechecked.
            </p>
        </div>
    );
}
