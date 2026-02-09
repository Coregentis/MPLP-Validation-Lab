import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRelease } from '@/lib/releases/loadRelease';

import { ArrowLeft, Download, FileCode, ShieldCheck, ShieldAlert } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PageProps {
    params: Promise<{ build_id: string }>;
}

export default async function ReleaseDetailPage({ params }: PageProps) {
    const { build_id } = await params;
    const release = getRelease(build_id);

    if (!release) {
        notFound();
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

            {/* Left: Sidebar (Evidence) */}
            <aside className="lg:col-span-1 space-y-6">
                <Link href="/releases" className="inline-flex items-center gap-2 text-sm text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                    <ArrowLeft size={14} /> Back to Index
                </Link>

                <div className="bg-glass border border-mplp-border/40 rounded-xl p-5" data-testid="seal-downloads">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-4">Evidence Artifacts</h3>
                    <ul className="space-y-2">
                        {release.files.map(f => {
                            // Derive purpose label from filename
                            const purpose = f.includes('seal') ? 'Seal record' :
                                f.includes('gate') ? 'Gate log (recheck)' :
                                    f.includes('audit') ? 'Audit report' :
                                        f.includes('manifest') ? 'Manifest' :
                                            f.includes('lint') ? 'Lint audit' : null;
                            return (
                                <li key={f}>
                                    <a
                                        href={`/api/releases/${release.build_id}/${f}`}
                                        className="flex flex-col p-2 rounded hover:bg-mplp-dark-soft/50 text-sm group transition-colors"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-mplp-text-primary truncate">
                                                <FileCode size={14} className="text-mplp-blue-soft" />
                                                <span className="truncate">{f}</span>
                                            </span>
                                            <Download size={14} className="text-mplp-text-muted group-hover:text-mplp-text opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                        {purpose && (
                                            <span className="text-[10px] text-mplp-text-muted/60 mt-1 ml-5">{purpose}</span>
                                        )}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="bg-glass border border-mplp-border/40 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-2">Build Policy</h3>
                    <div className={`p-2 rounded text-center font-bold text-sm ${release.lint_policy === 'strict' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                        {release.lint_policy === 'strict' ? 'STRICT (Zero Debt)' : 'TOLERANT (Audited)'}
                    </div>
                </div>
            </aside>

            {/* Right: Seal Content */}
            <div className="lg:col-span-3">
                <div className="bg-glass border border-mplp-border/40 rounded-2xl p-8">
                    <div className="flex items-start justify-between mb-8 border-b border-mplp-border/20 pb-6">
                        <div>
                            <h1 className="text-3xl font-mono font-bold text-mplp-text mb-2">{release.build_id}</h1>
                            <p className="text-mplp-text-muted text-sm">Seal Verification Record • {release.date}</p>
                        </div>
                        <div
                            className={`p-3 rounded-xl border ${release.seal_status === 'VALID' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                release.seal_status === 'TOLERANT' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                    'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}
                            data-testid="seal-status"
                        >
                            <div className="flex flex-col items-center">
                                {release.seal_status === 'VALID' ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                                <span className="text-[10px] font-bold uppercase tracking-widest mt-1">{release.seal_status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Non-certification notice */}
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 mb-6" data-testid="seal-non-certification">
                        <p className="text-xs text-amber-400">
                            <strong>⚠️ NOT a Certificate or Endorsement.</strong> This seal records an internal verification state.
                            It does not constitute regulatory approval, legal warranty, or third-party validation.
                        </p>
                    </div>

                    {/* Seal Hash */}
                    <div className="bg-mplp-dark-soft/30 border border-mplp-border/20 rounded-lg p-4 mb-6" data-testid="seal-hash">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-2">Seal Hash (SHA-256)</h3>
                        <code className="text-xs font-mono text-emerald-400 break-all select-all block mb-3">
                            {release.seal_hash}
                        </code>
                        <p className="text-[10px] text-mplp-text-muted/70 leading-relaxed">
                            <code className="text-emerald-400/70">hash = sha256(seal.md)</code> — This hash fingerprints <strong>this seal record only</strong>.<br />
                            Evidence packs are verified by local recheck; this hash confirms the frozen seal file matches.
                        </p>
                    </div>

                    {/* Verify Steps */}
                    <div className="bg-mplp-dark-soft/30 border border-mplp-border/20 rounded-lg p-4 mb-6" data-testid="seal-verify-steps">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-3">How to Verify Locally</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-mplp-text-muted">
                            <li>Download <code>seal.md</code> and evidence artifacts from the sidebar</li>
                            <li>Run deterministic recheck: <code>sha256sum seal.md</code></li>
                            <li>Compare computed hash with the Seal Hash shown above</li>
                        </ol>
                    </div>

                    <article className="prose prose-invert prose-sm max-w-none prose-headings:text-mplp-text prose-a:text-mplp-blue-soft">
                        {/* We render raw markdown here. Caution: Assumes trusted content (internal seals). */}
                        <ReactMarkdown>{release.seal_content}</ReactMarkdown>
                    </article>
                </div>
            </div>

        </div>
    );
}
