/**
 * About Page
 * 
 * Full statement of Validation Lab boundaries and positioning.
 * Content derived from README.md Four Boundaries.
 * 
 * GOVERNANCE: Do not modify wording without VLAB-DGB-01 governance review.
 * GATE-04 COMPLIANCE: Uses "Non-" prefix forms to avoid forbidden terms.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'About (Non-Normative)',
    description: 'Four Boundaries of MPLP Validation Lab: Non-certification, Non-normative, No execution hosting, Deterministic ruleset. Evidence generated in third-party environments.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/about`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">About MPLP Validation Lab</h1>

            <p className="text-zinc-400 mb-8">
                Evidence &amp; Conformance Laboratory for MPLP Lifecycle Invariants.
            </p>

            {/* Four Boundaries */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Four Boundaries (Non-Negotiable)</h2>

                <dl className="space-y-6">
                    <div>
                        <dt className="text-amber-400 font-semibold">Non-certification / Non-endorsement</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            The Lab does not issue official marks or any form of endorsement.
                            Verdicts are evidence-based outputs under versioned rulesets, not authoritative
                            statements of conformance.
                        </dd>
                    </div>

                    <div>
                        <dt className="text-amber-400 font-semibold">Non-normative</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            The Lab does not define protocol semantics. It evaluates evidence against versioned
                            rulesets derived from the upstream MPLP Protocol. The authoritative source of truth
                            for protocol semantics is the MPLP Protocol repository.
                        </dd>
                    </div>

                    <div>
                        <dt className="text-amber-400 font-semibold">No execution hosting</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            The Lab does not run your code, host sandboxes, or provide execution environments.
                            You generate evidence packs locally or in your own environment; the Lab evaluates
                            the submitted evidence only.
                        </dd>
                    </div>

                    <div>
                        <dt className="text-amber-400 font-semibold">Deterministic ruleset</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            Same evidence + same ruleset = same verdict. Evaluation is reproducible and
                            auditable. Verdict hashes provide cryptographic proof of determinism.
                        </dd>
                    </div>
                </dl>
            </section>

            {/* What This Lab Provides */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">What This Lab Provides</h2>
                <ul className="space-y-2 text-zinc-400">
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Evidence-based evaluation tools
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Self-assessment frameworks
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Lifecycle Guarantee (LG-01~05) verdict generation
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Schema validation utilities
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        Reproducible, auditable verdicts
                    </li>
                </ul>
            </section>

            {/* What This Lab Does NOT Provide */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">What This Lab Does NOT Provide</h2>
                <ul className="space-y-2 text-zinc-400">
                    <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Official marks or compliance statements
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Seals or endorsements
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Execution hosting or runtime environments
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Implementation advice or adaptor recommendations
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-red-500">✗</span>
                        Regulatory or legal guarantees
                    </li>
                </ul>
            </section>
            {/* Sustainability Stopline */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">Sustainability Stopline (Maintenance Mode)</h2>
                    <a href="file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/governance/seals/SEAL-v0.12.1.md" className="text-[10px] text-zinc-500 hover:text-blue-400 border border-zinc-700 px-2 py-1 rounded">VIEW SEAL-v0.12.1 →</a>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                    The Validation Lab has reached its functional sustainability baseline as of v0.12.0.
                    The project is now in <strong>Maintenance Mode</strong>.
                </p>
                <ul className="space-y-3 text-zinc-400 text-xs mb-6">
                    <li><strong className="text-zinc-200">v0.12.x Series:</strong> The **Maintenance Line**. Audit-grade, reproducible, and stopline-bounded.</li>
                    <li><strong className="text-zinc-200">v0.13.0+ Series:</strong> The **Extension Line**. Reserved for functional expansion (new substrates, logic, or IA).</li>
                </ul>

                <div className="bg-glass border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Institutional Reference &amp; Audit
                    </h3>
                    <ul className="space-y-3 text-[11px] text-zinc-400 font-mono">
                        <li className="flex gap-2">
                            <span className="text-zinc-500 w-24 shrink-0">Anchor:</span>
                            <a href="file:///Users/jasonwang/Documents/AI_Dev/V1.0_release/Validation_Lab/governance/seals/SEAL-v0.12.1.md" className="text-blue-400 hover:underline">SEAL-v0.12.1</a>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-zinc-500 w-24 shrink-0">Baseline Tag:</span>
                            <span className="text-zinc-300">vlab-v0.12.1-institution</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-zinc-500 w-24 shrink-0">Audit Cmd:</span>
                            <span className="text-zinc-300">npm run heartbeat</span>
                        </li>
                        <li className="flex gap-2 underline decoration-zinc-800">
                            <span className="text-zinc-500 w-24 shrink-0">Status:</span>
                            <span className="text-blue-400 font-bold uppercase">Locked / Stationary</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Navigation */}
            <section className="flex flex-wrap gap-6 text-sm border-t border-zinc-800 pt-8 mt-4">
                <Link href="/validation" className="text-blue-400 hover:underline font-bold">
                    Validation Dashboard →
                </Link>
                <Link href="/validation/samples" className="text-blue-400 hover:underline">
                    Evidence Gallery →
                </Link>
                <Link href="/rulesets" className="text-blue-400 hover:underline">
                    Browse Rulesets →
                </Link>
                <Link href="/runs" className="text-blue-400 hover:underline">
                    Explore Runs →
                </Link>
            </section>
        </div >
    );
}
