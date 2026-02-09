
import React from 'react';

interface EvidenceListProps {
    data?: Array<{
        label?: string;
        ptr?: string;
        // Other fields like mime_type, content_digest might exist but UI minimal for now
    }>;
    tokens: Record<string, string>;
    context?: {
        ptr?: string;
        [key: string]: unknown;
    };
}

export function EvidenceList({ data, tokens, context }: EvidenceListProps) {
    const title = tokens['LIT_EVIDENCE_DOCKET']; // No fallback, relying on SSOT
    const activePtr = context?.ptr;

    if (!data || data.length === 0) {
        return (
            <div className="evidence-list border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50 p-6 text-center">
                <div className="text-gray-400 font-medium mb-1">
                    {tokens['LIT_NOT_AVAILABLE']}
                </div>
                <div className="text-xs text-gray-500 mb-4">
                    {tokens['LIT_REASON_EVIDENCE_MISSING']}
                </div>
                <div className="inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">
                    {tokens['LIT_ACTION_HOW_TO_REPRO']}
                </div>
            </div>
        );
    }

    return (
        <div className="evidence-list border border-gray-200 rounded-lg overflow-hidden bg-white">
            <h3 className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-bold text-xs uppercase tracking-wider text-gray-600">
                {title}
            </h3>
            <ul className="divide-y divide-gray-100">
                {data.map((slice, idx) => {
                    const isActive = activePtr && slice.ptr === activePtr;
                    // Canonical pointer usage
                    const ptr = slice.ptr || `#slice-${idx}`;

                    return (
                        <li key={idx} className={`group ${isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                            <a
                                href={`?ptr=${encodeURIComponent(ptr)}`}
                                className="block px-4 py-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-medium ${isActive ? 'text-indigo-700' : 'text-gray-700'}`}>
                                        {slice.label || `Slice ${idx + 1}`}
                                    </span>
                                    {isActive && (
                                        <span className="flex-shrink-0 ml-2">
                                            <span className="sr-only">Active</span>
                                            <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                        </span>
                                    )}
                                </div>
                                <code className="text-xs text-gray-400 font-mono mt-1 block truncate">
                                    {ptr}
                                </code>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
