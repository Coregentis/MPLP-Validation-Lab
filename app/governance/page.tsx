import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { VersionStrip } from '@/components/VersionStrip';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';

interface GovernanceEntry {
    id: string;
    title: string;
    description: string;
    href: string;
    scope: string;
    tier: string;
}

interface GovernanceData {
    version: string;
    generated_at: string;
    entries: GovernanceEntry[];
}

async function getGovernanceData(): Promise<GovernanceData> {
    const filePath = path.join(process.cwd(), 'public/_data/governance/index.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

export const metadata = {
    title: 'Governance | MPLP Validation Lab',
    description: 'Unified governance entry point for policies, gates, releases, and audits.',
};

export default async function GovernancePage() {
    const data = await getGovernanceData();
    const versionModel = await getVersionStripModel();

    // Hardcode specific sections
    const dynamicSections = [
        {
            id: 'gov-runsets',
            title: `Runsets (${versionModel.run_inventory.total})`,
            description: `Curated Indexes and Unified Run Inventories (V1: ${versionModel.run_inventory.v1_count} / V2: ${versionModel.run_inventory.v2_count})`,
            href: '/runsets',
            scope: 'unified',
            tier: 'primary'
        },
        {
            id: 'gov-rulesets',
            title: `Rulesets (${versionModel.ruleset_inventory.total})`,
            description: 'Versioned logic for adjudication and seal verification.',
            href: '/rulesets',
            scope: 'unified',
            tier: 'primary'
        }
    ];

    const displayEntries = [
        ...dynamicSections,
        ...data.entries.filter(e => !['gov-runsets', 'gov-rulesets'].includes(e.id))
    ];

    return (
        <div className="pt-8">
            <VersionStrip {...versionModel} />

            {/* Header */}
            <div className="mb-12 mt-4">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Protocol Standards</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text">Unified Governance</h1>
                    <div className="flex items-center gap-3 text-xs text-mplp-text-muted bg-mplp-dark-soft px-3 py-1.5 rounded border border-mplp-border/30 font-mono">
                        <span>GOV-INDEX-V{data.version}</span>
                        <span className="w-px h-3 bg-mplp-border/50" />
                        <span>GEN: {data.generated_at}</span>
                    </div>
                </div>
                <div className="mt-6 max-w-3xl">
                    <p className="text-mplp-text-muted text-lg leading-relaxed">
                        Single point of truth for operational policies, verification gates, release seals, and audit reports.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayEntries.map((entry) => (
                    <Link
                        key={entry.id}
                        href={entry.href}
                        className="group block h-full"
                    >
                        <div className="h-full bg-glass border border-mplp-border/30 rounded-xl p-6 hover:border-mplp-blue-soft/50 hover:bg-mplp-dark-soft/40 transition-all duration-200">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-lg font-bold font-mono text-mplp-text group-hover:text-mplp-blue-soft transition-colors">
                                    {entry.title}
                                </h2>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-mplp-dark-soft text-mplp-text-muted font-mono uppercase tracking-wider">
                                    {entry.scope}
                                </span>
                            </div>
                            <p className="text-sm text-mplp-text-muted leading-relaxed mb-6">
                                {entry.description}
                            </p>
                            <div className="flex items-center text-xs font-bold uppercase tracking-widest text-mplp-blue-soft/80 group-hover:text-mplp-blue-soft transition-colors">
                                Access Resource <span className="ml-2">→</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-16 border-t border-mplp-border/30 pt-10">
                <div className="alert-box mb-8 p-4 bg-mplp-dark-soft/40 border border-mplp-border/40 rounded-lg">
                    <h3 className="text-sm font-bold font-mono text-mplp-text uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        Audit Utilities
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs font-mono">
                        <a href="/sitemap.xml" target="_blank" className="text-mplp-blue-soft hover:underline">sitemap.xml ↗</a>
                        <span className="text-mplp-border/50">|</span>
                        <a href="/robots.txt" target="_blank" className="text-mplp-blue-soft hover:underline">robots.txt ↗</a>
                        <span className="text-mplp-border/50">|</span>
                        <a href="/manifest.json" target="_blank" className="text-mplp-blue-soft hover:underline">manifest.json ↗</a>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <h3 className="text-sm font-bold font-mono text-mplp-text-muted uppercase tracking-widest">
                        Conformance Status
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div className="bg-mplp-dark-soft/20 p-5 rounded-lg border border-mplp-border/20">
                        <strong className="block mb-2 text-mplp-text">Deterministic</strong>
                        <p className="text-mplp-text-muted leading-relaxed text-xs">All gates and seals are cryptographically verifiable and deterministic.</p>
                    </div>
                    <div className="bg-mplp-dark-soft/20 p-5 rounded-lg border border-mplp-border/20">
                        <strong className="block mb-2 text-mplp-text">Unified</strong>
                        <p className="text-mplp-text-muted leading-relaxed text-xs">Covers both V1 (Simulated) and V2 (Reproduced) substrates.</p>
                    </div>
                    <div className="bg-mplp-dark-soft/20 p-5 rounded-lg border border-mplp-border/20">
                        <strong className="block mb-2 text-mplp-text">Source of Truth</strong>
                        <p className="text-mplp-text-muted leading-relaxed text-xs">Governance index is the root of trust for all policy assets.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
