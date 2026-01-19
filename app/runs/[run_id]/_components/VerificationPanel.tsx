import type { CuratedRunRecord } from '@/lib/curated/types';
import Link from 'next/link';

export function VerificationPanel({ run }: { run: CuratedRunRecord }) {
    const recomputeCmd = `npx @mplp/recompute data/runs/${run.run_id} --ruleset 1.0`;

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
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-mplp-text-muted mb-2">verdict_hash</dt>
                            <dd className="font-mono text-sm text-mplp-text break-all select-all">
                                {run.verdict_hash}
                            </dd>
                        </div>
                        <div className="bg-black/30 border border-mplp-border/20 rounded-lg p-4">
                            <dt className="text-[11px] font-bold uppercase tracking-wider text-mplp-text-muted mb-2">pack_root_hash</dt>
                            <dd className="font-mono text-sm text-mplp-text break-all select-all">
                                {run.pack_root_hash}
                            </dd>
                        </div>
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
            </div>
        </section>
    );
}
