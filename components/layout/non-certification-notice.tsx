/**
 * Non-Certification Notice Component
 * 
 * GOVERNANCE: This notice clarifies the Lab's certification boundaries.
 * Injected globally via root layout to satisfy PSC requirements.
 * 
 * Required by: GATE-SEMANTIC-SECTION-PRESENCE-01
 */
export function NonCertificationNotice() {
    return (
        <div
            className="bg-zinc-900/50 border-b border-zinc-800/50 px-6 py-2"
            data-testid="non-certification-notice"
        >
            <div className="max-w-6xl mx-auto flex items-center gap-4 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider">Notice</span>
                <span className="text-zinc-500">|</span>
                <span>This lab provides <strong className="text-zinc-300">evidence-based verdicts</strong>, not certification. No compliance marks or endorsements are issued.</span>
            </div>
        </div>
    );
}
