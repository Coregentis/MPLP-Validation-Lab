
import React from 'react';

export function StartHero({ tokens }: { tokens: Record<string, string> }) {
    return (
        <div className="py-12 text-center container mx-auto px-4 border-b border-gray-800 mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                {tokens.LIT_START_JOURNEY}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                {tokens.LIT_CTA_START_BY_ROLE_DESC}
            </p>
        </div>
    );
}
