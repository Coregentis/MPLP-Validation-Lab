
import React from 'react';

interface RegMappingGridProps {
    data?: Array<{
        article: string;
        requirement: string;
        clause_id: string; // Internal Link
        strength?: string;
    }>;
    tokens: Record<string, string>;
}

import { TRIPOD } from '../../_ssot/ux.generated';

export function RegMappingGrid({ data, tokens }: RegMappingGridProps) {
    // 1. Resolve Outbound Boundary from Tripod
    const outboundDefinition = TRIPOD.outbound?.find(o => o.id === 'clause_definition_link');
    const requiredToken = outboundDefinition?.required_token;
    const discl = requiredToken ? (tokens[requiredToken] || tokens['DISCL_READING_AID_ONLY']) : 'Reading Aid Only';

    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-400 italic">{tokens['LIT_NO_MAPPINGS']}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="bg-blue-900/20 border border-blue-800 p-3 rounded text-sm text-blue-200">
                {discl}
            </div>

            <div className="border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900/50 text-gray-400">
                        <tr>
                            <th className="p-3 font-medium">{tokens['LIT_ARTICLE']}</th>
                            <th className="p-3 font-medium">{tokens['LIT_REQUIREMENT']}</th>
                            <th className="p-3 font-medium">{tokens['LIT_MPLP_CLAUSE']}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((m, i) => (
                            <tr key={i} className="hover:bg-gray-800/30 transition-colors">
                                <td className="p-3 font-mono text-cyan-400 align-top whitespace-nowrap">{m.article}</td>
                                <td className="p-3 text-gray-300 align-top">{m.requirement}</td>
                                <td className="p-3 align-top">
                                    <span className="inline-flex items-center px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs font-mono text-yellow-500">
                                        {m.clause_id}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
