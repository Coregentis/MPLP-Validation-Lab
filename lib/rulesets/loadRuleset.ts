/**
 * Rulesets Loader
 * 
 * Loads ruleset data from data/rulesets/{version}/
 * 
 * Principles:
 * - UI does NOT introduce new fields, only reads ruleset files
 * - Non-normative: just reflects what's in the rulesets
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadYamlStrict } from '@/lib/utils/yaml-loader';

const RULESETS_ROOT = path.resolve(process.cwd(), 'data/rulesets');

export interface RulesetManifest {
    id: string;
    version: string;
    source?: 'v1' | 'v2';
    kind?: 'clauses' | 'golden_flows'; // Dual-mode support
    name: string;
    status: string;
    protocol?: {
        version: string;
        upstream_commit?: string;
    };
    compatibility?: {
        evidence_pack_contract?: string;
        min_pack_version?: string;
        max_pack_version?: string;
    };
    golden_flows?: string[];
    /** v0.3+: Four-domain clauses for ruleset-1.1 */
    four_domain_clauses?: string[];
    /** v0.4+: Twelve-clause semantic invariants for ruleset-1.2 */
    clauses?: string[];
    created_at?: string;
}

export interface RequirementDef {
    id: string;
    name?: string;
    description?: string;
    severity?: string;
    evidence?: {
        artifact?: string;
        type?: string;
        locator?: string;
    };
}

export interface RulesetData {
    version: string;
    manifest?: RulesetManifest;
    requirements: Record<string, RequirementDef[]>;
    missing: string[];
}

/**
 * List all ruleset versions
 */
export function listRulesetVersions(): string[] {
    if (!fs.existsSync(RULESETS_ROOT)) return [];

    try {
        return fs.readdirSync(RULESETS_ROOT).filter((d) => {
            const p = path.join(RULESETS_ROOT, d);
            return fs.statSync(p).isDirectory();
        });
    } catch {
        return [];
    }
}

/**
 * List rulesets with summary info (Unified V1 + V2)
 */
export function listRulesets(): RulesetManifest[] {
    const results: RulesetManifest[] = [];

    // 1. Load V1 (Filesystem)
    const v1Versions = listRulesetVersions();
    for (const version of v1Versions) {
        const data = loadRuleset(version);
        if (data.manifest) {
            // Inject source if missing
            // Inject source if missing
            results.push({ ...data.manifest, source: 'v1' });
        }
    }

    // 2. Load V2 (Index JSON)
    try {
        const v2IndexPath = path.join(process.cwd(), 'public/_data/v2/rulesets/index.json');
        if (fs.existsSync(v2IndexPath)) {
            const v2Index = JSON.parse(fs.readFileSync(v2IndexPath, 'utf8'));
            if (v2Index.data && Array.isArray(v2Index.data.rulesets)) {
                v2Index.data.rulesets.forEach((rs: { ruleset_id: string; id: string; version: string; name: string; status: string; clause_count: number }) => {
                    // Try to load full details to get real clauses
                    let clauses = Array(rs.clause_count || 0).fill('placeholder');
                    const detail = loadRuleset(rs.version);

                    if (detail.manifest && detail.manifest.clauses && detail.manifest.clauses.length > 0) {
                        clauses = detail.manifest.clauses;
                    }

                    results.push({
                        id: rs.ruleset_id || rs.id,
                        version: rs.version,
                        name: rs.name,
                        status: rs.status || 'active',
                        source: 'v2',
                        kind: 'clauses',
                        clauses: clauses
                    });
                });
            }
        }
    } catch {
        console.warn('Failed to load V2 rulesets');
    }

    return results.sort((a, b) => b.version.localeCompare(a.version));
}

/**
 * Load full ruleset data
 */
