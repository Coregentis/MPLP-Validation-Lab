/**
 * State Diff Panel — Displays JSON Patch diff between snapshots.
 *
 * GOVERNANCE: Part of P0 Evidence Replayer (VLAB-DGB-01)
 * JSON Diff is SSOT; unified view is UI-only rendering.
 */

export interface JsonPatchOp {
    op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
    path: string;
    value?: unknown;
    from?: string;
}

export interface DiffData {
    from: string;
    to: string;
    created_at?: string;
    event_refs?: string[];
    ops: JsonPatchOp[];
}

interface StateDiffPanelProps {
    diff: DiffData | null;
    isLoading?: boolean;
}

const opColors: Record<string, string> = {
    add: 'text-green-400 bg-green-500/10',
    remove: 'text-red-400 bg-red-500/10',
    replace: 'text-amber-400 bg-amber-500/10',
    move: 'text-mplp-blue-soft bg-mplp-blue-soft/10',
    copy: 'text-mplp-indigo bg-mplp-indigo/10',
    test: 'text-mplp-text-muted bg-mplp-dark-soft/40',
};

function formatValue(value: unknown): string {
    if (value === undefined) return '';
    if (typeof value === 'string') return `"${value}"`;
    if (Array.isArray(value)) return `[${value.length} items]`;
    if (typeof value === 'object' && value !== null) return `{...}`;
    return String(value);
}

export function StateDiffPanel({ diff, isLoading }: StateDiffPanelProps) {
    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-mplp-dark-soft/80 px-4 py-3 border-b border-mplp-border/30 shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-mplp-text">State Diff</h2>
                {diff && (
                    <p className="text-[10px] text-mplp-text-muted mt-1 font-mono truncate">
                        {diff.from} → {diff.to}
                    </p>
                )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-grow p-4">
                {isLoading && (
                    <p className="text-sm text-mplp-text-muted italic">Loading diff...</p>
                )}

                {!isLoading && !diff && (
                    <p className="text-sm text-mplp-text-muted italic">
                        Select a verdict pointer to view state diff.
                    </p>
                )}

                {!isLoading && diff && (
                    <div className="space-y-2">
                        {/* Operations List */}
                        {diff.ops.map((op, index) => (
                            <div
                                key={index}
                                className="bg-black/30 border border-mplp-border/20 rounded-lg p-3"
                            >
                                {/* Operation Badge */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${opColors[op.op]}`}>
                                        {op.op}
                                    </span>
                                    <code className="text-xs font-mono text-mplp-text break-all">
                                        {op.path}
                                    </code>
                                </div>

                                {/* Value (if present) */}
                                {op.value !== undefined && (
                                    <div className="mt-2 pl-2 border-l-2 border-mplp-border/30">
                                        <span className="text-[10px] text-mplp-text-muted uppercase tracking-wider">value:</span>
                                        <pre className="text-xs font-mono text-mplp-text mt-1 whitespace-pre-wrap break-all">
                                            {typeof op.value === 'object'
                                                ? JSON.stringify(op.value, null, 2)
                                                : formatValue(op.value)}
                                        </pre>
                                    </div>
                                )}

                                {/* From (for move/copy) */}
                                {op.from && (
                                    <div className="mt-2 text-[10px] text-mplp-text-muted">
                                        <span className="uppercase tracking-wider">from:</span>{' '}
                                        <code className="font-mono">{op.from}</code>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Empty Operations */}
                        {diff.ops.length === 0 && (
                            <p className="text-sm text-mplp-text-muted italic">No operations in diff</p>
                        )}
                    </div>
                )}
            </div>

            {/* Footer: Event References */}
            {diff?.event_refs && diff.event_refs.length > 0 && (
                <div className="border-t border-mplp-border/30 px-4 py-2 shrink-0">
                    <p className="text-[10px] text-mplp-text-muted">
                        <span className="uppercase tracking-wider">Events:</span>{' '}
                        <span className="font-mono">{diff.event_refs.join(', ')}</span>
                    </p>
                </div>
            )}
        </section>
    );
}
