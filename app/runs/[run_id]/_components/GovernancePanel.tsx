export function GovernancePanel() {
    return (
        <section className="bg-amber-900/10 border border-amber-500/20 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="bg-amber-900/20 px-6 py-4 border-b border-amber-500/20 flex items-center gap-2">
                <span className="text-amber-400">⚠</span>
                <h2 className="text-lg font-bold text-amber-400">Governance & Scope</h2>
            </div>

            <div className="p-6 space-y-6 text-sm">
                <div>
                    <h3 className="font-bold text-mplp-text mb-2">v0.2 Scenario Focus</h3>
                    <p className="text-mplp-text-muted">
                        This spine validates <strong className="text-mplp-text">LG-01: Single Agent Lifecycle</strong>.
                        While ruleset-1.0 checks LG-02~05, these checks are <strong className="text-amber-400">presence-level only</strong>.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-mplp-text mb-2">Presence-Level Validation</h3>
                    <p className="text-mplp-text-muted">
                        ruleset-1.0 verifies artifact <em>presence</em>, not semantic correctness.
                        A &quot;PASS&quot; for LG-02~05 indicates required files exist, not that they are semantically valid for those Lifecycle Guarantees.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-mplp-text mb-2">No Execution Hosting</h3>
                    <p className="text-mplp-text-muted">
                        The Lab does NOT execute agent code. All evidence generation occurs in third-party environments.
                    </p>
                </div>
            </div>
        </section>
    );
}
