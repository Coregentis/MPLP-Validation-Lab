/**
 * Evidence Producers Index Page
 * 
 * Lists all available evidence producer templates.
 * Entry point for /examples/evidence-producers/* dynamic routes.
 * 
 * NAV-FIX-01: Created to eliminate orphan status of producer pages.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Evidence Producers — MPLP Validation Lab',
    description: 'Reference templates for generating cross-substrate evidence packs. Not an official SDK.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/examples/evidence-producers`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

const PRODUCERS = [
    {
        id: 'langgraph',
        name: 'LangGraph',
        type: 'Framework',
        description: 'Graph-based agent orchestration producer',
        status: 'Available',
    },
    {
        id: 'autogen',
        name: 'AutoGen',
        type: 'Framework',
        description: 'Multi-agent conversation producer',
        status: 'Available',
    },
    {
        id: 'sk',
        name: 'Semantic Kernel',
        type: 'Framework',
        description: 'AI orchestration SDK producer',
        status: 'Available',
    },
];

export default function EvidenceProducersIndexPage() {
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Warning Banner */}
                <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4 mb-8">
                    <p className="text-sm text-amber-200">
                        <strong>Reference Templates Only</strong> — These are not official SDKs.
                        This project does not endorse any implementation. Producers are community-contributed
                        reference templates for generating cross-substrate evidence packs.
                    </p>
                </div>

                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm mb-4">
                        <Link href="/" className="hover:text-zinc-300">Home</Link>
                        <span>/</span>
                        <span className="text-zinc-300">Evidence Producers</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Evidence Producers</h1>
                    <p className="text-zinc-400">
                        Reference templates for generating MPLP-compliant evidence packs across different agent frameworks.
                    </p>
                </header>

                {/* Producer Cards */}
                <div className="grid gap-4">
                    {PRODUCERS.map((producer) => (
                        <Link
                            key={producer.id}
                            href={`/examples/evidence-producers/${producer.id}`}
                            className="block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-100 group-hover:text-blue-400 transition-colors">
                                        {producer.name}
                                    </h2>
                                    <p className="text-sm text-zinc-500 mt-1">{producer.type}</p>
                                    <p className="text-zinc-400 mt-2">{producer.description}</p>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50 rounded">
                                    {producer.status}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Usage Section */}
                <section className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <h2 className="text-lg font-semibold mb-4">Using Evidence Producers</h2>
                    <div className="space-y-4 text-sm text-zinc-400">
                        <p>
                            Each producer provides a reference implementation for generating evidence packs
                            that conform to the <Link href="/policies/contract" className="text-blue-400 hover:underline">Export Contract</Link>.
                        </p>
                        <pre className="bg-black/30 p-4 rounded font-mono text-green-400 overflow-x-auto">
                            {`# Clone and run a producer
cd producers/<substrate>
node run.mjs

# Output: evidence pack in packs/`}
                        </pre>
                    </div>
                </section>

                {/* Links */}
                <div className="mt-8 flex flex-wrap gap-4 text-sm">
                    <Link href="/policies/contract" className="text-blue-400 hover:underline">
                        Export Contract →
                    </Link>
                    <Link href="/coverage/adjudication" className="text-blue-400 hover:underline">
                        Coverage Matrix →
                    </Link>
                    <Link href="/policies/fmm" className="text-blue-400 hover:underline">
                        Field Mapping →
                    </Link>
                </div>
            </div>
        </main>
    );
}
