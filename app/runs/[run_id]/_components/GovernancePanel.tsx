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
                    <h3 className="font-bold text-mplp-text mb-2">Source-Bound Reading</h3>
                    <p className="text-mplp-text-muted">
                        Read this run through the facts bound to the run itself:
                        <strong className="text-mplp-text"> scenario ID</strong>,
                        <strong className="text-mplp-text"> ruleset identity</strong>,
                        <strong className="text-mplp-text"> admission/adjudication status</strong>,
                        and the published evidence surfaces.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-mplp-text mb-2">No Universal Spine</h3>
                    <p className="text-mplp-text-muted">
                        Legacy labels such as <code>LG-*</code>, <code>gf-*</code>, or older ruleset families may appear in run artifacts.
                        They should be read only as identifiers carried by the bound evidence/adjudication data, not as a universal governance doctrine for every run.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-mplp-text mb-2">Verdict Boundary</h3>
                    <p className="text-mplp-text-muted">
                        PASS, FAIL, NOT_EVALUATED, or NOT_ADMISSIBLE on this run mean only what the bound adjudication artifact says under its pinned ruleset.
                        They do not by themselves imply protocol truth, certification, or broader capability claims.
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
