import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProducerCatalogEntry, listProducerStaticParams } from '@/lib/producers/loadProducerCatalog';

export const metadata = {
    robots: { index: false, follow: false }
};

export function generateStaticParams() {
    return listProducerStaticParams();
}

export default async function EvidenceProducerPage({
    params,
}: {
    params: Promise<{ substrate: string }>;
}) {
    const { substrate } = await params;

    const producer = getProducerCatalogEntry(substrate);

    if (!producer) {
        notFound();
    }

    const runScriptPath = join(process.cwd(), producer.runScriptPath);

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
                <h1 className="text-3xl font-bold text-mplp-text mb-2">{producer.name} Producer</h1>
                <p className="text-mplp-text-muted">Cross-substrate evidence pack generator for {producer.name}</p>
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
                    {`# Run the ${producer.name} evidence producer
node ${producer.runScriptPath}`}
                </pre>
            </div>
        </div>
    );
}
