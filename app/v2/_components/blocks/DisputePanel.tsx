
import React from 'react';

interface DisputePanelProps {
    data?: {
        root_cause?: string;
        replay_instructions?: string;
        ptr?: string; // Pointer to failure context if any
    };
    tokens: Record<string, string>;
}

export function DisputePanel({ data, tokens }: DisputePanelProps) {
    const na = tokens['LIT_NOT_APPLICABLE'];

    if (!data || (!data.root_cause && !data.replay_instructions)) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-400 italic">
                {na}
            </div>
        );
    }

    const rootCauseLabel = tokens['LIT_ROOT_CAUSE'];
    const replayLabel = tokens['LIT_REPLAY_INSTRUCTIONS'];
    const title = tokens['LIT_DISPUTE_CLOSURE'];

    return (
        <div className="dispute-panel bg-red-50 border border-red-100 rounded-lg p-4">
            <h3 className="text-red-800 font-bold mb-4 uppercase text-xs tracking-wider">{title}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Root Cause */}
                {data?.root_cause && (
                    <div className="bg-white p-3 rounded shadow-sm">
                        <h4 className="text-xs text-gray-500 font-bold uppercase mb-1">{rootCauseLabel}</h4>
                        <p className="text-sm text-gray-800">{data.root_cause}</p>
                    </div>
                )}

                {/* Replay */}
                {data?.replay_instructions && (
                    <div className="bg-white p-3 rounded shadow-sm">
                        <h4 className="text-xs text-gray-500 font-bold uppercase mb-1">{replayLabel}</h4>
                        <code className="text-xs bg-gray-100 p-1 rounded block overflow-x-auto">
                            {data.replay_instructions}
                        </code>
                        {data.ptr && (
                            <a
                                href={`?ptr=${encodeURIComponent(data.ptr)}`}
                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 block"
                            >
                                Jump to Evidence &rarr;
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
