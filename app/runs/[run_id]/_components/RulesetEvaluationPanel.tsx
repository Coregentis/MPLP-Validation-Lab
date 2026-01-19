/**
 * Ruleset Evaluation Panel (Generalized)
 * 
 * Displays adjudication results from ANY ruleset using the generic
 * RulesetEvalResult interface from the registry.
 * 
 * This component ONLY depends on registry types, not ruleset-specific types.
 * UI becomes a "projection" of the registry output, not a ruleset-1.1 UI.
 */

'use client';

import { useState } from 'react';
import type { RulesetEvalResult, ClauseResult, DomainMeta } from '@/lib/rulesets/registry';

// =============================================================================
// Props
// =============================================================================

interface RulesetEvaluationPanelProps {
    evaluation: RulesetEvalResult | null;
    isLoading?: boolean;
    error?: string;
}

// =============================================================================
// Status Badge
// =============================================================================

type VerdictStatus = 'PASS' | 'FAIL' | 'NOT_EVALUATED' | 'NOT_ADMISSIBLE';

function StatusBadge({ status }: { status: VerdictStatus }) {
    const colors: Record<VerdictStatus, string> = {
        PASS: 'bg-green-500/20 text-green-400 border-green-500/30',
        FAIL: 'bg-red-500/20 text-red-400 border-red-500/30',
        NOT_EVALUATED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        NOT_ADMISSIBLE: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };

    return (
        <span className={`px-2 py-0.5 text-xs font-mono uppercase rounded border ${colors[status]}`}>
            {status}
        </span>
    );
}

// =============================================================================
// Clause Row with Drilldown
// =============================================================================

interface ClauseRowProps {
    clause: ClauseResult;
    domainName?: string;
}

