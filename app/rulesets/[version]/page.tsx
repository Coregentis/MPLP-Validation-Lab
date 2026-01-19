/**
 * Ruleset Detail Page
 * 
 * Shows ruleset manifest and requirements.
 * Non-normative: only reflects what's in the ruleset files.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadRuleset, rulesetExists } from '@/lib/rulesets/loadRuleset';

/**
 * SSOT: Map internal gf-xx to external LG-xx.
 * Fallback to 'LG-UNKNOWN' ensures no gf-xx leakage for unmapped IDs.
 */
const GF_TO_LG: Record<string, string> = {
    'gf-01': 'LG-01',
    'gf-02': 'LG-02',
    'gf-03': 'LG-03',
    'gf-04': 'LG-04',
    'gf-05': 'LG-05',
};

/**
 * Map CL-Dx-xx clause IDs to Domain labels
 */
const CLAUSE_DOMAIN_LABELS: Record<string, string> = {
    'D1': 'Budget Decision Record',
    'D2': 'Terminal Lifecycle State',
    'D3': 'Authorization Decision',
    'D4': 'Termination & Recovery',
};

function getExternalId(gfId: string): string {
    return GF_TO_LG[gfId.toLowerCase()] ?? 'LG-UNKNOWN';
}

/**
 * Extract domain from CL-Dx-xx clause ID
 */
function getClauseDomain(clauseId: string): string | null {
    const match = clauseId.match(/CL-D(\d)/i);
    return match ? `D${match[1]}` : null;
}

/**
 * Group clauses by domain for v0.4+ rulesets
 */
function groupClausesByDomain(clauses: string[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};
    for (const clause of clauses) {
        const domain = getClauseDomain(clause) || 'OTHER';
        if (!grouped[domain]) grouped[domain] = [];
        grouped[domain].push(clause);
    }
    return grouped;
}

interface Props {
    params: Promise<{ version: string }>;
}

export default async function RulesetDetailPage({ params }: Props) {
    const { version } = await params;

    if (!rulesetExists(version)) {
        notFound();
    }

    const data = loadRuleset(version);
    const manifest = data.manifest;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">{manifest?.name || version}</h1>
                {data.missing.length > 0 && (
                    <p className="text-amber-500 text-sm">
                        Missing: {data.missing.join(', ')}
                    </p>
                )}
            </div>

            {/* Manifest Info */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Manifest</h2>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <dt className="text-zinc-500">ID</dt>
                        <dd className="font-mono">{manifest?.id || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Version</dt>
                        <dd>{manifest?.version || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Status</dt>
                        <dd>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${manifest?.status === 'active'
                                ? 'bg-green-900/30 text-green-400'
                                : 'bg-zinc-700 text-zinc-400'
                                }`}>
                                {manifest?.status || 'N/A'}
                            </span>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Protocol Version</dt>
                        <dd>{manifest?.protocol?.version || 'N/A'}</dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Export Contract</dt>
                        <dd>
                            <Link href="/policies/contract" className="text-mplp-blue-soft hover:text-mplp-blue-light transition-colors">
                                v1.2 →
                            </Link>
                        </dd>
                    </div>
                    <div>
                        <dt className="text-zinc-500">Created</dt>
                        <dd className="text-xs">{manifest?.created_at || 'N/A'}</dd>
                    </div>
                </dl>
            </section>

            {/* Clauses / Lifecycle Guarantees Section */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                {/* v0.4+ Twelve-Clause format (ruleset-1.2) */}
                {manifest?.clauses && manifest.clauses.length > 0 ? (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Semantic Invariant Clauses</h2>
                        <p className="text-zinc-500 text-sm mb-4">
                            This ruleset defines {manifest.clauses.length} clauses across 4 domains (D1-D4).
                            <br />
                            <span className="text-xs text-zinc-600">
                                SSOT: data/rulesets/{version}/manifest.yaml → clauses
                            </span>
                        </p>

                        <div className="space-y-4">
                            {Object.entries(groupClausesByDomain(manifest.clauses)).map(([domain, domainClauses]) => (
                                <div key={domain} className="border border-zinc-700 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">
                                        <span className="text-mplp-blue-soft">{domain}</span>
                                        <span className="text-zinc-500 ml-2 text-sm font-normal">
                                            {CLAUSE_DOMAIN_LABELS[domain] || 'Unknown Domain'}
                                        </span>
                                    </h3>
                                    <ul className="space-y-2 text-sm">
                                        {domainClauses.map((clauseId) => (
                                            <li key={clauseId} className="flex items-center gap-2">
                                                <span className="inline-block px-1.5 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400">
                                                    invariant
                                                </span>
                                                <span className="font-mono text-zinc-300">{clauseId}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </>
                ) : manifest?.golden_flows && manifest.golden_flows.length > 0 ? (
                    /* v0.2/v0.3 Golden Flows format (ruleset-1.0, 1.1) */
                    <>
                        <h2 className="text-xl font-semibold mb-4">Lifecycle Guarantees</h2>
                        <p className="text-zinc-500 text-sm mb-4">
                            Requirements for each Lifecycle Guarantee (LG-01 ~ LG-05) defined in this ruleset.
                        </p>

                        <div className="space-y-4">
                            {manifest.golden_flows.map((gfId) => {
                                const reqs = data.requirements[gfId] || [];
                                return (
                                    <div key={gfId} className="border border-zinc-700 rounded-lg p-4">
                                        <h3 className="font-semibold mb-2">
                                            <span className="text-mplp-blue-soft">{getExternalId(gfId)}</span>
                                        </h3>

                                        {reqs.length > 0 ? (
                                            <ul className="space-y-2 text-sm">
                                                {reqs.map((req) => (
                                                    <li key={req.id} className="flex items-start gap-2">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium mt-0.5 ${req.severity === 'required' ? 'bg-red-900/30 text-red-400' :
                                                            req.severity === 'recommended' ? 'bg-amber-900/30 text-amber-400' :
                                                                'bg-zinc-700 text-zinc-400'
                                                            }`}>
                                                            {req.severity || 'optional'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <span className="font-mono text-zinc-300">{req.id}</span>
                                                            {req.name && (
                                                                <span className="text-zinc-400 ml-2">{req.name}</span>
                                                            )}
                                                            {req.description && (
                                                                <p className="text-zinc-500 text-xs mt-1">{req.description}</p>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-zinc-500 text-sm">No requirements found.</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Clauses / Lifecycle Guarantees</h2>
                        <p className="text-zinc-500">No clauses or lifecycle guarantees defined in this ruleset manifest.</p>
                    </div>
                )}
            </section>
        </div>
    );
}
