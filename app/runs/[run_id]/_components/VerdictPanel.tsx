/**
 * Verdict Panel — Displays reported target verdicts with evidence pointers.
 *
 * Source model:
 * - uses only the loaded verdict artifact
 * - does not upgrade target IDs into a broader doctrine layer
 */

import type { VerdictStatus, EvidencePointer, RequirementCoverage } from '@/lib/verdict/types';

function normalizeTargetId(gfId: string): string {
    return gfId.toUpperCase();
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
                <span>Reported coverage</span>
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-mplp-text">Adjudication Summary</h2>
                {verdict && verdict.versions && (
                    <div className="text-[10px] text-mplp-text-muted mt-1 space-y-1">
                        <p>
                            Ruleset: <span className="font-mono">{verdict.versions.ruleset || 'N/A'}</span>
                        </p>
                        <p>
                            Displays only the target IDs and status values present in the loaded verdict artifact.
                        </p>
                    </div>
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
                    const targetId = normalizeTargetId(gfVerdict.gf_id);

                    return (
                        <div
                            key={gfVerdict.gf_id}
                            className="bg-black/30 border border-mplp-border/20 rounded-lg p-4"
                        >
                            {/* Target Header */}
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <span className="text-sm font-bold text-mplp-text">{targetId}</span>
                                    <span className="text-xs text-mplp-text-muted ml-2">
                                        reported target ID
                                    </span>
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
                    <span className="mx-2">•</span>
                    <span>This panel does not infer stronger proof than the loaded verdict fields provide.</span>
                </div>
            )}
        </section>
    );
}
