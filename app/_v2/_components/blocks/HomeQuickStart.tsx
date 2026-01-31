
import React from 'react';

export function HomeQuickStart({ tokens }: { tokens: Record<string, string> }) {
    const steps = [
        {
            title: tokens.LIT_QUICKSTART_STEP1,
            cmd: "npm install"
        },
        {
            title: tokens.LIT_QUICKSTART_STEP2,
            cmd: "npm run projection:build"
        },
        {
            title: tokens.LIT_QUICKSTART_STEP3,
            cmd: "npm run gate:all"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h2 className="text-2xl font-bold mb-8 text-center">{tokens.LIT_QUICKSTART_TITLE}</h2>
            <div className="space-y-4">
                {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 bg-gray-900/20 p-4 rounded-lg border border-gray-800">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-bold text-gray-400">
                            {i + 1}
                        </div>
                        <div className="flex-1 font-medium text-gray-300">
                            {step.title}
                        </div>
                        <code className="text-sm bg-black px-3 py-2 rounded text-blue-400 font-mono">
                            {step.cmd}
                        </code>
                    </div>
                ))}
            </div>
        </div>
    );
}
