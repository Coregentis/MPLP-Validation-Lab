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
    golden_flows: string[];
    /** v0.3+: Four-domain clauses for ruleset-1.1 */
    four_domain_clauses?: string[];
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
 * List rulesets with summary info
 */
export function listRulesets(): RulesetManifest[] {
    const versions = listRulesetVersions();
    const results: RulesetManifest[] = [];

    for (const version of versions) {
        const data = loadRuleset(version);
        if (data.manifest) {
            results.push(data.manifest);
        }
    }

    return results;
}

/**
 * Load full ruleset data
 */
export function loadRuleset(version: string): RulesetData {
    const base = path.join(RULESETS_ROOT, version);

    const out: RulesetData = {
        version,
        requirements: {},
        missing: [],
    };

    // Manifest
    const manifestPath = path.join(base, 'manifest.yaml');
    if (fs.existsSync(manifestPath)) {
        try {
            out.manifest = loadYamlStrict<RulesetManifest>(manifestPath);
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
