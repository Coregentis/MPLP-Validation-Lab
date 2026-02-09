/**
 * Verdict Panel — Displays GF verdicts with evidence pointers.
 *
 * GOVERNANCE: Part of P0 Evidence Replayer (VLAB-DGB-01)
 * 
 * TERMINOLOGY (FROZEN):
 *   - External display: LG-xx (Lifecycle Guarantees)
 *   - Internal ID: gf-xx (frozen, do not change)
 *   - UI MUST show LG-xx, NOT gf-xx
 */

import type { VerdictStatus, EvidencePointer, RequirementCoverage } from '@/lib/verdict/types';

// Canonical mapping from internal gf-xx to external LG-xx
// NOTE: Only lowercase keys - canonicalizeToLG handles uppercase via .toLowerCase()
const GF_TO_LG_MAP: Record<string, string> = {
    'gf-01': 'LG-01',
    'gf-02': 'LG-02',
    'gf-03': 'LG-03',
    'gf-04': 'LG-04',
    'gf-05': 'LG-05',
};

const LG_NAMES: Record<string, string> = {
    'LG-01': 'Single Agent Lifecycle',
    'LG-02': 'Multi-Agent Collaboration',
    'LG-03': 'Human-in-the-Loop Gating',
    'LG-04': 'Drift Detection & Recovery',
    'LG-05': 'External Tool Integration',
};

function canonicalizeToLG(gfId: string): string {
    return GF_TO_LG_MAP[gfId] || GF_TO_LG_MAP[gfId.toLowerCase()] || gfId;
}

export interface GFVerdictData {
    gf_id: string;
    status: VerdictStatus;
    pointers: EvidencePointer[];
    coverage: RequirementCoverage;
}

export interface VerdictData {
    run_id: string;
    scenario_id: string;
    admission: string;
    gf_verdicts: GFVerdictData[];
    versions: {
        protocol: string;
        schema: string;
        ruleset: string;
    };
    evaluated_at: string;
}

interface VerdictPanelProps {
    verdict: VerdictData | null;
    isLoading?: boolean;
    onPointerClick?: (pointer: EvidencePointer) => void;
}

const statusColors: Record<VerdictStatus, string> = {
    PASS: 'bg-green-500/20 text-green-400 border-green-500/30',
    FAIL: 'bg-red-500/20 text-red-400 border-red-500/30',
    NOT_EVALUATED: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    NOT_ADMISSIBLE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function CoverageBar({ coverage }: { coverage: RequirementCoverage }) {
    const total = coverage.total || 1;
    const passedPct = (coverage.passed / total) * 100;
    const failedPct = (coverage.failed / total) * 100;
    const notEvalPct = (coverage.not_evaluated / total) * 100;

    return (
        <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-mplp-text-muted mb-1">
                <span>Coverage</span>
                <span>{coverage.passed}/{coverage.total} passed</span>
            </div>
            <div className="h-1.5 bg-mplp-dark-soft/60 rounded-full overflow-hidden flex">
                {passedPct > 0 && (
                    <div className="bg-green-500" style={{ width: `${passedPct}%` }} />
                )}
                {failedPct > 0 && (
                    <div className="bg-red-500" style={{ width: `${failedPct}%` }} />
                )}
                {notEvalPct > 0 && (
                    <div className="bg-amber-500" style={{ width: `${notEvalPct}%` }} />
                )}
            </div>
        </div>
    );
}

export function VerdictPanel({ verdict, isLoading, onPointerClick }: VerdictPanelProps) {
    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-mplp-dark-soft/80 px-4 py-3 border-b border-mplp-border/30 shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-mplp-text">Verdict</h2>
                {verdict && verdict.versions && (
                    <p className="text-[10px] text-mplp-text-muted mt-1">
                        Ruleset: <span className="font-mono">{verdict.versions.ruleset || 'N/A'}</span>
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-grow p-4 space-y-4">
                {isLoading && (
                    <p className="text-sm text-mplp-text-muted italic">Loading verdict...</p>
                )}

                {!isLoading && !verdict && (
                    <p className="text-sm text-mplp-text-muted italic">
                        No verdict data available.
                    </p>
                )}

                {!isLoading && verdict && verdict.gf_verdicts && verdict.gf_verdicts.map((gfVerdict) => {
                    const lgId = canonicalizeToLG(gfVerdict.gf_id);
                    const lgName = LG_NAMES[lgId] || '';

                    return (
                        <div
                            key={gfVerdict.gf_id}
                            className="bg-black/30 border border-mplp-border/20 rounded-lg p-4"
                        >
                            {/* LG Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="text-sm font-bold text-mplp-text">{lgId}</span>
                                    {lgName && (
                                        <span className="text-xs text-mplp-text-muted ml-2">
                                            {lgName}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusColors[gfVerdict.status]}`}>
                                    {gfVerdict.status}
                                </span>
                            </div>

                            {/* Coverage */}
                            <CoverageBar coverage={gfVerdict.coverage} />

                            {/* Evidence Pointers */}
                            {gfVerdict.pointers.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-mplp-border/20">
                                    <p className="text-[10px] uppercase tracking-wider text-mplp-text-muted mb-2">
                                        Evidence ({gfVerdict.pointers.length})
                                    </p>
                                    <ul className="space-y-1">
                                        {gfVerdict.pointers.map((pointer, idx) => (
                                            <li key={idx}>
                                                <button
                                                    className="w-full text-left text-xs font-mono p-2 rounded bg-mplp-dark-soft/40 hover:bg-mplp-blue-soft/10 border border-transparent hover:border-mplp-blue-soft/30 transition-colors"
                                                    onClick={() => onPointerClick?.(pointer)}
                                                >
                                                    <span className="text-mplp-blue-soft">{pointer.locator}</span>
                                                    {pointer.note && (
                                                        <span className="text-mplp-text-muted ml-2">— {pointer.note}</span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer: Run Info */}
            {verdict && (
                <div className="border-t border-mplp-border/30 px-4 py-2 shrink-0 text-[10px] text-mplp-text-muted">
                    <span className="uppercase tracking-wider">Run:</span>{' '}
                    <span className="font-mono">{verdict.run_id}</span>
                </div>
            )}
        </section>
    );
}
