"use client";

import * as React from "react";
import type { RunDisplayContract } from "@/lib/ui-contracts";

export function RunStatusBadge(props: {
    contract: RunDisplayContract;
    className?: string;
}) {
    const { contract, className = "" } = props;

    const toneClass =
        contract.badgeTone === "indexable"
            ? "bg-green-500/10 text-green-400 border-green-500/30"
            : contract.badgeTone === "adjudicated"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                : contract.badgeTone === "not_admissible"
                    ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";

    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${toneClass} ${className}`}
            title={contract.tooltip}
        >
            {contract.badgeText}
        </span>
    );
}
