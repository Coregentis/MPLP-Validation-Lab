'use client';

import Link from 'next/link';
import { ExternalLink, Download } from 'lucide-react';

interface EvidenceActionsProps {
    runId: string;
    source: 'v1' | 'v2';
    variant?: 'default' | 'minimal' | 'header';
}

export function EvidenceActions({ runId, source, variant = 'default' }: EvidenceActionsProps) {
    // Logic for routes
    // V1 View JSON: /api/runs/[run_id]/files/manifest.json (or similar? Usually we view the raw context or just JSON)
    // V2 View JSON: /api/v2/runs/[run_id]

    // V1 Download: /api/runs/[run_id]/download-zip (New)
    // V2 Download: /api/v2/runs/[run_id]/evidence

    const jsonHref = source === 'v2'
        ? `/api/v2/runs/${runId}`
        : `/api/runs/${runId}/files/manifest.json`; // Default to manifest for V1

    const downloadHref = source === 'v2'
        ? `/api/v2/runs/${runId}/evidence`
        : `/api/runs/${runId}/download-zip`;

    const jsonLabel = "View JSON";
    const downloadLabel = "Download Pack";

    if (variant === 'header') {
        return (
            <div className="flex items-center gap-2">
                <Link
                    href={jsonHref}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border border-mplp-border/50 text-mplp-text-muted hover:text-mplp-text hover:bg-mplp-dark-soft transition-all"
                >
                    <ExternalLink className="w-3 h-3" />
                    {jsonLabel}
                </Link>
                <Link
                    href={downloadHref}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded bg-mplp-blue-soft/10 border border-mplp-blue-soft/30 text-mplp-blue-soft hover:bg-mplp-blue-soft/20 hover:border-mplp-blue-soft/50 transition-all"
                >
                    <Download className="w-3 h-3" />
                    {downloadLabel}
                </Link>
            </div>
        );
    }

    if (variant === 'minimal') {
        return (
            <div className="flex gap-2">
                <a href={jsonHref} target="_blank" className="text-xs px-2 py-1 bg-mplp-blue text-white rounded hover:bg-mplp-blue/80">{jsonLabel}</a>
                <a href={downloadHref} className="text-xs px-2 py-1 border border-mplp-border rounded hover:bg-white/5">{downloadLabel}</a>
            </div>
        );
    }

    // Default variant
    return (
        <div className="flex gap-3">
            <Link
                href={jsonHref}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-mplp-border/50 bg-mplp-dark-soft text-mplp-text hover:bg-mplp-border/20 transition-all"
            >
                <ExternalLink className="w-4 h-4" />
                {jsonLabel}
            </Link>
            <Link
                href={downloadHref}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-mplp-blue text-white hover:bg-mplp-blue/90 transition-all"
            >
                <Download className="w-4 h-4" />
                {downloadLabel}
            </Link>
        </div>
    );
}
