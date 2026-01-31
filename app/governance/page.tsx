import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { Nav } from '@/components/Nav';

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

import { VersionStrip } from '@/components/VersionStrip';
import { getVersionStripModel } from '@/lib/unified/version-strip-model';

export default async function GovernancePage() {
    const data = await getGovernanceData();
    const versionModel = await getVersionStripModel();

    // Augment entries with dynamic counts data
    const entriesWithCounts = data.entries.map(entry => {
        const meta = '';
        if (entry.id === 'gov-policies') {
            // Runsets count (via version model)
            // Wait, Policies is policies. We need Runsets entry. A1 Inventory said Runsets/Rulesets missing from index.json.
            // We should inject them here if index.json is static and hard to change globally.
        }
        return { ...entry, meta };
    });

    // Hardcode specific sections if missing in JSON (User asked to add Runsets/Rulesets section)
    const dynamicSections = [
        {
            id: 'gov-runsets',
            title: `Runsets (${versionModel.run_inventory.total})`,
            description: `Curated Indexes and Unified Run Inventories (V1: ${versionModel.run_inventory.v1_count} / V2: ${versionModel.run_inventory.v2_count})`,
            href: '/runs',
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
        },
        // We replace existing Releases entry to update count? Or just append?
        // Let's filter out existing if we replace them.
    ];

    // Combine static + dynamic
    const displayEntries = [
        ...dynamicSections,
        ...data.entries.filter(e => !['gov-runsets', 'gov-rulesets'].includes(e.id))
    ];

    return (
        <main className="min-h-screen bg-mplp-dark-bg text-mplp-text-primary">
            <Nav />
            <VersionStrip {...versionModel} />
            <div className="px-4 py-8 max-w-7xl mx-auto mt-4">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-4 font-mono text-mplp-blue-light">
                        Unified Governance
                    </h1>
                    <p className="text-xl text-mplp-text-muted max-w-2xl">
                        Single point of truth for operational policies, verification gates, release seals, and audit reports.
                    </p>
                    <div className="mt-4 flex gap-4 text-xs font-mono text-mplp-text-muted opacity-60">
                        <span>VER: {data.version}</span>
                        <span>GEN: {data.generated_at}</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {displayEntries.map((entry) => (
                        <Link
                            key={entry.id}
                            href={entry.href}
                            className="block group"
                        >
                            <div className="h-full border border-mplp-border bg-mplp-bg-card p-6 rounded-lg hover:border-mplp-blue hover:translate-y-[-2px] transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold font-mono group-hover:text-mplp-blue transition-colors">
                                        {entry.title}
                                    </h2>
                                    <span className="text-xs px-2 py-1 rounded bg-mplp-bg-subtle text-mplp-text-muted font-mono uppercase">
                                        {entry.scope}
                                    </span>
                                </div>
                                <p className="text-mplp-text-muted mb-4">
                                    {entry.description}
                                </p>
                                <div className="flex items-center text-sm font-mono text-mplp-blue opacity-0 group-hover:opacity-100 transition-opacity">
                                    ACCESS_RESOURCE &rarr;
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 border-t border-mplp-border pt-8">
                    <h3 className="text-lg font-bold mb-4 font-mono text-mplp-text-muted">
                        Conformance Status
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="bg-mplp-bg-subtle p-4 rounded border border-mplp-border">
                            <strong className="block mb-1 text-mplp-text-primary">Deterministic</strong>
                            <p className="text-mplp-text-muted">All gates and seals are cryptographically verifiable and deterministic.</p>
                        </div>
                        <div className="bg-mplp-bg-subtle p-4 rounded border border-mplp-border">
                            <strong className="block mb-1 text-mplp-text-primary">Unified</strong>
                            <p className="text-mplp-text-muted">Covers both V1 (Simulated) and V2 (Reproduced) substrates.</p>
                        </div>
                        <div className="bg-mplp-bg-subtle p-4 rounded border border-mplp-border">
                            <strong className="block mb-1 text-mplp-text-primary">Source of Truth</strong>
                            <p className="text-mplp-text-muted">Governance index is the root of trust for all policy assets.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
