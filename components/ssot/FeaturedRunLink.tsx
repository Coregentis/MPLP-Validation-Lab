import React from 'react';
import { FeaturedRunModel } from '@/lib/ssot/featured-run';
import Link from 'next/link';

export function FeaturedRunLink({ featuredRun }: { featuredRun: FeaturedRunModel }) {
    if (!featuredRun.run_id) return null;

    return (
        <span data-testid="featured-run-link" className="inline-flex">
            <Link href={`/adjudication/${featuredRun.run_id}`} className="text-mplp-blue-soft hover:text-mplp-blue-light font-mono transition-colors">
                {featuredRun.run_id}
            </Link>
            <span className="ml-2 text-xs text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-500/20">
                RECOMMENDED
            </span>
        </span>
    );
}
