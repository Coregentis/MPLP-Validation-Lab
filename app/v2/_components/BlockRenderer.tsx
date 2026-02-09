
import React from 'react';
import { COMPONENTS, TOKENS } from '../_ssot/ux.generated';

// Simple Dot-Notation Resolver
function resolveDataBinding(context: unknown, path: string): unknown {
    if (!path || !context) return undefined;
    return path.split('.').reduce<unknown>((acc, part) => {
        if (acc && typeof acc === 'object' && part in acc) {
            return (acc as Record<string, unknown>)[part];
        }
        return undefined;
    }, context);
}

import { VerdictBadge } from './blocks/VerdictBadge';
import { DisclaimerBanner } from './blocks/DisclaimerBanner';
import { InteropGraph } from './blocks/InteropGraph';
import { DisputePanel } from './blocks/DisputePanel';
import { EvidenceList } from './blocks/EvidenceList';
import { ManifestViewer } from './blocks/ManifestViewer';
import { ClauseList } from './blocks/ClauseList';
import { RegMappingGrid } from './blocks/RegMappingGrid';
import { ProvenanceCard } from './blocks/ProvenanceCard';

import { RoleSelector } from './blocks/RoleSelector';
import { HeroBlock } from './blocks/HeroBlock';
import { StartHero } from './blocks/StartHero';
import { HomeHero } from './blocks/HomeHero';
import { HomePrimaryCtas } from './blocks/HomePrimaryCtas';
import { HomeStatsRow } from './blocks/HomeStatsRow';
import { HomeAuditBanner } from './blocks/HomeAuditBanner';
import { HomeQuickStart } from './blocks/HomeQuickStart';
import { HomeResourcesMatrix } from './blocks/HomeResourcesMatrix';

// Minimal Component Map (Registry Pattern)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    VerdictBadge: VerdictBadge,
    DisclaimerBanner: DisclaimerBanner,
    InteropGraph: InteropGraph,
    DisputePanel: DisputePanel,
    EvidenceList: EvidenceList,
    ManifestViewer: ManifestViewer,
    ProvenanceCard: ProvenanceCard,
    RoleSelector: RoleSelector,
    HeroBlock: HeroBlock,
    StartHero: StartHero,
    ClauseList: ClauseList,
    RegMappingGrid: RegMappingGrid,
    HomeHero: HomeHero,
    HomePrimaryCtas: HomePrimaryCtas,
    HomeStatsRow: HomeStatsRow,
    HomeAuditBanner: HomeAuditBanner,
    HomeQuickStart: HomeQuickStart,
    HomeResourcesMatrix: HomeResourcesMatrix,
};

// Helper: Pick Tokens
function pickTokens(allTokens: Record<string, string>, required?: string[]) {
    const subset: Record<string, string> = {};
    if (required) {
        required.forEach(k => { if (allTokens[k]) subset[k] = allTokens[k]; });
    }
    return subset;
}

interface BlockRendererProps {
    blockId: string;
    context: {
        projection?: unknown;
        ruleset?: unknown;
        ssot?: unknown;
        ptr?: unknown; // Start of ptr context
    };
}

export function BlockRenderer({ blockId, context }: BlockRendererProps) {
    // 1. Lookup Block Definition from SSOT
    const blockDef = COMPONENTS.blocks.find(b => b.block_id === blockId);

    if (!blockDef) {
        console.warn(`BlockRenderer: Unknown block_id "${blockId}"`);
        return null;
    }

    // 2. Resolve React Component
    const Component = COMPONENT_MAP[blockDef.component];
    if (!Component) {
        console.warn(`BlockRenderer: Implementation not found for "${blockDef.component}"`);
        return <div style={{ color: 'red' }}>[Missing Component: {blockDef.component}]</div>;
    }

    // 3. Data Binding
    let data = undefined;
    if (blockDef.data_binding) {
        data = resolveDataBinding(context, blockDef.data_binding);
    }

    // 4. Token Injection (Whitelist Only via SSOT)
    const tokens = pickTokens(TOKENS, blockDef.required_tokens);

    // 5. Policy Injection (For Component internal guards)
    const policy = {
        hardcoded: blockDef.hardcoded_text_policy,
        allowedLiterals: blockDef.allowed_literals || [],
        requiredTokens: blockDef.required_tokens || []
    };

    return (
        <section data-block={blockId} className="block-container">
            <Component
                data={data}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                context={context as any} // Pass full context for deep linking e.g. ctx.ptr
                tokens={tokens}
                policy={policy}
            />
        </section>
    );
}
