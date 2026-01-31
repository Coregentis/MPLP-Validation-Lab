import React from 'react';

export type SemanticStatus =
    | 'PASS'
    | 'FAIL'
    | 'PENDING_NORMALIZATION'
    | 'UNAVAILABLE'
    | 'NOT_APPLICABLE'
    | 'CONFORMANCE_CLAIM';

interface SemanticStatusBadgeProps {
    status: SemanticStatus | string;
    className?: string;
}

/**
 * SemanticStatusBadge: Normalizes UI states into a professional, audit-grade narrative.
 */
export const SemanticStatusBadge: React.FC<SemanticStatusBadgeProps> = ({ status, className }) => {
    let colorClass = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
    let label = status;

    switch (status) {
        case 'PASS':
            colorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            break;
        case 'FAIL':
            colorClass = 'bg-red-500/10 text-red-500 border-red-500/20';
            break;
        case 'PENDING_NORMALIZATION':
            colorClass = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            label = 'Pending Normalization';
            break;
        case 'UNAVAILABLE':
            colorClass = 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            label = 'Not Available in v1.0';
            break;
        case 'NOT_APPLICABLE':
            colorClass = 'bg-zinc-500/5 text-zinc-500/60 border-zinc-500/10';
            label = 'N/A';
            break;
        case 'CONFORMANCE_CLAIM':
            colorClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            label = 'Conformance Claim';
            break;
    }

    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colorClass} ${className}`}>
            {label}
        </span>
    );
};
