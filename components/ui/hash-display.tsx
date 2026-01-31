"use client";

import * as React from "react";

type Mode = "full" | "preview" | "hidden";

export function formatHashPreview(h: string) {
    if (h.length <= 16) return h;
    return `${h.slice(0, 8)}…${h.slice(-8)}`;
}

export function HashDisplay(props: {
    label?: string;
    hash: string | null | undefined;
    mode: Mode;
    copyable?: boolean;
    className?: string;
}) {
    const { label, hash, mode, copyable = true, className = "" } = props;

    if (mode === "hidden") return null;

    // Contract enforcement: if UI asked to show hash, it must exist
    if (!hash) {
        throw new Error(
            `HashDisplay contract violation: mode=${mode} but hash is ${hash}. This indicates indexable run with null hash.`
        );
    }

    const text = mode === "full" ? hash : formatHashPreview(hash);

    return (
        <div className={`flex items-center justify-between gap-3 ${className}`}>
            <div className="min-w-0 flex-1">
                {label ? (
                    <div className="text-xs text-mplp-text-muted mb-1">{label}</div>
                ) : null}
                <div className="font-mono text-sm text-mplp-text truncate">{text}</div>
            </div>
            {copyable ? (
                <button
                    className="text-xs px-2 py-1 rounded border border-mplp-border bg-mplp-dark-soft text-mplp-text-muted hover:text-mplp-text hover:border-mplp-text-muted transition-colors shrink-0"
                    onClick={() => navigator.clipboard.writeText(hash)}
                    title="Copy full hash"
                >
                    Copy
                </button>
            ) : null}
        </div>
    );
}
