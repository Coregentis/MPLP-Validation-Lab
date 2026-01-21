// Site-wide configuration
export const siteConfig = {
    name: "MPLP",
    title: "MPLP — The Agent OS Protocol",
    description:
        "Multi-Agent Lifecycle Protocol: The vendor-neutral, observable, governed lifecycle protocol for AI agents.",
    url: "https://www.mplp.io",
    ogImage: "/images/og-image.png",
    links: {
        github: "https://github.com/Coregentis/MPLP-Protocol",
        docs: "https://docs.mplp.io",
        twitter: "https://x.com/mplpprotocol",
    },
    keywords: [
        "Agent OS Protocol",
        "Multi-Agent",
        "MPLP",
        "Observable",
        "Governed",
        "Vendor-neutral",
        "Artificial Intelligence",
        "Machine Learning",
        "AI Agent",
        "AI protocol",
        "AI framework",
    ],
};

// Centralized documentation URLs - single source of truth
// MUST match actual docs.mplp.io navigation structure (verified against /docs/docs/*)
export const DOCS_URLS = {
    // Entry points
    home: "https://docs.mplp.io",
    overview: "https://docs.mplp.io/docs/introduction/mplp-v1.0-protocol-overview",

    // Architecture - /docs/docs/specification/architecture/*
    architecture: "https://docs.mplp.io/docs/specification/architecture",
    l1ToL4: "https://docs.mplp.io/docs/specification/architecture/l1-l4-architecture-deep-dive",
    l1CoreProtocol: "https://docs.mplp.io/docs/specification/architecture/l1-core-protocol",
    l4IntegrationInfra: "https://docs.mplp.io/docs/specification/architecture/l4-integration-infra",
    kernelDuties: "https://docs.mplp.io/docs/specification/architecture/cross-cutting-kernel-duties",

    // Modules - /docs/docs/specification/modules/*
    // Entry point
    modules: "https://docs.mplp.io/docs/specification/modules/module-interactions",
    moduleInteractions: "https://docs.mplp.io/docs/specification/modules/module-interactions",
    // Individual module pages (explicit - no path concatenation)
    contextModulePage: "https://docs.mplp.io/docs/specification/modules/context-module",
    confirmModulePage: "https://docs.mplp.io/docs/specification/modules/confirm-module",
    collabModulePage: "https://docs.mplp.io/docs/specification/modules/collab-module",
    planModulePage: "https://docs.mplp.io/docs/specification/modules/plan-module",
    dialogModulePage: "https://docs.mplp.io/docs/specification/modules/dialog-module",
    traceModulePage: "https://docs.mplp.io/docs/specification/modules/trace-module",
    roleModulePage: "https://docs.mplp.io/docs/specification/modules/role-module",
    networkModulePage: "https://docs.mplp.io/docs/specification/modules/network-module",
    extensionModulePage: "https://docs.mplp.io/docs/specification/modules/extension-module",
    coreModulePage: "https://docs.mplp.io/docs/specification/modules/core-module",

    // Runtime - /docs/docs/guides/runtime/*
    runtimeOverview: "https://docs.mplp.io/docs/guides/runtime/runtime-glue-overview",
    ael: "https://docs.mplp.io/docs/guides/runtime/ael",
    vsl: "https://docs.mplp.io/docs/guides/runtime/vsl",
    psg: "https://docs.mplp.io/docs/guides/runtime/psg",

    // Golden Flows - /docs/docs/evaluation/golden-flows/*
    goldenFlows: "https://docs.mplp.io/docs/evaluation/golden-flows",
    goldenFlowRegistry: "https://docs.mplp.io/docs/evaluation/tests/golden-flow-registry",

    // Profiles - /docs/docs/specification/profiles/*
    saProfile: "https://docs.mplp.io/docs/specification/profiles/sa-profile",
    mapProfile: "https://docs.mplp.io/docs/specification/profiles/map-profile",

    // Conformance & Tests - /docs/docs/evaluation/tests/*
    conformance: "https://docs.mplp.io/docs/evaluation/conformance",
    testsOverview: "https://docs.mplp.io/docs/evaluation/tests/test-architecture-overview",

    // Standards - /docs/docs/evaluation/standards/*
    standardsPositioning: "https://docs.mplp.io/docs/evaluation/standards/positioning",
    standardsIsoMapping: "https://docs.mplp.io/docs/evaluation/standards/iso-mapping",
    standardsNistMapping: "https://docs.mplp.io/docs/evaluation/standards/nist-mapping",

    // Guides - /docs/docs/guides/*
    guides: "https://docs.mplp.io/docs/guides",
    quickstart: "https://docs.mplp.io/docs/guides/examples/single-agent-flow",

    // SDK - /docs/docs/guides/sdk/*
    sdkDocs: "https://docs.mplp.io/docs/guides/sdk/ts-sdk-guide",

    // Governance - /docs/docs/evaluation/governance/*
    governance: "https://docs.mplp.io/docs/evaluation/governance",
    releasePolicy: "https://docs.mplp.io/docs/evaluation/governance/versioning-policy",
    contribution: "https://docs.mplp.io/docs/evaluation/governance/contributing",

    // External
    github: "https://github.com/Coregentis/MPLP-Protocol",
    community: "https://github.com/Coregentis/MPLP-Protocol/issues",
} as const;

