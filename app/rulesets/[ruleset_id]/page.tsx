import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getRuleset, loadRuleset, RequirementDef } from '@/lib/rulesets/loadRuleset';

import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface PageProps {
    params: Promise<{ ruleset_id: string }>;
}

export default async function RulesetDetailPage({ params }: PageProps) {
    const { ruleset_id } = await params;

    // R1: Fail-closed error handling for edge stability
    let loadError: string | null = null;
    let ruleset: Awaited<ReturnType<typeof getRuleset>> | null = null;
    let requirements: Record<string, RequirementDef[]> = {};

    try {
        // P4-D2: Legacy Alias Redirect
        // If user accesses /ruleset-1.0.0, redirect to /ruleset-1.0 (Canonical)
        // Heuristic: If ID contains dots like "1.0.0" but the canonical set is "ruleset-1.0"
        if (/ruleset-\d+\.\d+\.\d+/.test(ruleset_id)) {
            // Try to find if there is a canonical version
            const potentialCanonical = ruleset_id.replace(/(\d+\.\d+)\.\d+/, '$1');
            const exists = getRuleset(potentialCanonical);
            if (exists) {
                redirect(`/rulesets/${potentialCanonical}`);
            }
        }

        ruleset = getRuleset(ruleset_id);

        if (!ruleset) {
            notFound();
        }

        // P4-C: Load full detail (Bundle SSOT) if available
        if (ruleset.version) {
            const fullData = loadRuleset(ruleset.version);
            if (fullData.manifest) {
                // Merge or replace
                // Ensure we keep the 'kind' determined by the loader
                ruleset = { ...ruleset, ...fullData.manifest, kind: fullData.manifest.kind || ruleset.kind };
            }
            requirements = fullData.requirements || {};
        }
    } catch (e) {
        loadError = `Ruleset loader failed: ${e instanceof Error ? e.message : String(e)}`;
        console.error(`[RulesetDetail] Load error for ${ruleset_id}:`, e);
    }

    // R1: Render error card instead of crashing (fail-closed)
    if (loadError || !ruleset) {
        return (
            <>
                <div className="max-w-5xl mx-auto px-6 py-12">
                    <Link href="/rulesets" className="inline-flex items-center gap-2 text-sm text-mplp-text-muted hover:text-mplp-blue-soft mb-8 transition-colors">
                        <ArrowLeft size={14} />
                        Back to Rulesets
                    </Link>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <AlertTriangle className="text-red-400" size={24} />
                            <h1 className="text-2xl font-bold text-red-400">Ruleset Load Error</h1>
                        </div>
                        <p className="text-mplp-text-muted mb-4">
                            {loadError || 'Ruleset not found or failed to load.'}
                        </p>
                        <div className="bg-mplp-dark-soft/50 p-4 rounded border border-mplp-border/20 font-mono text-sm">
                            <p><span className="text-mplp-text-muted">Requested ID:</span> <span className="text-mplp-text">{ruleset_id}</span></p>
                            <p><span className="text-mplp-text-muted">Probe Paths:</span></p>
                            <ul className="list-disc list-inside text-xs text-mplp-text-muted/60 mt-1">
                                <li>data/rulesets/{ruleset_id}/manifest.yaml</li>
                                <li>public/_data/v2/rulesets/ruleset-v{ruleset_id}.json</li>
                                <li>public/_data/v2/rulesets/ruleset-{ruleset_id}.json</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div data-testid="ruleset-page-root">
                <Link href="/rulesets" className="inline-flex items-center gap-2 text-sm text-mplp-text-muted hover:text-mplp-blue-soft mb-8 transition-colors">
                    <ArrowLeft size={14} />
                    Back to Rulesets
                </Link>

                <div className="bg-glass border border-mplp-border/40 rounded-2xl p-8 mb-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-mplp-text mb-2">{ruleset.name || ruleset.id}</h1>
                            <div className="flex gap-3 text-sm font-mono text-mplp-text-muted">
                                <span>ID: {ruleset.id}</span>
                                <span>•</span>
                                <span>Version: {ruleset.version}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${ruleset.source === 'v2'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                                }`}>
                                {ruleset.source || 'v1'} SOURCE
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ruleset.status === 'active'
                                ? 'bg-mplp-blue-soft/10 text-mplp-blue-soft border border-mplp-blue-soft/20'
                                : 'bg-mplp-dark-soft text-mplp-text-muted border border-mplp-border/40'
                                }`}>
                                {ruleset.status}
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none text-mplp-text-muted/80 mb-8 border-t border-mplp-border/20 pt-6">
                        <h3>Overview</h3>
                        <p>
                            This ruleset defines the adjudication criteria for evidence packs targeting version <code>{ruleset.version}</code>.
                            {ruleset.source === 'v1' && ' It is defined in the local filesystem.'}
                            {ruleset.source === 'v2' && ' It is sourced from the V2 Unified Index.'}
                        </p>
                    </div>

                    {/* Domain Reference Section - D1/D2/D3/D4 anchors */}
                    <div className="mb-8 bg-mplp-dark-soft/30 border border-mplp-border/20 rounded-lg p-6" data-testid="ruleset-domains">
                        <h3 className="text-lg font-bold text-mplp-text mb-2">Domains (D1–D4)</h3>
                        <p className="text-sm text-mplp-text-muted mb-6">
                            Domains group clauses by verification dimension. Each domain defines <strong>what</strong> is checked,
                            <strong>which evidence</strong> must be present, and <strong>what failure means</strong>.
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* D1: Provenance & Identity */}
                            <div id="d1" className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg" data-testid="ruleset-domain-d1">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase">D1</span>
                                    <span className="font-bold text-mplp-text">Provenance &amp; Identity</span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div data-testid="ruleset-domain-d1-def">
                                        <span className="text-mplp-text-muted font-semibold">Definition:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Verifies the runner&apos;s identity, environment fingerprint, and manifest integrity before execution begins.</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d1-evidence">
                                        <span className="text-mplp-text-muted font-semibold">Evidence checked:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5 font-mono text-xs">runner_id, env_hash, manifest_seal, version_pin</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d1-fail">
                                        <span className="text-red-400/80 font-semibold">If FAIL:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Evidence pack cannot be trusted — origin or environment is unverifiable.</p>
                                    </div>
                                </div>
                            </div>

                            {/* D2: Lifecycle & State */}
                            <div id="d2" className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg" data-testid="ruleset-domain-d2">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase">D2</span>
                                    <span className="font-bold text-mplp-text">Lifecycle &amp; State</span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div data-testid="ruleset-domain-d2-def">
                                        <span className="text-mplp-text-muted font-semibold">Definition:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Verifies execution lifecycle integrity: state transitions, timeline consistency, and event ordering.</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d2-evidence">
                                        <span className="text-mplp-text-muted font-semibold">Evidence checked:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5 font-mono text-xs">event_log, state_diffs, timeline_hash, step_sequence</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d2-fail">
                                        <span className="text-red-400/80 font-semibold">If FAIL:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Execution sequence is inconsistent — events may be missing, reordered, or fabricated.</p>
                                    </div>
                                </div>
                            </div>

                            {/* D3: Arbitration & Dispute */}
                            <div id="d3" className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg" data-testid="ruleset-domain-d3">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase">D3</span>
                                    <span className="font-bold text-mplp-text">Arbitration &amp; Dispute</span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div data-testid="ruleset-domain-d3-def">
                                        <span className="text-mplp-text-muted font-semibold">Definition:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Provides pointers for dispute resolution: evidence locations, FMM markers, and triggered clause references.</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d3-evidence">
                                        <span className="text-mplp-text-muted font-semibold">Evidence checked:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5 font-mono text-xs">triggered_clauses, fmm_pointer, evidence_uri, diff_payload</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d3-fail">
                                        <span className="text-red-400/80 font-semibold">If FAIL:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Run is not dispute-ready — arbitration cannot proceed without valid evidence pointers.</p>
                                    </div>
                                </div>
                            </div>

                            {/* D4: Interop & Protocol */}
                            <div id="d4" className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-lg" data-testid="ruleset-domain-d4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded uppercase">D4</span>
                                    <span className="font-bold text-mplp-text">Interop &amp; Protocol</span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div data-testid="ruleset-domain-d4-def">
                                        <span className="text-mplp-text-muted font-semibold">Definition:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Validates cross-framework protocol compliance (MCP, A2A, ACP) and handoff integrity between agents.</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d4-evidence">
                                        <span className="text-mplp-text-muted font-semibold">Evidence checked:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5 font-mono text-xs">protocol_stack, handoff_log, interop_seal, bridge_events</p>
                                    </div>
                                    <div data-testid="ruleset-domain-d4-fail">
                                        <span className="text-red-400/80 font-semibold">If FAIL:</span>
                                        <p className="text-mplp-text-muted/90 mt-0.5">Cross-framework communication violated protocol spec — handoff integrity cannot be verified.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DUAL MODE RENDERING */}

                    {/* Mode A: Clauses (Standard) */}
                    {ruleset.kind === 'clauses' && (
                        <div className="mb-8" data-testid="clauses">
                            <h3 className="text-lg font-bold text-mplp-text mb-4">Core Invariants</h3>
                            {ruleset.clauses && ruleset.clauses.length > 0 ? (
                                <ul className="grid gap-3">
                                    {ruleset.clauses.map((clause, i) => (
                                        <li key={i} className="bg-mplp-dark-soft/30 p-3 rounded border border-mplp-border/20 text-sm font-mono text-mplp-text-primary">
                                            {clause === 'placeholder' ? `Clause ${i + 1}` : clause}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-mplp-text-muted italic">No clauses listed.</p>
                            )}
                        </div>
                    )}

                    {/* Mode B: Golden Flows (Legacy) */}
                    {ruleset.kind === 'golden_flows' && (
                        <div className="mb-8" data-testid="golden-flows">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-lg font-bold text-mplp-text">Legacy Surface (Golden Flows)</h3>
                                <div className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider inline-flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    Legacy Format
                                </div>
                            </div>
                            <p className="text-sm text-mplp-text-muted mb-4">
                                This ruleset uses the legacy <code>golden_flows</code> definitions instead of semantic clauses.
                            </p>
                            {ruleset.golden_flows && ruleset.golden_flows.length > 0 ? (
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {ruleset.golden_flows.map((flow, i) => (
                                        <li key={i} className="bg-mplp-dark-soft/30 p-3 rounded border border-mplp-border/20 text-sm font-mono text-mplp-text-primary flex items-center justify-between">
                                            <span>{flow}</span>
                                            <span className="text-xs text-mplp-text-muted/50">FLOW</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-mplp-text-muted italic">No golden flows listed.</p>
                            )}
                        </div>
                    )}

                    {/* Check Requirements (Pointers) - Available in BOTH modes if present */}
                    {Object.keys(requirements).length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-mplp-text mb-4">Requirements & Pointers</h3>
                            <div className="space-y-6">
                                {Object.entries(requirements).map(([group, reqs]) => (
                                    <div key={group}>
                                        <h4 className="text-sm font-bold text-mplp-text-muted uppercase tracking-wider mb-3">{group}</h4>
                                        <div className="grid gap-3">
                                            {reqs.map((req: RequirementDef, i) => (
                                                <div key={i} className="bg-mplp-dark-soft/30 p-4 rounded border border-mplp-border/20">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-mono text-mplp-blue-soft font-bold">{req.id}</span>
                                                        <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">{req.severity || 'MUST'}</span>
                                                    </div>
                                                    <p className="text-sm text-mplp-text mb-2">{req.name}</p>
                                                    <p className="text-xs text-mplp-text-muted leading-relaxed">{req.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Compatibility */}
                    {ruleset.compatibility && (
                        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                            <div className="bg-mplp-dark-soft/50 p-4 rounded border border-mplp-border/20">
                                <span className="block text-xs uppercase tracking-wider text-mplp-text-muted/60 mb-1">Contract</span>
                                <span className="font-mono">{ruleset.compatibility.evidence_pack_contract}</span>
                            </div>
                            <div className="bg-mplp-dark-soft/50 p-4 rounded border border-mplp-border/20">
                                <span className="block text-xs uppercase tracking-wider text-mplp-text-muted/60 mb-1">Target Packs</span>
                                <span className="font-mono">{ruleset.compatibility.min_pack_version || 'Any'} - {ruleset.compatibility.max_pack_version || 'Any'}</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}
