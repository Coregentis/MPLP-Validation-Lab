/**
 * Lifecycle Guarantees Index Page
 * 
 * TERMINOLOGY:
 *   - External display: LG-01 ~ LG-05 (Lifecycle Guarantees)
 *   - Internal ID: gf-01 ~ gf-05 (frozen, unchanged)
 *   - These are ADJUDICATION TARGETS, not test scenarios
 *   - Test scenarios are FLOW-01~05 in main repo
 * 
 * IMPORTANT: This page is NON-NORMATIVE.
 * For authoritative protocol definitions, see the MPLP Protocol.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Lifecycle Guarantees — MPLP Validation Lab',
    description: 'Lifecycle Guarantees (LG-01 ~ LG-05) overview. Non-normative guide to MPLP lifecycle invariants. ruleset-1.0 performs presence-level adjudication.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/guarantees`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

/**
 * Lifecycle Guarantees - Display data aligned to ruleset-1.0
 * 
 * Uses registry SSOT for id/title mapping.
 * Additional display metadata for evidence hints and not-evaluated notes.
 */
const GUARANTEE_DISPLAY = [
    {
        display_id: 'LG-01',
        internal_id: 'gf-01',
        name: 'Single Agent Lifecycle',
        description: 'Evaluates presence of context, plan, and trace artifacts.',
        strength: 'presence-level',
        evidenceHint: 'artifacts/context.json, artifacts/plan.json, artifacts/trace.json',
        notEvaluated: 'State transition correctness (requires future ruleset)',
    },
    {
        display_id: 'LG-02',
        internal_id: 'gf-02',
        name: 'Multi-Agent Collaboration',
        description: 'Evaluates presence of timeline events.',
        strength: 'presence-level',
        evidenceHint: 'timeline/events.ndjson',
        notEvaluated: 'Handoff correctness, role boundaries (requires future ruleset)',
    },
    {
        display_id: 'LG-03',
        internal_id: 'gf-03',
        name: 'Human-in-the-Loop Gating',
        description: 'Evaluates presence of confirm decision records.',
        strength: 'presence-level',
        evidenceHint: 'artifacts/context.json (confirm field)',
        notEvaluated: 'Gate implementation correctness (requires future ruleset)',
    },
    {
        display_id: 'LG-04',
        internal_id: 'gf-04',
        name: 'Drift Detection & Recovery',
        description: 'Evaluates presence of manifest file.',
        strength: 'presence-level',
        evidenceHint: 'manifest.json',
        notEvaluated: 'Drift detection logic correctness (requires future ruleset)',
    },
    {
        display_id: 'LG-05',
        internal_id: 'gf-05',
        name: 'External Tool Integration',
        description: 'Evaluates presence of integrity checksums.',
        strength: 'presence-level',
        evidenceHint: 'integrity/sha256sums.txt',
        notEvaluated: 'Tool call logging correctness (requires future ruleset)',
    },
];

export default function GuaranteesPage() {
    return (
        <div className="pt-8">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Scope & Invariants</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Lifecycle Guarantees</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Lifecycle Guarantees (LG-01 ~ LG-05) are adjudication targets. This is a non-normative guide to what each guarantee evaluates under <code className="font-mono text-sm">ruleset-1.0</code>.
                </p>
            </div>

            {/* Disclaimer */}
            <div className="mb-10 pl-4 border-l-2 border-amber-500/30">
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-amber-500 font-semibold uppercase tracking-wider text-xs mr-2">Non-Normative</strong>
                    For authoritative definitions, see the <a href="https://docs.mplp.io" className="text-mplp-blue-soft hover:underline">MPLP Protocol</a>.
                </p>
            </div>

            {/* Terminology Notice */}
            <div className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p className="text-xs text-mplp-text-muted">
                    <strong className="text-mplp-text">Terminology:</strong> LG = Lifecycle Guarantee (adjudication target).
                    FLOW = Test Scenario (main repo). These are distinct namespaces.
                </p>
            </div>

            {/* Ruleset Strength Block */}
            <div className="mb-12 p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Ruleset</span>
                        <span className="text-mplp-text font-mono">ruleset-1.0</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Strength</span>
                        <span className="text-amber-400 font-bold">presence-level</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Adjudicates</span>
                        <span className="text-mplp-text">Evidence presence + integrity anchors</span>
                    </div>
                </div>
                <p className="text-xs text-mplp-text-muted mt-4 pt-4 border-t border-mplp-border/20">
                    Structural and invariant-level evaluation requires versioned ruleset upgrades.
                </p>
            </div>

            {/* Guarantee List */}
            <div className="space-y-4">
                {GUARANTEE_DISPLAY.map((lg) => (
                    <div
                        key={lg.display_id}
                        className="group p-6 rounded-2xl border border-mplp-border/30 hover:border-mplp-blue-soft/30 bg-transparent hover:bg-mplp-blue-soft/5 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h2 className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors flex items-center gap-3">
                                <span className="font-mono text-mplp-blue-soft/80 text-sm tracking-widest">{lg.display_id}</span>
                                {lg.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-mplp-dark-soft border border-mplp-border/40 rounded text-mplp-text-muted">
                                    {lg.strength}
                                </span>
                            </div>
                        </div>
                        <p className="text-mplp-text-muted mb-4 text-sm leading-relaxed">{lg.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Evidence Hint</span>
                                <span className="font-mono text-mplp-text-muted/80 break-all">{lg.evidenceHint}</span>
                            </div>
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Not Evaluated</span>
                                <span className="text-mplp-text-muted/60 italic">{lg.notEvaluated}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Links */}
            <div className="mt-12 flex flex-wrap gap-4">
                <Link
                    href="/policies/contract"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-mplp-dark-soft hover:bg-mplp-dark-soft/80 text-mplp-text font-bold rounded-lg transition border border-mplp-border/40 text-xs uppercase tracking-wider"
                >
                    Evidence Contract →
                </Link>
                <Link
                    href="/rulesets"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-mplp-dark-soft/40 text-mplp-text-muted hover:text-mplp-text font-bold rounded-lg transition border border-mplp-border/40 text-xs uppercase tracking-wider"
                >
                    View Rulesets →
                </Link>
            </div>
        </div>
    );
}
