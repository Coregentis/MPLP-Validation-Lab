import type { CuratedRunRecord } from '@/lib/curated/types';
import { HashCell } from './HashCell';
import Link from 'next/link';

export function CuratedRunsTable({ runs }: { runs: CuratedRunRecord[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="text-left p-3 border-b">Run ID</th>
                        <th className="text-left p-3 border-b">Substrate</th>
                        <th className="text-left p-3 border-b">Claim Level</th>
                        <th className="text-left p-3 border-b">Verdict Hash</th>
                        <th className="text-left p-3 border-b">Pack Root Hash</th>
                        <th className="text-left p-3 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map(run => (
                        <tr key={run.run_id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                                <Link href={`/runs/${run.run_id}`} className="text-blue-600 hover:underline font-mono text-sm">
                                    {run.run_id}
                                </Link>
                            </td>
                            <td className="p-3">{run.substrate}</td>
                            <td className="p-3">
                                {run.substrate_claim_level === 'reproduced' ? (
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Reproduced ✓
                                    </span>
                                ) : (
                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Declared
                                    </span>
                                )}
                            </td>
                            <td className="p-3">
                                <HashCell hash={run.verdict_hash} label="verdict" />
                            </td>
                            <td className="p-3">
                                <HashCell hash={run.pack_root_hash} label="pack_root" />
                            </td>
                            <td className="p-3">
                                {run.substrate_claim_level === 'reproduced' && (
                                    <a
                                        href={run.repro_ref}
                                        className="text-blue-600 hover:underline text-sm"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Reproduce →
                                    </a>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
