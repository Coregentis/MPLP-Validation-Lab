#!/usr/bin/env tsx
/**
 * Surface Coverage Auditor - Step 1: Page Contracts Generator (v2 - Data Dependencies)
 * 
 * Analyzes page.tsx files to extract loader dependencies AND data dependencies.
 * 
 * Output: audit/surface/page-contracts.json
 * 
 * Usage: npx tsx scripts/audit/surface/generate-page-contracts.ts
 */

import fs from 'fs';
import path from 'path';

interface LoaderDependency {
    loader_name: string;
    loader_file: string;
    data_sources: string[];
}

interface DataDependencies {
    fs_reads: string[];      // readFileSync, fs.promises.readFile, glob patterns
    api_calls: string[];     // fetch('/api/...') patterns
    lib_calls: string[];     // load*, get*, list* function calls
}

interface PageContract {
    route_path: string;
    file_path: string;
    segment_group: string;
    is_dynamic: boolean;
    dynamic_params: string[];
    loader_chain: LoaderDependency[];
    data_dependencies: DataDependencies;
    explicit_no_data: boolean;
    required_entities: string[];
    required_links: string[];
    forbidden_patterns: string[];
    notes: string;
}

interface ContractsInventory {
    generated_at: string;
    total_contracts: number;
    contracts: PageContract[];
}

// Known loader mappings (static analysis hints)
const LOADER_MAPPINGS: Record<string, { file: string; sources: string[] }> = {
    'loadRuleset': { file: 'lib/rulesets/loadRuleset.ts', sources: ['data/rulesets/', 'public/_data/v2/rulesets/'] },
    'getRuleset': { file: 'lib/rulesets/loadRuleset.ts', sources: ['data/rulesets/', 'public/_data/v2/rulesets/'] },
    'loadRunDetail': { file: 'lib/runs/load-run-detail.ts', sources: ['public/_data/unified/runs/', 'public/_data/v1/runs/'] },
    'loadRunDetailV2': { file: 'lib/unified/load-run-detail-v2.ts', sources: ['public/_data/unified/runs/'] },
    'getRelease': { file: 'lib/releases/loadRelease.ts', sources: ['releases/unified/'] },
    'listUniqueReleases': { file: 'lib/releases/loadRelease.ts', sources: ['releases/unified/'] },
    'loadV1Guarantees': { file: 'app/guarantees/page.tsx', sources: ['governance/LIFECYCLE_GUARANTEES.yaml'] },
    'loadV2Guarantees': { file: 'app/guarantees/page.tsx', sources: ['public/_data/v2/rulesets/ruleset-v2.0.0.json'] },
    'loadRunset': { file: 'lib/runsets/loadRunset.ts', sources: ['public/_data/unified/runsets/'] },
    'getVersionStripModel': { file: 'lib/unified/version-strip-model.ts', sources: ['public/_meta/lab-manifest.json'] },
};

// Required entities by segment type
const REQUIRED_ENTITIES: Record<string, string[]> = {
    'runs': ['provenance', 'determinism', 'adjudication', 'verdict_badge'],
    'rulesets': ['clauses OR golden_flows', 'evidence_pointers', 'ruleset_version'],
    'releases': ['seal_status', 'evidence_files', 'build_policy'],
    'runsets': ['member_runs', 'substrate_info'],
    'guarantees': ['lg_list OR clause_list', 'ssot_notice'],
    'governance': ['policy_list', 'nav_links'],
    'policies': ['policy_content', 'back_link'],
    'adjudication': ['run_data', 'adjudication_result'],
    'examples': ['substrate_info', 'code_samples'],
};

// Required links by segment type
const REQUIRED_LINKS: Record<string, string[]> = {
    'runs': ['back_to_list', 'evidence_tab', 'replay_tab'],
    'rulesets': ['back_to_list', 'ruleset_version_link'],
    'releases': ['back_to_list', 'evidence_download'],
    'runsets': ['back_to_list', 'member_run_links'],
    'guarantees': ['ruleset_link', 'policies_link'],
    'governance': ['policy_subpages'],
    'policies': ['back_to_policies'],
};

