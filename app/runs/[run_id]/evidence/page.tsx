/**
 * Evidence Preview Page
 * 
 * Displays evidence file content with locator-based navigation.
 * Path: /runs/{run_id}/evidence?file=<artifact_path>&loc=<locator>
 * 
 * SECURITY: Read-only access to evidence files within run directory.
 */

import Link from 'next/link';
import { loadEvidence } from '@/lib/runs/loadEvidence';

interface PageProps {
    params: Promise<{ run_id: string }>;
    searchParams: Promise<{ file?: string; loc?: string }>;
}

export default async function EvidencePreviewPage({ params, searchParams }: PageProps) {
    const { run_id } = await params;
    const { file, loc } = await searchParams;

    if (!file) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
                <p className="text-zinc-400">Missing file parameter</p>
                <Link href={`/runs/${run_id}`} className="text-blue-400 hover:underline mt-4 inline-block">
                    ← Back to Run
                </Link>
            </div>
        );
    }

    const result = loadEvidence(run_id, file, loc);

    if (!result.success) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
                <p className="text-zinc-400">{result.error}</p>
                <Link href={`/runs/${run_id}`} className="text-blue-400 hover:underline mt-4 inline-block">
                    ← Back to Run
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link href={`/runs/${run_id}`} className="text-blue-400 hover:underline text-sm">
                    ← Back to Run: {run_id}
                </Link>
                <h1 className="text-2xl font-bold mt-2 font-mono">{result.fileName}</h1>
                <p className="text-zinc-500 text-sm font-mono">{result.filePath}</p>
                {result.locator && (
                    <p className="text-amber-400 text-sm mt-1">
                        Locator: {result.locator.raw}
                    </p>
                )}
            </div>

            {/* File Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span>Type: <span className="text-zinc-300">{result.contentType}</span></span>
                    {result.totalLines && (
                        <span>Lines: <span className="text-zinc-300">{result.totalLines}</span></span>
                    )}
                    {result.tooLarge && (
                        <span className="text-amber-400">
                            File too large ({Math.round((result.fileSize || 0) / 1024)}KB) - truncated
                        </span>
                    )}
                </div>
            </div>

            {/* Content Preview */}
            {result.lines && result.lines.length > 0 ? (
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <pre className="text-sm leading-relaxed">
                            {result.lines.map((line) => (
                                <div
                                    key={line.num}
                                    className={`flex ${line.highlight ? 'bg-amber-900/30' : ''}`}
                                >
                                    <span className="w-16 px-3 py-0.5 text-right text-zinc-600 bg-zinc-900 border-r border-zinc-800 select-none flex-shrink-0">
                                        {line.num}
                                    </span>
                                    <code className="px-4 py-0.5 text-zinc-300 whitespace-pre">
                                        {line.content}
                                    </code>
                                </div>
                            ))}
                        </pre>
                    </div>
                    {result.lines.length < (result.totalLines || 0) && (
                        <div className="text-center text-zinc-500 py-2 border-t border-zinc-800 text-sm">
                            Showing {result.lines.length} of {result.totalLines} lines
                        </div>
                    )}
                </div>
            ) : result.contentType === 'binary' ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <p className="text-zinc-500">Binary file - preview not available</p>
                    <a
                        href={`/api/runs/${run_id}/download?file=${encodeURIComponent(file)}`}
                        className="text-blue-400 hover:underline mt-4 inline-block"
                        download
                    >
                        ↓ Download file
                    </a>
                </div>
            ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <p className="text-zinc-500">No content to display</p>
                </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-4">
                <a
                    href={`/api/runs/${run_id}/download?file=${encodeURIComponent(file)}`}
                    className="text-blue-400 hover:underline text-sm"
                    download
                >
                    ↓ Download this file
                </a>
            </div>
        </div>
    );
}
