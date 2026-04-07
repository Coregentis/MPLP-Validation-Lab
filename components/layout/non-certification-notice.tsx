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
            className="bg-zinc-900/50 border-b border-zinc-800/50 px-4 sm:px-6 lg:px-8 py-2"
            data-testid="non-certification-notice"
        >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider">Surface Notice</span>
                <span className="text-zinc-500">|</span>
                <span>
                    Validation Lab is the public <strong className="text-zinc-300">evidence adjudication</strong> surface for MPLP.
                    It publishes evidence-based verdict views, not certification, compliance marks, or execution hosting.
                </span>
            </div>
        </div>
    );
}
