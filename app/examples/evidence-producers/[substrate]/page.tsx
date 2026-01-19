import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export const metadata = {
    robots: { index: false, follow: false }
};

// v0.5 Cross-Substrate Producers
const SUBSTRATES = {
    langgraph: { label: 'LangGraph', dir: 'langgraph' },
    autogen: { label: 'AutoGen', dir: 'autogen' },
    sk: { label: 'Semantic Kernel', dir: 'semantic-kernel' },
} as const;

type SubstrateKey = keyof typeof SUBSTRATES;

export function generateStaticParams() {
    return Object.keys(SUBSTRATES).map(substrate => ({ substrate }));
}

export default async function EvidenceProducerPage({
    params,
}: {
    params: Promise<{ substrate: string }>;
}) {
    const { substrate } = await params;

    // Validate substrate
    if (!(substrate in SUBSTRATES)) {
        notFound();
    }

    const substrateInfo = SUBSTRATES[substrate as SubstrateKey];

    // Read producer run.mjs (no README, show run script info)
    const producerDir = join(process.cwd(), 'producers', substrateInfo.dir);
    const runScriptPath = join(producerDir, 'run.mjs');

    if (!existsSync(runScriptPath)) {
        notFound();
    }

    // Read first 50 lines of run.mjs as preview
    const scriptContent = readFileSync(runScriptPath, 'utf-8');
    const previewLines = scriptContent.split('\n').slice(0, 50).join('\n');

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            {/* Boundary Banner */}
            <div className="bg-amber-900/30 border-b border-amber-700/50 p-4">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm text-amber-200">
                        <strong>Evidence Producer Reference</strong> — Not an official SDK or endorsed implementation.
                        This is a reference template for generating cross-substrate evidence packs.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-2">{substrateInfo.label} Producer</h1>
                <p className="text-zinc-400 mb-6">Cross-substrate evidence pack generator for {substrateInfo.label}</p>

                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Producer Script Preview</h2>
                    <pre className="text-xs text-zinc-300 font-mono overflow-x-auto bg-black/30 p-4 rounded">
                        {previewLines}
                        {scriptContent.split('\n').length > 50 && '\n... (truncated)'}
                    </pre>
                </div>

                <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Usage</h2>
                    <pre className="text-sm text-green-400 font-mono bg-black/30 p-4 rounded">
                        {`# Run the ${substrateInfo.label} evidence producer
node producers/${substrateInfo.dir}/run.mjs`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
