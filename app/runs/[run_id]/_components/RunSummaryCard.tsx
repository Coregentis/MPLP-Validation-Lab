import type { CuratedRunRecord } from '@/lib/curated/types';

export function RunSummaryCard({ run }: { run: CuratedRunRecord }) {
    return (
        <section className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-4">{run.run_id}</h1>

            <dl className="grid grid-cols-2 gap-4">
                <div>
                    <dt className="text-sm font-semibold text-gray-600">Substrate</dt>
                    <dd className="mt-1">{run.substrate}</dd>
                </div>
                <div>
                    <dt className="text-sm font-semibold text-gray-600">Claim Level</dt>
                    <dd className="mt-1">
                        {run.substrate_claim_level === 'reproduced' ? (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                Reproduced ✓
                            </span>
                        ) : (
                            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                Declared
                            </span>
                        )}
                    </dd>
                </div>
                <div>
                    <dt className="text-sm font-semibold text-gray-600">Scenario</dt>
                    <dd className="mt-1">{run.scenario_id}</dd>
                </div>
                <div>
                    <dt className="text-sm font-semibold text-gray-600">Ruleset</dt>
                    <dd className="mt-1">{run.ruleset_version} <span className="text-sm text-gray-500">(presence-level)</span></dd>
                </div>
            </dl>
        </section>
    );
}
