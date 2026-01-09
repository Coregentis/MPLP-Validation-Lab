/**
 * Rulesets Index Page
 * 
 * Lists available rulesets from data/rulesets/
 * Non-normative: only reflects what's in the ruleset files.
 */

import Link from 'next/link';
import { listRulesets } from '@/lib/rulesets/loadRuleset';

export default function RulesetsPage() {
    const rulesets = listRulesets();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Rulesets</h1>
            <p className="text-zinc-400 mb-8">
                Versioned rulesets for evidence-based verdicts. Each ruleset defines requirements for Golden Flows.
            </p>

            {rulesets.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                    <p className="text-zinc-500">No rulesets available.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {rulesets.map((rs) => (
                        <Link
                            key={rs.id}
                            href={`/rulesets/${rs.id}`}
                            className="block bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-lg">{rs.name || rs.id}</h2>
                                    <p className="text-zinc-500 text-sm">Version: {rs.version}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${rs.status === 'active'
                                            ? 'bg-green-900/30 text-green-400'
                                            : 'bg-zinc-700 text-zinc-400'
                                        }`}>
                                        {rs.status}
                                    </span>
                                    <p className="text-zinc-600 text-xs mt-1">
                                        {rs.golden_flows?.length || 0} Golden Flows
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
