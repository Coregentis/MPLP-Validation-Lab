/**
 * Replay Disclaimer — Non-endorsement notice for evidence replay pages.
 * 
 * GOVERNANCE: GATE-04 compliance. Text is HARDCODED to prevent injection.
 * Do NOT render from run/pack data.
 */

export function ReplayDisclaimer() {
    return (
        <aside
            className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4"
            role="complementary"
            aria-label="Non-endorsement notice"
        >
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                Important Notice
            </h3>
            <ul className="text-sm text-mplp-text-muted space-y-1 list-disc list-inside">
                <li>Labels apply to evidence strength, not to substrate quality.</li>
                <li>This is not certification or endorsement.</li>
                <li>Verdicts are scenario + ruleset scoped.</li>
            </ul>
        </aside>
    );
}
