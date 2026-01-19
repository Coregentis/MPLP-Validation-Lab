export function ScenarioAwareBanner() {
    return (
        <div className="bg-mplp-blue-soft/5 border border-mplp-blue-soft/20 p-6 rounded-xl relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-mplp-blue-soft/10 blur-[40px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <h3 className="font-bold text-mplp-blue-soft uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-mplp-blue-soft animate-pulse" />
                    Cross-Vendor Evidence Spine
                </h3>
                <ul className="space-y-2 text-sm text-mplp-text-muted">
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Scenario Focus:</strong> LG-01 (Single Agent Lifecycle)
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Ruleset:</strong> ruleset-1.0 (presence-level validation)
                        </span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-mplp-blue-soft">•</span>
                        <span>
                            <strong className="text-mplp-text">Important:</strong> LG-02~05 PASS results indicate artifact presence only,
                            not semantic correctness for those flows.
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
