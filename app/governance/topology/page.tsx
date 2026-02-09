import type { Metadata } from 'next';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { loadAllRuns } from '@/lib/unified/load-all-runs';
import { loadAllRunsets } from '@/lib/unified/load-all-runsets';
import { listRegisteredRulesets } from '@/lib/rulesets/registry';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';

// 1. Robot Configuration: NOINDEX (Human Only)
export const metadata: Metadata = {
    title: "Site Topology | MPLP Validation Lab",
    description: "Complete index of all accessible pages in the Validation Lab. Human-readable sitemap for discovery.",
    robots: {
        index: false,
        follow: true,
    },
};

// Data Loaders
async function getReleases() {
    try {
        const releaseIndexPath = path.join(process.cwd(), 'governance/releases/release-index.yaml');
        if (fs.existsSync(releaseIndexPath)) {
            const fileContents = fs.readFileSync(releaseIndexPath, 'utf8');
            const data = yaml.parse(fileContents);
            return {
                active: data.active || [],
                archived: data.archived || []
            };
        }
    } catch (e) {
        console.error("Failed to load releases:", e);
    }
    return { active: [], archived: [] };
}

export default async function SiteTopologyPage() {
    // Load all dynamic entities
    const allRuns = loadAllRuns();
    const runsets = loadAllRunsets();
    const rulesets = await listRegisteredRulesets();
    const releases = await getReleases();

    // Group Runs by Source/Tier
    const v2Runs = allRuns.runs.filter(r => r.source === 'v2');
    const v1Runs = allRuns.runs.filter(r => r.source === 'v1');

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Site Topology</h1>
                    <p className="text-lg text-slate-600 max-w-3xl">
                        This is the <strong>Human Site Map</strong> for the Validation Lab. It lists all ~115+ accessible routes, including those excluded from the public SEO sitemap (e.g., simulated runs, historic archives).
                    </p>
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                        <strong>Note:</strong> This page is <code>noindex</code>. It serves as a comprehensive inventory for auditors and users to discover content that is valid but not prioritized for search engines.
                    </div>
                </div>

                <div className="grid gap-12 lg:grid-cols-2">
                    {/* Left Column: Structure & Hubs */}
                    <div className="space-y-12">
                        {/* 1. Static Hubs */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-sm">01</span>
                                Static Hubs & Tools
                            </h2>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {[
                                        { label: "Home", href: "/" },
                                        { label: "Governance Hub", href: "/governance" },
                                        { label: "About", href: "/about" },
                                        { label: "Methodology", href: "/methodology" },
                                        { label: "Lifecycle Guarantees", href: "/guarantees" },
                                        { label: "Policies Index", href: "/policies" },
                                        { label: "Runs Index", href: "/runs" },
                                        { label: "Rulesets Index", href: "/rulesets" },
                                        { label: "Coverage Index", href: "/coverage" },
                                        { label: "Audit Tools", href: "/audit" },
                                    ].map(link => (
                                        <li key={link.href}>
                                            <Link href={link.href} className="block px-6 py-3 hover:bg-slate-50 transition-colors text-sm text-slate-700 font-medium">
                                                {link.label} <span className="text-slate-400 font-normal ml-2">({link.href})</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* 2. Rulesets */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-sm">02</span>
                                Rulesets ({rulesets.length})
                            </h2>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {rulesets.map(r => (
                                        <li key={r.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <Link href={`/rulesets/${r.id}`} className="flex items-center justify-between group">
                                                <div>
                                                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{r.manifest.name}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{r.id}</div>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600">{r.manifest.version}</div>
                                            </Link>
                                            {/* Evolution Link */}
                                            <div className="mt-2 text-xs">
                                                <Link href={`/rulesets/evolution/diff/${r.id}`} className="text-blue-500 hover:underline">
                                                    View Evolution Diff →
                                                </Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>

                        {/* 3. Releases */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-sm">03</span>
                                Releases ({releases.active.length + releases.archived.length})
                            </h2>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <div className="px-6 py-2 bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">Active Headers</div>
                                <ul className="divide-y divide-slate-100">
                                    {releases.active.map((r: any) => (
                                        <li key={r.id}>
                                            <Link href={`/releases/${r.id}`} className="block px-6 py-3 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-900">{r.id}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">FROZEN</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="px-6 py-2 bg-slate-50 border-y border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 mt-2">Archived</div>
                                <ul className="divide-y divide-slate-100">
                                    {releases.archived.map((r: any) => (
                                        <li key={r.id}>
                                            <Link href={`/releases/${r.id}`} className="block px-6 py-3 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-slate-600">{r.id}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">ARCHIVED</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Dynamic Runs Inventory */}
                    <div className="space-y-12">
                        {/* 4. Runs Inventory */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-sm">04</span>
                                    Run Inventory ({allRuns.runs.length})
                                </h2>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">x3 views each</span>
                            </div>

                            {/* V2 Real Runs */}
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">V2: Real Substrates ({v2Runs.length})</h3>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2">ID</th>
                                                <th className="px-4 py-2">Tier</th>
                                                <th className="px-4 py-2 text-right">Views</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {v2Runs.map(run => (
                                                <tr key={run.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2 font-mono text-xs text-slate-700 truncate max-w-[200px]" title={run.id}>{run.id}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${run.tier === 'DISPUTE_READY' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            run.tier === 'REPRODUCED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                'bg-slate-100 text-slate-600 border-slate-200'
                                                            }`}>{run.tier}</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-right space-x-2">
                                                        <Link href={`/runs/${run.id}`} className="text-xs text-blue-600 hover:underline">Detail</Link>
                                                        <Link href={`/runs/${run.id}/evidence`} className="text-xs text-slate-500 hover:text-blue-600">Ev</Link>
                                                        <Link href={`/runs/${run.id}/replay`} className="text-xs text-slate-500 hover:text-blue-600">Rep</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* V1 Simulated Runs */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">V1: Simulated Baseline ({v1Runs.length})</h3>
                                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                            <tr>
                                                <th className="px-4 py-2">ID</th>
                                                <th className="px-4 py-2">Source</th>
                                                <th className="px-4 py-2 text-right">Views</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {v1Runs.map(run => (
                                                <tr key={run.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-2 font-mono text-xs text-slate-700 truncate max-w-[200px]" title={run.id}>{run.id}</td>
                                                    <td className="px-4 py-2 text-xs text-slate-500">v1-curated</td>
                                                    <td className="px-4 py-2 text-right space-x-2">
                                                        <Link href={`/runs/${run.id}`} className="text-xs text-blue-600 hover:underline">Detail</Link>
                                                        <Link href={`/runs/${run.id}/evidence`} className="text-xs text-slate-500 hover:text-blue-600">Ev</Link>
                                                        <Link href={`/runs/${run.id}/replay`} className="text-xs text-slate-500 hover:text-blue-600">Rep</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 5. Runsets */}
                        <section className="mt-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-sm">05</span>
                                Runsets ({runsets.length})
                            </h2>
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                <ul className="divide-y divide-slate-100">
                                    {runsets.map(rs => (
                                        <li key={rs.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                            <Link href={rs.href} className="flex items-center justify-between group">
                                                <div>
                                                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{rs.title}</div>
                                                    <div className="text-xs text-slate-500 mt-0.5">{rs.description}</div>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-slate-100 text-xs font-medium text-slate-600">{rs.run_count} runs</div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
