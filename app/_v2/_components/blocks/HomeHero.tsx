
import React from 'react';

export function HomeHero({ tokens }: { tokens: Record<string, string> }) {
    return (
        <div className="py-20 text-center">
            <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                {tokens.LIT_HOME_TITLE}
            </h1>
            <p className="text-2xl text-gray-300 mb-8 font-light">
                {tokens.LIT_HOME_SUBTITLE}
            </p>
            <div className="inline-block px-6 py-2 border border-yellow-500/30 bg-yellow-500/10 rounded-full">
                <p className="text-yellow-400 text-sm font-medium">
                    {tokens.LIT_HOME_TAGLINE_NONCERT}
                </p>
            </div>

            <div className="mt-10 flex justify-center gap-4">
                <a href="/start" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg shadow-blue-900/20">
                    {tokens.LIT_NAV_START}
                </a>
                <a href="/cases" className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg transition border border-gray-700">
                    {tokens.LIT_NAV_CASES}
                </a>
            </div>
        </div>
    );
}
