import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'MPLP Validation Lab — Evidence Verdict Gateway',
    description: 'Evidence & Conformance Laboratory for MPLP Lifecycle Invariants. Non-certifying, non-normative, no execution hosting. Deterministic verdicts from versioned rulesets.',
    alternates: {
        canonical: LAB_CANONICAL_HOST,
    },
    robots: {
        index: true,
        follow: true,
    },
    keywords: ['MPLP', 'Validation Lab', 'Evidence', 'Golden Flows', 'Lifecycle Invariants', 'Non-certifying'],
};

export default function Home() {
    return (
        <div className="min-h-screen p-8 max-w-4xl mx-auto">
            {/* Hero Section - Per VLAB-NAME-01 */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-2">MPLP Validation Lab</h1>
                <p className="text-xl text-gray-400 mb-4">
                    Evidence &amp; Conformance Laboratory for MPLP Lifecycle Invariants (Non-certifying)
                </p>
                <p className="text-sm text-gray-400">
                    Deterministic verdicts from versioned rulesets + reproducible evidence packs.
                </p>
                <p className="text-xs text-amber-400 mt-2">
                    Not certification. Not regulatory compliance. Not hosted execution.
                </p>
            </header>

            <section className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold mb-4">Lab Status</h2>
                <p className="text-gray-400">
                    Phase F Complete — UI Projection + Sample Runs verified.
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                    A–F: Foundation → Schema → Admission → Evaluation → Governance → UI
                </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
                <a href="/runs" className="card block p-4 bg-zinc-900 border border-zinc-700 rounded-lg transition hover:border-zinc-500">
                    <h3 className="font-semibold mb-2">Runs</h3>
                    <p className="text-sm text-gray-400">Browse evaluation runs</p>
                </a>
                <a href="/rulesets" className="card block p-4 bg-zinc-900 border border-zinc-700 rounded-lg transition hover:border-zinc-500">
                    <h3 className="font-semibold mb-2">Rulesets</h3>
                    <p className="text-sm text-gray-400">View versioned rulesets</p>
                </a>
                <a href="/guarantees" className="card block p-4 bg-zinc-900 border border-zinc-700 rounded-lg transition hover:border-zinc-500">
                    <h3 className="font-semibold mb-2">Guarantees</h3>
                    <p className="text-sm text-gray-400">GF-01 ~ GF-05 overview (non-normative)</p>
                </a>
            </section>

            {/* Governance Banner */}
            <footer className="mt-12 text-center text-xs text-zinc-500">
                <p>Non-certification. Non-endorsement. Evidence-based verdicts under versioned rulesets.</p>
                <p className="mt-1">No execution hosting. The Lab evaluates evidence only.</p>
            </footer>
        </div>
    );
}