// Forbidden patterns
const FORBIDDEN_PATTERNS = [
    'TODO',
    'FIXME',
    'Coming soon',
    'Under construction',
    'Lorem ipsum',
    'Not implemented',
    'Clause 1 stub',
];

// Static pages that don't need data (explicit_no_data = true)
const STATIC_ONLY_PAGES = [
    '/about',
    '/methodology',
    '/builder',
    '/audit',
    '/validation',
    '/validation/samples',
];

function extractLoaders(content: string): LoaderDependency[] {
    const loaders: LoaderDependency[] = [];

    for (const [loaderName, info] of Object.entries(LOADER_MAPPINGS)) {
        if (content.includes(loaderName)) {
            loaders.push({
                loader_name: loaderName,
                loader_file: info.file,
                data_sources: info.sources,
            });
        }
    }

    return loaders;
}

function extractDataDependencies(content: string): DataDependencies {
    const deps: DataDependencies = {
        fs_reads: [],
        api_calls: [],
        lib_calls: [],
    };

    // === FS Reads ===
    // Check for fs imports
    if (content.includes("from 'fs'") || content.includes('from "fs"')) {
        if (content.includes('readFileSync')) {
            deps.fs_reads.push('readFileSync (fs module)');
        }
        if (content.includes('existsSync')) {
            deps.fs_reads.push('existsSync (fs check)');
        }
    }

    // readFileSync patterns with path
    const fsReadPatterns = [
        /readFileSync\s*\(\s*['"`]([^'"`]+)['"`]/g,
        /readFileSync\s*\([^)]*path\.join/g,
    ];
    for (const pattern of fsReadPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            deps.fs_reads.push(...matches.map(m => m.replace(/\s+/g, ' ').slice(0, 60)));
        }
    }

    // YAML/JSON parsing (indicates file reading)
    if (content.includes('yaml.parse') || content.includes('YAML.parse')) {
        deps.fs_reads.push('yaml.parse (YAML file read)');
    }
    if (content.includes('JSON.parse') && content.includes('readFileSync')) {
        deps.fs_reads.push('JSON.parse (JSON file read)');
    }

    // === API Calls ===
    // fetch('/api/...') patterns
    const fetchPatterns = [
        /fetch\s*\(\s*['"`](\/api\/[^'"`]+)['"`]/g,
        /fetch\s*\(\s*`\/api\/[^`]+`/g,
    ];
    for (const pattern of fetchPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            deps.api_calls.push(match[1] || match[0].slice(0, 50));
        }
    }

    // === Lib Calls ===
    // load*, get*, list* function calls (broader detection)
    const libCallPatterns = [
        /\b(load[A-Z][a-zA-Z0-9]*)\s*\(/g,
        /\b(get[A-Z][a-zA-Z0-9]*)\s*\(/g,
        /\b(list[A-Z][a-zA-Z0-9]*)\s*\(/g,
        /\b(fetch[A-Z][a-zA-Z0-9]*)\s*\(/g,
    ];
    const seenCalls = new Set<string>();
    for (const pattern of libCallPatterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const funcName = match[1];
            // Skip common false positives
            if (['getServerSession', 'getStaticProps', 'getServerSideProps', 'fetchData'].includes(funcName)) continue;
            if (!seenCalls.has(funcName)) {
                seenCalls.add(funcName);
                deps.lib_calls.push(funcName);
            }
        }
    }

    // Also check for component-level data fetching
    if (content.includes('useEffect') && content.includes('fetch')) {
        deps.api_calls.push('useEffect + fetch (client-side)');
    }

    return deps;
}

function analyzePageFile(filePath: string, routePath: string): PageContract {
    const content = fs.readFileSync(filePath, 'utf-8');
    const dynamicParams = routePath.match(/\[([^\]]+)\]/g)?.map(m => m.replace(/[\[\]]/g, '')) || [];
    const segmentGroup = routePath.split('/').filter(Boolean).find(s => !s.startsWith('[')) || 'root';

    const loaders = extractLoaders(content);
    const dataDeps = extractDataDependencies(content);

    // Determine if this page is static-only
    const isStaticOnly = STATIC_ONLY_PAGES.includes(routePath);

    // Generate notes
    const hasAnyData = loaders.length > 0 ||
        dataDeps.fs_reads.length > 0 ||
        dataDeps.api_calls.length > 0 ||
        dataDeps.lib_calls.length > 0;

    let notes = '';
    if (!hasAnyData && !isStaticOnly && dynamicParams.length > 0) {
        notes = 'Dynamic page with no detected data deps - needs manual review or explicit_no_data';
    }

    return {
        route_path: routePath,
        file_path: filePath,
        segment_group: segmentGroup,
        is_dynamic: dynamicParams.length > 0,
        dynamic_params: dynamicParams,
        loader_chain: loaders,
        data_dependencies: dataDeps,
        explicit_no_data: isStaticOnly,
        required_entities: REQUIRED_ENTITIES[segmentGroup] || ['page_content'],
        required_links: REQUIRED_LINKS[segmentGroup] || ['back_link'],
        forbidden_patterns: FORBIDDEN_PATTERNS,
        notes,
    };
}

async function generateContracts(): Promise<ContractsInventory> {
    // Read source routes
    const sourceRoutesPath = path.join(process.cwd(), 'audit/surface/routes.source.json');
    if (!fs.existsSync(sourceRoutesPath)) {
        throw new Error('routes.source.json not found. Run scan-routes-source.ts first.');
    }

    const sourceRoutes = JSON.parse(fs.readFileSync(sourceRoutesPath, 'utf-8'));
    const contracts: PageContract[] = [];

    for (const route of sourceRoutes.routes) {
        if (route.kind !== 'page') continue;

        const contract = analyzePageFile(route.file_path, route.route_path);
        contracts.push(contract);
    }

    contracts.sort((a, b) => a.route_path.localeCompare(b.route_path));

    return {
        generated_at: new Date().toISOString(),
        total_contracts: contracts.length,
        contracts,
    };
}

async function main() {
    console.log('🔍 Surface Coverage Auditor - Page Contracts Generator (v2 - Data Dependencies)');
    console.log('================================================================================\n');

    const inventory = await generateContracts();

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'audit/surface');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'page-contracts.json');
    fs.writeFileSync(outputPath, JSON.stringify(inventory, null, 2));

    console.log(`📊 Total Page Contracts: ${inventory.total_contracts}`);
    console.log('');

    // Summary stats
    const withLoaders = inventory.contracts.filter(c => c.loader_chain.length > 0).length;
    const withFsReads = inventory.contracts.filter(c => c.data_dependencies.fs_reads.length > 0).length;
    const withApiCalls = inventory.contracts.filter(c => c.data_dependencies.api_calls.length > 0).length;
    const withLibCalls = inventory.contracts.filter(c => c.data_dependencies.lib_calls.length > 0).length;
    const explicitNoData = inventory.contracts.filter(c => c.explicit_no_data).length;

    console.log('📁 Data Dependency Coverage:');
    console.log(`   With Loaders: ${withLoaders}`);
    console.log(`   With FS Reads: ${withFsReads}`);
    console.log(`   With API Calls: ${withApiCalls}`);
    console.log(`   With Lib Calls: ${withLibCalls}`);
    console.log(`   Explicit No Data: ${explicitNoData}`);

    // Dynamic pages needing review
    const needsReview = inventory.contracts.filter(c => c.notes.includes('needs manual review'));
    if (needsReview.length > 0) {
        console.log('\n⚠️  Dynamic pages needing manual review:');
        for (const c of needsReview) {
            console.log(`   ${c.route_path}`);
        }
    } else {
        console.log('\n✅ All dynamic pages have data dependencies or explicit_no_data');
    }

    console.log(`\n✅ Output: ${outputPath}`);
}

main().catch(console.error);
