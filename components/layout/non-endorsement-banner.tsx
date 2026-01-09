/**
 * Non-Endorsement Banner Component
 * 
 * GOVERNANCE: Content derived from README.md Four Boundaries.
 * Do not modify wording without VLAB-DGB-01 governance review.
 */
export function NonEndorsementBanner() {
    return (
        <aside className="bg-amber-950/30 border-b border-amber-900/50 px-4 py-3">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-sm font-semibold text-amber-200 mb-2">
                    Validation Lab Boundaries
                </h2>
                <ul className="text-xs text-amber-100/80 space-y-1">
                    <li>• <strong>Non-certification / Non-endorsement</strong>: No badges, rankings, or official compliance marks</li>
                    <li>• <strong>Non-normative</strong>: Lab does not define protocol semantics; it evaluates evidence only</li>
                    <li>• <strong>No execution hosting</strong>: Lab does not run your code; you provide evidence packs</li>
                    <li>• <strong>Deterministic ruleset</strong>: Same evidence + same ruleset = same verdict</li>
                </ul>
                <a href="/about" className="text-xs text-amber-400 underline mt-2 inline-block">
                    Full statement →
                </a>
            </div>
        </aside>
    );
}