function ClauseRow({ clause, domainName }: ClauseRowProps) {
    const [expanded, setExpanded] = useState(false);
    const evidenceRefs = clause.evidence_refs || [];
    const resolvedCount = evidenceRefs.filter(r => r.resolved !== 'none').length;

    return (
        <>
            <tr
                className="hover:bg-mplp-dark-soft/50 cursor-pointer transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <td className="px-4 py-3 text-sm font-mono text-mplp-text-muted">
                    {expanded ? '▼' : '▶'} {domainName || clause.domain_id || '—'}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-mplp-text">
                    {clause.clause_id}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-mplp-text-muted">
                    {clause.requirement_id}
                </td>
                <td className="px-4 py-3">
                    <StatusBadge status={clause.status} />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-mplp-text-muted">
                    {clause.reason_code || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-mplp-text-muted">
                    {resolvedCount}/{evidenceRefs.length} resolved
                </td>
            </tr>

            {expanded && (
                <tr className="bg-mplp-dark-soft/30">
                    <td colSpan={6} className="px-8 py-4">
                        <EvidenceDrilldown clause={clause} />
                    </td>
                </tr>
            )}
        </>
    );
}

// =============================================================================
// Evidence Drilldown
// =============================================================================

function EvidenceDrilldown({ clause }: { clause: ClauseResult }) {
    const evidenceRefs = clause.evidence_refs || [];

    if (evidenceRefs.length === 0) {
        return (
            <div className="text-sm border-l-2 border-yellow-500/50 pl-4">
                <div className="flex items-center gap-2 mb-2">
                    <code className="px-2 py-0.5 text-xs font-mono rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        MISSING_EVIDENCE_POINTERS
                    </code>
                    {clause.reason_code && (
                        <code className="px-2 py-0.5 text-xs font-mono rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            {clause.reason_code}
                        </code>
                    )}
                </div>
                <p className="text-mplp-text-muted">
                    No evidence pointers found for requirement{' '}
                    <code className="text-xs bg-mplp-dark px-1 rounded">{clause.requirement_id}</code>.
                    A valid pointer is required to satisfy this clause.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Notes */}
            {clause.notes && clause.notes.length > 0 && (
                <div className="text-sm">
                    <p className="font-semibold text-mplp-text mb-1">Notes:</p>
                    <ul className="list-disc list-inside text-mplp-text-muted space-y-1">
                        {clause.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Evidence References */}
            <div>
                <p className="text-sm font-semibold text-mplp-text mb-2">Evidence References:</p>
                <div className="space-y-2">
                    {evidenceRefs.map((ref, i) => (
                        <EvidenceRefCard key={i} ref={ref} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function EvidenceRefCard({ ref, index }: {
    ref: { pointer: unknown; resolved: string; content?: Record<string, unknown> };
    index: number
}) {
    const pointer = ref.pointer as Record<string, unknown> | null;

    return (
        <div className="bg-mplp-dark rounded-lg p-3 border border-mplp-border/30">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-mplp-text-muted">#{index + 1}</span>
                <ResolvedBadge resolved={ref.resolved as 'event' | 'snapshot' | 'none'} />
                {pointer?.locator && (
                    <code className="text-xs text-mplp-blue-soft font-mono">
                        {String(pointer.locator)}
                    </code>
                )}
            </div>

            {/* Resolved content */}
            {ref.content && Object.keys(ref.content).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mt-2">
                    {Object.entries(ref.content)
                        .filter(([k]) => !k.startsWith('_'))
                        .slice(0, 8)
                        .map(([key, value]) => (
                            <div key={key}>
                                <span className="text-mplp-text-muted">{key}:</span>{' '}
                                <span className="font-mono text-mplp-text">{String(value)}</span>
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
}

function ResolvedBadge({ resolved }: { resolved: 'event' | 'snapshot' | 'none' }) {
    const colors = {
        event: 'bg-blue-500/20 text-blue-400',
        snapshot: 'bg-purple-500/20 text-purple-400',
        none: 'bg-gray-500/20 text-gray-400',
    };
    return (
        <span className={`px-1.5 py-0.5 text-xs font-mono rounded ${colors[resolved]}`}>
            {resolved}
        </span>
    );
}

// =============================================================================
// Main Panel
// =============================================================================

export function RulesetEvaluationPanel({ evaluation, isLoading, error }: RulesetEvaluationPanelProps) {
    if (isLoading) {
        return (
            <section className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                <div className="animate-pulse">
                    <div className="h-6 w-48 bg-mplp-dark-soft rounded mb-4"></div>
                    <div className="h-20 bg-mplp-dark-soft rounded"></div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="bg-glass rounded-2xl p-6 border border-red-500/30">
                <h2 className="text-lg font-bold text-red-400 mb-2">Evaluation Error</h2>
                <p className="text-sm text-mplp-text-muted">{error}</p>
            </section>
        );
    }

    if (!evaluation) {
        return (
            <section className="bg-glass rounded-2xl p-6 border border-mplp-border/30">
                <h2 className="text-lg font-bold text-mplp-text mb-2">Ruleset Evaluation</h2>
                <p className="text-sm text-mplp-text-muted">
                    No ruleset evaluation available. This run may not have a valid ruleset reference.
                </p>
            </section>
        );
    }

    // Build domain lookup for clause grouping
    const domainLookup = new Map<string, string>();
    if (evaluation.domain_meta) {
        evaluation.domain_meta.forEach(dm => {
            domainLookup.set(dm.domain_id, dm.domain_name);
        });
    }

    return (
        <section className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30">
            {/* Header */}
            <div className="px-6 py-4 border-b border-mplp-border/30 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-mplp-text">
                        Ruleset Evaluation
                        <span className="ml-2 text-sm font-mono text-mplp-text-muted">
                            {evaluation.ruleset_id}
                        </span>
                    </h2>
                    <p className="text-xs text-mplp-text-muted mt-1">
                        Evaluated: {new Date(evaluation.evaluated_at).toLocaleString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <StatusBadge status={evaluation.topline_verdict} />
                    {evaluation.reason_code && (
                        <code className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">
                            {evaluation.reason_code}
                        </code>
                    )}
                </div>
            </div>

            {/* Domain Summary (if available) */}
            {evaluation.domain_meta && evaluation.domain_meta.length > 0 && (
                <div className="px-6 py-3 bg-mplp-dark-soft/30 border-b border-mplp-border/20">
                    <div className="flex flex-wrap gap-4">
                        {evaluation.domain_meta.map(dm => (
                            <div key={dm.domain_id} className="flex items-center gap-2">
                                <span className="text-xs font-mono text-mplp-text-muted">{dm.domain_id}:</span>
                                <span className="text-xs font-semibold text-mplp-text">{dm.domain_name}</span>
                                <StatusBadge status={dm.status} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Clauses Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-mplp-dark-soft/50">
                        <tr className="text-left text-xs uppercase tracking-wider text-mplp-text-muted">
                            <th className="px-4 py-3">Domain</th>
                            <th className="px-4 py-3">Clause</th>
                            <th className="px-4 py-3">Requirement</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Reason Code</th>
                            <th className="px-4 py-3">Evidence</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-mplp-border/10">
                        {evaluation.clauses.map(clause => (
                            <ClauseRow
                                key={clause.clause_id}
                                clause={clause}
                                domainName={clause.domain_id ? domainLookup.get(clause.domain_id) : undefined}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
