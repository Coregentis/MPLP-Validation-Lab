import Link from 'next/link';

export default function AuditPage() {
    return (
        <main className="min-h-screen bg-mplp-dark-bg text-mplp-text-primary px-4 py-8">
            <div className="max-w-4xl mx-auto mt-12">
                <div className="mb-6">
                    <Link href="/governance" className="text-mplp-blue hover:underline text-sm font-mono">&larr; Back to Governance</Link>
                </div>
                <h1 className="text-3xl font-bold mb-6 font-mono">Local Audit</h1>
                <p className="text-mplp-text-muted mb-8">
                    Tools for local verification of site health and content integrity.
                </p>

                <div className="p-6 bg-mplp-bg-subtle border border-mplp-border rounded font-mono text-sm">
                    <h3 className="font-bold mb-2">Run Audit</h3>
                    <code className="bg-black/30 p-2 rounded block">npm run audit:http:local</code>
                    <p className="mt-2 text-mplp-text-muted text-xs">
                        Checks 200 OK status and content length for critical routes including:
                        Home, Runs (Filtered), Detail Pages, Governance, Rulesets.
                    </p>
                </div>
            </div>
        </main>
    );
}
