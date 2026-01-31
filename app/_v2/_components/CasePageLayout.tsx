
import React from 'react';
import { notFound } from 'next/navigation';
import { PAGE_BINDINGS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';
// This helper allows us to mock or fetch data
// Ideally we import from a generated data map
async function getProjection(runId: string) {
    try {
        const data = await import(`../../public/_data/v2/runs/${runId}.json`);
        return data.default;
    } catch (e) {
        return null;
    }
}

export async function CasePageLayout({ runId, ptr }: { runId: string, ptr?: string }) {
    const projectionRoot = await getProjection(runId);

    if (!projectionRoot || !projectionRoot.data) {
        notFound();
    }

    const projection = projectionRoot.data;

    // Get Bindings
    const pageBinding = PAGE_BINDINGS.find(p => p.id === 'case_detail');
    if (!pageBinding) {
        return <div>Config Error: case_detail not bound</div>;
    }

    // Context for BlockRenderer
    // Parse ptr if exists
    // B4: Implement unified parser. For now, pass raw string.
    const context = {
        projection: projection,
        // TODO: Add ruleset, ssot, ptr
        ptr: ptr // Raw string for now, BlockRenderer or parser can refine
    };

    return (
        <div className="case-detail-page">
            <h1 className="visually-hidden">Case Detail: {runId}</h1>
            <div className="blocks-container">
                {pageBinding.blocks.map(blockId => (
                    <BlockRenderer
                        key={blockId}
                        blockId={blockId}
                        context={context}
                    />
                ))}
            </div>

            {/* Temporary: Keep old manual content below for reference/fallback if strictness allows? 
                 User said "stepwise replacement". B5 is "Placeholder Replacement".
                 B2 is "Page-level Layouts".
                 I should USE this layout in page.tsx.
             */}
        </div>
    );
}
