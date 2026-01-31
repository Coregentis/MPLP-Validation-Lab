
import React from 'react';
import { PAGE_BINDINGS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';

async function getRuleset() {
    try {
        const data = await import('../../public/_data/v2/rulesets/ruleset-v2.0.0.json');
        return data.default;
    } catch (e) {
        return null;
    }
}

export async function LawsPageLayout() {
    const rulesetImport = await getRuleset();
    const ruleset = rulesetImport?.data;

    // Get Bindings
    const pageBinding = PAGE_BINDINGS.find(p => p.id === 'laws');
    if (!pageBinding) {
        return <div>Config Error: laws not bound</div>;
    }

    // Context
    const context = {
        ruleset: ruleset
    };

    return (
        <div className="laws-page">
            <h1 className="visually-hidden">Laws Library</h1>
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
