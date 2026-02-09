#!/usr/bin/env tsx
/**
 * R1 Semantic Coverage Auditor - Page Semantic Contracts Generator
 * 
 * Generates semantic contracts for each page defining:
 * - version_scope: v1-only | v2-only | unified | version-agnostic
 * - required_sections: DOM elements that must exist
 * - required_disclaimers: Legal/boundary notices that must exist
 * - forbidden_patterns: Terms/phrases that must NOT appear
 * 
 * Output: audit/semantic/page-semantic-contracts.json
 */

import fs from 'fs';
import path from 'path';

interface RequiredSection {
    id: string;
    selector: string;           // CSS selector or text pattern
    description: string;
}

interface SSOTBinding {
    ssot_path: string;
    binding_type: 'loader' | 'api' | 'static';
}

interface PageSemanticContract {
    route: string;
    page_role: 'index' | 'detail' | 'policy' | 'explainer' | 'evidence' | 'tool';
    entities: string[];
    version_scope: 'v1-only' | 'v2-only' | 'unified' | 'version-agnostic';
    sample_params_key?: string;
    required_sections: RequiredSection[];
    required_disclaimers: string[];
    ssot_bindings: SSOTBinding[];
    forbidden_patterns: string[];
}

interface PSCInventory {
    psc_version: string;
    generator_version: string;
    generated_at: string;
    generator_signature: string;
    source_contract_version: string;
    total_contracts: number;
    contracts: PageSemanticContract[];
}

const PSC_VERSION = '1.0.0';
const GENERATOR_VERSION = '1.0.0';
const GENERATOR_SIGNATURE = 'R1-SEMANTIC-PSC-GENERATOR-V1';


const PROJECT_ROOT = process.cwd();

// ============== Page Role Mapping ==============
const PAGE_ROLES: Record<string, PageSemanticContract['page_role']> = {
    'root': 'index',
    'runs': 'index',
    'rulesets': 'index',
    'runsets': 'index',
    'releases': 'index',
    'governance': 'index',
    'policies': 'index',
    'guarantees': 'index',
    'adjudication': 'tool',
    'coverage': 'index',
    'examples': 'index',
    'gates': 'index',
    'audit': 'tool',
    'builder': 'tool',
    'about': 'explainer',
    'methodology': 'explainer',
    'validation': 'explainer',
};

// ============== Version Scope Definitions ==============
// Key pages with explicit version scope requirements
const VERSION_SCOPES: Record<string, PageSemanticContract['version_scope']> = {
    '/guarantees': 'unified',  // Must show V1 + V2
    '/rulesets': 'unified',
    '/runs': 'unified',
    '/releases': 'version-agnostic',
    '/governance': 'version-agnostic',
    '/policies': 'version-agnostic',
    '/about': 'version-agnostic',
    '/methodology': 'version-agnostic',
};

