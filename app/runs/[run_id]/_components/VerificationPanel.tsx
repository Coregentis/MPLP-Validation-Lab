import type { CuratedRunRecord } from '@/lib/curated/types';
import Link from 'next/link';
import { getRunDisplayContract } from '@/lib/ui-contracts';
import { HashDisplay } from '@/components/ui/hash-display';

export function VerificationPanel({ run }: { run: CuratedRunRecord }) {
    const recomputeCmd = `npx @mplp/recompute data/runs/${run.run_id} --ruleset 1.0`;
    const contract = getRunDisplayContract(run);

    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-mplp-dark-soft/80 px-6 py-4 border-b border-mplp-border/30 flex justify-between items-center">
                <h2 className="text-lg font-bold text-mplp-text">Third-Party Verification</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-mplp-emerald bg-mplp-emerald/10 px-2 py-1 rounded border border-mplp-emerald/30">
                    Read-Only
                </span>
            </div>

            <div className="p-6 space-y-6">
                {contract.hashDisplayMode === 'hidden' ? (
                    /* Archived Run Info Card */
                    <div className="bg-zinc-900/60 border border-zinc-700/50 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                                <span className="text-xl">🗃️</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-200 mb-1">Evidence Status: Archived</h3>
                                <p className="text-sm text-zinc-400">
                                    This run does not have complete verification artifacts.
                                </p>
                            </div>
                        </div>
                        <div className="bg-black/30 border border-zinc-800 rounded p-3">
                            <dt className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Reason</dt>
                            <dd className="text-sm text-zinc-300">{contract.tooltip}</dd>
                        </div>
                        <p className="text-xs text-zinc-500 mt-4">
                            Future availability: Contact governance for evidence completion pathway.
                        </p>
                    </div>
                ) : (
                    /* Standard Hash Display for Indexable Runs */
                    <>
                        <p className="text-sm text-mplp-text-muted">
                            Anyone can independently verify this verdict using the recompute CLI:
                        </p>

                        {/* Command Block */}
                        <div className="bg-black/40 border border-mplp-border/30 rounded-lg p-4 overflow-x-auto">
                            <code className="text-sm font-mono text-mplp-emerald">{recomputeCmd}</code>
                        </div>

                        {/* Expected Output */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-4">Expected Output</h3>
                            <dl className="space-y-4">
                                <div className="bg-black/30 border border-mplp-border/20 rounded-lg p-4">
                                    <HashDisplay
                                        label="verdict_hash"
                                        hash={run.verdict_hash}
                                        mode={contract.hashDisplayMode}
                                    />
                                </div>
                                <div className="bg-black/30 border border-mplp-border/20 rounded-lg p-4">
                                    <HashDisplay
                                        label="pack_root_hash"
                                        hash={run.pack_root_hash}
                                        mode={contract.hashDisplayMode}
                                    />
                                </div>
                                {run.verify_report_hash && (
                                    <div className="bg-black/30 border border-mplp-border/20 rounded-lg p-4">
                                        <HashDisplay
                                            label="verify_report_hash"
                                            hash={run.verify_report_hash}
                                            mode={contract.hashDisplayMode}
                                        />
                                    </div>
                                )}
                                {(run as any).evaluation_report_hash && (
                                    <div className="bg-black/30 border border-mplp-border/20 rounded-lg p-4">
                                        <HashDisplay
                                            label="evaluation_report_hash"
                                            hash={(run as any).evaluation_report_hash}
                                            mode="full"
                                        />
                                    </div>
                                )}
                            </dl>
                        </div>

                        {/* Reproduction Available */}
                        {run.substrate_claim_level === 'reproduced' && (
                            <div className="bg-mplp-emerald/10 border border-mplp-emerald/30 rounded-lg p-4">
                                <h3 className="font-bold text-mplp-emerald text-sm mb-1">Reproduction Available</h3>
                                <p className="text-sm text-mplp-text-muted">
                                    Full reproduction steps:{' '}
                                    <Link
                                        href={`/examples/evidence-producers/${run.substrate}#repro-steps`}
                                        className="text-mplp-blue-soft hover:text-mplp-blue-light font-semibold"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        README.md#repro-steps ↗
                                    </Link>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