export function loadRuleset(version: string): RulesetData {
    // Check if it's a V2 ruleset first
    // Refactor P4-D2: Support robust path probing
    const pathsToProbe = [
        path.join(process.cwd(), `public/_data/v2/rulesets/ruleset-v${version}.json`),
        path.join(process.cwd(), `public/_data/v2/rulesets/ruleset-${version}.json`)
    ];

    let v2Path = '';
    for (const p of pathsToProbe) {
        if (fs.existsSync(p)) {
            v2Path = p;
            break;
        }
    }

    // Strict SSOT: V2 Rulesets MUST have a bundle. No fallbacks/stubs.
    if (v2Path) {
        try {
            const raw = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
            // Adapter: Existing assets are wrapped in a 'data' property
            const bundle = raw.data ? raw.data : raw;

            // Map clauses (objects) to strings (ids) to match interface
            const clauseIds = Array.isArray(bundle.clauses)
                ? bundle.clauses.map((c: unknown) => typeof c === 'string' ? c : (c as { id: string }).id)
                : [];

            return {
                version,
                manifest: {
                    id: bundle.ruleset_id || bundle.id,
                    version: bundle.version,
                    name: bundle.name,
                    status: bundle.status || 'active',
                    source: 'v2',
                    kind: 'clauses', // V2 is always clauses
                    clauses: clauseIds
                },
                // Populate requirements using the clause objects (enriching them)
                requirements: {
                    'core-invariants': Array.isArray(bundle.clauses) ? bundle.clauses : []
                },
                missing: []
            };
        } catch {
            return {
                version,
                requirements: {},
                missing: [`v2-asset/${version} (parse error)`]
            };
        }
    }

    // Fallback to V1 loading
    const base = path.join(RULESETS_ROOT, version);

    // FIX: Canonical ID is the folder name for V1 (e.g. ruleset-1.0)
    // The previous loader might have been confusing ID vs Version
    // We try to reuse existing logic but explicitly detect kind.

    const out: RulesetData = {
        version,
        requirements: {},
        missing: [],
    };

    // Manifest
    const manifestPath = path.join(base, 'manifest.yaml');
    if (fs.existsSync(manifestPath)) {
        try {
            const m = loadYamlStrict<RulesetManifest>(manifestPath);

            // DUAL MODE LOGIC
            // If clauses exist -> kind='clauses'
            // If clauses empty AND golden_flows exist -> kind='golden_flows'
            if (m.clauses && m.clauses.length > 0) {
                m.kind = 'clauses';
            } else if (m.golden_flows && m.golden_flows.length > 0) {
                m.kind = 'golden_flows';
            } else {
                // Fallback default
                m.kind = 'clauses';
            }

            out.manifest = m;

        } catch {
            out.missing.push('manifest.yaml (parse error)');
        }
    } else {
        out.missing.push('manifest.yaml');
    }

    // Requirements
    const reqDir = path.join(base, 'requirements');
    if (fs.existsSync(reqDir)) {
        try {
            const files = fs.readdirSync(reqDir).filter((f) => f.endsWith('.yaml'));
            for (const file of files) {
                const gfId = file.replace('.yaml', '');
                const filePath = path.join(reqDir, file);
                try {
                    const content = loadYamlStrict<{ requirements?: RequirementDef[] }>(filePath);
                    out.requirements[gfId] = content.requirements || [];
                } catch {
                    out.missing.push(`requirements/${file} (parse error)`);
                }
            }
        } catch {
            out.missing.push('requirements/ (read error)');
        }
    }

    return out;
}


/**
 * Check if a ruleset exists
 */
export function rulesetExists(version: string): boolean {
    const rulesetPath = path.join(RULESETS_ROOT, version);
    return fs.existsSync(rulesetPath) && fs.statSync(rulesetPath).isDirectory();
}

/**
 * Get a specific ruleset by ID (searches V1 and V2)
 */
export function getRuleset(id: string): RulesetManifest | null {
    const all = listRulesets();
    return all.find(r => r.id === id) || null;
}
