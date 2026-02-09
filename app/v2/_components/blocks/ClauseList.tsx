


interface ClauseListProps {
    data?: Array<{
        id: string;
        name: string;
        intent?: string;
        surfaces?: string[];
        precedents?: unknown[];
    }>;
    tokens: Record<string, string>;
}

export function ClauseList({ data, tokens }: ClauseListProps) {
    // 1. Resolve Outbound Boundary from Tripod
    // const outboundDefinition = TRIPOD.outbound?.find(o => o.id === 'clause_definition_link');

    if (!data || data.length === 0) {
        return <div className="p-4 text-gray-400 italic">{tokens['LIT_NO_CLAUSES']}</div>;
    }

    return (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-900/50 text-gray-400">
                    <tr>
                        <th className="p-3 font-medium">{tokens['LIT_CLAUSE_ID']}</th>
                        <th className="p-3 font-medium">{tokens['LIT_CLAUSE_NAME']}</th>
                        <th className="p-3 font-medium">{tokens['LIT_INTENT']}</th>
                        <th className="p-3 font-medium">{tokens['LIT_SURFACES']}</th>
                        <th className="p-3 font-medium">{tokens['LIT_PRECEDENTS']}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {data.map((clause) => (
                        <tr key={clause.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="p-3 font-mono text-cyan-400">{clause.id}</td>
                            <td className="p-3 font-medium text-gray-200">{clause.name}</td>
                            <td className="p-3 text-gray-400 max-w-xs truncate" title={clause.intent}>{clause.intent || '-'}</td>
                            <td className="p-3 text-gray-400">
                                {clause.surfaces?.map(s => (
                                    <span key={s} className="inline-block px-1.5 py-0.5 bg-gray-800 rounded text-xs mr-1 mb-1 border border-gray-700">
                                        {s}
                                    </span>
                                ))}
                            </td>
                            <td className="p-3 text-gray-500">
                                {clause.precedents?.length || 0}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
