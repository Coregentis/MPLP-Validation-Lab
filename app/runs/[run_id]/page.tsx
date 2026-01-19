import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RunSummaryCard } from './_components/RunSummaryCard';
import { VerificationPanel } from './_components/VerificationPanel';
import { RulesetEvaluationSection } from './_components/RulesetEvaluationSection';
import { EvidencePackBrowser } from './_components/EvidencePackBrowser';
import { GovernancePanel } from './_components/GovernancePanel';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';

// GATE-06: Default to noindex for run detail pages
export const metadata = {
    robots: { index: false, follow: false }
};

// Required for fs-based loaders (loadRunBundle, etc.)
export const runtime = 'nodejs';


export async function generateStaticParams() {
    const data = getCuratedRuns();
    return data.runs.map(run => ({ run_id: run.run_id }));
}

export default async function RunDetailPage({ params }: { params: Promise<{ run_id: string }> }) {
    const { run_id } = await params;
    const data = getCuratedRuns();
    const run = data.runs.find(r => r.run_id === run_id);

    if (!run) {
        notFound();
    }

    // Determine if this is a ruleset-1.1 run (v0.3 arbitration pack)
    const isRuleset11 = run.ruleset_version === 'ruleset-1.1' || run_id.toLowerCase().startsWith('arb-');

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div />
                <Link
                    href={`/runs/${run.run_id}/replay`}
                    className="px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg bg-mplp-blue-soft/10 border border-mplp-blue-soft/30 text-mplp-blue-soft hover:bg-mplp-blue-soft/20 hover:border-mplp-blue-soft/50 transition-all"
                >
                    View Replay →
                </Link>
            </div>
            <RunSummaryCard run={run} />
            <VerificationPanel run={run} />

            {/* Ruleset-1.1 Four-Domain Evaluation (v0.3 arbitration packs) */}
            {isRuleset11 && (
                <RulesetEvaluationSection runId={run.run_id} />
            )}

            <EvidencePackBrowser runId={run.run_id} />
            <GovernancePanel />
            <ProvenanceFooter ssot={data.ssot} />
        </div>
    );
}

