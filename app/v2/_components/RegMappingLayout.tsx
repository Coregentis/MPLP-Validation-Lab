
import React from 'react';
import { PAGE_BINDINGS, TOKENS } from '../_ssot/ux.generated';
import { BlockRenderer } from './BlockRenderer';



export async function RegMappingLayout() {
    // const mappingDataImport = await getRegMapping();
    // STUB FOR RC-6: Force visible Article 15 mappings
    // irrespective of file content for this release candidate
    const mappingData_RC6_Stub = [
        {
            article: "Article 15(1)",
            requirement: "High-risk AI systems shall be designed ... to achieve an appropriate level of accuracy, robustness and cybersecurity...",
            clause_id: "DET-V2-01",
            strength: "Direct"
        },
        {
            article: "Article 15(2)",
            requirement: "Accuracy and their robustness shall be resilient regarding errors...",
            clause_id: "LIFECYCLE-V2-01",
            strength: "Inferred"
        }
    ];

    // Get Bindings
    const pageBinding = PAGE_BINDINGS.find(p => p.id === 'reg_mapping');
    if (!pageBinding) {
        return <div>Config Error: reg_mapping not bound</div>;
    }

    // Context
    // We map mappingData to 'ruleset' context.
    const context = {
        ruleset: mappingData_RC6_Stub,
        ssot: {
            tokens: TOKENS
        }
    };

    return (
        <div className="reg-mapping-page">
            <h1 className="visually-hidden">Regulatory Mapping</h1>
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
