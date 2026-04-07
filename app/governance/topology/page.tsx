import type { Metadata } from 'next';
import Link from 'next/link';
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

    const sectionNumberClass = 'flex h-8 w-8 items-center justify-center rounded-lg bg-mplp-dark-soft border border-mplp-border/30 text-mplp-text-muted text-sm';
    const sectionTitleClass = 'text-xl font-bold text-mplp-text mb-6 flex items-center gap-3';
    const panelClass = 'bg-glass border border-mplp-border/30 rounded-xl overflow-hidden';
    const panelHeaderClass = 'px-6 py-2 bg-mplp-dark-soft/50 border-b border-mplp-border/30 text-xs font-bold uppercase tracking-wider text-mplp-text-muted';
    const listDividerClass = 'divide-y divide-mplp-border/20';
    const listLinkClass = 'block px-6 py-3 hover:bg-mplp-dark-soft/40 transition-colors text-sm text-mplp-text font-medium';
    const tableHeadClass = 'bg-mplp-dark-soft/50 text-mplp-text-muted font-medium border-b border-mplp-border/30';
    const tableRowClass = 'hover:bg-mplp-dark-soft/30 transition-colors';
    const subtlePillClass = 'px-2 py-1 rounded bg-mplp-dark-soft border border-mplp-border/30 text-xs font-medium text-mplp-text-muted';

    return (
        <div className="pt-8 pb-12">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">
                    Audit Utility
                </p>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="max-w-3xl">
                        <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-4">Site Topology</h1>
                        <p className="text-lg text-mplp-text-muted leading-relaxed">
                            Human-readable route inventory for the Validation Lab. This page lists accessible public routes, including valid routes not prioritized for search indexing.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-mplp-text-muted bg-mplp-dark-soft px-3 py-1.5 rounded border border-mplp-border/30 font-mono">
                        <span>NOINDEX</span>
                        <span className="w-px h-3 bg-mplp-border/50" />
                        <span>TOPOLOGY MAP</span>
                    </div>
                </div>
                <div className="mt-6 p-4 bg-amber-900/10 border border-amber-500/20 rounded-lg text-sm text-amber-100/80 max-w-4xl">
                    <strong className="text-amber-400">Boundary:</strong> This route is an audit-oriented discovery map for public Lab surfaces. It does not define protocol truth and is intentionally excluded from search indexing.
                </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
                {/* Left Column: Structure & Hubs */}
                <div className="space-y-12">
                    {/* 1. Static Hubs */}
                    <section>
                        <h2 className={sectionTitleClass}>
                            <span className={sectionNumberClass}>01</span>
                            Static Hubs & Tools
                        </h2>
                        <div className={panelClass}>
                            <ul className={listDividerClass}>
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
                                        <Link href={link.href} className={listLinkClass}>
                                            {link.label} <span className="text-mplp-text-muted/60 font-normal ml-2">({link.href})</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* 2. Rulesets */}
                    <section>
                        <h2 className={sectionTitleClass}>
                            <span className={sectionNumberClass}>02</span>
                            Rulesets ({rulesets.length})
                        </h2>
                        <div className={panelClass}>
                            <ul className={listDividerClass}>
                                {rulesets.map(r => (
                                    <li key={r.id} className="px-6 py-4 hover:bg-mplp-dark-soft/40 transition-colors">
                                        <Link href={`/rulesets/${r.id}`} className="flex items-center justify-between group">
                                            <div>
                                                <div className="font-semibold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">{r.manifest.name}</div>
                                                <div className="text-xs text-mplp-text-muted mt-0.5 font-mono">{r.id}</div>
                                            </div>
                                            <div className={subtlePillClass}>{r.manifest.version}</div>
                                        </Link>
                                        <div className="mt-2 text-xs">
                                            <Link href={`/rulesets/evolution/diff/${r.id}`} className="text-mplp-blue-soft hover:underline">
                                                View Evolution Diff →
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* 3. Release Records */}
                    <section>
                        <h2 className={sectionTitleClass}>
                            <span className={sectionNumberClass}>03</span>
                            Release Records ({releases.active.length + releases.archived.length})
                        </h2>
                        <div className={panelClass}>
                            <div className={panelHeaderClass}>Active Records</div>
                            <ul className={listDividerClass}>
                                {releases.active.map((r: any) => (
                                    <li key={r.id}>
                                        <Link href={`/releases/${r.id}`} className={listLinkClass}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-mplp-text">{r.id}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">SEALED</span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className={`${panelHeaderClass} mt-2 border-t`}>Archived</div>
                            <ul className={listDividerClass}>
                                {releases.archived.map((r: any) => (
                                    <li key={r.id}>
                                        <Link href={`/releases/${r.id}`} className={listLinkClass}>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-mplp-text-muted">{r.id}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-mplp-dark-soft border border-mplp-border/30 text-mplp-text-muted">ARCHIVED</span>
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
                            <h2 className={sectionTitleClass}>
                                <span className={sectionNumberClass}>04</span>
                                Run Inventory ({allRuns.runs.length})
                            </h2>
                            <span className={subtlePillClass}>x3 views each</span>
                        </div>

                        {/* V2 Real Runs */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-mplp-text-muted uppercase tracking-wider mb-3">V2: Real Substrates ({v2Runs.length})</h3>
                            <div className={`${panelClass} max-h-[400px] overflow-y-auto`}>
                                <table className="w-full text-sm text-left">
                                    <thead className={tableHeadClass}>
                                        <tr>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Tier</th>
                                            <th className="px-4 py-2 text-right">Views</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-mplp-border/20">
                                        {v2Runs.map(run => (
                                            <tr key={run.id} className={tableRowClass}>
                                                <td className="px-4 py-2 font-mono text-xs text-mplp-text truncate max-w-[200px]" title={run.id}>{run.id}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${run.tier === 'DISPUTE_READY'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        : run.tier === 'REPRODUCED'
                                                            ? 'bg-mplp-blue/10 text-mplp-blue-soft border-mplp-blue/20'
                                                            : 'bg-mplp-dark-soft text-mplp-text-muted border-mplp-border/30'
                                                        }`}>{run.tier}</span>
                                                </td>
                                                <td className="px-4 py-2 text-right space-x-2">
                                                    <Link href={`/runs/${run.id}`} className="text-xs text-mplp-blue-soft hover:underline">Detail</Link>
                                                    <Link href={`/runs/${run.id}/evidence`} className="text-xs text-mplp-text-muted hover:text-mplp-blue-soft">Ev</Link>
                                                    <Link href={`/runs/${run.id}/replay`} className="text-xs text-mplp-text-muted hover:text-mplp-blue-soft">Rep</Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* V1 Simulated Runs */}
                        <div>
                            <h3 className="text-sm font-bold text-mplp-text-muted uppercase tracking-wider mb-3">V1: Simulated Baseline ({v1Runs.length})</h3>
                            <div className={`${panelClass} max-h-[400px] overflow-y-auto`}>
                                <table className="w-full text-sm text-left">
                                    <thead className={tableHeadClass}>
                                        <tr>
                                            <th className="px-4 py-2">ID</th>
                                            <th className="px-4 py-2">Source</th>
                                            <th className="px-4 py-2 text-right">Views</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-mplp-border/20">
                                        {v1Runs.map(run => (
                                            <tr key={run.id} className={tableRowClass}>
                                                <td className="px-4 py-2 font-mono text-xs text-mplp-text truncate max-w-[200px]" title={run.id}>{run.id}</td>
                                                <td className="px-4 py-2 text-xs text-mplp-text-muted">v1-curated</td>
                                                <td className="px-4 py-2 text-right space-x-2">
                                                    <Link href={`/runs/${run.id}`} className="text-xs text-mplp-blue-soft hover:underline">Detail</Link>
                                                    <Link href={`/runs/${run.id}/evidence`} className="text-xs text-mplp-text-muted hover:text-mplp-blue-soft">Ev</Link>
                                                    <Link href={`/runs/${run.id}/replay`} className="text-xs text-mplp-text-muted hover:text-mplp-blue-soft">Rep</Link>
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
                        <h2 className={sectionTitleClass}>
                            <span className={sectionNumberClass}>05</span>
                            Runsets ({runsets.length})
                        </h2>
                        <div className={panelClass}>
                            <ul className={listDividerClass}>
                                {runsets.map(rs => (
                                    <li key={rs.id} className="px-6 py-4 hover:bg-mplp-dark-soft/40 transition-colors">
                                        <Link href={rs.href} className="flex items-center justify-between group">
                                            <div>
                                                <div className="font-semibold text-mplp-text group-hover:text-mplp-blue-soft transition-colors">{rs.title}</div>
                                                <div className="text-xs text-mplp-text-muted mt-0.5">{rs.description}</div>
                                            </div>
                                            <div className={subtlePillClass}>{rs.run_count} runs</div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
