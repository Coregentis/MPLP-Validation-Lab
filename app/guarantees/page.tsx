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
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Guarantees — MPLP Validation Lab',
    description: 'Golden Flows GF-01 ~ GF-05 overview. Non-normative guide to MPLP lifecycle invariants. ruleset-1.0 performs presence-level adjudication.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/guarantees`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

/**
 * Golden Flows - Aligned to ruleset-1.0 (presence-level)
 * 
 * IMPORTANT: ruleset-1.0 performs PRESENCE-LEVEL adjudication only.
 * Descriptions below reflect actual requirements, not semantic correctness.
 */
const GOLDEN_FLOWS = [
    {
        id: 'GF-01',
        name: 'Single Agent Lifecycle',
        description: 'Evaluates presence of context, plan, and trace artifacts.',
        strength: 'presence-level',
        evidenceHint: 'artifacts/context.json, artifacts/plan.json, artifacts/trace.json',
        notEvaluated: 'State transition correctness (requires future ruleset)',
    },
    {
        id: 'GF-02',
        name: 'Multi-Agent Coordination',
        description: 'Evaluates presence of timeline events.',
        strength: 'presence-level',
        evidenceHint: 'timeline/events.ndjson',
        notEvaluated: 'Handoff correctness, role boundaries (requires future ruleset)',
    },
    {
        id: 'GF-03',
        name: 'Human-in-the-Loop Gating',
        description: 'Evaluates presence of confirm decision records.',
        strength: 'presence-level',
        evidenceHint: 'artifacts/context.json (confirm field)',
        notEvaluated: 'Gate implementation correctness (requires future ruleset)',
    },
    {
        id: 'GF-04',
        name: 'Drift Detection & Recovery',
        description: 'Evaluates presence of manifest file.',
        strength: 'presence-level',
        evidenceHint: 'manifest.json',
        notEvaluated: 'Drift detection logic correctness (requires future ruleset)',
    },
    {
        id: 'GF-05',
        name: 'External Tool Integration',
        description: 'Evaluates presence of integrity checksums.',
        strength: 'presence-level',
        evidenceHint: 'integrity/sha256sums.txt',
        notEvaluated: 'Tool call logging correctness (requires future ruleset)',
    },
];

export default function GuaranteesPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Guarantees (Golden Flows)</h1>

            {/* Non-normative disclaimer */}
            <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-4 mb-6">
                <p className="text-amber-200 text-sm">
                    <strong>Non-normative guide.</strong> This page provides a high-level overview of Golden Flow evaluations.
                    For authoritative definitions, see the <a href="https://docs.mplp.io" className="underline">MPLP Protocol</a>.
                </p>
                <p className="text-amber-200/70 text-xs mt-2">
                    Evidence-based verdicts under versioned rulesets. No execution hosting.
                </p>
            </div>

            {/* Ruleset Strength Block */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-zinc-500">Ruleset:</span>
                        <span className="text-zinc-300 ml-2 font-mono">ruleset-1.0</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">Strength:</span>
                        <span className="text-amber-400 ml-2">presence-level</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-zinc-500">Adjudicates:</span>
                        <span className="text-zinc-300 ml-2">Evidence presence + integrity anchors</span>
                    </div>
                </div>
                <p className="text-zinc-500 text-xs mt-3">
                    Structural and invariant-level evaluation requires versioned ruleset upgrades.
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
                            <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-amber-400">
                                {gf.strength}
                            </span>
                        </div>
                        <p className="text-zinc-400 mb-3">{gf.description}</p>
                        <div className="text-sm mb-2">
                            <span className="text-zinc-500">Evidence hint: </span>
                            <span className="text-zinc-400 font-mono text-xs">{gf.evidenceHint}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-zinc-600">Not evaluated in ruleset-1.0: </span>
                            <span className="text-zinc-500 text-xs">{gf.notEvaluated}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Links */}
            <div className="mt-8 flex flex-wrap gap-4">
                <Link
                    href="/policies/strength"
                    className="inline-block bg-amber-900/30 hover:bg-amber-900/50 text-amber-300 px-4 py-2 rounded text-sm transition"
                >
                    Strength Policy →
                </Link>
                <Link
                    href="/policies/contract"
                    className="inline-block bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded text-sm transition"
                >
                    Evidence Contract →
                </Link>
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
