import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Methodology | MPLP Validation Lab',
    description: 'Evidence-based evaluation methodology for MPLP lifecycle guarantees under versioned deterministic rulesets.',
    robots: { index: true, follow: true },
};

export default function MethodologyPage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                        <Link href="/" className="hover:text-zinc-300">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-300">Methodology</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Evaluation Methodology</h1>
                    <p className="text-zinc-400">
                        Evidence-based verdicts for MPLP lifecycle guarantees under versioned, deterministic rulesets.
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                        <span className="bg-zinc-800 px-2 py-1 rounded">METHOD-VLAB-01</span>
                        <span>Version 1.0</span>
                        <span>site-v0.5</span>
                    </div>
                </header>

                {/* SSOT Notice */}
                <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-8">
                    <p className="text-blue-400 text-sm">
                        📋 <strong>SSOT</strong>: This page is a projection of{' '}
                        <code className="bg-zinc-800 px-1 rounded">governance/METHOD-VLAB-01_EVALUATION_METHOD.md</code>
                    </p>
                </div>

                {/* Four Boundaries */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">1.</span> Four Boundaries
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Non-certification', desc: 'No badges, rankings, or compliance certificates' },
                            { title: 'Non-endorsement', desc: 'Verdict ≠ recommendation or quality assessment' },
                            { title: 'No execution hosting', desc: 'Lab does not run your code; you provide evidence packs' },
                            { title: 'Deterministic ruleset', desc: 'Same evidence + same ruleset = same verdict' },
                        ].map((b, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <h3 className="font-semibold text-amber-400 mb-1">{b.title}</h3>
                                <p className="text-zinc-400 text-sm">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">
                        See <Link href="/about" className="text-blue-400 hover:underline">/about</Link> for full boundary statement.
                    </p>
                </section>

                {/* What We Evaluate */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">2.</span> What We Evaluate
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-4">
                        <code className="text-green-400 text-lg">
                            Evidence Pack + Ruleset → Verdict (PASS/FAIL) + verdict_hash
                        </code>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-green-400 mb-2">✅ We Evaluate</h3>
                            <ul className="text-zinc-400 text-sm space-y-1">
                                <li>• Evidence packs against Lifecycle Guarantees</li>
                                <li>• Structural completeness and integrity</li>
                                <li>• Claim satisfaction under frozen rulesets</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-400 mb-2">❌ We Do NOT Evaluate</h3>
                            <ul className="text-zinc-400 text-sm space-y-1">
                                <li>• Runtime performance or latency</li>
                                <li>• Agent quality or intelligence</li>
                                <li>• Code correctness or security</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Evidence Pack */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">3.</span> Evidence Pack (Input)
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-sm text-zinc-400">
                        <pre>{`pack/
├── manifest.json            # Pack metadata
├── integrity/
│   ├── sha256sums.txt       # File checksums
│   └── pack.sha256          # Pack root hash
├── timeline/
│   └── events.ndjson        # Execution timeline
└── artifacts/
    ├── context.json         # Agent context
    ├── plan.json            # Agent plan
    └── trace.json           # Execution trace`}</pre>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm">
                        <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-400">pack-v0.2</span>
                        <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-400">pack-v0.3</span>
                        <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-400">pack-v0.4</span>
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">
                        See <Link href="/policies/contract" className="text-blue-400 hover:underline">/policies/contract</Link> for full specification.
                    </p>
                </section>

                {/* Case Lifecycle */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">4.</span> Case Lifecycle
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
                            <span className="bg-zinc-700 px-3 py-2 rounded">Submitted</span>
                            <span className="text-zinc-600">→</span>
                            <span className="bg-amber-900/50 text-amber-400 px-3 py-2 rounded border border-amber-800">Admission Check</span>
                            <span className="text-zinc-600">→</span>
                            <span className="bg-blue-900/50 text-blue-400 px-3 py-2 rounded border border-blue-800">REGISTERED</span>
                            <span className="text-zinc-600">→</span>
                            <span className="bg-green-900/50 text-green-400 px-3 py-2 rounded border border-green-800">ADJUDICATED</span>
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-red-400 text-sm bg-red-900/30 px-2 py-1 rounded">
                                ✗ NOT_ADMISSIBLE (if admission fails)
                            </span>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                            <h4 className="text-blue-400 font-semibold">REGISTERED</h4>
                            <p className="text-zinc-500">Pack admitted, awaiting evaluation</p>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                            <h4 className="text-green-400 font-semibold">ADJUDICATED</h4>
                            <p className="text-zinc-500">Evaluation complete, verdict issued</p>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 rounded p-3">
                            <h4 className="text-red-400 font-semibold">NOT_ADMISSIBLE</h4>
                            <p className="text-zinc-500">Pack rejected, no verdict</p>
                        </div>
                    </div>
                </section>

                {/* Rulesets */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">5.</span> Rulesets
                    </h2>
                    <p className="text-zinc-400 mb-4">
                        A <strong>Ruleset</strong> is a versioned, immutable set of decision rules. Once frozen, it never changes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { v: 'ruleset-1.0', format: 'GoldenFlow (LG-01~05)', pack: 'pack-v0.2' },
                            { v: 'ruleset-1.1', format: 'Four-Domain (D1~D4)', pack: 'pack-v0.3' },
                            { v: 'ruleset-1.2', format: 'Semantic Invariant (12 clauses)', pack: 'pack-v0.4' },
                        ].map((r, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                                <h3 className="font-mono text-purple-400 mb-2">{r.v}</h3>
                                <p className="text-zinc-400 text-sm">{r.format}</p>
                                <p className="text-zinc-600 text-xs mt-1">{r.pack}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">
                        See <Link href="/rulesets" className="text-blue-400 hover:underline">/rulesets</Link> for all versions.
                    </p>
                </section>

                {/* Verdicts & Recheck */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">6.</span> Verdicts & Recheck
                    </h2>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-4">
                        <h3 className="text-green-400 font-semibold mb-2">Determinism Guarantee</h3>
                        <code className="text-zinc-300">Same pack + same ruleset = same verdict_hash</code>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-blue-400 font-semibold mb-2">Third-Party Recheck</h3>
                        <code className="text-zinc-400 text-sm">
                            npx @mplp/recompute {'<pack_path>'} --ruleset 1.0
                        </code>
                        <p className="text-zinc-500 text-sm mt-2">
                            Anyone can verify a verdict independently without trusting Lab infrastructure.
                        </p>
                    </div>
                </section>

                {/* Substrate Model */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">7.</span> Substrate Model
                    </h2>
                    <p className="text-zinc-400 mb-4">
                        A <strong>Substrate</strong> is an execution environment (framework, protocol, runtime) that produces evidence packs.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                        {[
                            { name: 'LangChain', status: '✅ ADJUDICATED' },
                            { name: 'MCP', status: '✅ ADJUDICATED' },
                            { name: 'A2A', status: '✅ ADJUDICATED' },
                            { name: 'Autogen', status: '⚪ Archived' },
                            { name: 'Magnetic One', status: '⚪ Archived' },
                            { name: 'PydanticAI', status: '⚪ Available' },
                        ].map((s, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded p-3 text-center">
                                <p className="font-semibold text-zinc-200">{s.name}</p>
                                <p className="text-xs text-zinc-500">{s.status}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-zinc-500 text-sm">
                        See <Link href="/policies/substrate-scope" className="text-blue-400 hover:underline">/policies/substrate-scope</Link> for admission tiers.
                    </p>
                </section>

                {/* Version Taxonomy */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-amber-500">8.</span> Version Taxonomy
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left">
                                    <th className="py-2 text-zinc-400">Type</th>
                                    <th className="py-2 text-zinc-400">Prefix</th>
                                    <th className="py-2 text-zinc-400">Current</th>
                                    <th className="py-2 text-zinc-400">Scope</th>
                                </tr>
                            </thead>
                            <tbody className="text-zinc-300">
                                <tr className="border-b border-zinc-800/50">
                                    <td className="py-2">Site Freeze</td>
                                    <td className="py-2 font-mono text-blue-400">site-v*</td>
                                    <td className="py-2">site-v0.5</td>
                                    <td className="py-2 text-zinc-500">Website IA</td>
                                </tr>
                                <tr className="border-b border-zinc-800/50">
                                    <td className="py-2">Pack Format</td>
                                    <td className="py-2 font-mono text-green-400">pack-v*</td>
                                    <td className="py-2">pack-v0.2~0.4</td>
                                    <td className="py-2 text-zinc-500">Evidence structure</td>
                                </tr>
                                <tr className="border-b border-zinc-800/50">
                                    <td className="py-2">Ruleset</td>
                                    <td className="py-2 font-mono text-purple-400">ruleset-*</td>
                                    <td className="py-2">ruleset-1.0~1.2</td>
                                    <td className="py-2 text-zinc-500">Decision rules</td>
                                </tr>
                                <tr>
                                    <td className="py-2">Release Seal</td>
                                    <td className="py-2 font-mono text-amber-400">rel-lab-*</td>
                                    <td className="py-2">rel-lab-0.5</td>
                                    <td className="py-2 text-zinc-500">Governance seal</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Quick Links */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold mb-4">Quick Reference</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { href: '/about', label: 'Boundaries' },
                            { href: '/policies/contract', label: 'Pack Contract' },
                            { href: '/policies/intake', label: 'Intake Policy' },
                            { href: '/policies/substrate-scope', label: 'Substrate Scope' },
                            { href: '/rulesets', label: 'Rulesets' },
                            { href: '/guarantees', label: 'Guarantees' },
                            { href: '/coverage/adjudication', label: 'Coverage' },
                            { href: '/adjudication', label: 'Adjudication' },
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-center hover:bg-zinc-800 hover:border-zinc-600 transition-colors"
                            >
                                <span className="text-zinc-300 text-sm">{link.label}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-zinc-800 pt-8 text-center text-zinc-500 text-sm">
                    <p>
                        SSOT: <code className="bg-zinc-800 px-1 rounded">governance/METHOD-VLAB-01_EVALUATION_METHOD.md</code>
                    </p>
                    <p className="mt-2">
                        Validation Lab • site-v0.5 Frozen
                    </p>
                </footer>
            </div>
        </main>
    );
}
