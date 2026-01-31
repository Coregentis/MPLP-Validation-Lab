
import React from 'react';
import { PAGE_BINDINGS, ROLES, TOKENS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';

export function StartPageLayout() {
    // Get Bindings
    const pageBinding = PAGE_BINDINGS.find(p => p.id === 'start');
    if (!pageBinding) {
        return <div>Config Error: start not bound</div>;
    }

    // Context
    const context = {
        ssot: {
            roles: ROLES
        }
    };

    return (
        <div className="start-page">
            <h1 className="visually-hidden">{TOKENS['LIT_NAV_START']}</h1>
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
