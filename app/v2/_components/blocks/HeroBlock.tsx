
import React from 'react';

interface HeroBlockProps {
    data?: unknown;
    tokens: Record<string, string>;
    context?: {
        ruleset?: { version?: string };
    };
}

export function HeroBlock({ tokens, context }: HeroBlockProps) {
    const title = tokens['LIT_LAWS_TITLE'];
    const desc = tokens['LIT_LAWS_DESC'];
    const versionLabel = tokens['LIT_RULESET_VERSION_LABEL'];
    const version = context?.ruleset?.version;

    return (
        <div className="hero-block mb-8 p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg border border-gray-700">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {title}
                    </h1>
                    {desc && (
                        <p className="text-lg text-gray-400 max-w-2xl">
                            {desc}
                        </p>
                    )}
                </div>

                {version && (
                    <div className="text-right">
                        <span className="block text-xs text-gray-500 uppercase tracking-wider">
                            {versionLabel}
                        </span>
                        <span className="font-mono text-xl text-cyan-400">
                            {version}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
