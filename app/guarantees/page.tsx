/**
 * Lifecycle Guarantees Index Page
 * 
 * SSOT: governance/LIFECYCLE_GUARANTEES.yaml
 * 
 * TERMINOLOGY:
 *   - External display: LG-01 ~ LG-05 (Lifecycle Guarantees)
 *   - Internal ID: gf-01 ~ gf-05 (frozen, unchanged)
 *   - These are ADJUDICATION TARGETS, not test scenarios
 *   - Test scenarios are FLOW-01~05 in main repo
 * 
 * IMPORTANT: This page is NON-NORMATIVE.
 * For authoritative protocol definitions, see the MPLP Protocol.
 */

import Link from 'next/link';
import type { Metadata } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'yaml';

const LAB_CANONICAL_HOST = 'https://lab.mplp.io';

export const metadata: Metadata = {
    title: 'Lifecycle Guarantees — MPLP Validation Lab',
    description: 'Lifecycle Guarantees (LG-01 ~ LG-05) overview. Non-normative guide to MPLP lifecycle invariants. ruleset-1.0 performs presence-level adjudication.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/guarantees`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

interface Guarantee {
    id: string;
    internal_id: string;
    name: string;
    description: string;
    strength: string;
    evidence_hint: string[];
    not_evaluated: string;
    ruleset_version: string;
}

interface GuaranteesData {
    metadata: {
        schema_version: string;
        freeze_tag: string;
        ruleset_ref: string;
        strength: string;
    };
    guarantees: Guarantee[];
}

function loadGuarantees(): GuaranteesData {
    const ssotPath = join(process.cwd(), 'governance', 'LIFECYCLE_GUARANTEES.yaml');
    const content = readFileSync(ssotPath, 'utf-8');
    return yaml.parse(content) as GuaranteesData;
}

export default function GuaranteesPage() {
    const data = loadGuarantees();
    const guarantees = data.guarantees;
    const freezeTag = data.metadata.freeze_tag;
    const rulesetRef = data.metadata.ruleset_ref;
    const strength = data.metadata.strength;

    return (
        <div className="pt-8">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Scope & Invariants</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Lifecycle Guarantees</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Lifecycle Guarantees (LG-01 ~ LG-05) are adjudication targets. This is a non-normative guide to what each guarantee evaluates under <code className="font-mono text-sm">{rulesetRef}</code>.
                </p>
            </div>

            {/* SSOT Notice */}
            <div className="mb-8 p-3 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <p className="text-xs text-blue-400">
                    📊 <strong>SSOT</strong>: <code className="bg-zinc-800 px-1 rounded">governance/LIFECYCLE_GUARANTEES.yaml</code>
                    <span className="ml-2 text-zinc-500">Frozen at {freezeTag}</span>
                </p>
            </div>

            {/* Disclaimer */}
            <div className="mb-10 pl-4 border-l-2 border-amber-500/30">
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-amber-500 font-semibold uppercase tracking-wider text-xs mr-2">Non-Normative</strong>
                    For authoritative definitions, see the <a href="https://docs.mplp.io" className="text-mplp-blue-soft hover:underline">MPLP Protocol</a>.
                </p>
            </div>

            {/* Terminology Notice */}
            <div className="mb-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                <p className="text-xs text-mplp-text-muted">
                    <strong className="text-mplp-text">Terminology:</strong> LG = Lifecycle Guarantee (adjudication target).
                    FLOW = Test Scenario (main repo). These are distinct namespaces.
                </p>
            </div>

            {/* Ruleset Strength Block */}
            <div className="mb-12 p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Ruleset</span>
                        <span className="text-mplp-text font-mono">{rulesetRef}</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Strength</span>
                        <span className="text-amber-400 font-bold">{strength}</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Adjudicates</span>
                        <span className="text-mplp-text">Evidence presence + integrity anchors</span>
                    </div>
                </div>
                <p className="text-xs text-mplp-text-muted mt-4 pt-4 border-t border-mplp-border/20">
                    Structural and invariant-level evaluation requires versioned ruleset upgrades.
                </p>
            </div>

            {/* Guarantee List - Now SSOT Driven */}
            <div className="space-y-4">
                {guarantees.map((lg) => (
                    <div
                        key={lg.id}
                        className="group p-6 rounded-2xl border border-mplp-border/30 hover:border-mplp-blue-soft/30 bg-transparent hover:bg-mplp-blue-soft/5 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h2 className="text-lg font-bold text-mplp-text group-hover:text-mplp-blue-soft transition-colors flex items-center gap-3">
                                <span className="font-mono text-mplp-blue-soft/80 text-sm tracking-widest">{lg.id}</span>
                                {lg.name}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-mplp-dark-soft border border-mplp-border/40 rounded text-mplp-text-muted">
                                    {lg.strength}
                                </span>
                            </div>
                        </div>
                        <p className="text-mplp-text-muted mb-4 text-sm leading-relaxed">{lg.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Evidence Hint</span>
                                <span className="font-mono text-mplp-text-muted/80 break-all">
                                    {lg.evidence_hint.join(', ')}
                                </span>
                            </div>
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Not Evaluated</span>
                                <span className="text-mplp-text-muted/60 italic">{lg.not_evaluated}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Links */}
            <div className="mt-12 flex flex-wrap gap-4">
                <Link
                    href="/policies/contract"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-mplp-dark-soft hover:bg-mplp-dark-soft/80 text-mplp-text font-bold rounded-lg transition border border-mplp-border/40 text-xs uppercase tracking-wider"
                >
                    Evidence Contract →
                </Link>
                <Link
                    href="/rulesets"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-transparent hover:bg-mplp-dark-soft/40 text-mplp-text-muted hover:text-mplp-text font-bold rounded-lg transition border border-mplp-border/40 text-xs uppercase tracking-wider"
                >
                    View Rulesets →
                </Link>
            </div>
        </div>
    );
}
