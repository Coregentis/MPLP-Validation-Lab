
/**
 * Unified Tier Legend Component
 * 
 * Shared between /runs and /methodology to ensure consistent definitions.
 * SSOT for Tier Constraints & Verification Logic.
 */

import { RunTier } from '@/lib/unified/types';

// Domain labels for D1, D2, D3, D4
export const DOMAIN_LABELS: Record<string, { label: string; desc: string }> = {
    'd1': { label: 'D1 · Provenance', desc: 'Identity, environment, provenance integrity' },
    'd2': { label: 'D2 · Lifecycle', desc: 'Execution lifecycle, state transitions' },
    'd3': { label: 'D3 · Arbitration', desc: 'Dispute resolution, evidence pointers' },
    'd4': { label: 'D4 · Interop', desc: 'Cross-framework protocol compliance' },
};

export const TIER_STYLES: Record<RunTier, { bg: string; text: string; label: string }> = {
    DISPUTE_READY: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Dispute Ready' },
    REPRODUCED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Reproduced' },
    SIMULATED: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Simulated' },
    DECLARED: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', label: 'Declared' },
};

export function TierLegend() {
    const definitions = [
        {
            tier: 'REPRODUCED',
            label: 'Reproduced',
            constraint: 'Real evidence pack with verifiable hash/seal',
            verification: 'Can download, re-run locally, compare hash',
            hardConstraint: 'Reproduced = downloadable pack + deterministic recheck + hash matches release seal',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/5',
            testid: 'tier-def-reproduced',
        },
        {
            tier: 'SIMULATED',
            label: 'Simulated',
            constraint: 'Synthetic evidence pack (not from real execution)',
            verification: 'For demo/coverage only, not dispute-ready',
            hardConstraint: null,
            color: 'text-blue-400',
            bg: 'bg-blue-500/5',
            testid: 'tier-def-simulated',
        },
        {
            tier: 'DISPUTE_READY',
            label: 'Dispute Ready',
            constraint: 'FAIL verdict with evidence pointers to triggered clauses',
            verification: 'Arbitration-ready: clause + evidence + FMM pointer',
            hardConstraint: null,
            color: 'text-red-400',
            bg: 'bg-red-500/5',
            testid: 'tier-def-dispute-ready',
        },
        {
            tier: 'DECLARED',
            label: 'Declared',
            constraint: 'Manifest/metadata only, no downloadable evidence',
            verification: 'Cannot be independently verified',
            hardConstraint: null,
            color: 'text-zinc-400',
            bg: 'bg-zinc-500/5',
            testid: 'tier-def-declared',
        },
    ];
    return (
        <div className="mb-8 bg-mplp-dark-soft/40 border border-mplp-border/30 rounded-xl p-6" data-testid="runs-legend" id="legend">
            <h2 className="text-sm font-bold uppercase tracking-widest text-mplp-text mb-4 flex items-center gap-2">
                <span className="text-mplp-blue-soft">📊</span> How to Read This Table
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {definitions.map(d => (
                    <div key={d.tier} className={`p-3 rounded-lg border border-mplp-border/20 ${d.bg}`} data-testid={d.testid}>
                        <div className={`font-bold text-sm ${d.color} mb-2`}>{d.label}</div>
                        <p className="text-xs text-mplp-text mb-1">{d.constraint}</p>
                        <p className="text-[10px] text-mplp-text-muted italic">{d.verification}</p>
                        {d.hardConstraint && (
                            <p className="text-[10px] text-emerald-300/80 font-mono mt-2 pt-2 border-t border-mplp-border/20">
                                ✓ {d.hardConstraint}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Domain Legend */}
            <div className="border-t border-mplp-border/20 pt-4 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-3">Domain Labels (D1, D2, D3, D4)</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.entries(DOMAIN_LABELS).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase">{key}</span>
                            <span className="text-xs text-mplp-text-muted">{val.label.split(' · ')[1]}: {val.desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Host vs Interop Explanation */}
            <div className="border-t border-mplp-border/20 pt-4 mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-3">Host vs Interop</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <span className="font-bold text-mplp-text">Host</span>
                        <span className="text-mplp-text-muted ml-2">= Orchestration framework running the agent (LangGraph, CrewAI, etc.)</span>
                    </div>
                    <div>
                        <span className="font-bold text-purple-400">Interop</span>
                        <span className="text-mplp-text-muted ml-2">= Protocol stack used for cross-framework communication (MCP, A2A, ACP)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TierBadge({ tier }: { tier: RunTier }) {
    const style = TIER_STYLES[tier];
    return (
        <span
            className={`px-2 py-0.5 text-xs font-mono rounded ${style.bg} ${style.text} border border-current/20 cursor-help`}
            title={getTierExplanation(tier)}
        >
            {style.label}
        </span>
    );
}

function getTierExplanation(tier: RunTier): string {
    const explanations: Record<RunTier, string> = {
        REPRODUCED: 'Real evidence pack + verifiable hash/seal. Can be audited and replayed.',
        SIMULATED: 'Synthetic evidence pack for demo/coverage. Not from real execution.',
        DISPUTE_READY: 'FAIL verdict with evidence pointers. Ready for dispute resolution.',
        DECLARED: 'Manifest only. No downloadable evidence pack.',
    };
    return explanations[tier];
}
