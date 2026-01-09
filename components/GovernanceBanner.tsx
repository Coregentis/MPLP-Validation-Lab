/**
 * Governance Banner Component
 * 
 * Displays the non-certification / non-endorsement / no execution hosting
 * governance statement prominently on every page.
 * 
 * GATE-04/05 Safe: Uses only allowed phrases from forbidden-lexicon.yaml
 */

export function GovernanceBanner() {
    return (
        <div className="bg-amber-900/20 border-b border-amber-700/30 px-4 py-2 text-center text-sm">
            <span className="text-amber-200 font-medium">
                Non-certification. Non-endorsement.
            </span>
            {' '}
            <span className="text-amber-200/80">
                Evidence-based verdicts under a versioned ruleset. No execution hosting.
            </span>
        </div>
    );
}
