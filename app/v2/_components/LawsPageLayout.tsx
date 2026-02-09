
import React from 'react';
import fs from 'fs';
import path from 'path';
import { PAGE_BINDINGS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';

async function getRuleset() {
    try {
        const rulesetPath = path.join(process.cwd(), 'public/_data/v2/rulesets/ruleset-v2.0.0.json');
        if (!fs.existsSync(rulesetPath)) return null;
        const content = fs.readFileSync(rulesetPath, 'utf-8');
        return JSON.parse(content);
    } catch {
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
