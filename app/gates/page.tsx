import Link from 'next/link';
import { Nav } from '@/components/Nav';

export default function GatesPage() {
    return (
        <main className="min-h-screen bg-mplp-dark-bg text-mplp-text-primary px-4 py-8">
            <Nav />
            <div className="max-w-4xl mx-auto mt-12">
                <div className="mb-6">
                    <Link href="/governance" className="text-mplp-blue hover:underline text-sm font-mono">&larr; Back to Governance</Link>
                </div>
                <h1 className="text-3xl font-bold mb-6 font-mono">Verification Gates</h1>
                <p className="text-mplp-text-muted mb-8">
                    Automated gates ensure the integrity, consistency, and correctness of the Validation Lab.
                </p>

                <div className="grid gap-6">
                    <div className="p-6 bg-mplp-bg-subtle border border-mplp-border rounded">
                        <h2 className="text-xl font-bold mb-2">Gate Suites</h2>
                        <ul className="list-disc list-inside space-y-2 text-mplp-text-muted font-mono text-sm">
                            <li>gate:v1:all (Core V1 Integrity)</li>
                            <li>gate:v2:all (V2 Substrate Integrity)</li>
                            <li>gate:unified:inventory (Cross-Substrate SSOT)</li>
                            <li>gate:unified:no-escape (Tooling Security)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    );
}
