import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
    robots: { index: false, follow: false }
};

/**
 * SUBSTRATES map for evidence producers
 * 
 * B-Type Hardcode (Stable Definition)
 * Source: producers/ directory structure
 * 
 * Note: This subset of Tier-0 substrates have working evidence producers.
 * Not all Tier-0 substrates from substrate-index.yaml have producers yet.
 */
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
        <div className="space-y-6">
            <Link href="/methodology" className="inline-flex items-center gap-2 text-sm text-mplp-text-muted hover:text-mplp-blue-soft transition-colors">
                <ArrowLeft size={14} /> Back to Methodology
            </Link>

            <header>
                <h1 className="text-3xl font-bold text-mplp-text mb-2">{substrateInfo.label} Producer</h1>
                <p className="text-mplp-text-muted">Cross-substrate evidence pack generator for {substrateInfo.label}</p>
            </header>

            <div className="bg-glass rounded-xl border border-mplp-border/40 p-6">
                <h2 className="text-lg font-semibold text-mplp-text mb-4">Producer Script Preview</h2>
                <pre className="text-xs text-mplp-text-muted/80 font-mono overflow-x-auto bg-black/30 p-4 rounded">
                    {previewLines}
                    {scriptContent.split('\n').length > 50 && '\n... (truncated)'}
                </pre>
            </div>

            <div className="bg-glass rounded-xl border border-mplp-border/40 p-6">
                <h2 className="text-lg font-semibold text-mplp-text mb-4">Usage</h2>
                <pre className="text-sm text-green-400 font-mono bg-black/30 p-4 rounded">
                    {`# Run the ${substrateInfo.label} evidence producer
node producers/${substrateInfo.dir}/run.mjs`}
                </pre>
            </div>
        </div>
    );
}
