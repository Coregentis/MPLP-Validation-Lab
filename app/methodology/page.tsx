import Link from 'next/link';
import type { Metadata } from 'next';
import { VersionBadge } from '@/components/common/VersionBadge';
import { TierLegend } from '@/components/unified/TierLegend';

export const metadata: Metadata = {
    title: 'Methodology | MPLP Validation Lab',
    description: 'Evidence-pack plus ruleset-identity methodology for bounded MPLP Validation Lab adjudication.',
    robots: { index: true, follow: true },
};

export default function MethodologyPage() {
    return (
        <div className="pt-8" data-testid="methodology-page">
            {/* Header */}
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Standards</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text">Evaluation Methodology</h1>
                    <div className="flex items-center gap-3 text-xs text-mplp-text-muted bg-mplp-dark-soft px-3 py-1.5 rounded border border-mplp-border/30">
                        <span className="font-mono">METHOD-VLAB-01</span>
                        <VersionBadge variant="lab" className="ml-0" />
                    </div>
                </div>
                <div className="mt-6 max-w-3xl">
                    <p className="text-mplp-text-muted text-lg leading-relaxed">
                        A bounded, non-certifying method for adjudicating evidence packs under explicit ruleset identities.
                    </p>
                </div>
            </div>

            {/* Section 1: Non-Certification Limit */}
            <div className="mb-12 p-4 bg-amber-900/10 border border-amber-500/20 rounded-lg" data-testid="methodology-non-certification">
                <div className="flex items-start gap-4">
                    <span className="text-amber-400 text-lg mt-0.5">⚠</span>
                    <div>
                        <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Non-Certification & Non-Endorsement</h2>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            The Validation Lab evaluates <strong>evidence packs</strong>, not live systems. We issue <strong>verdicts</strong> under a selected ruleset identity, not certifications of quality, safety, or protocol truth. A PASS verdict means the submitted evidence satisfied that ruleset&apos;s current criteria.
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 2: How to Read a Verdict (Tier) */}
            <div className="mb-16">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-mplp-text mb-2">01. How to Read a Verdict</h2>
                    <p className="text-sm text-mplp-text-muted">Evidence maturity classifications and cryptographic guarantees.</p>
                </div>
                <TierLegend />
            </div>

            {/* Section 3: Current Public Lab Model */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-mplp-text mb-2">02. Current Public Lab Model</h2>
                        <p className="text-sm text-mplp-text-muted">Two coexisting adjudication lines, kept distinct on public Lab surfaces.</p>
                    </div>
                    <div className="hidden sm:flex gap-3">
                        <Link href="/guarantees" className="text-xs font-bold uppercase tracking-wider text-mplp-blue-soft hover:text-mplp-text transition-colors">
                            View Guarantees →
                        </Link>
                        <Link href="/rulesets" className="text-xs font-bold uppercase tracking-wider text-mplp-blue-soft hover:text-mplp-text transition-colors">
                            View Rulesets →
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold text-xs">LEGACY</span>
                            <Link href="/guarantees?v=1" className="text-lg font-bold text-mplp-text group-hover:text-amber-400 transition-colors">V1 LG Line</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            Legacy V1 Lab guarantees come from <code>governance/LIFECYCLE_GUARANTEES.yaml</code> and are adjudicated under <code>ruleset-1.0</code> at presence-level strength.
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-mplp-blue/10 text-mplp-blue-soft font-bold text-xs">V2</span>
                            <Link href="/guarantees?v=2" className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">Clause Bundle Line</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            V2 public bundles are exposed under <code>public/_data/v2/rulesets/</code> and displayed as clause IDs. They coexist with the legacy V1 line and must not be collapsed into one doctrine.
                        </p>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                    <p className="text-sm text-mplp-text-muted leading-relaxed">
                        Historical teaching families such as <code>D1–D4</code>, <code>pack-v*</code>, and <code>ruleset-1.1/1.2</code> remain lineage context only.
                        They are not the primary public teaching model for the current aggregate V1/V2 Lab surface.
                    </p>
                </div>
            </div>

            {/* Section 4: Evaluation Object */}
            <div className="mb-16">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-mplp-text mb-2">03. Evaluation Object</h2>
                    <p className="text-sm text-mplp-text-muted">The Lab evaluates an evidence pack plus a selected ruleset identity.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="prose prose-invert prose-sm text-mplp-text-muted">
                        <p className="leading-relaxed mb-6">
                            The <strong>Evidence Pack</strong> is the Lab&apos;s input bundle. It is a portable adjudication input, not a protocol-definition artifact and not a certification object.
                        </p>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">Evidence Pack Contract</strong>
                                    <span className="block text-xs mt-1">Use the public contract page for the contract boundary and compatibility story.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">Ruleset Identity</strong>
                                    <span className="block text-xs mt-1">Every verdict must be read through the selected <code>validation_ruleset_version</code>.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">Version Domains</strong>
                                    <span className="block text-xs mt-1">Keep protocol version, schema bundle version, ruleset identity, and Lab release version distinct.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">Boundary</strong>
                                    <span className="block text-xs mt-1">Protocol invariants and protocol meaning remain repo/docs truth; Lab adjudicates submitted evidence only.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-mplp-dark-soft rounded-xl p-5 font-mono text-xs text-zinc-400 border border-mplp-border/30">
                        <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">reading order</span>
                        </div>
                        <pre className="overflow-x-auto text-[10px] leading-relaxed text-zinc-300">{`1. Read the evidence pack contract
2. Read the pinned ruleset identity
3. Read the adjudication output
4. Recheck the verdict hash locally
5. Do not infer protocol meaning from Lab UI copy alone`}</pre>
                    </div>
                </div>
            </div>

            {/* Section 5: Self-Audit Path */}
            <div className="mb-16" data-testid="methodology-self-audit-path">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-mplp-text mb-2">04. Self-Audit Path</h2>
                        <p className="text-sm text-mplp-text-muted">Independent recheck path without trusting the Lab UI.</p>
                    </div>
                    <Link href="/runs" className="hidden sm:inline-flex px-4 py-2 bg-mplp-blue hover:bg-mplp-blue-soft text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">
                        Start Self-Audit →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">1. Select Run</span>
                        <p className="text-xs text-mplp-text-muted">
                            Find a run in the <Link href="/runs" className="underline hover:text-white">/runs</Link> index and inspect its evidence bundle.
                        </p>
                    </div>
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">2. Check Ruleset</span>
                        <p className="text-xs text-mplp-text-muted">
                            Verify the evaluation logic matches the <Link href="/rulesets" className="underline hover:text-white">Ruleset ID</Link> claimed by the evidence pack.
                        </p>
                    </div>
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">3. Verify Record</span>
                        <p className="text-xs text-mplp-text-muted">
                            Find the release record in <Link href="/releases" className="underline hover:text-white">/releases</Link> and compare the published hash.
                        </p>
                    </div>
                    <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                        <span className="block text-lg font-bold text-emerald-400 mb-2">4. Local Hash</span>
                        <p className="text-xs text-mplp-text-muted">
                            Run a local hash recheck on the pack. Matching the published record confirms projection integrity, not runtime quality.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-mplp-border/30">
                <Link href="/runsets" className="block p-4 border border-mplp-border/20 rounded-lg hover:bg-mplp-blue-soft/5 hover:border-mplp-blue-soft/30 transition-all text-center">
                    <span className="block text-xs font-bold uppercase tracking-widest text-mplp-text-muted mb-1">Start Here</span>
                    <span className="text-sm font-bold text-mplp-text">Browse Runsets</span>
                </Link>
                <Link href="/runs" className="block p-4 border border-mplp-border/20 rounded-lg hover:bg-mplp-blue-soft/5 hover:border-mplp-blue-soft/30 transition-all text-center">
                    <span className="block text-xs font-bold uppercase tracking-widest text-mplp-text-muted mb-1">Evidence</span>
                    <span className="text-sm font-bold text-mplp-text">All Runs</span>
                </Link>
                <Link href="/releases" className="block p-4 border border-mplp-border/20 rounded-lg hover:bg-mplp-blue-soft/5 hover:border-mplp-blue-soft/30 transition-all text-center">
                    <span className="block text-xs font-bold uppercase tracking-widest text-mplp-text-muted mb-1">Verification</span>
                    <span className="text-sm font-bold text-mplp-text">Release Records</span>
                </Link>
            </div>
        </div>
    );
}
