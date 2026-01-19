/**
 * Intake Policy Page
 * 
 * Explains the Lab's evidence intake mechanism:
 * - What we receive (evidence packs, not code)
 * - Admissibility criteria
 * - Status taxonomy
 * - Responsibility boundary
 * 
 * GOVERNANCE: Non-certification. We evaluate evidence, not systems.
 */

import type { Metadata } from 'next';
import Link from 'next/link';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Intake Policy — MPLP Validation Lab',
    description: 'How evidence packs are received, evaluated, and adjudicated by the Validation Lab.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/intake`,
    },
    robots: { index: true, follow: true },
};

export default function IntakePolicyPage() {
    return (
        <div className="max-w-4xl mx-auto pt-8">
            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Policy</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Intake Policy</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    How evidence packs are received, evaluated, and adjudicated.
                </p>
            </div>

            {/* Boundary Statement */}
            <div className="mb-10 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <p className="text-xs text-amber-400/90 font-medium uppercase tracking-wider mb-2">
                    Governance Boundary
                </p>
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-amber-400">Non-certification</strong> · Evidence-based verdicts only ·
                    <strong className="text-amber-400"> No endorsement</strong> · No execution hosting ·{' '}
                    <Link href="/about" className="text-mplp-blue-soft hover:underline">Full statement →</Link>
                </p>
            </div>

            {/* Section 1: What We Receive */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">1. What the Lab Receives</h2>
                <div className="space-y-4 text-sm text-mplp-text-muted">
                    <div className="flex items-start gap-3">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <div>
                            <strong className="text-mplp-text">Evidence Packs</strong>
                            <p>Structured bundles containing manifest, timeline, snapshots, and artifacts.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">✗</span>
                        <div>
                            <strong className="text-mplp-text">Source Code or Binaries</strong>
                            <p>The Lab does not execute your code. Evidence is produced externally by you or your tooling.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-red-500 mt-0.5">✗</span>
                        <div>
                            <strong className="text-mplp-text">Framework Adapters</strong>
                            <p>The Lab does not ship or maintain adapters for any framework. Evidence producers are community-maintained.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Admissibility */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">2. Admissibility Criteria</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    An evidence pack must meet the following to be evaluated:
                </p>
                <ul className="space-y-2 text-sm text-mplp-text-muted">
                    <li className="flex items-start gap-2">
                        <span className="text-mplp-blue-soft font-mono text-xs">REQ-01</span>
                        <span>Valid <code className="px-1 py-0.5 rounded bg-mplp-dark-soft text-xs">manifest.json</code> with pack metadata</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-mplp-blue-soft font-mono text-xs">REQ-02</span>
                        <span>Timeline events with required schema fields</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-mplp-blue-soft font-mono text-xs">REQ-03</span>
                        <span>Pinned <code className="px-1 py-0.5 rounded bg-mplp-dark-soft text-xs">ruleset_version</code> and <code className="px-1 py-0.5 rounded bg-mplp-dark-soft text-xs">protocol_version</code></span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-mplp-blue-soft font-mono text-xs">REQ-04</span>
                        <span>Required artifacts for declared ruleset (varies by ruleset)</span>
                    </li>
                </ul>
                <p className="text-xs text-mplp-text-muted/60 mt-4">
                    See <Link href="/policies/contract" className="text-mplp-blue-soft hover:underline">Export Contract</Link> for full schema.
                </p>
            </section>

            {/* Section 3: Status Taxonomy */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">3. Status Taxonomy</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    Each run progresses through these states:
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="text-left py-2 px-3 text-mplp-text-muted font-semibold">Status</th>
                                <th className="text-left py-2 px-3 text-mplp-text-muted font-semibold">Meaning</th>
                                <th className="text-left py-2 px-3 text-mplp-text-muted font-semibold">UI Behavior</th>
                            </tr>
                        </thead>
                        <tbody className="text-mplp-text-muted">
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3"><code className="text-zinc-400">REGISTERED</code></td>
                                <td className="py-2 px-3">Run is in allowlist; pack may exist but is not closure-complete</td>
                                <td className="py-2 px-3">Verdict/Recheck disabled</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3"><code className="text-blue-400">EVIDENCE_READY</code></td>
                                <td className="py-2 px-3">Pack is closure-complete with <code>pack_root_hash</code></td>
                                <td className="py-2 px-3">Verdic/Recheck disabled (pending adjudication)</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3"><code className="text-green-400">ADJUDICATED</code></td>
                                <td className="py-2 px-3">verdict.json exists with deterministic <code>verdict_hash</code></td>
                                <td className="py-2 px-3">Verdict/Recheck enabled; clickable</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3"><code className="text-red-400">NOT_ADMISSIBLE</code></td>
                                <td className="py-2 px-3">Failed admission gates (schema, structure, or integrity)</td>
                                <td className="py-2 px-3">Verdict shows failure reason</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3"><code className="text-zinc-500">NOT_EVALUATED</code></td>
                                <td className="py-2 px-3">Deliberately not evaluated (out of scope or deferred)</td>
                                <td className="py-2 px-3">Grayed out with reason</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 4: Responsibility Boundary */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">4. Responsibility Boundary</h2>
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h3 className="font-semibold text-mplp-text mb-2">Lab Responsibility</h3>
                        <ul className="space-y-1 text-mplp-text-muted">
                            <li>• Evaluate evidence against versioned ruleset</li>
                            <li>• Produce deterministic, recheckable verdicts</li>
                            <li>• Maintain admission gates and reason codes</li>
                            <li>• Publish adjudication bundles with <code>verdict_hash</code></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-mplp-text mb-2">Producer Responsibility</h3>
                        <ul className="space-y-1 text-mplp-text-muted">
                            <li>• Produce evidence packs externally</li>
                            <li>• Ensure pack meets admissibility criteria</li>
                            <li>• Pin correct protocol/schema versions</li>
                            <li>• Resolve NOT_ADMISSIBLE issues and resubmit</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Minimal Submission Guide */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">5. Minimal Pack Structure</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    A minimal evidence pack contains:
                </p>
                <pre className="bg-mplp-dark-soft p-4 rounded text-xs text-mplp-text-muted font-mono overflow-x-auto">
                    {`evidence-pack/
├── manifest.json        # Pack metadata (run_id, ruleset_version, etc.)
├── timeline.json        # Event sequence with timestamps
├── snapshots/           # State snapshots at key points
│   └── *.json
└── artifacts/           # Domain-specific artifacts (plan.json, etc.)
    └── *.json`}
                </pre>
                <p className="text-xs text-mplp-text-muted/60 mt-4">
                    See <Link href="/examples/evidence-producers/langgraph" className="text-mplp-blue-soft hover:underline">Evidence Producers</Link> for working examples.
                </p>
            </section>

            {/* Navigation */}
            <div className="flex gap-4 text-sm pt-4">
                <Link href="/runs" className="text-mplp-blue-soft hover:underline">
                    Browse Runs →
                </Link>
                <Link href="/adjudication" className="text-mplp-blue-soft hover:underline">
                    View Adjudications →
                </Link>
                <Link href="/policies/contract" className="text-mplp-blue-soft hover:underline">
                    Export Contract →
                </Link>
            </div>
        </div>
    );
}
