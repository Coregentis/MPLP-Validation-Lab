/**
 * Adjudication Detail Page
 * 
 * Shows full adjudication bundle details for a specific run_id.
 * Includes verdict summary, integrity info, and recheck instructions.
 * 
 * GOVERNANCE: Reviewability ≠ Reproducibility
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    loadExportJson,
    loadAdjudicationFile,
    loadAdjudicationTextFile,
    adjudicationBundleExists,
    AdjudicationIndex,
    Verdict
} from '@/lib/export/loadJson';
import { StatusBadge } from '@/app/_shared/StatusBadge';
import { VerdictHashBadge } from '@/app/_shared/VerdictHashBadge';

interface PageProps {
    params: Promise<{ run_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { run_id } = await params;
    return {
        title: `${run_id} — Adjudication — MPLP Validation Lab`,
        description: `Adjudication bundle for ${run_id}. Deterministic verdict_hash, recheckable locally.`,
    };
}

export default async function AdjudicationDetailPage({ params }: PageProps) {
    const { run_id } = await params;

    // Check bundle exists
    if (!adjudicationBundleExists(run_id)) {
        notFound();
    }

    // Load verdict
    const verdict = loadAdjudicationFile<Verdict>(run_id, 'verdict.json');
    if (!verdict) {
        notFound();
    }

    // Load sha256sums
    const sha256sums = loadAdjudicationTextFile(run_id, 'sha256sums.txt') || '';

    // Get index entry for cross-reference
    let indexEntry = null;
    try {
        const index = loadExportJson<AdjudicationIndex>('adjudication-index.json');
        indexEntry = index.adjudications.find(e => e.run_id === run_id);
    } catch {
        // Index may not exist
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link href="/adjudication" className="text-zinc-500 hover:text-zinc-300 text-sm">
                    ← Back to Adjudications
                </Link>
            </div>

            <h1 className="text-3xl font-bold mb-2">{run_id}</h1>
            <p className="text-zinc-400 mb-6">Adjudication Bundle</p>

            {/* Verdict Summary */}
            <section className="border border-zinc-800 rounded-xl p-6 mb-6 bg-zinc-950">
                <h2 className="text-lg font-semibold mb-4">Verdict Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-zinc-500">Overall Status:</span>
                        <div className="mt-1">
                            <StatusBadge status={verdict.overall_status} size="md" />
                        </div>
                    </div>
                    <div>
                        <span className="text-zinc-500">Admission:</span>
                        <div className="mt-1">
                            <StatusBadge status={verdict.admission_status} size="md" />
                        </div>
                    </div>
                    <div>
                        <span className="text-zinc-500">Ruleset:</span>
                        <p className="mt-1 text-zinc-300">{verdict.ruleset_version}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Protocol Pin:</span>
                        <p className="mt-1 text-zinc-300 font-mono text-xs">{verdict.protocol_pin}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Adjudicated At:</span>
                        <p className="mt-1 text-zinc-300">{new Date(verdict.adjudicated_at).toLocaleString()}</p>
                    </div>
                    <div>
                        <span className="text-zinc-500">Verifier:</span>
                        <p className="mt-1 text-zinc-300">{verdict.verifier?.id} v{verdict.verifier?.version}</p>
                    </div>
                </div>

                {/* Verdict Hash */}
                <div className="mt-6 pt-4 border-t border-zinc-800">
                    <span className="text-zinc-500 text-sm">Verdict Hash (deterministic):</span>
                    <div className="mt-2">
                        <VerdictHashBadge hash={verdict.verdict_hash} truncate={false} />
                    </div>
                </div>
            </section>

            {/* Lifecycle Guarantee Results */}
            {verdict.golden_flow_results && Object.keys(verdict.golden_flow_results).length > 0 && (
                <section className="border border-zinc-800 rounded-xl p-6 mb-6 bg-zinc-950">
                    <h2 className="text-lg font-semibold mb-4">Lifecycle Guarantee Results</h2>
                    <div className="space-y-2">
                        {Object.entries(verdict.golden_flow_results).map(([gfId, result]) => {
                            // Map internal gf-xx to external LG-xx
                            const LG_NAMES: Record<string, { id: string; name: string; internalId: string }> = {
                                '0': { id: 'LG-01', internalId: 'gf-01', name: 'Single Agent Lifecycle' },
                                '1': { id: 'LG-02', internalId: 'gf-02', name: 'Multi-Agent Collaboration' },
                                '2': { id: 'LG-03', internalId: 'gf-03', name: 'Human-in-the-Loop Gating' },
                                '3': { id: 'LG-04', internalId: 'gf-04', name: 'Drift Detection & Recovery' },
                                '4': { id: 'LG-05', internalId: 'gf-05', name: 'External Tool Integration' },
                                'gf-01': { id: 'LG-01', internalId: 'gf-01', name: 'Single Agent Lifecycle' },
                                'gf-02': { id: 'LG-02', internalId: 'gf-02', name: 'Multi-Agent Collaboration' },
                                'gf-03': { id: 'LG-03', internalId: 'gf-03', name: 'Human-in-the-Loop Gating' },
                                'gf-04': { id: 'LG-04', internalId: 'gf-04', name: 'Drift Detection & Recovery' },
                                'gf-05': { id: 'LG-05', internalId: 'gf-05', name: 'External Tool Integration' },
                            };
                            const lgInfo = LG_NAMES[gfId] || LG_NAMES[gfId.toLowerCase()] || { id: gfId.toUpperCase().replace('GF-', 'LG-'), internalId: gfId, name: '' };

                            return (
                                <div key={gfId} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-bold text-mplp-blue-soft">{lgInfo.id}</span>
                                        {lgInfo.name && <span className="text-sm text-zinc-400">{lgInfo.name}</span>}
                                    </div>
                                    <StatusBadge status={result.status} />
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Integrity */}
            <section className="border border-zinc-800 rounded-xl p-6 mb-6 bg-zinc-950">
                <h2 className="text-lg font-semibold mb-4">Integrity (sha256sums)</h2>
                <pre className="text-xs text-zinc-400 font-mono overflow-x-auto bg-zinc-900 p-4 rounded">
                    {sha256sums || 'No sha256sums.txt found'}
                </pre>
            </section>

            {/* Verify Locally (Read-Only) */}
            <section className="border border-zinc-800 rounded-xl overflow-hidden mb-6 bg-zinc-950">
                <div className="bg-zinc-900/50 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-zinc-200">Verify Locally (Read-Only)</h2>
                    <span className="text-xs font-mono text-emerald-500 bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/50">MATCH GUARANTEED</span>
                </div>
                <div className="p-6">
                    <div className="text-sm text-zinc-400 space-y-3">
                        <p>Run these commands to verify the adjudication independently:</p>
                        <div className="relative group">
                            <pre className="text-xs font-mono bg-black/50 border border-zinc-800 p-4 rounded text-zinc-300 overflow-x-auto whitespace-pre-wrap select-all">
                                {`# Clone and navigate to bundle
cd Validation_Lab/adjudication/${run_id}

# Step 1: Verify file integrity
sha256sum -c sha256sums.txt

# Step 2: Verify verdict_hash (read-only)
npm run vlab:recheck-hash ${run_id}`}
                            </pre>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-xs text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 pointer-events-none">
                                Select to copy
                            </div>
                        </div>
                        <p className="text-xs text-zinc-500">
                            <strong>Note:</strong> These commands verify that the local evidence pack produces the exact same verdict hash as the record.
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 text-xs text-zinc-500">
                        <Link href="https://docs.mplp.io/evaluation/conformance/reviewability" className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                            <span>Reviewability ≠ Reproducibility Guide</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Boundary statement */}
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-950 text-center">
                <span className="text-xs text-zinc-500">
                    Reviewability ≠ Reproducibility. The Lab rechecks evidence, not execution.
                </span>
            </div>
        </div>
    );
}
