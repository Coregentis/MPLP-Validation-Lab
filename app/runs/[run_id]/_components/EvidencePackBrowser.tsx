export function EvidencePackBrowser({ runId }: { runId: string }) {
    const files = [
        { path: 'manifest.json', category: 'manifest' },
        { path: 'integrity/sha256sums.txt', category: 'integrity' },
        { path: 'integrity/pack.sha256', category: 'integrity' },
        { path: 'timeline/events.ndjson', category: 'timeline' },
        { path: 'artifacts/context.json', category: 'artifacts' },
        { path: 'artifacts/plan.json', category: 'artifacts' },
        { path: 'artifacts/trace.json', category: 'artifacts' }
    ];

    const categoryColors: Record<string, string> = {
        manifest: 'bg-mplp-blue-soft/20 text-mplp-blue-soft border-mplp-blue-soft/30',
        integrity: 'bg-mplp-emerald/20 text-mplp-emerald border-mplp-emerald/30',
        timeline: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        artifacts: 'bg-mplp-indigo/20 text-mplp-indigo border-mplp-indigo/30',
    };

    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-mplp-dark-soft/80 px-6 py-4 border-b border-mplp-border/30 flex justify-between items-center">
                <h2 className="text-lg font-bold text-mplp-text">Evidence Pack</h2>
                <span className="text-xs font-bold text-mplp-text-muted">{files.length} files</span>
            </div>

            <ul className="divide-y divide-mplp-border/20">
                {files.map(file => (
                    <li key={file.path} className="flex items-center justify-between px-6 py-3 hover:bg-mplp-blue-soft/5 transition-colors">
                        <div className="flex items-center gap-3">
                            {/* Category Pill */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${categoryColors[file.category]}`}>
                                {file.category}
                            </span>
                            <code className="text-sm font-mono text-mplp-text">{file.path}</code>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/api/runs/${runId}/files/${file.path}`}
                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-dark-soft border border-mplp-border/50 text-mplp-text-muted hover:text-mplp-text hover:border-mplp-blue-soft/50 transition-all"
                            >
                                View
                            </a>
                            <a
                                href={`/api/runs/${runId}/download/${file.path}`}
                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded bg-mplp-blue-soft/10 border border-mplp-blue-soft/30 text-mplp-blue-soft hover:bg-mplp-blue-soft/20 hover:border-mplp-blue-soft/50 transition-all"
                            >
                                Download
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
