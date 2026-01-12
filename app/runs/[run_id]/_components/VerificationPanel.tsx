import type { CuratedRunRecord } from '@/lib/curated/types';

export function VerificationPanel({ run }: { run: CuratedRunRecord }) {
    const recomputeCmd = `npx @mplp/recompute data/runs/${run.run_id} --ruleset 1.0`;

    return (
        <section className="border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Third-Party Verification</h2>

            <p className="text-sm text-gray-600 mb-4">
                Anyone can independently verify this verdict using the recompute CLI:
            </p>

            <div className="bg-gray-900 text-white p-4 rounded font-mono text-sm mb-4 overflow-x-auto">
                <code>{recomputeCmd}</code>
            </div>

            <div>
                <h3 className="text-sm font-semibold mb-3">Expected Output</h3>
                <dl className="space-y-3">
                    <div>
                        <dt className="text-xs text-gray-600 mb-1">verdict_hash</dt>
                        <dd className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                            {run.verdict_hash}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-gray-600 mb-1">pack_root_hash</dt>
                        <dd className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                            {run.pack_root_hash}
                        </dd>
                    </div>
                </dl>
            </div>

            {run.substrate_claim_level === 'reproduced' && (
                <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <h3 className="font-semibold text-green-900">Reproduction Available</h3>
                    <p className="text-sm mt-1 text-green-800">
                        Full reproduction steps: <a href={`/examples/evidence-producers/${run.substrate}#repro-steps`} className="text-blue-600 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">
                            README.md#repro-steps
                        </a>
                    </p>
                </div>
            )}
        </section>
    );
}
