export function GovernancePanel() {
    return (
        <section className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded">
            <h2 className="text-xl font-semibold mb-4">Governance & Guarantees</h2>

            <div className="space-y-4 text-sm">
                <div>
                    <h3 className="font-semibold mb-2">v0.1 Scenario Focus</h3>
                    <p>
                        This spine validates <strong>GF-01: Single Agent Lifecycle</strong>.
                        While ruleset-1.0 checks GF-02~05, these checks are <strong>presence-level only</strong>.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Presence-Level Validation</h3>
                    <p>
                        ruleset-1.0 verifies artifact <em>presence</em>, not semantic correctness.
                        A "PASS" for GF-02~05 indicates required files exist, not that they are semantically valid for those flows.
                    </p>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">No Execution Hosting</h3>
                    <p>
                        The Lab does NOT execute agent code. All evidence generation occurs in third-party environments.
                    </p>
                </div>
            </div>
        </section>
    );
}