// Repository URLs - source of truth links
// MUST point to actual repo directories
export const REPO_URLS = {
    root: "https://github.com/Coregentis/MPLP-Protocol",
    schemas: "https://github.com/Coregentis/MPLP-Protocol/tree/main/schemas",
    governance: "https://github.com/Coregentis/MPLP-Protocol/tree/main/governance",
    tests: "https://github.com/Coregentis/MPLP-Protocol/tree/main/tests",
    packages: "https://github.com/Coregentis/MPLP-Protocol/tree/main/packages",
    docs: "https://github.com/Coregentis/MPLP-Protocol/tree/main/docs",
} as const;

// Lab URLs - Evidence Verdict Gateway (4th entry point)
// Canonical host for Validation Lab
// SSOT: routes verified against Validation_Lab/components/Nav.tsx
// Website must only link stable first-level entries (no sub-routes unless frozen)
export const LAB_URLS = {
    home: "https://lab.mplp.io",
    contract: "https://lab.mplp.io/policies/contract",
    strength: "https://lab.mplp.io/policies/strength",
    guarantees: "https://lab.mplp.io/guarantees",
    runs: "https://lab.mplp.io/runs",
    rulesets: "https://lab.mplp.io/rulesets",
    // Verified stable first-level entry points for Website preview cards
    coverage: "https://lab.mplp.io/coverage",
    adjudication: "https://lab.mplp.io/adjudication",
} as const;

// Type-safe key references for components
export type DocsKey = keyof typeof DOCS_URLS;
export type RepoKey = keyof typeof REPO_URLS;

// Module URL lookup map - maps module ID to explicit DOCS_URLS key
const MODULE_DOC_KEYS: Record<string, keyof typeof DOCS_URLS> = {
    context: "contextModulePage",
    confirm: "confirmModulePage",
    collab: "collabModulePage",
    plan: "planModulePage",
    dialog: "dialogModulePage",
    trace: "traceModulePage",
    role: "roleModulePage",
    network: "networkModulePage",
    extension: "extensionModulePage",
    core: "coreModulePage",
};

// Helper for dynamic module URLs - uses explicit lookup (no path concatenation)
export function getModuleDocUrl(moduleId: string): string {
    const key = MODULE_DOC_KEYS[moduleId];
    if (key) {
        return DOCS_URLS[key];
    }
    // Fallback for unknown modules (should not happen in practice)
    console.warn(`Unknown module ID: ${moduleId}`);
    return DOCS_URLS.modules;
}

// Navbar: Strict 7 Semantic Anchors ONLY (FROZEN)
// All other pages are reachable via these anchors
export const navItems = [
    { label: "Architecture", href: "/architecture" },       // Anchor #1
    { label: "Modules", href: "/modules" },                 // Anchor #2
    { label: "Kernel Duties", href: "/kernel-duties" },     // Anchor #3
    { label: "Golden Flows", href: "/golden-flows" },       // Anchor #4
    { label: "Governance", href: "/governance/overview" },  // Anchor #5
    { label: "References", href: "/references" },           // Anchor #6
    { label: "FAQ", href: "/faq" },                         // Anchor #7
];

export const footerLinks = {
    // Column 1: SPECIFICATION (Anchors #1-4)
    specification: [
        { label: "Definition", href: "/definition" },  // Canonical anchor
        { label: "Specification Entry", href: "/specification" },  // Three-entry navigation
        { label: "Architecture", href: "/architecture" },
        { label: "Modules", href: "/modules" },
        { label: "Kernel Duties", href: "/kernel-duties" },
        { label: "Golden Flows", href: "/golden-flows" },
    ],
    // Column 2: GOVERNANCE & BOUNDARIES (Anchors #5-7)
    governance: [
        { label: "Governance", href: "/governance/overview" },
        { label: "POSIX Analogy", href: "/posix-analogy" },  // Non-normative explainer
        { label: "Validation Lab", href: "/validation-lab" },  // Evaluation entry
        { label: "References", href: "/references" },
        { label: "FAQ", href: "/faq" },
        { label: "Documentation", href: DOCS_URLS.home },
    ],
    // Column 3: EXTERNAL RESOURCES
    external: [
        { label: "GitHub Repository", href: DOCS_URLS.github },
        { label: "X (Twitter)", href: siteConfig.links.twitter },
    ],
};

