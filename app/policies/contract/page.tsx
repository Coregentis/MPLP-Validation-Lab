/**
 * Evidence Pack Contract Page
 * 
 * Defines the minimal evidence pack structure for v1.0.
 * This is the SINGLE SOURCE OF TRUTH for file names and paths.
 * 
 * NON-NORMATIVE: This is Lab governance, not MPLP protocol spec.
 * GATE-04 COMPLIANCE: No certification/endorsement language.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Evidence Pack Contract v1.0 — MPLP Validation Lab',
    description: 'Minimal evidence pack file structure for ruleset-1.0. Required files: manifest.json, sha256sums.txt, events.ndjson, artifacts/*. Non-normative.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies/contract`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ContractPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Evidence Pack Contract v1.0</h1>
            <p className="text-zinc-500 text-sm mb-6">
                Reference (Validation Lab) — Non-Normative
            </p>

            {/* Scope */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-3">Scope & Non-Goals</h2>
                <p className="text-zinc-400 text-sm mb-3">
                    This contract defines the <strong>minimal file structure</strong> for evidence packs
                    evaluated by Validation Lab under ruleset-1.0.
                </p>
                <div className="text-zinc-500 text-xs space-y-1">
                    <p>• This is NOT an MPLP protocol specification.</p>
                    <p>• For authoritative protocol definitions, see the <a href="https://docs.mplp.io" className="text-blue-400 underline">MPLP Protocol Documentation</a>.</p>
                    <p>• Contract versions are tied to ruleset versions.</p>
                </div>
            </section>

            {/* Required Files */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Required Files (v1.0)</h2>
                <p className="text-zinc-500 text-xs mb-4">
                    All paths are relative to pack root. Absence of any required file triggers NOT_ADMISSIBLE.
                </p>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-700">
                            <th className="text-left py-2 text-zinc-400">File Path</th>
                            <th className="text-left py-2 text-zinc-400">Purpose</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-green-400">manifest.json</td>
                            <td className="py-2 text-zinc-400">Pack metadata (pack_id, protocol_version)</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-green-400">integrity/sha256sums.txt</td>
                            <td className="py-2 text-zinc-400">File checksums for integrity verification</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-green-400">timeline/events.ndjson</td>
                            <td className="py-2 text-zinc-400">Lifecycle events (NDJSON format)</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-green-400">artifacts/context.json</td>
                            <td className="py-2 text-zinc-400">Context artifact (GF-01)</td>
                        </tr>
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-green-400">artifacts/plan.json</td>
                            <td className="py-2 text-zinc-400">Plan artifact (GF-01)</td>
                        </tr>
                        <tr>
                            <td className="py-2 font-mono text-green-400">artifacts/trace.json</td>
                            <td className="py-2 text-zinc-400">Trace artifact (GF-01)</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Optional Files */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Optional Files</h2>
                <p className="text-zinc-500 text-xs mb-4">
                    These files may be included but are not required for ruleset-1.0 evaluation.
                </p>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-zinc-700">
                            <th className="text-left py-2 text-zinc-400">File/Directory</th>
                            <th className="text-left py-2 text-zinc-400">Purpose</th>
                        </tr>
                    </thead>
                    <tbody className="text-zinc-300">
                        <tr className="border-b border-zinc-800">
                            <td className="py-2 font-mono text-zinc-500">snapshots/*</td>
                            <td className="py-2 text-zinc-500">State snapshots (future ruleset)</td>
                        </tr>
                        <tr>
                            <td className="py-2 font-mono text-zinc-500">manifest.substrate</td>
                            <td className="py-2 text-zinc-500">Substrate descriptor (for catalog categorization)</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Path & Naming Invariants */}
            <section className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-amber-200 mb-4">Path & Naming Invariants</h2>
                <ul className="space-y-2 text-sm">
                    <li className="flex gap-2 text-amber-100/80">
                        <span className="text-red-400">✗</span>
                        <span><strong>No absolute paths</strong> permitted in any output or report.</span>
                    </li>
                    <li className="flex gap-2 text-amber-100/80">
                        <span className="text-red-400">✗</span>
                        <span><strong>YAML variants</strong> (manifest.yaml) are NOT part of v1.0 contract.</span>
                    </li>
                    <li className="flex gap-2 text-amber-100/80">
                        <span className="text-red-400">✗</span>
                        <span><strong>Alternative timeline paths</strong> (timeline.json) are NOT recognized.</span>
                    </li>
                </ul>
                <p className="text-amber-200/60 text-xs mt-4">
                    Violation of these invariants may trigger GATE-07 (PII/Path Leak Lint) failure.
                </p>
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
                <Link href="/policies/strength" className="text-blue-400 hover:underline">
                    Ruleset Strength Policy →
                </Link>
                <Link href="/guarantees" className="text-blue-400 hover:underline">
                    View Guarantees →
                </Link>
                <Link href="/builder" className="text-blue-400 hover:underline">
                    Builder Guide →
                </Link>
            </section>
        </div>
    );
}
