import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Policies',
    description: 'Secondary governance landing page for Validation Lab policy references. This page is a limited public pointer surface, not a full policy registry.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/policies`,
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function PoliciesPage() {
    return (
        <div className="max-w-4xl mx-auto mt-12">
            <div className="mb-6">
                <Link href="/governance" className="text-mplp-blue hover:underline text-sm font-mono">&larr; Back to Governance</Link>
            </div>
            <h1 className="text-3xl font-bold mb-6 font-mono">Operational Policies</h1>
            <p className="text-mplp-text-muted mb-8">
                Secondary governance entry for policy references and boundary pointers. This page is not a full public policy registry.
            </p>
            <div className="p-6 bg-mplp-bg-card border border-mplp-border rounded text-center">
                <p className="text-mplp-text-muted">Public policy registry content is limited here. Use the governance index and linked policy/reference surfaces for active public governance resources.</p>
            </div>
        </div>
    );
}
