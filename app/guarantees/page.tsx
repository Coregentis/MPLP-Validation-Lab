/**
 * Guarantees Index Page
 * 
 * Non-normative overview of Golden Flows (GF-01 ~ GF-05).
 * Evidence-based verdicts under versioned rulesets.
 * 
 * IMPORTANT: This page is NON-NORMATIVE.
 * It only provides a high-level guide to what each Golden Flow evaluates.
 * For authoritative definitions, see the MPLP Protocol.
 */

import Link from 'next/link';

const GOLDEN_FLOWS = [
    {
        id: 'GF-01',
        name: 'Single Agent Lifecycle',
        description: 'Evaluates whether a single agent correctly executes the intent → plan → execute → confirm lifecycle with proper state transitions.',
        evidenceHint: 'context.json, plan.json, execution_trace.ndjson',
    },
    {
        id: 'GF-02',
        name: 'Multi-Agent Coordination',
        description: 'Evaluates whether multiple agents coordinate correctly with proper handoffs, shared context, and role boundaries.',
        evidenceHint: 'timeline.json with MAP session events',
    },
    {
        id: 'GF-03',
        name: 'Human-in-the-Loop Gating',
        description: 'Evaluates whether confirmation gates are properly implemented for high-risk or uncertain decisions.',
        evidenceHint: 'context.json with confirm decisions',
    },
    {
        id: 'GF-04',
        name: 'Drift Detection & Recovery',
        description: 'Evaluates whether the system detects environmental changes and adapts plans accordingly.',
        evidenceHint: 'timeline.json with drift events',
    },
    {
        id: 'GF-05',
        name: 'External Tool Integration',
        description: 'Evaluates whether external tool calls are properly logged with inputs, outputs, and error handling.',
        evidenceHint: 'manifest.yaml artifacts_included',
    },
];

export default function GuaranteesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Guarantees (Golden Flows)</h1>

            {/* Non-normative disclaimer */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-8">
                <p className="text-amber-200 text-sm">
                    <strong>Non-normative guide.</strong> This page provides a high-level overview of Golden Flow evaluations.
                    For authoritative definitions, see the <a href="https://docs.mplp.io" className="underline">MPLP Protocol</a>.
                </p>
                <p className="text-amber-200/70 text-xs mt-2">
                    Evidence-based verdicts under versioned rulesets. No execution hosting.
                </p>
            </div>

            <div className="space-y-4">
                {GOLDEN_FLOWS.map((gf) => (
                    <div
                        key={gf.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-6"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h2 className="text-xl font-semibold">
                                {gf.id}: {gf.name}
                            </h2>
                        </div>
                        <p className="text-zinc-400 mb-4">{gf.description}</p>
                        <div className="text-sm">
                            <span className="text-zinc-500">Evidence hint: </span>
                            <span className="text-zinc-400 font-mono text-xs">{gf.evidenceHint}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Links */}
            <div className="mt-8 flex gap-4">
                <Link
                    href="/rulesets"
                    className="inline-block bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition"
                >
                    View Rulesets →
                </Link>
                <Link
                    href="/runs"
                    className="inline-block bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition"
                >
                    Browse Runs →
                </Link>
            </div>
        </div>
    );
}
