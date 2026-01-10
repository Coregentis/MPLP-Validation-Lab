export function ScenarioAwareBanner() {
    return (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="font-semibold text-lg mb-2">Cross-Vendor Evidence Spine v0.1</h3>
            <ul className="space-y-2 text-sm">
                <li>
                    <strong>Scenario Focus</strong>: GF-01 (Single Agent Lifecycle)
                </li>
                <li>
                    <strong>Ruleset</strong>: ruleset-1.0 (presence-level validation)
                </li>
                <li>
                    <strong>Important</strong>: GF-02~05 PASS results indicate artifact presence only,
                    not semantic correctness for those flows.
                </li>
            </ul>
        </div>
    );
}
