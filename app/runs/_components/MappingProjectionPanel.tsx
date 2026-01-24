'use client';

import React from 'react';
import { DisclaimerBox } from '@/components/common/DisclaimerBox';

interface MappingProjectionPanelProps {
    runId: string;
    mappingIndex: RunMappingEntry | null;
}

interface RunMappingEntry {
    run_id: string;
    substrate: string;
    fingerprint_ref: string;
    fieldmap_ref: string;
    normalization_spec_ref: string;
    hash_scope_ref: string;
    equivalence_criteria_ref: string;
}

/**
 * MappingProjectionPanel
 * 
 * P2.1 Migration: Now uses DisclaimerBox for mandatory wording.
 * 
 * MANDATORY DISCLAIMER (Managed via DisclaimerBox):
 * "Mappings describe evidence projection only; they do not describe framework capability."
 */
export function MappingProjectionPanel({ runId, mappingIndex }: MappingProjectionPanelProps) {
    if (!mappingIndex) {
        return (
            <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-zinc-700 mb-2 flex items-center gap-2">
                    <span>📐</span> Mapping & Projection
                </h3>
                <p className="text-sm text-zinc-500">
                    Not indexed. This run is not currently exposed in the public mapping index.
                </p>
            </section>
        );
    }

    const refs = [
        { label: 'Fingerprint', path: mappingIndex.fingerprint_ref },
        { label: 'Fieldmap', path: mappingIndex.fieldmap_ref },
        { label: 'Normalization Spec', path: mappingIndex.normalization_spec_ref },
        { label: 'Hash Scope', path: mappingIndex.hash_scope_ref },
        { label: 'Equivalence Criteria', path: mappingIndex.equivalence_criteria_ref },
    ];

    return (
        <section className="bg-zinc-50 border border-zinc-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-zinc-700 mb-4 flex items-center gap-2">
                <span>📐</span> Mapping & Projection
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {refs.map((ref, i) => (
                    <div key={i} className="bg-white border border-zinc-100 rounded-lg p-3">
                        <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">
                            {ref.label}
                        </div>
                        <code className="text-xs text-blue-600 break-all">
                            {ref.path}
                        </code>
                    </div>
                ))}
            </div>

            <DisclaimerBox kind="projection_only" variant="zinc" />
        </section>
    );
}
