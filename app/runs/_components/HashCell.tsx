'use client';

import { useState } from 'react';

export function HashCell({ hash, label }: { hash: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono" title={hash}>
                {hash.slice(0, 8)}...{hash.slice(-8)}
            </code>
            <button
                onClick={handleCopy}
                className="text-xs text-blue-600 hover:text-blue-800 transition"
                title={`Copy ${label}_hash`}
            >
                {copied ? '✓ Copied' : 'Copy'}
            </button>
        </div>
    );
}
