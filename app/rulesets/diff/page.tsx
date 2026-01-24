import { Metadata } from 'next';
import Link from 'next/link';
import * as fs from 'fs';
import * as path from 'path';

export const metadata: Metadata = {
    title: 'Ruleset Diff Reports | Validation Lab',
    description: 'MUST-3 Ruleset version evolution diff reports',
};

interface DiffIndexEntry {
    diff_id: string;
    from: string;
    to: string;
    from_hash: string;
    to_hash: string;
    path: string;
    generated_at: string;
}

interface DiffIndex {
    index_version: string;
    generated_at: string;
    diffs: DiffIndexEntry[];
}

interface ReproIndexEntry {
    diff_id: string;
    repro_pack_sha256: string;
    path: string;
}

interface ReproIndex {
    index_repro_version: string;
    diffs: ReproIndexEntry[];
}

function loadDiffIndex(): { data: DiffIndex; mode: 'enhanced' | 'v0.8' } | null {
    try {
        const exportRoot = path.join(process.cwd(), 'export/ruleset-diff');

        // Try enhanced first (v0.9+)
        const enhancedPath = path.join(exportRoot, 'index.enhanced.json');
        if (fs.existsSync(enhancedPath)) {
            const raw = fs.readFileSync(enhancedPath, 'utf-8');
            return { data: JSON.parse(raw), mode: 'enhanced' };
        }

        // Fallback to v0.8
        const v08Path = path.join(exportRoot, 'index.json');
        if (fs.existsSync(v08Path)) {
            const raw = fs.readFileSync(v08Path, 'utf-8');
            return { data: JSON.parse(raw), mode: 'v0.8' };
        }

        return null;
    } catch (error) {
        console.error('Failed to load diff index:', error);
        return null;
    }
}

export default function RulesetDiffPage() {
    const loaded = loadDiffIndex();

    // Load repro index for indicators
    let reproSet: Set<string> = new Set();
    try {
        const reproPath = path.join(process.cwd(), 'export/ruleset-diff/index.repro.json');
        if (fs.existsSync(reproPath)) {
            const reproIndex: ReproIndex = JSON.parse(fs.readFileSync(reproPath, 'utf-8'));
            reproSet = new Set(reproIndex.diffs.map(d => d.diff_id));
        }
    } catch { /* ignore */ }

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
                        <p className="text-sm text-yellow-700">
                            <strong>Non-Endorsement Boundary:</strong> These diff reports explain ruleset evolution only.
                            They MUST NOT be interpreted as certification, endorsement, or ranking of any framework or vendor.
                            Changes reflect governance decisions about evidence requirements, not substrate quality.
                        </p>
                    </div>
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Ruleset Diff Reports</h1>
            <p className="text-gray-600 mb-2">
                MUST-3: Ruleset version evolution tracking with reproducible hash anchors
            </p>
            {loaded && (
                <p className="text-xs text-gray-500 mb-6">
                    Data source: {loaded.mode === 'enhanced' ? 'index.enhanced.json (v0.9+)' : 'index.json (v0.8)'}
                </p>
            )}

            {!loaded ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Index Not Available</h2>
                    <p className="text-red-700">
                        Unable to load diff index. Ensure export/ruleset-diff/index.json exists.
                    </p>
                </div>
            ) : loaded.data.diffs.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <p className="text-gray-600">No diff reports available.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Evolution
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        From Hash
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        To Hash
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Generated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loaded.data.diffs.map((diff: DiffIndexEntry) => (
                                    <tr key={diff.diff_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {diff.from} → {diff.to}
                                            </div>
                                            <div className="text-xs text-gray-500">{diff.diff_id}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {diff.from_hash.substring(0, 12)}...
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {diff.to_hash.substring(0, 12)}...
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(diff.generated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/rulesets/diff/${diff.diff_id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    View Details →
                                                </Link>
                                                {reproSet.has(diff.diff_id) && (
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                        Repro
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                        <p className="font-medium mb-2">Reproducibility</p>
                        <p>All diff reports are generated with reproducible hash computation:</p>
                        <code className="block mt-2 bg-white px-3 py-2 rounded border text-xs">
                            find data/rulesets/&lt;version&gt; -type f \( -name &quot;*.yaml&quot; -o -name &quot;*.json&quot; \) | sort | shasum -a 256
                        </code>
                    </div>
                </div>
            )}
        </div>
    );
}
