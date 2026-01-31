
import React from 'react';

interface InteropGraphProps {
    data?: string[]; // Assumption: Stack of protocols e.g. ["User Agent", "LangChain", "Model"]
    tokens: Record<string, string>;
    policy?: {
        requiredTokens: string[];
    };
}

export function InteropGraph({ data, tokens }: InteropGraphProps) {
    const hasData = Array.isArray(data) && data.length > 0;

    // SSOT Tokens
    const title = tokens['LIT_STACK_FLOW'] || 'Stack Flow'; // Fallback only for dev safety
    const na = tokens['LIT_NOT_APPLICABLE'];

    if (!hasData) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-400 italic">
                {na}
            </div>
        );
    }

    return (
        <div className="interop-graph border border-gray-200 rounded p-4">
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                {title}
            </h3>

            <div className="flex flex-col space-y-2">
                {data!.map((layer, idx) => (
                    <div key={idx} className="flex items-center justify-center">
                        <div className="w-full max-w-xs bg-white shadow-sm border border-gray-300 rounded px-4 py-2 text-center font-mono text-sm">
                            {layer}
                        </div>
                        {idx < data!.length - 1 && (
                            <div className="mx-auto h-4 w-px bg-gray-300 my-1"></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
