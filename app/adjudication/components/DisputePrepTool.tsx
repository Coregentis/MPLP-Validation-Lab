'use client';

import React, { useState } from 'react';

type ValidationResult = {
    valid: boolean;
    error?: string;
    d1?: boolean;
    d2?: boolean;
    d3?: boolean;
    d4?: boolean;
};

export function DisputePrepTool() {
    const [manifestInput, setManifestInput] = useState('');
    const [rulesetId, setRulesetId] = useState('');
    const [releaseBuild, setReleaseBuild] = useState('');
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

    const handleAnalyze = () => {
        try {
            if (!manifestInput.trim()) {
                setValidationResult({ valid: false, error: 'Manifest content is empty.' });
                return;
            }

            // 1. Parse JSON
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let manifest: any;
            try {
                manifest = JSON.parse(manifestInput);
            } catch {
                setValidationResult({ valid: false, error: 'Invalid JSON format. Please check syntax.' });
                return;
            }

            // 2. Structural Validation (D1-D4 Sim)
            // D1: Provenance - runner_id and env_hash are critical
            const d1_provenance = !!(manifest.runner_id && manifest.env_hash);

            // D2: Lifecycle - events array must exist and have content
            const d2_lifecycle = !!(manifest.events && Array.isArray(manifest.events) && manifest.events.length > 0);

            // D3: Arbitration - evidence pointers must be present
            const d3_arbitration = !!(manifest.evidence_pointers || manifest.pointers);

            // D4: Interop - protocol stack defined
            const d4_interop = !!(manifest.protocol_stack || manifest.interop);

            // Valid if basic provenance and lifecycle are present (simulated logic)
            const isValid = d1_provenance && d2_lifecycle;

            setValidationResult({
                valid: isValid,
                error: isValid ? undefined : 'Manifest incomplete. See checklist.',
                d1: d1_provenance,
                d2: d2_lifecycle,
                d3: d3_arbitration,
                d4: d4_interop
            });

        } catch {
            setValidationResult({ valid: false, error: 'Unexpected error during analysis.' });
        }
    };

    return (
        <section className="mb-16">
            <h2 className="text-lg font-bold text-mplp-text mb-6">Dispute Prep Tool</h2>
            <div className="bg-mplp-dark-soft/30 border border-mplp-border/30 rounded-2xl p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Inputs */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-2">
                                Evidence Source
                            </label>
                            <textarea
                                className="w-full h-40 bg-mplp-dark-bg border border-mplp-border/40 rounded-lg p-4 font-mono text-xs text-mplp-text focus:border-mplp-blue-soft focus:outline-none resize-none"
                                placeholder='Paste Manifest JSON here...'
                                data-testid="adjudication-input-manifest"
                                value={manifestInput}
                                onChange={(e) => setManifestInput(e.target.value)}
                            ></textarea>
                            <p className="text-[10px] text-mplp-text-muted mt-2">
                                Paste your <code>manifest.json</code> content. We will check for D1-D4 completeness locally.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-2">
                                    Ruleset ID
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-mplp-dark-bg border border-mplp-border/40 rounded-lg p-3 font-mono text-sm text-mplp-text"
                                    placeholder="e.g. ruleset-v2.0.1"
                                    data-testid="adjudication-input-ruleset"
                                    value={rulesetId}
                                    onChange={(e) => setRulesetId(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-mplp-text-muted mb-2">
                                    Release Build
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-mplp-dark-bg border border-mplp-border/40 rounded-lg p-3 font-mono text-sm text-mplp-text"
                                    placeholder="e.g. rc-2026..."
                                    data-testid="adjudication-input-build"
                                    value={releaseBuild}
                                    onChange={(e) => setReleaseBuild(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="w-full py-3 bg-mplp-blue-soft/10 text-mplp-blue-soft font-bold rounded-lg border border-mplp-blue-soft/20 hover:bg-mplp-blue-soft/20 transition-colors"
                            data-testid="adjudication-fail-closed"
                            onClick={handleAnalyze}
                        >
                            Analyze Evidence (Client-side)
                        </button>
                        {validationResult?.error && (
                            <p className="text-xs text-red-400 mt-2 font-bold animate-pulse">
                                ⚠️ {validationResult.error}
                            </p>
                        )}
                    </div>

                    {/* Checklist Output */}
                    <div className="bg-glass rounded-xl p-6 border border-mplp-border/20">
                        <h3 className="text-sm font-bold text-mplp-text mb-4">Preparation Checklist</h3>
                        <div className="space-y-3">
                            <ChecklistItem
                                label="D1: Provenance"
                                sublabel="runner_id, env_hash present"
                                testid="adjudication-checklist-d1"
                                status={validationResult?.d1}
                            />
                            <ChecklistItem
                                label="D2: Lifecycle"
                                sublabel="Trace timeline consistent"
                                testid="adjudication-checklist-d2"
                                status={validationResult?.d2}
                            />
                            <ChecklistItem
                                label="D3: Arbitration"
                                sublabel="Dispute pointers valid"
                                testid="adjudication-checklist-d3"
                                status={validationResult?.d3}
                            />
                            <ChecklistItem
                                label="D4: Interop"
                                sublabel="Protocol stack defined"
                                testid="adjudication-checklist-d4"
                                status={validationResult?.d4}
                            />
                        </div>
                        {validationResult?.valid && (
                            <div className="mt-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-xs text-green-400 font-bold text-center">
                                    ✅ Evidence Structure Valid
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ChecklistItem({ label, sublabel, testid, status }: { label: string, sublabel: string, testid: string, status?: boolean }) {
    let iconColor = "text-mplp-text-muted/40";
    let iconContent = null;
    let borderColor = "border-mplp-text-muted/40";

    if (status === true) {
        iconColor = "text-green-400";
        borderColor = "border-green-400";
        iconContent = "✓";
    } else if (status === false) {
        iconColor = "text-red-400";
        borderColor = "border-red-400";
        iconContent = "✕";
    }

    return (
        <div className="flex items-start gap-3" data-testid={testid}>
            <div className={`w-4 h-4 rounded-full border ${borderColor} mt-0.5 flex items-center justify-center text-[10px] font-bold ${iconColor}`}>
                {iconContent}
            </div>
            <div>
                <p className={`text-sm font-bold ${status === true ? 'text-green-400' : 'text-mplp-text-muted'}`}>{label}</p>
                <p className="text-xs text-mplp-text-muted/60">{sublabel}</p>
            </div>
        </div>
    );
}
