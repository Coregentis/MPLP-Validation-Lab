import React from 'react';
import { GateSummaryModel } from '@/lib/ssot/gate-summary';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export function GateSummaryPill({ summaryModel }: { summaryModel: GateSummaryModel }) {
    const { sealed, counts, total } = summaryModel;

    return (
        <div
            data-testid="gate-summary-pill"
            className="flex items-center gap-3 px-4 py-2 bg-mplp-dark-soft/50 border border-mplp-border/40 rounded-lg backdrop-blur-sm"
        >
            <div className={`p-1.5 rounded-full ${sealed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {sealed ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold tracking-wider text-mplp-text">
                    {sealed ? 'System Sealed' : 'System Open'}
                </span>
                <span className="text-[10px] text-mplp-text-muted font-mono">
                    {counts.pass}/{total} Gates Passing
                </span>
            </div>
        </div>
    );
}
