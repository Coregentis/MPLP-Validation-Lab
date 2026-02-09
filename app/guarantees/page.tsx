/**
 * Lifecycle Guarantees Index Page — V1/V2 Unified View
 * 
 * SSOT:
 *   - V1: governance/LIFECYCLE_GUARANTEES.yaml (LG-01~05 GoldenFlow)
 *   - V2: public/_data/v2/rulesets/ruleset-v2.0.0.json (Baseline Clauses)
 * 
 * TERMINOLOGY:
 *   - V1 (Legacy): LG-01 ~ LG-05 (GoldenFlow, presence-level)
 *   - V2: PROV-V2-*, LIFECYCLE-V2-*, TRUST-V2-*, DET-V2-*, METADATA-V2-*
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
    description: 'Lifecycle Guarantees (V1 GoldenFlow + V2 Deterministic) overview. Non-normative guide to MPLP lifecycle invariants.',
    alternates: {
        canonical: `${LAB_CANONICAL_HOST}/guarantees`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

// ============== V1 Types & Loader ==============
interface V1Guarantee {
    id: string;
    internal_id: string;
    name: string;
    description: string;
    strength: string;
    evidence_hint: string[];
    not_evaluated: string;
    ruleset_version: string;
}

interface V1GuaranteesData {
    metadata: {
        schema_version: string;
        freeze_tag: string;
        ruleset_ref: string;
        strength: string;
    };
    guarantees: V1Guarantee[];
}

function loadV1Guarantees(): V1GuaranteesData {
    const ssotPath = join(process.cwd(), 'governance', 'LIFECYCLE_GUARANTEES.yaml');
    const content = readFileSync(ssotPath, 'utf-8');
    return yaml.parse(content) as V1GuaranteesData;
}

// ============== V2 Types & Loader ==============
interface V2Clause {
    id: string;
    name: string;
    description: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    eval_type: string;
    pointer: string;
    expectation: string;
}

interface V2RulesetData {
    projection_type: string;
    data: {
        ruleset_id: string;
        name: string;
        version: string;
        description: string;
        clauses: V2Clause[];
    };
}

function loadV2Guarantees(): { ruleset: V2RulesetData['data']; clauses: V2Clause[] } {
    const ssotPath = join(process.cwd(), 'public/_data/v2/rulesets/ruleset-v2.0.0.json');
    const content = readFileSync(ssotPath, 'utf-8');
    const data = JSON.parse(content) as V2RulesetData;
    return { ruleset: data.data, clauses: data.data.clauses };
}

// ============== Page Component ==============
interface PageProps {
    searchParams: Promise<{ v?: string }>;
}

export default async function GuaranteesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const activeTab = params.v === '2' ? 'v2' : 'v1';

    const v1Data = loadV1Guarantees();
    const v2Data = loadV2Guarantees();

    return (
        <div className="pt-8">
            <div className="mb-12">
                <p className="text-xs font-bold uppercase tracking-[0.4em] text-mplp-text-muted/80 mb-3">Scope & Invariants</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-mplp-text mb-6">Lifecycle Guarantees</h1>
                <p className="max-w-2xl text-mplp-text-muted leading-relaxed">
                    Unified view of lifecycle guarantees — adjudication targets that define what the MPLP Validation Lab evaluates.
                </p>
            </div>

            {/* Version Tabs */}
            <div className="mb-8 flex gap-2" data-testid="guarantees-tabs">
                <Link
                    href="/guarantees?v=1"
                    data-testid="guarantees-tab-v1"
                    className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'v1'
                        ? 'bg-mplp-blue text-white'
                        : 'bg-mplp-dark-soft border border-mplp-border/40 text-mplp-text-muted hover:text-mplp-text hover:border-mplp-blue-soft/30'
                        }`}
                >
                    Legacy (V1)
                </Link>
                <Link
                    href="/guarantees?v=2"
                    data-testid="guarantees-tab-v2"
                    className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'v2'
                        ? 'bg-mplp-blue text-white'
                        : 'bg-mplp-dark-soft border border-mplp-border/40 text-mplp-text-muted hover:text-mplp-text hover:border-mplp-blue-soft/30'
                        }`}
                >
                    V2 — Deterministic
                </Link>
            </div>

            {/* Disclaimer */}
            <div className="mb-10 pl-4 border-l-2 border-amber-500/30" data-testid="non-normative-notice">
                <p className="text-sm text-mplp-text-muted">
                    <strong className="text-amber-500 font-semibold uppercase tracking-wider text-xs mr-2">Non-Normative</strong>
                    For authoritative definitions, see the <a href="https://docs.mplp.io" className="text-mplp-blue-soft hover:underline">MPLP Protocol</a>.
                </p>
            </div>

            {/* Conditional Content */}
            {activeTab === 'v1' ? (
                <V1Content data={v1Data} />
            ) : (
                <V2Content ruleset={v2Data.ruleset} clauses={v2Data.clauses} />
            )}

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

