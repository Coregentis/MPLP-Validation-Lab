/**
 * VerdictHashBadge Component
 * 
 * Displays verdict_hash with copy functionality.
 * Factual display only - the hash is the recheckable anchor.
 */

'use client';

import React, { useState } from 'react';

interface VerdictHashBadgeProps {
    hash: string;
    truncate?: boolean;
    link?: string;
}

export function VerdictHashBadge({ hash, truncate = true, link }: VerdictHashBadgeProps) {
    const [copied, setCopied] = useState(false);

    const displayHash = truncate ? `${hash.slice(0, 16)}...` : hash;

    const handleCopy = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await navigator.clipboard.writeText(hash);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const content = (
        <span className="inline-flex items-center gap-2 font-mono text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1">
            <span className="text-amber-400">{displayHash}</span>
            <button
                onClick={handleCopy}
                className="text-zinc-500 hover:text-zinc-300 transition"
                title="Copy full hash"
            >
                {copied ? '✓' : '📋'}
            </button>
        </span>
    );

    if (link) {
        return (
            <a href={link} className="hover:opacity-80 transition">
                {content}
            </a>
        );
    }

    return content;
}
