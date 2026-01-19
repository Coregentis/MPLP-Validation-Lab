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

            {/* Navigation */}
            <section className="flex gap-4 text-sm">
                <Link href="/guarantees" className="text-blue-400 hover:underline">
                    View Lifecycle Guarantees →
                </Link>
                <Link href="/rulesets" className="text-blue-400 hover:underline">
                    Browse Rulesets →
                </Link>
                <Link href="/runs" className="text-blue-400 hover:underline">
                    Explore Runs →
                </Link>
            </section>
        </div>
    );
}
