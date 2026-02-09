/**
 * Adjudication Index Page
 * 
 * Lists all adjudication bundles from export/adjudication-index.json.
 * Factual display only - non-endorsement, non-certification, and no ranking.
 * 
 * GOVERNANCE: Reviewability ≠ Reproducibility
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { loadExportJson, AdjudicationIndex } from '@/lib/export/loadJson';
import { StatusBadge } from '@/app/_shared/StatusBadge';
import { VerdictHashPill } from '@/app/_shared/VerdictHashPill';
import { DisputePrepTool } from './components/DisputePrepTool';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Adjudication Bundles — MPLP Validation Lab',
    description: 'Browse adjudication bundles with deterministic verdict hashes. Recheckable locally.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/adjudication`,
    },
    robots: { index: true, follow: true },
};

export default function AdjudicationPage() {
    let adjudicationIndex: AdjudicationIndex;

    try {
        adjudicationIndex = loadExportJson<AdjudicationIndex>('adjudication-index.json');
    } catch {
        return (
            <div className="container max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-mplp-text">Adjudication Bundles</h1>
                <p className="text-mplp-text-muted">No adjudication index found. Run <code className="px-1 py-0.5 rounded bg-mplp-dark-soft border border-mplp-border/40 text-xs font-mono">npm run vlab:export</code> first.</p>
            </div>
        );
    }

    const { adjudications } = adjudicationIndex;

    return (
        <div className="pt-8">
            <header className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Governance</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Adjudication &amp; Dispute Prep</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed" data-testid="adjudication-what-is">
                    <strong>Adjudication</strong> is the deterministic evaluation of an Evidence Pack against a Ruleset.
                    This tool helps you prepare materials for dispute resolution or local re-verification.
                </p>
            </header>

            {/* Boundary Statement - Standardized Four Boundaries */}
            <div className="mb-12 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg" data-testid="adjudication-non-certification">
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-1">
                    ⚠️ Non-certification Notice
                </p>
                <p className="text-sm text-mplp-text-muted">
                    This is an evidence-based verification tool, NOT a certifying authority. Results generated here are for internal audit and dispute preparation only.
                    We do not issue regulatory approvals or endorsements.
                </p>
            </div>

            {/* When to Use Cards */}
            <section className="mb-16" data-testid="adjudication-when-cards">
                <h2 className="text-lg font-bold text-mplp-text mb-6">When to Use Adjudication</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-glass border border-mplp-border/30 rounded-xl">
                        <h3 className="text-red-400 font-bold mb-2">Dispute Ready</h3>
                        <p className="text-sm text-mplp-text-muted">You have a FAIL result that you believe is incorrect, or a specific sample that demonstrates a ruleset ambiguity.</p>
                    </div>
                    <div className="p-6 bg-glass border border-mplp-border/30 rounded-xl">
                        <h3 className="text-amber-400 font-bold mb-2">Mismatch</h3>
                        <p className="text-sm text-mplp-text-muted">Your local recheck hash does not match the Release Seal hash, indicating env drift or artifact corruption.</p>
                    </div>
                    <div className="p-6 bg-glass border border-mplp-border/30 rounded-xl">
                        <h3 className="text-mplp-blue-soft font-bold mb-2">Pointer Break</h3>
                        <p className="text-sm text-mplp-text-muted">An evidence pointer (mplp://) cannot be resolved or the referenced artifact is missing.</p>
                    </div>
                </div>
            </section>

            {/* Client-Side Dispute Prep Tool */}
            <DisputePrepTool />

            {/* Verify Loop */}
            <section className="mb-16 bg-mplp-dark-soft/40 border border-mplp-border/30 rounded-xl p-8" data-testid="adjudication-verify-loop">
                <h2 className="text-lg font-bold text-mplp-text mb-4">Verification Loop</h2>
                <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-mplp-text-muted">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue-soft/20 text-mplp-blue-soft flex items-center justify-center font-bold text-xs">1</span>
                        <span>Download Artifacts</span>
                    </div>
                    <div className="h-px w-8 bg-mplp-border hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue-soft/20 text-mplp-blue-soft flex items-center justify-center font-bold text-xs">2</span>
                        <span>Local Recheck</span>
                    </div>
                    <div className="h-px w-8 bg-mplp-border hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue-soft/20 text-mplp-blue-soft flex items-center justify-center font-bold text-xs">3</span>
                        <span>Compare Hash</span>
                    </div>
                    <div className="h-px w-8 bg-mplp-border hidden md:block"></div>
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-mplp-blue-soft/20 text-mplp-blue-soft flex items-center justify-center font-bold text-xs">4</span>
                        <span>Submit Dispute</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-lg font-bold text-mplp-text mb-6">Public Adjudication Records</h2>
                {adjudications.length === 0 ? (
                    <p className="text-mplp-text-muted">No adjudications yet.</p>
                ) : (
                    <div className="bg-glass rounded-2xl overflow-hidden border border-mplp-border/30">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-mplp-dark-soft/50">
                                    <tr>
                                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Run ID</th>
                                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Status</th>
                                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Verdict Hash</th>
                                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Ruleset</th>
                                        <th className="text-left p-4 border-b border-mplp-border/30 text-xs font-bold text-mplp-text-muted uppercase tracking-wider">Adjudicated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adjudications.map((entry) => (
                                        <tr
                                            key={entry.run_id}
                                            className="border-b border-mplp-border/20 hover:bg-mplp-blue-soft/5 transition-colors group"
                                        >
                                            <td className="p-4">
                                                <Link
                                                    href={`/adjudication/${entry.run_id}`}
                                                    className="text-mplp-text hover:text-mplp-blue-soft transition font-mono text-sm font-bold"
                                                >
                                                    {entry.run_id}
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                <StatusBadge status={entry.overall_status} />
                                            </td>
                                            <td className="p-4">
                                                <VerdictHashPill
                                                    hash={entry.verdict_hash}
                                                    link={`/adjudication/${entry.run_id}`}
                                                />
                                            </td>
                                            <td className="p-4 text-sm text-mplp-text-muted font-mono">
                                                {entry.ruleset_version}
                                            </td>
                                            <td className="p-4 text-sm text-mplp-text-muted">
                                                {new Date(entry.adjudicated_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>

            {/* Stats */}
            <div className="mt-8 text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60 pb-12">
                Total: {adjudications.length} adjudication(s)
            </div>
        </div>
    );
}
