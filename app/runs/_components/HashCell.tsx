'use client';

import { useState } from 'react';

export function HashCell({ hash, label }: { hash: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (!hash) return;
        await navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!hash) {
        return <span className="text-xs text-mplp-text-muted italic">—</span>;
    }

    return (
        <div className="flex items-center gap-2">
            <code className="text-xs bg-zinc-900 border border-zinc-800 px-2 py-1 rounded font-mono text-amber-400" title={hash}>
                {hash.slice(0, 16)}...
            </code>
            <button
                onClick={handleCopy}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
                title={`Copy ${label}_hash`}
            >
                {copied ? '✓' : '📋'}
            </button>
        </div>
    );
}
