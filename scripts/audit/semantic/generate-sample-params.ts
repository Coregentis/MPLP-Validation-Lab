#!/usr/bin/env tsx
/**
 * R1 Semantic Coverage Auditor - Sample Params Generator
 * 
 * Generates sample parameters for dynamic routes by querying existing SSOT.
 * Ensures DOM checker can cover all dynamic pages without hardcoding.
 * 
 * Output: audit/semantic/sample-params.json
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface SampleParams {
    generated_at: string;
    params: {
        run_id: string[];
        runset_id: string[];
        ruleset_id: string[];
        build_id: string[];
        substrate: string[];
        id: string[];  // For evolution diff
    };
    route_samples: Record<string, string[]>;  // route pattern -> concrete URLs
}

const PROJECT_ROOT = process.cwd();

// Get run IDs from v2 runs directory (JSON files)
async function getRuns(): Promise<string[]> {
    const runsDir = path.join(PROJECT_ROOT, 'public/_data/v2/runs');
    if (!fs.existsSync(runsDir)) return [];

    const files = fs.readdirSync(runsDir)
        .filter(f => f.endsWith('.json') && !f.includes('.evidence.') && f !== 'index.json')
        .map(f => f.replace('.json', ''));

    // Return first 3 runs for sampling
    return files.slice(0, 3);
}

// Get runset IDs from runset-aliases.json
async function getRunsets(): Promise<string[]> {
    const aliasesPath = path.join(PROJECT_ROOT, 'public/_data/unified/runset-aliases.json');
    if (fs.existsSync(aliasesPath)) {
        const aliases = JSON.parse(fs.readFileSync(aliasesPath, 'utf-8'));
        return Object.keys(aliases).slice(0, 3);
    }

    // Fallback: look for runset JSON files
    const runsetsDir = path.join(PROJECT_ROOT, 'public/_data/unified/runsets');
    if (!fs.existsSync(runsetsDir)) return [];

    const files = fs.readdirSync(runsetsDir)
        .filter(f => f.endsWith('.json') && f !== 'index.json')
        .map(f => f.replace('.json', ''));

    return files.slice(0, 3);
}

// Get ruleset IDs from both v1 and v2 sources
async function getRulesets(): Promise<string[]> {
    const rulesets: string[] = [];

    // V1 rulesets from data/rulesets
    const v1Dir = path.join(PROJECT_ROOT, 'data/rulesets');
    if (fs.existsSync(v1Dir)) {
        const dirs = fs.readdirSync(v1Dir, { withFileTypes: true })
            .filter(d => d.isDirectory() && d.name.startsWith('ruleset-'))
            .map(d => d.name);
        rulesets.push(...dirs);
    }

    // V2 rulesets from public/_data/v2/rulesets
    const v2Index = path.join(PROJECT_ROOT, 'public/_data/v2/rulesets/index.json');
    if (fs.existsSync(v2Index)) {
        const index = JSON.parse(fs.readFileSync(v2Index, 'utf-8'));
        if (index.rulesets) {
            rulesets.push(...index.rulesets.map((r: { ruleset_id: string }) => r.ruleset_id));
        }
    }

    return [...new Set(rulesets)];
}

// Get build IDs from releases/unified
async function getReleases(): Promise<string[]> {
    const releasesDir = path.join(PROJECT_ROOT, 'releases/unified');
    if (!fs.existsSync(releasesDir)) return [];

    const dirs = fs.readdirSync(releasesDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && d.name.startsWith('rc-'))
        .map(d => d.name)
        .sort()
        .reverse();  // Latest first

    return dirs.slice(0, 3);
}

// Get substrate IDs from producers directory
async function getSubstrates(): Promise<string[]> {
    const producersDir = path.join(PROJECT_ROOT, 'producers');
    if (!fs.existsSync(producersDir)) return [];

    const dirs = fs.readdirSync(producersDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

    // Map directory names to expected slugs
    const slugMap: Record<string, string> = {
        'langgraph': 'langgraph',
        'autogen': 'autogen',
        'semantic-kernel': 'sk',
    };

    return dirs.map(d => slugMap[d] || d).filter(Boolean);
}

// Get evolution diff IDs
async function getEvolutionDiffs(): Promise<string[]> {
    // These are typically version comparisons
    return ['1.0-to-1.1', '1.1-to-1.2'];
}

async function generateSampleParams(): Promise<SampleParams> {
    console.log('📊 Generating sample params from SSOT...\n');

    const runs = await getRuns();
    const runsets = await getRunsets();
    const rulesets = await getRulesets();
    const releases = await getReleases();
    const substrates = await getSubstrates();
    const diffs = await getEvolutionDiffs();

    console.log(`   run_id: ${runs.length} samples`);
    console.log(`   runset_id: ${runsets.length} samples`);
    console.log(`   ruleset_id: ${rulesets.length} samples`);
    console.log(`   build_id: ${releases.length} samples`);
    console.log(`   substrate: ${substrates.length} samples`);
    console.log(`   id (diff): ${diffs.length} samples`);

    // Generate concrete URL samples for each dynamic route
    const routeSamples: Record<string, string[]> = {
        '/runs/[run_id]': runs.map(id => `/runs/${id}`),
        '/runs/[run_id]/evidence': runs.map(id => `/runs/${id}/evidence`),
        '/runs/[run_id]/replay': runs.map(id => `/runs/${id}/replay`),
        '/runsets/[runset_id]': runsets.map(id => `/runsets/${id}`),
        '/rulesets/[ruleset_id]': rulesets.map(id => `/rulesets/${id}`),
        '/releases/[build_id]': releases.map(id => `/releases/${id}`),
        '/adjudication/[run_id]': runs.slice(0, 1).map(id => `/adjudication/${id}`),
        '/examples/evidence-producers/[substrate]': substrates.map(id => `/examples/evidence-producers/${id}`),
        '/rulesets/evolution/diff/[id]': diffs.map(id => `/rulesets/evolution/diff/${id}`),
    };

    return {
        generated_at: new Date().toISOString(),
        params: {
            run_id: runs,
            runset_id: runsets,
            ruleset_id: rulesets,
            build_id: releases,
            substrate: substrates,
            id: diffs,
        },
        route_samples: routeSamples,
    };
}

async function main() {
    console.log('🔍 R1 Semantic Auditor - Sample Params Generator');
    console.log('=================================================\n');

    const params = await generateSampleParams();

    const outputDir = path.join(PROJECT_ROOT, 'audit/semantic');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'sample-params.json');
    fs.writeFileSync(outputPath, JSON.stringify(params, null, 2));

    console.log(`\n✅ Output: ${outputPath}`);

    // Summary of route coverage
    console.log('\n📁 Route Samples:');
    for (const [route, urls] of Object.entries(params.route_samples)) {
        console.log(`   ${route}: ${urls.length} URLs`);
    }
}

main().catch(console.error);
