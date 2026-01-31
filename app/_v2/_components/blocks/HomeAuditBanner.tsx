
import React from 'react';

export function HomeAuditBanner({ tokens }: { tokens: Record<string, string> }) {
    return (
        <div className="container mx-auto px-4 py-6 mb-16">
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-sm font-medium text-gray-400 bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tokens.LIT_AUDIT_BANNER_LINE1}
                </span>
                <span className="hidden md:inline w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {tokens.LIT_AUDIT_BANNER_LINE2}
                </span>
                <span className="hidden md:inline w-1 h-1 bg-gray-600 rounded-full"></span>
                <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    {tokens.LIT_AUDIT_BANNER_LINE3}
                </span>
            </div>
        </div>
    );
}