// ============== Required Sections by Page ==============
// RULE: Every page must have >= 1 required_section (unless explicit_no_sections=true)
const REQUIRED_SECTIONS: Record<string, RequiredSection[]> = {
    // === Homepage ===
    '/': [
        { id: 'page-title', selector: 'h1, [data-testid="page-title"]', description: 'Page main heading' },
        { id: 'home-primary-cta', selector: '[data-testid="home-cta"], .cta-section, a[href*="run"]', description: 'Primary call-to-action' },
    ],
    // === Tool Pages ===
    '/adjudication': [
        { id: 'page-title', selector: 'h1, [data-testid="page-title"]', description: 'Page main heading' },
        { id: 'adjudication-list', selector: '[data-testid="adjudication-list"], table, tbody', description: 'Adjudication bundles table/list' },
    ],
    // === Guarantees (unified V1+V2) ===
    '/guarantees': [
        { id: 'v1-tab', selector: '[data-testid="guarantees-tab-v1"], a[href*="v=1"]', description: 'V1 Legacy tab' },
        { id: 'v2-tab', selector: '[data-testid="guarantees-tab-v2"], a[href*="v=2"]', description: 'V2 Deterministic tab' },
        { id: 'ssot-notice', selector: '[data-testid*="ssot"], code:contains("SSOT")', description: 'SSOT attribution notice' },
    ],
    // === Releases ===
    '/releases': [
        { id: 'page-title', selector: 'h1, [data-testid="page-title"]', description: 'Page main heading' },
        { id: 'release-list', selector: '[data-testid="release-list"], .release-card, a[href*="/releases/"]', description: 'Release cards list' },
    ],
    '/releases/[build_id]': [
        { id: 'seal-status', selector: '[data-testid="seal-status"], .seal-badge, [class*="seal"]', description: 'Seal status badge' },
        { id: 'evidence-section', selector: '[data-testid="evidence-files"], .evidence-list, a[href*=".json"]', description: 'Evidence files section' },
    ],
    // === Runs ===
    '/runs': [
        { id: 'page-title', selector: 'h1, [data-testid="page-title"]', description: 'Page main heading' },
        { id: 'run-list', selector: '[data-testid="run-list"], .run-card, table, a[href*="/runs/"]', description: 'Run cards/table' },
    ],
    '/runs/[run_id]': [
        { id: 'provenance-section', selector: '[data-testid="provenance"], h2:contains("Provenance"), [class*="provenance"]', description: 'Provenance section' },
        { id: 'determinism-section', selector: '[data-testid="determinism"], h2:contains("Determinism"), [class*="determinism"]', description: 'Determinism section' },
        { id: 'verdict-badge', selector: '[data-testid="verdict"], .verdict-badge, [class*="verdict"]', description: 'Verdict badge' },
    ],
    // === Rulesets ===
    '/rulesets': [
        { id: 'page-title', selector: 'h1, [data-testid="page-title"]', description: 'Page main heading' },
        { id: 'ruleset-list', selector: '[data-testid="rulesets-unified-grid"], [data-testid="ruleset-list"], a[href*="/rulesets/"]', description: 'Ruleset cards list' },
    ],
    '/rulesets/[ruleset_id]': [
        { id: 'ruleset-header', selector: '[data-testid="ruleset-header"], h1, [class*="header"]', description: 'Ruleset header' },
        { id: 'clauses-or-flows', selector: '[data-testid="clauses"], [data-testid="golden-flows"], [class*="clause"], [class*="golden"]', description: 'Clauses or Golden Flows section' },
    ],
};

// ============== Required Disclaimers ==============
const REQUIRED_DISCLAIMERS: Record<string, string[]> = {
    '/': ['non-endorsement-banner', 'non-certification-notice'],
    '/guarantees': ['non-normative-notice'],
    '/runs': ['non-certification-notice'],
    '/runs/[run_id]': ['non-certification-notice'],
    '/releases': ['non-certification-notice'],
    '/releases/[build_id]': ['non-certification-notice'],
    '/rulesets': ['non-certification-notice'],
    '/adjudication': ['non-certification-notice'],
};

// ============== SSOT Bindings ==============
const SSOT_BINDINGS: Record<string, SSOTBinding[]> = {
    '/guarantees': [
        { ssot_path: 'governance/LIFECYCLE_GUARANTEES.yaml', binding_type: 'loader' },
        { ssot_path: 'public/_data/v2/rulesets/ruleset-v2.0.0.json', binding_type: 'loader' },
    ],
    '/rulesets': [
        { ssot_path: 'data/rulesets/', binding_type: 'loader' },
        { ssot_path: 'public/_data/v2/rulesets/', binding_type: 'loader' },
    ],
    '/releases': [
        { ssot_path: 'releases/unified/', binding_type: 'loader' },
    ],
    '/runs': [
        { ssot_path: 'public/_data/v2/runs/', binding_type: 'loader' },
    ],
};

// ============== Forbidden Patterns ==============
const GLOBAL_FORBIDDEN = [
    'TODO',
    'FIXME',
    'Coming soon',
    'Under construction',
    'Lorem ipsum',
];

const PAGE_FORBIDDEN: Record<string, string[]> = {
    '/guarantees': [
        // V2 section should NOT use V1 terminology
        'GoldenFlow in V2',
        'LG-0 in V2 context',
    ],
};

// ============== Dynamic Route Param Keys ==============
const SAMPLE_PARAMS_KEYS: Record<string, string> = {
    '/runs/[run_id]': 'run_id',
    '/runs/[run_id]/evidence': 'run_id',
    '/runs/[run_id]/replay': 'run_id',
    '/runsets/[runset_id]': 'runset_id',
    '/rulesets/[ruleset_id]': 'ruleset_id',
    '/releases/[build_id]': 'build_id',
    '/adjudication/[run_id]': 'run_id',
    '/examples/evidence-producers/[substrate]': 'substrate',
    '/rulesets/evolution/diff/[id]': 'id',
};

