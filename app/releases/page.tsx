import Link from 'next/link';
import { Nav } from '@/components/Nav';
import { VersionStrip } from '@/components/VersionStrip';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';
import { listUnifiedReleases, UnifiedRelease } from '@/lib/releases/listUnifiedReleases';

export default async function ReleasesPage() {
    const versionModel = await getVersionStripModel();
    const releases = listUnifiedReleases();

    return (
        <main className="min-h-screen bg-mplp-dark-bg text-mplp-text-primary px-4 py-8">
            <Nav />
            <VersionStrip {...versionModel} />
            <div className="max-w-4xl mx-auto mt-12">
                <div className="mb-6">
                    <Link href="/governance" className="text-mplp-blue hover:underline text-sm font-mono">&larr; Back to Governance</Link>
                </div>
                <h1 className="text-3xl font-bold mb-6 font-mono">Releases & Seals</h1>
                <p className="text-mplp-text-muted mb-8">
                    Immutable records of verified unified releases.
                </p>

                <div className="space-y-6">
                    {releases.length === 0 ? (
                        <div className="p-8 border border-mplp-border/30 rounded-xl bg-mplp-bg-card text-center">
                            <p className="text-mplp-text-muted">No sealed releases found.</p>
                        </div>
                    ) : (
                        releases.map(release => (
                            <ReleaseCard key={release.id} release={release} />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

function ReleaseCard({ release }: { release: UnifiedRelease }) {
    return (
        <div className="p-6 border border-mplp-border bg-mplp-bg-card rounded-lg hover:border-mplp-blue/50 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-bold font-mono text-mplp-text-primary flex items-center gap-3">
                        {release.build_id}
                        <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider ${release.status === 'VALID'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                            {release.status}
                        </span>
                    </h2>
                    <p className="text-sm text-mplp-text-muted font-mono mt-1">{release.date}</p>
                </div>
                <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60">
                        {release.targets_verified} Targets Verified
                    </span>
                    <p className="text-xs text-mplp-text-muted mt-1">Basis: {release.basis}</p>
                </div>
            </div>

            <div className="pt-4 border-t border-mplp-border/30 flex gap-4 text-xs font-mono">
                {release.artifacts.seal && (
                    <span className="text-mplp-text-muted">Seal: <span className="text-mplp-text-primary">SHA-256</span></span>
                )}
                {/* We could add direct download links if we exposed a route for artifacts */}
            </div>
        </div>
    );
}
