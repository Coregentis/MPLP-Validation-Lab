import Link from 'next/link';
import { listUniqueReleases } from '@/lib/releases/loadRelease';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';
import { ShieldCheck, ShieldAlert, FileText, Clock } from 'lucide-react';

export const metadata = {
    title: 'Release Seals | MPLP Validation Lab',
    description: 'Immutable release artifacts and verification seals.',
};

export default async function ReleaseIndexPage() {
    const releases = listUniqueReleases();
    const versionModel = await getVersionStripModel();

    return (
        <div>
            {/* Header */}
            <div className="mb-12 mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Audit Trail</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Release Seals</h1>
                <div className="max-w-3xl">
                    <p className="text-mplp-text-muted text-lg leading-relaxed">
                        Immutable verification records for every release candidate. Each entry represents a sealed state of the Validation Lab.
                    </p>
                </div>
            </div>

            {/* Release Legend */}
            <div className="mb-12 p-6 bg-glass border border-mplp-border/30 rounded-xl" data-testid="releases-legend">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-2 bg-mplp-blue/10 rounded-lg">
                        <ShieldCheck className="text-mplp-blue-soft w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-mplp-text mb-1">What is a Release Seal?</h2>
                        <p className="text-sm text-mplp-text-muted">A frozen fingerprint of adjudication results and evidence artifacts.</p>
                    </div>
                </div>

                <div className="space-y-6 text-sm text-mplp-text-muted">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="font-bold text-emerald-400 uppercase tracking-wider text-xs">Reproduced</span>
                            </div>
                            <p className="text-xs opacity-80">Downloadable evidence pack + deterministic recheck + hash matches release seal.</p>
                        </div>
                        <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                <span className="font-bold text-red-400 uppercase tracking-wider text-xs">Dispute Ready</span>
                            </div>
                            <p className="text-xs opacity-80">Contains FAIL/dispute samples for counter-evidence or tribunal-style adjudication.</p>
                        </div>
                    </div>

                    <div className="border-t border-mplp-border/20 pt-4">
                        <h3 className="font-bold text-mplp-text mb-3 text-xs uppercase tracking-widest">How to Verify</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-mplp-blue-soft font-bold">01. Select ID</span>
                                <p className="text-xs opacity-60">Choose a build_id from the list below.</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-mplp-blue-soft font-bold">02. Download</span>
                                <p className="text-xs opacity-60">Get the evidence pack ZIP and manifest.</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-mplp-blue-soft font-bold">03. Local Check</span>
                                <p className="text-xs opacity-60">Run sha256sum and match with Seal Hash.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {releases.length === 0 && (
                    <div className="p-8 text-center text-mplp-text-muted bg-mplp-dark-soft/40 border border-mplp-border/20 rounded-xl">
                        <p className="mb-1">No sealed releases found.</p>
                        <code className="text-xs text-mplp-text-muted/60">Check releases/unified/ directory.</code>
                    </div>
                )}

                {releases.map((rel) => (
                    <Link key={rel.build_id} href={`/releases/${rel.build_id}`} className="block group">
                        <div className="bg-glass border border-mplp-border/30 rounded-xl p-5 hover:border-mplp-blue-soft/50 hover:bg-mplp-dark-soft/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6">

                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-lg ${rel.seal_status === 'VALID' ? 'bg-emerald-500/10 text-emerald-400' :
                                    rel.seal_status === 'TOLERANT' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>
                                    {rel.seal_status === 'VALID' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-mono font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors mb-1">
                                        {rel.build_id}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-mplp-text-muted font-mono opacity-80">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={12} /> {rel.date}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-mplp-border" />
                                        <span className="flex items-center gap-1.5">
                                            <FileText size={12} /> {rel.evidence_count} Artifacts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {rel.seal_status === 'TOLERANT' && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-1 rounded border border-amber-500/20">
                                        Tolerant
                                    </span>
                                )}
                                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider border ${rel.seal_status === 'VALID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    rel.seal_status === 'TOLERANT' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                        'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    {rel.seal_status}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
