/**
 * StatusBadge Component
 * 
 * Displays adjudication status with appropriate coloring.
 * Factual display only - no endorsement/certification/ranking.
 */

import React from 'react';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'ADJUDICATED': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-700/50' },
    'ADMISSIBLE': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-700/50' },
    'INCOMPLETE': { bg: 'bg-amber-900/30', text: 'text-amber-400', border: 'border-amber-700/50' },
    'NOT_ADMISSIBLE': { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700/50' },
    'NOT_ADJUDICATED': { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' },
    'PASS': { bg: 'bg-emerald-900/30', text: 'text-emerald-400', border: 'border-emerald-700/50' },
    'FAIL': { bg: 'bg-red-900/30', text: 'text-red-400', border: 'border-red-700/50' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const colors = STATUS_COLORS[status] || STATUS_COLORS['NOT_ADJUDICATED'];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

    return (
        <span className={`inline-flex items-center rounded border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} font-medium`}>
            {status}
        </span>
    );
}
