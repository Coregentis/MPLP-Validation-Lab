/**
 * Substrate Scope Policy Page
 * 
 * Public projection of governance/SUBSTRATE_SCOPE_POLICY.md
 * Explains: tier definitions, admission criteria, claim levels
 * 
 * GOVERNANCE: Non-certification. This describes evidence admissibility, not capability.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

interface SubstrateRun {
    run_id: string;
    status: string;
}

interface Substrate {
    id: string;
    display_name: string;
    type: string;
    tier: number;
    runs: SubstrateRun[];
}

interface SubstrateIndex {
    substrates: Substrate[];
}

function loadTier0Substrates() {
    const ssotPath = join(process.cwd(), 'data', 'curated-runs', 'substrate-index.yaml');
    const content = readFileSync(ssotPath, 'utf-8');
    const data = yaml.parse(content) as SubstrateIndex;
    return data.substrates.filter(s => s.tier === 0);
}

export const metadata: Metadata = {
    title: 'Substrate Scope Policy | MPLP Validation Lab',
    description: 'Which execution substrates may appear in the Validation Lab and under what admission criteria',
};

export default function SubstrateScopePage() {
    const tier0Substrates = loadTier0Substrates();
    const frameworks = tier0Substrates.filter(s => s.type === 'framework');
    const protocols = tier0Substrates.filter(s => s.type === 'protocol');

    return (
        <div className="max-w-4xl mx-auto pt-8">
            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Policy</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Substrate Scope Policy</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Which execution substrates may appear in the Validation Lab and under what admission criteria.
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

            {/* Section 1: Key Principle */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">1. Key Principle</h2>
                <ul className="space-y-2 text-mplp-text-muted">
                    <li className="flex gap-2">
                        <span className="text-amber-500">•</span>
                        <span>This policy <strong>does not</strong> define MPLP protocol requirements.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-amber-500">•</span>
                        <span>This policy <strong>does not</strong> certify or endorse any framework.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-amber-500">•</span>
                        <span>The Lab adjudicates <strong>evidence</strong>, not execution.</span>
                    </li>
                </ul>
            </section>

            {/* Section 2: Tier Definitions */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">2. Scope Tiers</h2>

                <div className="space-y-6">
                    {/* Tier-0 */}
                    <div>
                        <h3 className="font-medium text-mplp-text mb-3">
                            <span className="inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded mr-2">Tier-0</span>
                            Canonical Target List
                        </h3>
                        <p className="text-sm text-mplp-text-muted mb-4">
                            The minimal mainstream set required to credibly claim cross-framework adjudication.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-mplp-text-muted uppercase tracking-wider mb-2">
                                    Execution Frameworks ({frameworks.length})
                                </p>
                                <ul className="text-sm space-y-1 text-mplp-text-muted">
                                    {frameworks.map(s => (
                                        <li key={s.id}>• {s.display_name}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-mplp-text-muted uppercase tracking-wider mb-2">
                                    Protocol Rails ({protocols.length})
                                </p>
                                <ul className="text-sm space-y-1 text-mplp-text-muted">
                                    {protocols.map(s => (
                                        <li key={s.id}>• {s.display_name}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <p className="text-xs text-mplp-text-muted/60 mt-3">
                            📊 SSOT: <code className="bg-zinc-800 px-1 rounded">data/curated-runs/substrate-index.yaml</code>
                        </p>
                    </div>

                    {/* Tier-1 & Tier-2 */}
                    <div className="border-t border-zinc-700 pt-4">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="inline-block bg-zinc-600 text-white text-xs px-2 py-0.5 rounded mr-2">Tier-1</span>
                                <span className="text-mplp-text-muted">Extended / Rolling</span>
                                <p className="text-xs text-mplp-text-muted/70 mt-1">
                                    Frameworks with meaningful adoption (e.g., LlamaIndex, Haystack)
                                </p>
                            </div>
                            <div>
                                <span className="inline-block bg-zinc-700 text-white text-xs px-2 py-0.5 rounded mr-2">Tier-2</span>
                                <span className="text-mplp-text-muted">Ecosystem / Long-tail</span>
                                <p className="text-xs text-mplp-text-muted/70 mt-1">
                                    Niche, experimental, or closed-source substrates
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Claim Levels */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">3. Claim Levels (Admissibility)</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    Each substrate evidence pack carries a claim level indicating its reproducibility:
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-700">
                                <th className="text-left py-2 px-3 text-mplp-text-muted font-medium">Level</th>
                                <th className="text-left py-2 px-3 text-mplp-text-muted font-medium">Definition</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3 font-mono text-blue-400">Declared</td>
                                <td className="py-2 px-3 text-mplp-text-muted">Static or mocked producer; evidence present but not reproduced</td>
                            </tr>
                            <tr className="border-b border-zinc-800">
                                <td className="py-2 px-3 font-mono text-green-400">Reproduced</td>
                                <td className="py-2 px-3 text-mplp-text-muted">Deterministic reproduction demonstrated (run-twice hash match)</td>
                            </tr>
                            <tr>
                                <td className="py-2 px-3 font-mono text-purple-400">Cross-Verified</td>
                                <td className="py-2 px-3 text-mplp-text-muted">Equivalence evidence across paradigms under the same ruleset</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Section 4: Admission Criteria */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4 text-mplp-text">4. Admission Criteria</h2>
                <p className="text-sm text-mplp-text-muted mb-4">
                    For an evidence pack to be admitted (ADMISSIBLE), it must pass these structural gates:
                </p>
                <ul className="space-y-2 text-sm text-mplp-text-muted">
                    <li className="flex gap-2">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">MAN-001</code>
                        <span>All required manifest fields present (pack_version, protocol_version, etc.)</span>
                    </li>
                    <li className="flex gap-2">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">INT-001</code>
                        <span>SHA256 sums verification passes for all listed files</span>
                    </li>
                    <li className="flex gap-2">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">INT-002</code>
                        <span>Pack root hash matches computed hash</span>
                    </li>
                    <li className="flex gap-2">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">INT-003</code>
                        <span>All pack files covered by SHA256 sums (no uncovered files)</span>
                    </li>
                    <li className="flex gap-2">
                        <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded">VER-*</code>
                        <span>Protocol version binding and schemas bundle hash verification</span>
                    </li>
                </ul>
                <p className="text-xs text-mplp-text-muted/70 mt-4">
                    See <Link href="/policies/intake" className="text-mplp-blue-soft hover:underline">Intake Policy</Link> for
                    status taxonomy (REGISTERED, ADJUDICATED, NOT_ADMISSIBLE, etc.)
                </p>
            </section>

            {/* Section 5: Traceability */}
            <section className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-8">
                <h3 className="text-sm font-semibold mb-2 text-mplp-text">Traceability</h3>
                <p className="text-sm text-mplp-text-muted">
                    This page is a public projection of the internal governance document. Authoritative source:{' '}
                    <a
                        href="https://github.com/Coregentis/MPLP-Protocol/blob/main/Validation_Lab/governance/SUBSTRATE_SCOPE_POLICY.md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-mplp-blue-soft hover:underline"
                    >
                        SUBSTRATE_SCOPE_POLICY.md ↗
                    </a>
                </p>
            </section>

            {/* Navigation */}
            <div className="flex gap-4 text-sm pt-4">
                <Link href="/coverage/adjudication" className="text-mplp-blue-soft hover:underline">
                    ← Adjudication Coverage
                </Link>
                <Link href="/policies/intake" className="text-mplp-blue-soft hover:underline">
                    Intake Policy →
                </Link>
            </div>
        </div>
    );
}
