/**
 * Run Detail Page
 * 
 * Four sections (frozen UI projection):
 * 1. Overview: pack_id, hash, admission, protocol/ruleset version
 * 2. Guarantees: GF verdicts with requirements and pointers
 * 3. Export: Download links for reports and evidence
 * 4. Execution: Referenced artifact files (derived from pointers)
 * 
 * Default: noindex,nofollow (GATE-06 enforcement)
 * Curated runs: index,follow (from curation.yaml whitelist)
 */

import { notFound } from 'next/navigation';
import { loadRun, runExists } from '@/lib/runs/loadRun';
import { getRunRobots } from '@/lib/policy/loadCuration';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ run_id: string }>;
}

// GATE-06: Generate robots metadata based on curation policy
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { run_id } = await params;
    const robots = getRunRobots(run_id);

    return {
        title: `Run: ${run_id} | MPLP Validation Lab`,
        robots: {
            index: robots.index,
            follow: robots.follow,
        },
    };
}

export default async function RunDetailPage({ params }: Props) {
    const { run_id } = await params;

    if (!runExists(run_id)) {
        notFound();
    }

    const data = loadRun(run_id);
    const evalReport = data.evaluationReport;
    const verifyReport = data.verifyReport;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Run: {run_id}</h1>
                {data.missing.length > 0 && (
                    <p className="text-amber-500 text-sm">
                        Missing: {data.missing.join(', ')}
                    </p>
                )}
            </div>

            {/* Section 1: Overview */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Overview</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-zinc-500">Pack ID</dt>
                        <dd className="font-mono">{evalReport?.pack_id || data.manifest?.pack_id || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Pack Root Hash</dt>
                        <dd className="font-mono text-xs">{evalReport?.pack_root_hash || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Protocol Version</dt>
                        <dd>{evalReport?.protocol_version || data.manifest?.protocol_version || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Ruleset Version</dt>
                        <dd>{evalReport?.ruleset_version || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Admission Status</dt>
                        <dd>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${verifyReport?.admission_status === 'ADMISSIBLE'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-red-900/30 text-red-400'
                                }`}>
                                {verifyReport?.admission_status || 'N/A'}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Verdict Hash</dt>
                        <dd className="font-mono text-xs">{evalReport?.verdict_hash || 'N/A'}</dd>
                    </div>
                </dl>
            </section>

            {/* Section 2: Guarantees (GF Verdicts) */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Guarantees (Golden Flows)</h2>

                {/* HARD BOUNDARY: NOT_ADMISSIBLE → no GF verdicts displayed */}
                {verifyReport?.admission_status !== 'ADMISSIBLE' ? (
                    <div className="space-y-4">
                        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
                            <p className="text-red-400 font-semibold mb-2">
                                Admission Failed — Guarantees Not Evaluated
                            </p>
                            <p className="text-zinc-400 text-sm">
                                Evidence pack did not pass admission checks. GF evaluation is skipped to prevent verdicts on untrusted evidence.
                            </p>
                        </div>

                        {/* Show blocking failures from verify report */}
                        {verifyReport?.blocking_failures && verifyReport.blocking_failures.length > 0 && (
                            <div className="text-sm">
                                <p className="text-zinc-500 mb-2">Blocking Failures:</p>
                                <ul className="space-y-2">
                                    {verifyReport.blocking_failures.map((fail: { check_id?: string; taxonomy?: string; message?: string; pointers?: Array<{ artifact_path: string; locator?: string }> }, idx: number) => (
                                        <li key={idx} className="bg-zinc-800 border border-zinc-700 rounded p-2">
                                            <p className="text-zinc-300">{fail.message}</p>
                                            {fail.taxonomy && (
                                                <span className="text-xs text-zinc-500 font-mono">{fail.taxonomy}</span>
                                            )}
                                            {fail.pointers && fail.pointers.length > 0 && (
                                                <div className="mt-1 text-xs text-zinc-500">
                                                    {fail.pointers.map((ptr, pIdx) => (
                                                        <div key={pIdx} className="font-mono">
                                                            {ptr.artifact_path}{ptr.locator ? `#${ptr.locator}` : ''}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : evalReport?.gf_verdicts && evalReport.gf_verdicts.length > 0 ? (
                    <div className="space-y-4">
                        {evalReport.gf_verdicts.map((gf) => (
                            <div key={gf.gf_id} className="border border-zinc-700 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold">{gf.gf_id}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${gf.status === 'PASS' ? 'bg-green-900/30 text-green-400' :
                                        gf.status === 'FAIL' ? 'bg-red-900/30 text-red-400' :
                                            'bg-zinc-700 text-zinc-400'
                                        }`}>
                                        {gf.status}
                                    </span>
                                </div>

                                {/* Requirements */}
                                {gf.requirements && gf.requirements.length > 0 && (
                                    <div className="text-sm">
                                        <p className="text-zinc-500 mb-2">Requirements:</p>
                                        <ul className="space-y-1">
                                            {gf.requirements.map((req, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${req.status === 'PASS' ? 'bg-green-500' :
                                                        req.status === 'FAIL' ? 'bg-red-500' :
                                                            'bg-zinc-500'
                                                        }`} />
                                                    <span className="font-mono text-xs">{req.requirement_id}</span>
                                                    <span className="text-zinc-500">— {req.status}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Failures with Pointers */}
                                {gf.failures && gf.failures.length > 0 && (
                                    <div className="mt-3 text-sm">
                                        <p className="text-red-400 mb-2">Failures:</p>
                                        <ul className="space-y-2">
                                            {gf.failures.map((fail, idx) => (
                                                <li key={idx} className="bg-red-900/10 border border-red-900/30 rounded p-2">
                                                    <p className="text-zinc-300">{fail.message}</p>
                                                    {fail.pointers && fail.pointers.length > 0 && (
                                                        <div className="mt-1 text-xs text-zinc-500">
                                                            {fail.pointers.map((ptr, pIdx) => (
                                                                <div key={pIdx} className="font-mono">
                                                                    {ptr.artifact_path}{ptr.locator ? `#${ptr.locator}` : ''}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500">No verdict data available.</p>
                )}
            </section>

            {/* Section 3: Export */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Export</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                        <p className="text-zinc-500 mb-2">Reports</p>
                        <ul className="space-y-1">
                            <li className={data.missing.includes('verify.report.json') ? 'text-zinc-600' : 'text-zinc-300'}>
                                verify.report.json {data.missing.includes('verify.report.json') && '(missing)'}
                            </li>
                            <li className={data.missing.includes('evaluation.report.json') ? 'text-zinc-600' : 'text-zinc-300'}>
                                evaluation.report.json {data.missing.includes('evaluation.report.json') && '(missing)'}
                            </li>
                        </ul>
                    </div>
                    <div className="text-sm">
                        <p className="text-zinc-500 mb-2">Evidence</p>
                        <ul className="space-y-1">
                            <li className={data.missing.includes('manifest.yaml') ? 'text-zinc-600' : 'text-zinc-300'}>
                                manifest.yaml {data.missing.includes('manifest.yaml') && '(missing)'}
                            </li>
                            <li className={data.missing.includes('sha256sums.txt') ? 'text-zinc-600' : 'text-zinc-300'}>
                                sha256sums.txt {data.missing.includes('sha256sums.txt') && '(missing)'}
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Section 4: Execution (Evidence Files from Pointers) */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Execution (Evidence Files)</h2>
                {evalReport?.gf_verdicts ? (
                    <div className="text-sm">
                        <p className="text-zinc-500 mb-2">Files referenced by verdict pointers:</p>
                        <ul className="space-y-1 font-mono text-xs">
                            {Array.from(new Set(
                                evalReport.gf_verdicts.flatMap((gf) => [
                                    ...(gf.requirements?.flatMap((r) =>
                                        r.pointers?.map((p) => p.artifact_path) || []
                                    ) || []),
                                    ...(gf.failures?.flatMap((f) =>
                                        f.pointers?.map((p) => p.artifact_path) || []
                                    ) || []),
                                ])
                            )).filter(Boolean).sort().map((file) => (
                                <li key={file} className="text-zinc-400">{file}</li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-zinc-500">No execution data available.</p>
                )}
            </section>
        </div>
    );
}