// ============== V1 Content Component ==============
function V1Content({ data }: { data: V1GuaranteesData }) {
    const { metadata, guarantees } = data;

    return (
        <div data-testid="guarantees-v1-content">
            {/* SSOT Notice */}
            <div className="mb-8 p-3 rounded-lg bg-blue-900/20 border border-blue-800/30" data-testid="ssot-notice-v1">
                <p className="text-xs text-blue-400">
                    📊 <strong>SSOT</strong>: <code className="bg-zinc-800 px-1 rounded">governance/LIFECYCLE_GUARANTEES.yaml</code>
                    <span className="ml-2 text-zinc-500">Frozen at {metadata.freeze_tag}</span>
                </p>
            </div>

            {/* Ruleset Strength Block */}
            <div className="mb-12 p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Ruleset</span>
                        <Link href={`/rulesets/${metadata.ruleset_ref}`} className="text-mplp-blue-soft hover:text-mplp-blue-light font-mono transition-colors">
                            {metadata.ruleset_ref}
                        </Link>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Strength</span>
                        <span className="text-amber-400 font-bold">{metadata.strength}</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Adjudicates</span>
                        <span className="text-mplp-text">Evidence presence + integrity anchors</span>
                    </div>
                </div>
            </div>

            {/* Guarantee List */}
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
        </div>
    );
}

// ============== V2 Content Component ==============
function V2Content({ ruleset, clauses }: { ruleset: V2RulesetData['data']; clauses: V2Clause[] }) {
    return (
        <div data-testid="guarantees-v2-content">
            {/* SSOT Notice */}
            <div className="mb-8 p-3 rounded-lg bg-emerald-900/20 border border-emerald-800/30" data-testid="ssot-notice-v2">
                <p className="text-xs text-emerald-400">
                    📊 <strong>SSOT</strong>: <code className="bg-zinc-800 px-1 rounded">public/_data/v2/rulesets/{ruleset.ruleset_id}.json</code>
                    <span className="ml-2 text-zinc-500">Version {ruleset.version}</span>
                </p>
            </div>

            {/* Ruleset Info Block */}
            <div className="mb-12 p-6 rounded-2xl bg-mplp-dark-soft/30 border border-mplp-border/30">
                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Ruleset</span>
                        <Link href={`/rulesets/${ruleset.ruleset_id}`} className="text-mplp-blue-soft hover:text-mplp-blue-light font-mono transition-colors">
                            {ruleset.ruleset_id}
                        </Link>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Strength</span>
                        <span className="text-emerald-400 font-bold">Deterministic</span>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-mplp-text-muted block mb-1">Clauses</span>
                        <span className="text-mplp-text">{clauses.length} baseline clauses</span>
                    </div>
                </div>
                <p className="text-xs text-mplp-text-muted mt-4 pt-4 border-t border-mplp-border/20">
                    {ruleset.description}
                </p>
            </div>

            {/* Clause List */}
            <div className="space-y-4">
                {clauses.map((clause) => (
                    <div
                        key={clause.id}
                        id={clause.id}
                        className="group p-6 rounded-2xl border border-mplp-border/30 hover:border-emerald-500/30 bg-transparent hover:bg-emerald-500/5 transition-all"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h2 className="text-lg font-bold text-mplp-text group-hover:text-emerald-400 transition-colors flex items-center gap-3">
                                <span className="font-mono text-emerald-400/80 text-sm tracking-widest">{clause.id}</span>
                                {clause.name}
                            </h2>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${clause.severity === 'CRITICAL'
                                ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                                : clause.severity === 'WARNING'
                                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                    : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                                }`}>
                                {clause.severity}
                            </span>
                        </div>
                        <p className="text-mplp-text-muted mb-4 text-sm leading-relaxed">{clause.description}</p>

                        <div className="grid md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Pointer</span>
                                <code className="font-mono text-mplp-text-muted/80 break-all text-[11px]">
                                    {clause.pointer}
                                </code>
                            </div>
                            <div className="p-3 rounded-lg bg-mplp-dark-soft/30 border border-mplp-border/20">
                                <span className="block font-bold text-mplp-text-muted uppercase tracking-wider mb-1">Expectation</span>
                                <code className="font-mono text-emerald-400/80 text-[11px]">{clause.expectation}</code>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-mplp-border/10">
                            <Link
                                href={`/rulesets/${ruleset.ruleset_id}#${clause.id}`}
                                className="text-xs text-mplp-blue-soft hover:text-mplp-blue-light transition-colors"
                            >
                                View in Ruleset →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
