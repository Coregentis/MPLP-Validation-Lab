import type { SSOTMetadata } from '@/lib/curated/types';

interface ProvenanceFooterProps {
    ssot: SSOTMetadata;
}

export function ProvenanceFooter({ ssot }: ProvenanceFooterProps) {
    return (
        <footer className="mt-8 pt-4 border-t text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-4">
                <span>
                    <strong>SSOT:</strong> <code className="bg-gray-100 px-1">{ssot.source}</code>
                </span>
                <span>
                    <strong>Commit:</strong> <code className="bg-gray-100 px-1">{ssot.git_commit}</code>
                </span>
                <span>
                    <strong>Generated:</strong> {new Date(ssot.generated_at).toLocaleString()}
                </span>
            </div>
        </footer>
    );
}
