import type { CuratedRunRecord } from '@/lib/curated/types';
import { HashCell } from './HashCell';
import Link from 'next/link';
import { StatusBadge } from '@/app/_shared/StatusBadge';

export function CuratedRunsTable({ runs }: { runs: CuratedRunRecord[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-mplp-dark-soft/50">
                    <tr>
                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text uppercase tracking-wider">Run ID</th>
                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Substrate</th>
                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Status</th>
                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Verdict Hash</th>
                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map(run => {
                        const adjStatus = (run as unknown as Record<string, unknown>).adjudication_status as string | undefined;
                        const adjHash = (run as unknown as Record<string, unknown>).adjudication_verdict_hash as string | undefined;
                        const isAdjudicated = adjStatus === 'ADJUDICATED';

                        return (
                            <tr key={run.run_id} className="border-b border-mplp-border/20 hover:bg-mplp-blue-soft/5 transition-colors group">
                                <td className="p-4">
                                    <Link href={`/runs/${run.run_id}`} className="text-mplp-text font-mono text-sm font-bold group-hover:text-mplp-blue-soft transition-colors">
                                        {run.run_id}
                                    </Link>
                                </td>
                                <td className="p-4 text-sm text-mplp-text-muted">{run.substrate}</td>
                                <td className="p-4">
                                    {isAdjudicated ? (
                                        <Link href={`/adjudication/${run.run_id}`} className="hover:opacity-80 transition-opacity">
                                            <StatusBadge status={adjStatus} />
                                        </Link>
                                    ) : (
                                        <StatusBadge status={adjStatus || 'NOT_ADJUDICATED'} />
                                    )}
                                </td>
                                <td className="p-4">
                                    {adjHash ? (
                                        <Link href={`/adjudication/${run.run_id}`} className="hover:opacity-80 transition-opacity">
                                            <HashCell hash={adjHash} label="verdict" />
                                        </Link>
                                    ) : (
                                        <HashCell hash={run.verdict_hash} label="verdict" />
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        {/* View Pack */}
                                        <Link
                                            href={`/runs/${run.run_id}`}
                                            className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-dark-soft border border-mplp-border/50 text-mplp-text-muted hover:text-mplp-text hover:border-mplp-blue-soft/50 hover:bg-mplp-blue-soft/10 transition-all"
                                            title="View evidence pack details"
                                        >
                                            Pack
                                        </Link>

                                        {/* Replay (always enabled) */}
                                        <Link
                                            href={`/runs/${run.run_id}/replay`}
                                            className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                                            title="View evidence replay"
                                        >
                                            Replay
                                        </Link>

                                        {/* View Adjudication Verdict */}
                                        {isAdjudicated ? (
                                            <Link
                                                href={`/adjudication/${run.run_id}`}
                                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-blue-soft/10 border border-mplp-blue-soft/30 text-mplp-blue-soft hover:bg-mplp-blue-soft/20 hover:border-mplp-blue-soft/50 transition-all"
                                                title="View adjudication bundle"
                                            >
                                                Verdict
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                aria-disabled="true"
                                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-dark-soft/50 border border-mplp-border/30 text-mplp-text-muted/50 cursor-not-allowed opacity-50"
                                                title="No adjudication bundle available (NOT_ADJUDICATED)"
                                            >
                                                Verdict
                                            </button>
                                        )}

                                        {/* Recheck Hash */}
                                        {isAdjudicated ? (
                                            <Link
                                                href={`/adjudication/${run.run_id}#recheck`}
                                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-emerald/10 border border-mplp-emerald/30 text-mplp-emerald hover:bg-mplp-emerald/20 hover:border-mplp-emerald/50 transition-all"
                                                title="Recheck verdict hash locally"
                                            >
                                                Recheck
                                            </Link>
                                        ) : (
                                            <button
                                                disabled
                                                aria-disabled="true"
                                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-dark-soft/50 border border-mplp-border/30 text-mplp-text-muted/50 cursor-not-allowed opacity-50"
                                                title="Recheck requires adjudication bundle (NOT_ADJUDICATED)"
                                            >
                                                Recheck
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Legacy/Archive Note */}
            <div className="mt-6 p-4 bg-amber-900/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-400/80">
                    <strong className="text-amber-400">Note:</strong> Curated Runs = indexed &amp; contract-governed.
                    Legacy runs (Autogen, Magentic One, etc.) in <code className="text-amber-300/80">releases/</code> are archived and not part of v0.2 freeze.
                </p>
            </div>
        </div>
    );
}
