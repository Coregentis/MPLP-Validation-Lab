import React from 'react';
import { LabStatusModel } from '@/lib/ssot/lab-status';

export function LabStatusBadge({ statusModel }: { statusModel: LabStatusModel }) {
    const status = statusModel.status.toLowerCase();
    const isInferred = statusModel.status_source === 'inferred';

    // Default to 'operational' colors if unknown
    const colors = {
        operational: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        maintenance: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        frozen: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        unknown: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
    }[status] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';

    return (
        <div
            data-testid="lab-status-badge"
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] ${colors}`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span>
                {status}
                {isInferred && <span className="opacity-50 ml-1 text-[8px] tracking-normal lowercase">(inferred)</span>}
            </span>
        </div>
    );
}
