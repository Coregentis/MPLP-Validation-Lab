import type { Metadata } from 'next';
import Link from 'next/link';
import * as fs from 'fs';
import * as path from 'path';
import { notFound } from 'next/navigation';

type PageParams = { diff_id: string };
type PageProps = {
    params: Promise<PageParams>;
    searchParams?: Promise<{ domain?: string; type?: string }>;
};

// Repro Pack type (rp-1)
interface ReproPackRp1 {
    repro_pack_version: string;
    diff_id: string;
    from: string;
    to: string;
    inputs?: Record<string, string>;
    artifacts?: {
        v0_8_frozen?: { index_json_sha256: string; diff_json_sha256: string };
        v0_9_enhanced?: { index_enhanced_json_sha256: string; diff_enhanced_json_sha256: string } | null;
    };
    commands?: Record<string, string[]>;
    boundary?: { non_endorsement?: string };
}

interface DiffReport {
    diff_version: string;
    generated_at: string;
    from: {
        ruleset_version: string;
        path: string;
        root_hash_sha256: string;
    };
    to: {
        ruleset_version: string;
        path: string;
        root_hash_sha256: string;
    };
    scope: {
        domains: string[];
        notes: string;
    };
    summary: {
        breaking_changes: number;
        non_breaking_changes: number;
        added: number;
        removed: number;
        modified: number;
        note?: string;
    };
    clause_delta: {
        added: any[];
        removed: any[];
        modified: any[];
        note?: string;
    };
    requirement_delta: {
        added: any[];
        removed: any[];
        modified: any[];
        note?: string;
    };
    non_endorsement_boundary: string[];
    reproducibility?: {
        command: string;
        hash_computation: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { diff_id } = await params;
    return {
        title: `Ruleset Diff: ${diff_id} | Validation Lab`,
        description: 'Ruleset version evolution diff report',
    };
}

function sanitizeDiffId(diffId: string): string | null {
    // Allow only safe characters to prevent path traversal
    // Example allowed: ruleset-1.0_to_ruleset-1.1
    if (!/^[a-zA-Z0-9._-]+$/.test(diffId)) return null;
    if (diffId.includes('..')) return null;
    return diffId;
}

function loadDiffReport(diffId: string): { data: DiffReport; mode: 'enhanced' | 'v0.8' } | null {
    try {
        const safe = sanitizeDiffId(diffId);
        if (!safe) return null;

        const exportRoot = path.join(process.cwd(), 'export/ruleset-diff', safe);

        // Try enhanced first (v0.9+)
        const enhancedPath = path.join(exportRoot, 'diff.enhanced.json');
        if (fs.existsSync(enhancedPath)) {
            const raw = fs.readFileSync(enhancedPath, 'utf-8');
            return { data: JSON.parse(raw), mode: 'enhanced' };
        }

        // Fallback to v0.8
        const v08Path = path.join(exportRoot, 'diff.json');
        if (fs.existsSync(v08Path)) {
            const raw = fs.readFileSync(v08Path, 'utf-8');
            return { data: JSON.parse(raw), mode: 'v0.8' };
        }

        return null;
    } catch (error) {
        console.error(`Failed to load diff report ${diffId}:`, error);
        return null;
    }
}

function formatDate(dateString: string): string {
    try {
        const dt = new Date(dateString);
        return isNaN(dt.getTime()) ? dateString : dt.toLocaleString();
    } catch {
        return dateString;
    }
}

function loadReproPack(diffId: string): ReproPackRp1 | null {
    try {
        const safe = sanitizeDiffId(diffId);
        if (!safe) return null;
        const reproPath = path.join(process.cwd(), 'export/ruleset-diff', safe, 'repro-pack.json');
        if (!fs.existsSync(reproPath)) return null;
        const raw = fs.readFileSync(reproPath, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export default async function DiffDetailPage({ params, searchParams }: PageProps) {
    const { diff_id } = await params;
    const resolvedSearchParams = await searchParams;
    const selectedDomain = resolvedSearchParams?.domain ?? 'all';
    const selectedType = resolvedSearchParams?.type ?? 'all';

    const loaded = loadDiffReport(diff_id);

    if (!loaded) {
        notFound();
    }

    const { data: report, mode } = loaded;
    const reproPack = loadReproPack(diff_id);

    // Extract facets data (enhanced mode only)
    const domainDelta = (report as any)?.domain_delta ?? null;
    const modifiedItems: any[] = report?.clause_delta?.modified ?? [];

    const allDomains: string[] = domainDelta ? Object.keys(domainDelta) : [];
    const allTypes: string[] = Array.from(
        new Set(
            modifiedItems
                .map((x: any) => x?.change_type)
                .filter((x): x is string => typeof x === 'string' && x.length > 0)
        )
    ).sort();

    const facetsEnabled = mode === 'enhanced' && (allDomains.length > 0 || allTypes.length > 0);

    // Build facet href helper
    const baseHref = `/rulesets/diff/${diff_id}`;
    function facetHref(domain: string, type: string) {
        const qs: string[] = [];
        if (domain !== 'all') qs.push(`domain=${encodeURIComponent(domain)}`);
        if (type !== 'all') qs.push(`type=${encodeURIComponent(type)}`);
        return qs.length ? `${baseHref}?${qs.join('&')}` : baseHref;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Boundary Banner */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 mb-1">Non-Endorsement Boundary</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            {report.non_endorsement_boundary.map((item, idx) => (
                                <li key={idx}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="mb-4">
                <Link href="/rulesets/diff" className="text-blue-600 hover:text-blue-800 text-sm">
                    ← Back to all diffs
                </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Ruleset Evolution: {report.from.ruleset_version} → {report.to.ruleset_version}
                </h1>
                <p className="text-gray-600">
                    Generated: {formatDate(report.generated_at)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    Data source: {mode === 'enhanced' ? 'diff.enhanced.json (v0.9+)' : 'diff.json (v0.8)'}
                </p>
            </div>

            {/* Facets Panel (v0.9.2) */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-2">Filters</h2>
                <p className="text-xs text-gray-500 mb-4">
                    Filters help navigate ruleset changes. They do not indicate framework/vendor/substrate quality.
                </p>

                {!facetsEnabled ? (
                    <p className="text-sm text-gray-500">
                        Facets are available when enhanced diff data is present.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Domain Filter */}
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Domain</div>
                            <div className="flex flex-wrap gap-2">
                                <Link
                                    href={facetHref('all', selectedType)}
                                    className={`text-xs px-2 py-1 rounded ${selectedDomain === 'all' ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    All
                                </Link>
                                {allDomains.sort().map((d) => (
                                    <Link
                                        key={d}
                                        href={facetHref(d, selectedType)}
                                        className={`text-xs px-2 py-1 rounded ${selectedDomain === d ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {d}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Change Type Filter */}
                        {allTypes.length > 0 && (
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">Change Type</div>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={facetHref(selectedDomain, 'all')}
                                        className={`text-xs px-2 py-1 rounded ${selectedType === 'all' ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        All
                                    </Link>
                                    {allTypes.map((t) => (
                                        <Link
                                            key={t}
                                            href={facetHref(selectedDomain, t)}
                                            className={`text-xs px-2 py-1 rounded ${selectedType === t ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {t}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hash Anchors */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Hash Anchors (Reproducible)</h2>
                <div className="space-y-3">
                    <div>
                        <span className="text-sm font-medium text-gray-700">From ({report.from.ruleset_version}):</span>
                        <code className="block mt-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                            {report.from.root_hash_sha256}
                        </code>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-700">To ({report.to.ruleset_version}):</span>
                        <code className="block mt-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                            {report.to.root_hash_sha256}
                        </code>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded">
                        <div className="text-2xl font-bold text-red-600">{report.summary.breaking_changes}</div>
                        <div className="text-sm text-gray-600">Breaking</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded">
                        <div className="text-2xl font-bold text-blue-600">{report.summary.non_breaking_changes}</div>
                        <div className="text-sm text-gray-600">Non-Breaking</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded">
                        <div className="text-2xl font-bold text-green-600">{report.summary.added}</div>
                        <div className="text-sm text-gray-600">Added</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded">
                        <div className="text-2xl font-bold text-yellow-600">{report.summary.modified}</div>
                        <div className="text-sm text-gray-600">Modified</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded">
                        <div className="text-2xl font-bold text-gray-600">{report.summary.removed}</div>
                        <div className="text-sm text-gray-600">Removed</div>
                    </div>
                </div>
                {report.summary.note && (
                    <p className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        <strong>Note:</strong> {report.summary.note}
                    </p>
                )}
            </div>

            {/* Clause Delta */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Clause Delta</h2>
                {report.clause_delta.note ? (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{report.clause_delta.note}</p>
                ) : (
                    <div className="space-y-4">
                        {report.clause_delta.added.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-green-700 mb-2">Added</h3>
                                <div className="space-y-2">
                                    {report.clause_delta.added.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-green-50 border-l-4 border-green-400 p-3">
                                            <code className="text-sm font-mono">{item?.clause_id || '(missing clause_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.clause_delta.modified.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-yellow-700 mb-2">Modified</h3>
                                <div className="space-y-2">
                                    {report.clause_delta.modified.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                            <code className="text-sm font-mono">{item?.clause_id || '(missing clause_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.clause_delta.removed.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-red-700 mb-2">Removed</h3>
                                <div className="space-y-2">
                                    {report.clause_delta.removed.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-3">
                                            <code className="text-sm font-mono">{item?.clause_id || '(missing clause_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.clause_delta.added.length === 0 &&
                            report.clause_delta.modified.length === 0 &&
                            report.clause_delta.removed.length === 0 && (
                                <p className="text-sm text-gray-500">No clause changes</p>
                            )}
                    </div>
                )}
            </div>

            {/* Requirement Delta */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Requirement Delta</h2>
                {report.requirement_delta.note ? (
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{report.requirement_delta.note}</p>
                ) : (
                    <div className="space-y-4">
                        {report.requirement_delta.added.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-green-700 mb-2">Added</h3>
                                <div className="space-y-2">
                                    {report.requirement_delta.added.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-green-50 border-l-4 border-green-400 p-3">
                                            <code className="text-sm font-mono">{item?.requirement_id || '(missing requirement_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.requirement_delta.modified.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-yellow-700 mb-2">Modified</h3>
                                <div className="space-y-2">
                                    {report.requirement_delta.modified.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                                            <code className="text-sm font-mono">{item?.requirement_id || '(missing requirement_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.requirement_delta.removed.length > 0 && (
                            <div>
                                <h3 className="text-sm font-medium text-red-700 mb-2">Removed</h3>
                                <div className="space-y-2">
                                    {report.requirement_delta.removed.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-3">
                                            <code className="text-sm font-mono">{item?.requirement_id || '(missing requirement_id)'}</code>
                                            <p className="text-sm text-gray-700 mt-1">{item?.human_explanation || '(no explanation)'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {report.requirement_delta.added.length === 0 &&
                            report.requirement_delta.modified.length === 0 &&
                            report.requirement_delta.removed.length === 0 && (
                                <p className="text-sm text-gray-500">No requirement changes</p>
                            )}
                    </div>
                )}
            </div>

            {/* Reproducibility */}
            {report.reproducibility && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Reproducibility</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-sm font-medium text-gray-700">Generation Command:</span>
                            <code className="block mt-1 bg-white px-3 py-2 rounded text-sm font-mono break-all">
                                {report.reproducibility.command}
                            </code>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-700">Hash Computation:</span>
                            <code className="block mt-1 bg-white px-3 py-2 rounded text-sm font-mono break-all">
                                {report.reproducibility.hash_computation}
                            </code>
                        </div>
                    </div>
                </div>
            )}

            {/* Repro Pack (v0.9.2) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-8" id="reproduction">
                <h2 className="text-xl font-semibold mb-2">Repro Pack</h2>
                <p className="text-xs text-gray-500 mb-4">
                    Commands and hashes are provided for reproducibility only. This is not certification or endorsement.
                </p>

                {!reproPack ? (
                    <p className="text-sm text-gray-500">
                        repro-pack.json not found for this diff_id.
                    </p>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <span className="font-semibold">Profile:</span> {reproPack.repro_pack_version}
                        </div>

                        {reproPack.commands && (
                            <div className="space-y-4">
                                {Object.entries(reproPack.commands).map(([cmdName, cmds]) => (
                                    <div key={cmdName}>
                                        <div className="text-sm font-medium text-gray-700 mb-1">{cmdName}</div>
                                        <pre className="text-xs bg-white rounded border p-3 overflow-x-auto">
                                            {Array.isArray(cmds) ? cmds.join('\n') : String(cmds)}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        {reproPack.artifacts && (
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Artifact Hashes</div>
                                <pre className="text-xs bg-white rounded border p-3 overflow-x-auto">
                                    {JSON.stringify(reproPack.artifacts, null, 2)}
                                </pre>
                            </div>
                        )}

                        {reproPack.boundary?.non_endorsement && (
                            <div className="text-xs text-gray-500 italic border-t pt-3">
                                {reproPack.boundary.non_endorsement}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
