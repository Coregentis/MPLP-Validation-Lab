import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

export const metadata = {
    robots: { index: false, follow: false }
};

export function generateStaticParams() {
    return [
        { substrate: 'langchain' },
        { substrate: 'a2a' },
        { substrate: 'mcp' },
    ];
}

export default async function EvidenceProducerPage({
    params,
}: {
    params: Promise<{ substrate: string }>;
}) {
    const { substrate } = await params;

    // Validate substrate
    const validSubstrates = ['langchain', 'a2a', 'mcp'];
    if (!validSubstrates.includes(substrate)) {
        notFound();
    }

    // Read markdown file
    const readmePath = join(
        process.cwd(),
        'examples',
        'evidence-producers',
        substrate,
        'README.md'
    );

    if (!existsSync(readmePath)) {
        notFound();
    }

    const content = readFileSync(readmePath, 'utf-8');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Boundary Banner */}
            <div className="bg-amber-50 border-b border-amber-200 p-4">
                <div className="max-w-5xl mx-auto">
                    <p className="text-sm text-amber-900">
                        <strong>Evidence Producer Reference</strong> — Not an official SDK or endorsed implementation.
                        This is a reference template for generating evidence packs.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto p-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <div className="prose prose-lg max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                </div>
            </div>
        </div>
    );
}