function inferPageRole(route: string, segmentGroup: string): PageSemanticContract['page_role'] {
    // Detail pages (have dynamic params)
    if (route.includes('[') && !route.includes('evidence') && !route.includes('replay')) {
        return 'detail';
    }
    // Evidence pages
    if (route.includes('evidence') || route.includes('replay')) {
        return 'evidence';
    }
    // Policy pages
    if (route.startsWith('/policies/')) {
        return 'policy';
    }
    // Use predefined role or default to index
    return PAGE_ROLES[segmentGroup] || 'index';
}

function inferEntities(route: string): string[] {
    const entities: string[] = [];
    if (route.includes('run')) entities.push('runs');
    if (route.includes('ruleset')) entities.push('rulesets');
    if (route.includes('runset')) entities.push('runsets');
    if (route.includes('release')) entities.push('releases');
    if (route.includes('guarantee')) entities.push('guarantees');
    if (route.includes('governance') || route.includes('policies')) entities.push('governance');
    return entities.length > 0 ? entities : ['general'];
}

async function generatePSC(): Promise<PSCInventory> {
    // Load page contracts from R0
    const contractsPath = path.join(PROJECT_ROOT, 'audit/surface/page-contracts.json');
    if (!fs.existsSync(contractsPath)) {
        throw new Error('page-contracts.json not found. Run R0 surface audit first.');
    }

    const pageContracts = JSON.parse(fs.readFileSync(contractsPath, 'utf-8'));
    const contracts: PageSemanticContract[] = [];

    for (const pc of pageContracts.contracts) {
        const route = pc.route_path;
        const segmentGroup = pc.segment_group;

        const psc: PageSemanticContract = {
            route,
            page_role: inferPageRole(route, segmentGroup),
            entities: inferEntities(route),
            version_scope: VERSION_SCOPES[route] || 'version-agnostic',
            required_sections: REQUIRED_SECTIONS[route] || [],
            required_disclaimers: REQUIRED_DISCLAIMERS[route] || [],
            ssot_bindings: SSOT_BINDINGS[route] || [],
            forbidden_patterns: [...GLOBAL_FORBIDDEN, ...(PAGE_FORBIDDEN[route] || [])],
        };

        // Add sample_params_key for dynamic routes
        if (SAMPLE_PARAMS_KEYS[route]) {
            psc.sample_params_key = SAMPLE_PARAMS_KEYS[route];
        }

        contracts.push(psc);
    }

    contracts.sort((a, b) => a.route.localeCompare(b.route));

    return {
        psc_version: PSC_VERSION,
        generator_version: GENERATOR_VERSION,
        generated_at: new Date().toISOString(),
        generator_signature: GENERATOR_SIGNATURE,
        source_contract_version: 'R0-page-contracts-v1',
        total_contracts: contracts.length,
        contracts,
    };
}

async function main() {
    console.log('🔍 R1 Semantic Auditor - PSC Generator');
    console.log('======================================\n');

    const inventory = await generatePSC();

    const outputDir = path.join(PROJECT_ROOT, 'audit/semantic');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'page-semantic-contracts.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(`📊 Total Semantic Contracts: ${inventory.total_contracts}`);
    console.log('');

    // Summary
    const byRole = new Map<string, number>();
    const byScope = new Map<string, number>();

    for (const c of inventory.contracts) {
        byRole.set(c.page_role, (byRole.get(c.page_role) || 0) + 1);
        byScope.set(c.version_scope, (byScope.get(c.version_scope) || 0) + 1);
    }

    console.log('📁 By Page Role:');
    for (const [role, count] of Array.from(byRole.entries()).sort()) {
        console.log(`   ${role}: ${count}`);
    }

    console.log('\n📁 By Version Scope:');
    for (const [scope, count] of Array.from(byScope.entries()).sort()) {
        console.log(`   ${scope}: ${count}`);
    }

    // Pages with required sections
    const withSections = inventory.contracts.filter(c => c.required_sections.length > 0);
    console.log(`\n📋 Pages with Required Sections: ${withSections.length}`);
    for (const c of withSections) {
        console.log(`   ${c.route}: ${c.required_sections.map(s => s.id).join(', ')}`);
    }

    console.log(`\n✅ Output: ${outputPath}`);
}

main().catch(console.error);
