/**
 * Non-Endorsement Banner Component
 * 
 * GOVERNANCE: Content derived from README.md Four Boundaries.
 * Do not modify wording without VLAB-DGB-01 governance review.
 */
export function NonEndorsementBanner() {
    return (
        <aside
            className="bg-amber-950/30 border-b border-amber-900/50 px-4 sm:px-6 lg:px-8 py-3"
            data-testid="non-endorsement-banner"
        >
            <div className="max-w-7xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-amber-200">
                        Public Lab Boundaries
                    </h2>
                    <a href="/about" className="text-xs text-amber-400 underline hover:text-amber-300 transition">
                        Boundary statement →
                    </a>
                </div>
                <ul className="text-xs text-amber-100/80 space-y-1 list-disc list-inside marker:text-amber-400/50">
                    <li><strong>Non-certification</strong>: No certification marks, rankings, or endorsement claims are issued here</li>
                    <li><strong>Non-normative evidence adjudication</strong>: The Lab evaluates submitted evidence and does not define protocol semantics</li>
                    <li><strong>No execution hosting</strong>: The public Lab does not run your code; it publishes evidence-linked verdict views</li>
                    <li><strong>Deterministic recheck model</strong>: The same evidence plus the same ruleset identity should yield the same verdict</li>
                </ul>
            </div>
        </aside>
    );
}
