/**
 * Builder Guide Page
 * 
 * Explains BYO Evidence workflow for agent builders.
 * Clarifies: No upload, no hosted execution, evidence-only approach.
 * 
 * GATE-04 COMPLIANCE: Uses allowed terminology, no forbidden terms.
 */

import Link from 'next/link';
import type { Metadata } from 'next';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Builder Guide — MPLP Validation Lab',
    description: 'How to generate evidence packs for MPLP Validation Lab. BYO Evidence workflow: no uploads, no hosted execution.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/builder`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function BuilderGuidePage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Builder Guide</h1>
            <p className="text-zinc-400 mb-8">
                How to evaluate your agent implementation using the Validation Lab.
            </p>

            {/* Important Notice */}
            <section className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-amber-200 mb-3">
                    Important: What This Lab Does NOT Do
                </h2>
                <ul className="space-y-2 text-amber-100/80 text-sm">
                    <li className="flex gap-2">
                        <span className="text-red-400">✗</span>
                        <span>Does NOT accept uploads of your runtime or agent code</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-400">✗</span>
                        <span>Does NOT provide hosted execution environments</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-400">✗</span>
                        <span>Does NOT issue official marks or endorsements</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-red-400">✗</span>
                        <span>Does NOT run your code online</span>
                    </li>
                </ul>
                <p className="text-amber-200/70 text-xs mt-4">
                    The Lab evaluates evidence only. You generate evidence locally, then the Lab provides verdicts.
                </p>
            </section>

            {/* BYO Evidence Workflow */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">BYO Evidence Workflow</h2>
                <p className="text-zinc-400 text-sm mb-6">
                    &quot;Bring Your Own Evidence&quot; — generate evidence locally, then evaluate with the Lab.
                </p>

                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                            1
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Generate Evidence Pack Locally</h3>
                            <p className="text-zinc-400 text-sm">
                                Run your agent in your own environment (local, CI, staging) and capture:
                            </p>
                            <ul className="text-zinc-500 text-sm mt-2 space-y-1">
                                <li>• <code className="text-zinc-400">manifest.json</code> — pack metadata (required)</li>
                                <li>• <code className="text-zinc-400">integrity/sha256sums.txt</code> — file checksums (required)</li>
                                <li>• <code className="text-zinc-400">timeline/events.ndjson</code> — lifecycle events (required)</li>
                                <li>• <code className="text-zinc-400">artifacts/</code> — context.json, plan.json, trace.json (required)</li>
                                <li>• <code className="text-zinc-400">snapshots/</code> — state snapshots <span className="text-zinc-600">(optional)</span></li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                            2
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Run Evaluation Script</h3>
                            <p className="text-zinc-400 text-sm">
                                Use the Lab&apos;s generator to create run artifacts:
                            </p>
                            <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 mt-2 text-sm overflow-x-auto">
                                <code className="text-green-400">
                                    {`npx tsx scripts/generate-sample-run.ts \\
  ./path/to/your/evidence-pack \\
  my-run-id`}
                                </code>
                            </pre>
                            <p className="text-zinc-500 text-xs mt-2">
                                This produces: verify.report.json, evaluation.report.json (if admissible)
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold flex-shrink-0">
                            3
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Preview Locally or Deploy</h3>
                            <p className="text-zinc-400 text-sm">
                                View your run results locally:
                            </p>
                            <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 mt-2 text-sm overflow-x-auto">
                                <code className="text-green-400">
                                    {`npm run dev
# Open http://localhost:3000/runs/my-run-id`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* Substrate Declaration */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Substrate Declaration</h2>
                <p className="text-zinc-400 text-sm mb-4">
                    Your agent&apos;s substrate (A2A, MCP, LangChain, etc.) is declared in the manifest:
                </p>
                <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm overflow-x-auto">
                    <code className="text-zinc-300">
                        {`{
  "pack_id": "my-agent-001",
  "protocol_version": "1.0.0",
  "substrate": {
    "type": "A2A",
    "version": "1.0",
    "adaptor": "custom-a2a-adaptor"
  },
  ...
}`}
                    </code>
                </pre>
                <p className="text-zinc-500 text-xs mt-3">
                    The substrate descriptor helps categorize runs in the catalog. It does not affect evaluation logic.
                </p>
            </section>

            {/* Curated Runs */}
            <section className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Curated Runs</h2>
                <p className="text-zinc-400 text-sm mb-4">
                    To include your run in the public catalog, add it to <code className="text-zinc-300">data/policy/curation.yaml</code>:
                </p>
                <pre className="bg-zinc-950 border border-zinc-800 rounded p-3 text-sm overflow-x-auto">
                    <code className="text-zinc-300">
                        {`curated_runs:
  - run_id: my-run-id
    index: true  # Allow indexing`}
                    </code>
                </pre>
                <p className="text-zinc-500 text-xs mt-3">
                    Non-curated runs default to noindex. This prevents unverified runs from appearing in search engines.
                </p>
            </section>

            {/* Non-certification Notice */}
            <section className="border border-zinc-700 rounded-lg p-6 mb-8 text-center">
                <p className="text-zinc-400 text-sm">
                    Verdicts are evidence-based outputs under versioned rulesets.
                </p>
                <p className="text-amber-400 text-xs mt-2">
                    Non-certification. Non-endorsement. Deterministic evaluation only.
                </p>
            </section>

            {/* Navigation */}
            <section className="flex gap-4 text-sm">
                <Link href="/about" className="text-blue-400 hover:underline">
                    ← Read Full Statement
                </Link>
                <Link href="/runs" className="text-blue-400 hover:underline">
                    Browse Sample Runs →
                </Link>
                <Link href="/rulesets" className="text-blue-400 hover:underline">
                    View Rulesets →
                </Link>
            </section>
        </div>
    );
}
