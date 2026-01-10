/**
 * Ruleset Strength Policy Page
 * 
 * Governance document to prevent narrative drift.
 * Defines ruleset strength levels and anti-drift rules.
 * 
 * NON-NORMATIVE: This is Lab governance, not MPLP protocol spec.
 * GATE-04 COMPLIANCE: No certification/endorsement language.
 */

import Link from 'next/link';

export default function StrengthPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Ruleset Strength Policy</h1>
            <p className="text-zinc-500 text-sm mb-6">
                Non-Normative (Validation Lab) — Governance Document
            </p>

            {/* What This Policy Governs */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">What This Policy Governs</h2>
                <p className="text-zinc-400 text-sm mb-4">
                    This policy defines the relationship between <strong>ruleset versions</strong> and
                    <strong> UI claims</strong> in Validation Lab.
                </p>
                <div className="bg-zinc-800 border border-zinc-700 rounded p-4">
                    <p className="text-amber-300 text-sm font-semibold">
                        Core Rule: UI MAY ONLY project claims supported by the active ruleset version.
                    </p>
                </div>
            </section>

            {/* Strength Levels */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Strength Levels</h2>
                <p className="text-zinc-500 text-xs mb-4">
                    Rulesets are classified by their adjudication strength. Higher levels require more sophisticated evaluation logic.
                </p>
                <div className="space-y-4">
                    {/* Presence-level */}
                    <div className="border border-green-900/50 bg-green-950/20 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded text-xs font-semibold">
                                ACTIVE
                            </span>
                            <h3 className="font-semibold text-green-300">Presence-level</h3>
                            <span className="text-zinc-500 text-xs">(ruleset-1.0)</span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-2">
                            Evaluates: Evidence presence + integrity anchors
                        </p>
                        <p className="text-zinc-600 text-xs">
                            Does NOT evaluate: Schema validity, semantic correctness, invariant satisfaction
                        </p>
                    </div>

                    {/* Structural-level */}
                    <div className="border border-zinc-700 rounded-lg p-4 opacity-60">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-zinc-800 text-zinc-500 rounded text-xs font-semibold">
                                FUTURE
                            </span>
                            <h3 className="font-semibold text-zinc-400">Structural-level</h3>
                        </div>
                        <p className="text-zinc-500 text-sm mb-2">
                            Will evaluate: Schema validity, field type conformance
                        </p>
                        <p className="text-zinc-600 text-xs">
                            Requires: New ruleset version (e.g., ruleset-2.x)
                        </p>
                    </div>

                    {/* Invariant-level */}
                    <div className="border border-zinc-700 rounded-lg p-4 opacity-60">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-2 py-1 bg-zinc-800 text-zinc-500 rounded text-xs font-semibold">
                                FUTURE
                            </span>
                            <h3 className="font-semibold text-zinc-400">Invariant-level</h3>
                        </div>
                        <p className="text-zinc-500 text-sm mb-2">
                            Will evaluate: Semantic invariant satisfaction, lifecycle correctness
                        </p>
                        <p className="text-zinc-600 text-xs">
                            Requires: New ruleset version + invariant definitions from MPLP Protocol
                        </p>
                    </div>
                </div>
            </section>

            {/* Anti-Drift Rule */}
            <section className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-amber-200 mb-4">Anti-Drift Rule</h2>
                <div className="space-y-3 text-sm">
                    <p className="text-amber-100/80">
                        <strong>Any stronger claim MUST ship as a new ruleset version.</strong>
                    </p>
                    <p className="text-amber-100/70">
                        Documentation changes alone are invalid for strengthening adjudication claims.
                    </p>
                    <ul className="text-amber-200/60 text-xs space-y-1 mt-4">
                        <li>• UI pages (Guarantees, Builder Guide) may only describe what the active ruleset evaluates.</li>
                        <li>• Claims about semantic correctness require ruleset upgrade.</li>
                        <li>• Narrative must not exceed ruleset capabilities.</li>
                    </ul>
                </div>
            </section>

            {/* Current Ruleset Status */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Current Ruleset Status</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-zinc-500">Version</p>
                        <p className="text-zinc-300 font-mono">ruleset-1.0</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Strength</p>
                        <p className="text-amber-400">presence-level</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Golden Flows</p>
                        <p className="text-zinc-300">GF-01 ~ GF-05</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Contract</p>
                        <p className="text-zinc-300">v1.0</p>
                    </div>
                </div>
            </section>

            {/* Authority Map */}
            <section className="border border-zinc-700 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold mb-3">Authority Map</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                        <p className="text-zinc-500">Repo</p>
                        <p className="text-zinc-300">Truth Source</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Docs</p>
                        <p className="text-zinc-300">Specification</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Website</p>
                        <p className="text-zinc-300">Discovery</p>
                    </div>
                    <div>
                        <p className="text-zinc-500">Lab</p>
                        <p className="text-amber-400">Evidence Verdict</p>
                    </div>
                </div>
                <p className="text-zinc-600 text-xs mt-3">
                    Lab is an Evidence Verdict Gateway. It does not define protocol semantics.
                </p>
            </section>

            {/* Navigation */}
            <section className="flex flex-wrap gap-4 text-sm">
                <Link href="/policies/contract" className="text-blue-400 hover:underline">
                    Evidence Pack Contract →
                </Link>
                <Link href="/guarantees" className="text-blue-400 hover:underline">
                    View Guarantees →
                </Link>
                <Link href="/rulesets" className="text-blue-400 hover:underline">
                    View Rulesets →
                </Link>
            </section>
        </div>
    );
}
