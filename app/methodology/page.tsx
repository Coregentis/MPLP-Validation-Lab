import Link from 'next/link';
import type { Metadata } from 'next';
import { VersionBadge, VersionText } from '@/components/common/VersionBadge';
import { getLabSeries } from '@/lib/ssot/load-lab-manifest';
import { TierLegend } from '@/components/unified/TierLegend';

export const metadata: Metadata = {
    title: 'Methodology | MPLP Validation Lab',
    description: 'Evidence-based evaluation methodology for MPLP lifecycle guarantees under versioned deterministic rulesets.',
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
                        A rigorous, non-certifying approach to verifying MPLP lifecycle invariants using evidence-based verdicts.
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
                            The Validation Lab evaluates <strong>evidence packs</strong>, not agentic systems. We issue <strong>verdicts</strong> based on deterministic rulesets, not certifications of quality or safety. A PASS verdict means the submitted evidence satisfies the claimed invariants under the specified Ruleset.
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

            {/* Section 3: What is Evaluated (Rulesets & Domains) */}
            <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-mplp-text mb-2">02. What We Evaluate</h2>
                        <p className="text-sm text-mplp-text-muted">Four domains of lifecycle inquiry (D1–D4).</p>
                    </div>
                    <Link href="/rulesets" className="hidden sm:block text-xs font-bold uppercase tracking-wider text-mplp-blue-soft hover:text-mplp-text transition-colors">
                        View Rulesets →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-amber-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold text-xs">D1</span>
                            <Link href="/rulesets/ruleset-1.1#d1" className="text-lg font-bold text-mplp-text group-hover:text-amber-400 transition-colors">Provenance</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            Is the agent identity and execution environment cryptographically verifiable? (e.g., Transparency logs, remote attestation)
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-mplp-blue-soft/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-mplp-blue/10 text-mplp-blue-soft font-bold text-xs">D2</span>
                            <Link href="/rulesets/ruleset-1.1#d2" className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">Lifecycle</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            Did the agent respect state transitions (Initialize → Run → Terminate) without leaking resources or zombie processes?
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-400 font-bold text-xs">D3</span>
                            <Link href="/rulesets/ruleset-1.1#d3" className="text-lg font-bold text-mplp-text group-hover:text-purple-400 transition-colors">Arbitration</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            Does the evidence contain necessary pointers (lines, diffs, snapshots) for human or machine arbitration in case of failure?
                        </p>
                    </div>

                    <div className="group p-6 rounded-xl bg-glass border border-mplp-border/30 hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-xs">D4</span>
                            <Link href="/rulesets/ruleset-1.1#d4" className="text-lg font-bold text-mplp-text group-hover:text-emerald-400 transition-colors">Interop</Link>
                        </div>
                        <p className="text-sm text-mplp-text-muted leading-relaxed">
                            Did the communication between components adhere to standard protocols (MCP, A2A) without proprietary side-channels?
                        </p>
                    </div>
                </div>
            </div>

            {/* Section 4: Evidence Pack Format */}
            <div className="mb-16">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-mplp-text mb-2">03. Evidence Pack Format</h2>
                    <p className="text-sm text-mplp-text-muted">The atomic unit of evaluation.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="prose prose-invert prose-sm text-mplp-text-muted">
                        <p className="leading-relaxed mb-6">
                            The <strong>Evidence Pack</strong> is a ZIP archive containing the minimal set of files needed to satisfy the Ruleset. It serves as a portable proof of conformance.
                        </p>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">manifest.json</strong>
                                    <span className="block text-xs mt-1">Metadata, claims, and self-reported verdict.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">integrity/</strong>
                                    <span className="block text-xs mt-1">SHA256 checksums for all artifacts in the pack.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">timeline/</strong>
                                    <span className="block text-xs mt-1">NDJSON event stream of the execution for replay.</span>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <div>
                                    <strong className="text-mplp-text">artifacts/</strong>
                                    <span className="block text-xs mt-1">Full capture of inputs, outputs, and side-effects.</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-mplp-dark-soft rounded-xl p-5 font-mono text-xs text-zinc-400 border border-mplp-border/30">
                        <div className="flex items-center gap-1.5 mb-4 border-b border-white/5 pb-3">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">manifest.json structure</span>
                        </div>
                        <pre className="overflow-x-auto text-[10px] leading-relaxed text-zinc-300">{`{
  "id": "run-xyz-123",
  "tier": "REPRODUCED",
  "verdict": "PASS",
  "ruleset": "ruleset-1.1",
  "claims": {
    "d1.provenance": true,
    "d4.mcp_compliance": true
  },
  "signatures": { 
    "signer": "vlab-signer-01",
    "algo": "ed25519", 
    "value": "a7f...9c2" 
  }
}`}</pre>
                    </div>
                </div>
            </div>

            {/* Section 5: Self-Audit Path */}
            <div className="mb-16" data-testid="methodology-self-audit-path">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-mplp-text mb-2">04. Self-Audit Path</h2>
                        <p className="text-sm text-mplp-text-muted">Official verification without trusting the Lab UI.</p>
                    </div>
                    <Link href="/runs" className="hidden sm:inline-flex px-4 py-2 bg-mplp-blue hover:bg-mplp-blue-soft text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors">
                        Start Self-Audit →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">1. Select Run</span>
                        <p className="text-xs text-mplp-text-muted">
                            Find a run marked <span className="text-emerald-400">REPRODUCED</span> in the <Link href="/runs" className="underline hover:text-white">/runs</Link> index.
                        </p>
                    </div>
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">2. Check Ruleset</span>
                        <p className="text-xs text-mplp-text-muted">
                            Verify the evaluation logic matches the  <Link href="/rulesets" className="underline hover:text-white">Ruleset ID</Link> claimed.
                        </p>
                    </div>
                    <div className="p-5 bg-glass rounded-xl border border-mplp-border/30">
                        <span className="block text-lg font-bold text-mplp-blue-soft mb-2">3. Verify Seal</span>
                        <p className="text-xs text-mplp-text-muted">
                            Find the Freeze Date in <Link href="/releases" className="underline hover:text-white">/releases</Link> and get the Seal Hash.
                        </p>
                    </div>
                    <div className="p-5 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                        <span className="block text-lg font-bold text-emerald-400 mb-2">4. Local Hash</span>
                        <p className="text-xs text-mplp-text-muted">
                            Run <code className="bg-black/20 px-1 rounded">sha256sum</code> on the pack. Must match Seal.
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
                    <span className="text-sm font-bold text-mplp-text">Release Seals</span>
                </Link>
            </div>
        </div>
    );
}
