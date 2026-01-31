/**
 * SSOT for facet keys, enums, and display rules
 * 
 * Facets are used for filtering and categorization throughout the UI.
 * All facet definitions must be centralized here.
 */

export const FACET_KEYS = {
    SUBSTRATE: 'substrate',
    VERDICT: 'verdict',
    INDEXABILITY_STATUS: 'indexability_status',
    SCENARIO: 'scenario',
    RULESET_VERSION: 'ruleset_version',
    TAGS: 'tags',
} as const;

export type FacetKey = typeof FACET_KEYS[keyof typeof FACET_KEYS];

/**
 * Indexability status facet
 */
export const INDEXABILITY_STATUSES = {
    REAL: 'INDEXABLE_REAL',
    SYNTHETIC: 'INDEXABLE_SYNTHETIC',
} as const;

export type IndexabilityStatus = typeof INDEXABILITY_STATUSES[keyof typeof INDEXABILITY_STATUSES];

/**
 * Verdict facet
 */
export const VERDICTS = {
    PASS: 'PASS',
    FAIL: 'FAIL',
} as const;

export type Verdict = typeof VERDICTS[keyof typeof VERDICTS];

/**
 * Substrate IDs
 */
export const SUBSTRATE_IDS = {
    MCP: 'mcp',
    ACP: 'acp',
    LANGCHAIN: 'langchain',
    LANGGRAPH: 'langgraph',
    AUTOGEN: 'autogen',
    SEMANTIC_KERNEL: 'semantic-kernel',
    METAGPT: 'metagpt',
    A2A: 'a2a',
} as const;

export type SubstrateId = typeof SUBSTRATE_IDS[keyof typeof SUBSTRATE_IDS];

/**
 * Display names for substrates
 */
export const SUBSTRATE_DISPLAY_NAMES: Record<SubstrateId, string> = {
    [SUBSTRATE_IDS.MCP]: 'Model Context Protocol',
    [SUBSTRATE_IDS.ACP]: 'Agent Communication Protocol',
    [SUBSTRATE_IDS.LANGCHAIN]: 'LangChain',
    [SUBSTRATE_IDS.LANGGRAPH]: 'LangGraph',
    [SUBSTRATE_IDS.AUTOGEN]: 'AutoGen',
    [SUBSTRATE_IDS.SEMANTIC_KERNEL]: 'Semantic Kernel',
    [SUBSTRATE_IDS.METAGPT]: 'MetaGPT',
    [SUBSTRATE_IDS.A2A]: 'Agent-to-Agent (A2A)',
};

/**
 * Canonical scenario identifiers
 */
export const SCENARIOS = {
    D1: 'd1',
    D2: 'd2',
    D3: 'd3',
    D4: 'd4',
} as const;

export type Scenario = typeof SCENARIOS[keyof typeof SCENARIOS];

/**
 * Display names for scenarios
 */
export const SCENARIO_DISPLAY_NAMES: Record<Scenario, string> = {
    [SCENARIOS.D1]: 'D1: Basic Success',
    [SCENARIOS.D2]: 'D2: Failure Case',
    [SCENARIOS.D3]: 'D3: Complex Multi-Step',
    [SCENARIOS.D4]: 'D4: Edge Case',
};

/**
 * Display configuration for indexability statuses
 */
export const INDEXABILITY_DISPLAY = {
    [INDEXABILITY_STATUSES.REAL]: {
        label: 'Real Validation',
        description: 'Evidence from real substrate execution with complete provenance',
        color: 'green',
        badge: 'REAL',
    },
    [INDEXABILITY_STATUSES.SYNTHETIC]: {
        label: 'Synthetic Test',
        description: 'Synthetic evidence for ruleset regression testing only',
        color: 'yellow',
        badge: 'SYNTHETIC',
    },
} as const;

/**
 * Display configuration for verdicts
 */
export const VERDICT_DISPLAY = {
    [VERDICTS.PASS]: {
        label: 'Pass',
        color: 'green',
        icon: 'check',
    },
    [VERDICTS.FAIL]: {
        label: 'Fail',
        color: 'red',
        icon: 'x',
    },
} as const;
