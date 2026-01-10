import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { notFound } from 'next/navigation';
import { RunSummaryCard } from './_components/RunSummaryCard';
import { VerificationPanel } from './_components/VerificationPanel';
import { EvidencePackBrowser } from './_components/EvidencePackBrowser';
import { GovernancePanel } from './_components/GovernancePanel';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';

// GATE-06: Default to noindex for run detail pages
export const metadata = {
    robots: { index: false, follow: false }
};

export async function generateStaticParams() {
    const data = getCuratedRuns();
    return data.runs.map(run => ({ run_id: run.run_id }));
}

export default function RunDetailPage({ params }: { params: { run_id: string } }) {
    const data = getCuratedRuns();
    const run = data.runs.find(r => r.run_id === params.run_id);

    if (!run) {
        notFound();
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8">
            <RunSummaryCard run={run} />
            <VerificationPanel run={run} />
            <EvidencePackBrowser runId={run.run_id} />
            <GovernancePanel />
            <ProvenanceFooter ssot={data.ssot} />
        </div>
    );
}
