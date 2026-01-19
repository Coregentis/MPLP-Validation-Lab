/**
 * Adjudication Index Page
 * 
 * Lists all adjudication bundles from export/adjudication-index.json.
 * Factual display only - no endorsement/certification/ranking.
 * 
 * GOVERNANCE: Reviewability ≠ Reproducibility
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { loadExportJson, AdjudicationIndex } from '@/lib/export/loadJson';
import { StatusBadge } from '@/app/_shared/StatusBadge';
import { VerdictHashBadge } from '@/app/_shared/VerdictHashBadge';

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
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Governance</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Adjudication Bundles</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Browse adjudication bundles with deterministic <code className="text-mplp-blue-soft font-mono text-sm">verdict_hash</code> that anyone can recheck locally.
                </p>
            </div>

            {/* Boundary Statement - Standardized Four Boundaries */}
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
                                            <VerdictHashBadge
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

            {/* Stats */}
            <div className="mt-8 text-xs font-bold uppercase tracking-widest text-mplp-text-muted/60">
                Total: {adjudications.length} adjudication(s)
            </div>
        </div>
    );
}
