/**
 * Runs Index Page
 * 
 * Lists available runs in data/runs/
 * Shows pack_id, admission status, verdict_hash for each run.
 */

import Link from 'next/link';
import { listRuns } from '@/lib/runs/loadRun';

export default function RunsPage() {
    const runs = listRuns();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Runs</h1>
            <p className="text-zinc-400 mb-8">
                Evidence-based verdicts evaluated under versioned rulesets.
            </p>

            {runs.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <p className="text-zinc-500">No runs available.</p>
                    <p className="text-zinc-600 text-sm mt-2">
                        Add run data to <code className="text-zinc-400">data/runs/</code> to see verdicts.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {runs.map((run) => (
                        <Link
                            key={run.run_id}
                            href={`/runs/${run.run_id}`}
                            className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg">{run.run_id}</h2>
                                    {run.pack_id && (
                                        <p className="text-zinc-500 text-sm">Pack: {run.pack_id}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    {run.admission_status && (
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${run.admission_status === 'ADMISSIBLE'
                                                ? 'bg-green-900/30 text-green-400'
                                                : 'bg-red-900/30 text-red-400'
                                            }`}>
                                            {run.admission_status}
                                        </span>
                                    )}
                                    {run.verdict_hash && (
                                        <p className="text-zinc-600 text-xs mt-1 font-mono">
                                            {run.verdict_hash.slice(0, 16)}...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
