import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { CuratedRunsTable } from './_components/CuratedRunsTable';
import { ScenarioAwareBanner } from './_components/ScenarioAwareBanner';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';

export const metadata = {
    title: 'Curated Runs | MPLP Validation Lab',
    description: 'Vendor-neutral evidence packs for third-party verification'
};

export default function RunsPage() {
    const data = getCuratedRuns();

    return (
        <div className="container max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Curated Runs</h1>

            <ScenarioAwareBanner />

            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Evidence Packs (v0.1)</h2>
                <p className="text-gray-600 mb-6">
                    These packs have been verified against frozen ruleset-1.0 and can be
                    independently recomputed using <code className="bg-gray-100 px-2 py-1 rounded">@mplp/recompute</code>.
                </p>
                <CuratedRunsTable runs={data.runs} />
            </section>

            <ProvenanceFooter ssot={data.ssot} />
        </div>
    );
}
