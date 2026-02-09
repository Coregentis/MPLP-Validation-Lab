/**
 * About Page
 * 
 * Full statement of Validation Lab boundaries and positioning.
 * 
 * GOVERNANCE: All text and links are bound to lab-manifest.json (SSOT).
 * ALIGNMENT FINALITY: Uses SmartLink and BoundText components.
 */


import type { Metadata } from 'next';
import { SmartLink } from '@/components/common/SmartLink';
import { BoundText } from '@/components/common/BoundText';

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
                <h2 className="text-xl font-semibold mb-4 text-emerald-400">Governance Foundations (Frozen)</h2>

                <dl className="space-y-6">
                    <div>
                        <dt className="text-amber-400 font-semibold">Non-certification / Non-endorsement</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            <BoundText term="BOUNDARY-NON-CERTIFICATION" className="italic text-zinc-300" />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-amber-400 font-semibold">Non-normative Boundary</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            <BoundText term="BOUNDARY-VENDOR-NEUTRAL" />
                        </dd>
                    </div>

                    <div>
                        <dt className="text-amber-400 font-semibold">No execution hosting</dt>
                        <dd className="text-zinc-400 text-sm mt-1">
                            <BoundText term="BOUNDARY-NO-EXECUTION-HOSTING" />
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

            {/* Sustainability Stopline */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">Sustainability Stopline (Maintenance Mode)</h2>
                    <SmartLink anchor="repo_anchor" className="text-[10px] text-zinc-500 hover:text-blue-400 border border-zinc-700 px-2 py-1 rounded">
                        VIEW GOVERNANCE SOURCE →
                    </SmartLink>
                </div>
                <p className="text-zinc-400 text-sm mb-4">
                    The Validation Lab has reached its functional sustainability baseline as of v0.12.0.
                    The project is now in <strong>Maintenance Mode</strong>.
                </p>

                <div className="bg-glass border border-blue-500/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Institutional Reference &amp; Audit
                    </h3>
                    <ul className="space-y-3 text-[11px] text-zinc-400 font-mono">
                        <li className="flex gap-2">
                            <span className="text-zinc-500 w-24 shrink-0">Anchor:</span>
                            <SmartLink anchor="repo_anchor" className="text-blue-400 hover:underline">Institutional Repository</SmartLink>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-zinc-500 w-24 shrink-0">Baseline:</span>
                            <span className="text-zinc-300">vlab-v0.12.1-institution</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Navigation */}
            <section className="flex flex-wrap gap-6 text-sm border-t border-zinc-800 pt-8 mt-4">
                <SmartLink anchor="validation_hub" className="text-blue-400 hover:underline font-bold">
                    Validation Dashboard →
                </SmartLink>
                <SmartLink anchor="evidence_gallery" className="text-blue-400 hover:underline">
                    Evidence Gallery →
                </SmartLink>
                <SmartLink anchor="rulesets" className="text-blue-400 hover:underline">
                    Browse Rulesets →
                </SmartLink>
                <SmartLink anchor="runs" className="text-blue-400 hover:underline">
                    Explore Runs →
                </SmartLink>
            </section>
        </div >
    );
}
