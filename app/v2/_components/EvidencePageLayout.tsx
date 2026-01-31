
import React from 'react';
import { notFound } from 'next/navigation';
import { PAGE_BINDINGS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';

async function getProjection(runId: string) {
    try {
        const data = await import(`../../public/_data/v2/runs/${runId}.json`);
        return data.default;
    } catch (e) {
        return null;
    }
}

export async function EvidencePageLayout({ runId, ptr }: { runId: string, ptr?: string }) {
    const projectionRoot = await getProjection(runId);

    if (!projectionRoot || !projectionRoot.data) {
        notFound();
    }

    const projection = projectionRoot.data;

    // Get Bindings
    const pageBinding = PAGE_BINDINGS.find(p => p.id === 'evidence_room');
    if (!pageBinding) {
        return <div>Config Error: evidence_room not bound</div>;
    }

    // Context
    const context = {
        projection: projection,
        ptr: ptr
    };

    return (
        <div className="evidence-room">
            <h1 className="visually-hidden">Evidence Room: {runId}</h1>
            <div className="blocks-container">
                {pageBinding.blocks.map(blockId => (
                    <BlockRenderer
                        key={blockId}
                        blockId={blockId}
                        context={context}
                    />
                ))}
            </div>
        </div>
    );
}
