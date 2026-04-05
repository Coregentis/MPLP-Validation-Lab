export function ScenarioAwareBanner() {
    return (
        <div className="bg-mplp-blue-soft/5 border border-mplp-blue-soft/20 p-6 rounded-xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-mplp-blue-soft/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <h3 className="font-bold text-mplp-blue-soft uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mplp-blue-soft animate-pulse" />
                    Scenario-Aware Reading
                </h3>
                <ul className="space-y-2 text-sm text-mplp-text-muted">
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Use the run context:</strong> read the current run&apos;s scenario ID, substrate, and ruleset identity first.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Legacy labels are not shortcuts:</strong> older <code>LG-*</code>, <code>gf-*</code>, or ruleset-family labels should be treated as identifiers only when they appear in bound run data.
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Do not over-read a verdict:</strong> PASS/FAIL language on a run stays limited to the submitted evidence and pinned ruleset behind that run.
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
