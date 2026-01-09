/**
 * Phase D: Evaluation Engine
 * 
 * Evaluates evidence pack against Golden Flow requirements.
 * Only runs after passing Admission (GATE-02).
 */

import * as fs from 'fs';
import * as path from 'path';
import { PackHandle, VerificationReport } from '../engine/types';
import { EvidencePointer } from '../verdict/types';
import { FailureTaxonomy } from '../verdict/taxonomy';
import { loadYamlStrict, validateRequiredFields, sanitizePath } from '../utils/yaml-loader';
import {
    makeFilePointer,
    makeMissingEvidencePointer,
    makeJsonPointer,
    makeNdjsonLinePointer,
    sortPointers
} from '../verdict/pointer';
import { computeVerdictHash } from '../verdict/canonicalize';
import {
    EvaluationReport,
    EvaluateOptions,
    GFVerdict,
    RequirementVerdict,
    EvaluationFailure,
    RulesetManifest,
    GFDefinition,
    RequirementDefinition,
    RULESET_VALIDATION_ERRORS,
} from './types';

// =============================================================================
// Main Evaluation Function
// =============================================================================

/**
 * Evaluate an evidence pack against Golden Flow requirements.
 * 
 * @param pack PackHandle from ingest()
 * @param verifyReport VerificationReport from verify()
 * @param options Evaluation options
 * @returns EvaluationReport
 */
export async function evaluate(
    pack: PackHandle,
    verifyReport: VerificationReport,
    options: EvaluateOptions
): Promise<EvaluationReport> {
    const startTime = Date.now();

    // GATE-02: Admission check (User requirement: NOT_ADMISSIBLE → no evaluate)
    if (verifyReport.admission_status !== 'ADMISSIBLE') {
        return createNotEvaluatedReport(
            pack,
            verifyReport,
            options.ruleset_version,
            'Admission failed: pack is NOT_ADMISSIBLE'
        );
    }

    // Load ruleset
    const basePath = options.rulesets_base_path || path.resolve(__dirname, '../../data/rulesets');
    const rulesetPath = path.join(basePath, options.ruleset_version);

    let manifest: RulesetManifest;
    try {
        manifest = loadRulesetManifest(rulesetPath);
    } catch (e) {
        return createNotEvaluatedReport(
            pack,
            verifyReport,
            options.ruleset_version,
            `Ruleset load failed: ${e instanceof Error ? e.message : String(e)}`
        );
    }

    // Validate ruleset closure (User HARD-03)
    try {
        validateRulesetClosure(rulesetPath, manifest);
    } catch (e) {
        return createNotEvaluatedReport(
            pack,
            verifyReport,
            options.ruleset_version,
            `Ruleset validation failed: ${e instanceof Error ? e.message : String(e)}`
        );
    }

    // Evaluate each Golden Flow
    const gfFilter = new Set(options.gf_filter || manifest.golden_flows);
    const gfVerdicts: GFVerdict[] = [];

    for (const gfId of manifest.golden_flows) {
        if (!gfFilter.has(gfId)) {
            continue; // Skip if not in filter
        }

        const gfVerdict = await evaluateGoldenFlow(pack, rulesetPath, gfId);
        gfVerdicts.push(gfVerdict);
    }

    // Build report (without verdict_hash yet)
    const report: EvaluationReport = {
        report_version: '1.0',
        ruleset_version: options.ruleset_version,
        pack_id: pack.manifest_raw?.pack_id || 'unknown',
        pack_root_hash: verifyReport.hashes.pack_root_hash, // User HARD-06: same source
        protocol_version: verifyReport.protocol_version || '',
        gf_verdicts: gfVerdicts,
        verdict_hash: '', // Computed below
        evaluated_at: new Date().toISOString(),
        total_duration_ms: Date.now() - startTime,
    };

    // Compute deterministic verdict hash (D4)
    report.verdict_hash = computeVerdictHash(report);

    return report;
}

// =============================================================================
// Ruleset Loading (D1 + User HARD-03)
// =============================================================================

function loadRulesetManifest(rulesetPath: string): RulesetManifest {
    const manifestPath = path.join(rulesetPath, 'manifest.yaml');
    const manifest = loadYamlStrict<RulesetManifest>(manifestPath);

    validateRequiredFields(manifest, [
        'id', 'version', 'name', 'status', 'protocol', 'golden_flows'
    ], 'ruleset manifest');

    validateRequiredFields(manifest.protocol, [
        'version', 'upstream_commit', 'schemas_bundle_sha256', 'invariants_bundle_sha256'
    ], 'ruleset manifest.protocol');

    return manifest;
}

/**
 * Validate ruleset closure per User HARD-03.
 * - All manifest.golden_flows must have requirements files
 * - No orphan requirements files
 * - gf_id in file must match filename
 */
function validateRulesetClosure(rulesetPath: string, manifest: RulesetManifest): void {
    const reqsPath = path.join(rulesetPath, 'requirements');

    // Check requirements directory exists
    if (!fs.existsSync(reqsPath)) {
        throw new Error(
            `${RULESET_VALIDATION_ERRORS.MISSING_GF_FILE}: requirements directory not found`
        );
    }

    // Check all declared GFs have files
    for (const gfId of manifest.golden_flows) {
        const gfFile = path.join(reqsPath, `${gfId}.yaml`);
        if (!fs.existsSync(gfFile)) {
            throw new Error(
                `${RULESET_VALIDATION_ERRORS.MISSING_GF_FILE}: ${gfId}.yaml`
            );
        }
    }

    // Check for orphan files
    const declaredGFs = new Set(manifest.golden_flows);
    const files = fs.readdirSync(reqsPath).filter(f => f.endsWith('.yaml'));

    for (const file of files) {
        const gfId = file.replace('.yaml', '');
        if (!declaredGFs.has(gfId)) {
            throw new Error(
                `${RULESET_VALIDATION_ERRORS.UNDECLARED_GF_FILE}: ${file}`
            );
        }
    }

    // Validate gf_id matches filename
    for (const gfId of manifest.golden_flows) {
        const gfFile = path.join(reqsPath, `${gfId}.yaml`);
        const gfDef = loadYamlStrict<GFDefinition>(gfFile);

        if (gfDef.gf_id !== gfId) {
            throw new Error(
                `${RULESET_VALIDATION_ERRORS.GF_ID_MISMATCH}: file ${gfId}.yaml has gf_id="${gfDef.gf_id}"`
            );
        }
    }
}

// =============================================================================
// Golden Flow Evaluation
// =============================================================================

async function evaluateGoldenFlow(
    pack: PackHandle,
    rulesetPath: string,
    gfId: string
): Promise<GFVerdict> {
    const reqsPath = path.join(rulesetPath, 'requirements', `${gfId}.yaml`);

    let gfDef: GFDefinition;
    try {
        gfDef = loadYamlStrict<GFDefinition>(reqsPath);
    } catch (e) {
        return {
            gf_id: gfId,
            status: 'NOT_EVALUATED',
            requirements: [],
            failures: [{
                taxonomy: FailureTaxonomy.RULESET_INVALID,
                message: `Failed to load GF definition: ${sanitizePath(reqsPath)}`,
                pointers: [],
            }],
        };
    }

    const requirements: RequirementVerdict[] = [];
    const failures: EvaluationFailure[] = [];

    for (const reqDef of gfDef.requirements) {
        const verdict = evaluateRequirement(pack, reqDef);
        requirements.push(verdict);

        if (verdict.status === 'FAIL') {
            failures.push({
                taxonomy: verdict.taxonomy || FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
                message: verdict.message,
                pointers: verdict.pointers,
                requirement_id: verdict.requirement_id,
            });
        }
    }

    // Determine GF status
    const hasFailures = requirements.some(r => r.status === 'FAIL');
    const hasNotEvaluated = requirements.some(r => r.status === 'NOT_EVALUATED');

    let status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    if (hasFailures) {
        status = 'FAIL';
    } else if (hasNotEvaluated) {
        status = 'NOT_EVALUATED';
    } else {
        status = 'PASS';
    }

    return {
        gf_id: gfId,
        status,
        requirements,
        failures,
    };
}

// =============================================================================
// Requirement Evaluation
// =============================================================================

function evaluateRequirement(
    pack: PackHandle,
    reqDef: RequirementDefinition
): RequirementVerdict {
    const evidence = reqDef.evidence;
    const artifactPath = evidence.artifact;
    const fullPath = path.join(pack.root_path, artifactPath);

    // Check file exists
    if (!fs.existsSync(fullPath)) {
        // For optional requirements, mark as NOT_EVALUATED
        if (reqDef.severity === 'optional') {
            return {
                requirement_id: reqDef.id,
                status: 'NOT_EVALUATED',
                pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id)],
                message: `Optional evidence not present: ${artifactPath}`,
            };
        }

        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id)],
            message: `Required evidence missing: ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
        };
    }

    // Evidence type-specific checks
    switch (evidence.type) {
        case 'file':
            return evaluateFileEvidence(pack, reqDef, artifactPath);

        case 'json_pointer':
            return evaluateJsonPointerEvidence(pack, reqDef, artifactPath, evidence.locator || '');

        case 'ndjson_line':
            return evaluateNdjsonEvidence(pack, reqDef, artifactPath, evidence.locator);

        case 'cross_ref':
            // Cross-reference checks are Phase D+ feature
            return {
                requirement_id: reqDef.id,
                status: 'NOT_EVALUATED',
                pointers: [makeFilePointer(artifactPath, reqDef.id)],
                message: 'Cross-reference checks not yet implemented',
            };

        default:
            return {
                requirement_id: reqDef.id,
                status: 'NOT_EVALUATED',
                pointers: [makeFilePointer(artifactPath, reqDef.id)],
                message: `Unknown evidence type: ${evidence.type}`,
            };
    }
}

function evaluateFileEvidence(
    pack: PackHandle,
    reqDef: RequirementDefinition,
    artifactPath: string
): RequirementVerdict {
    // File exists and is readable = PASS
    const fullPath = path.join(pack.root_path, artifactPath);

    try {
        const stat = fs.statSync(fullPath);
        if (stat.size === 0) {
            return {
                requirement_id: reqDef.id,
                status: 'FAIL',
                pointers: [makeFilePointer(artifactPath, reqDef.id, 'File is empty')],
                message: `Evidence file is empty: ${artifactPath}`,
                taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
            };
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `Evidence present: ${artifactPath}`,
        };
    } catch (e) {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `Evidence file read error: ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }
}

function evaluateJsonPointerEvidence(
    pack: PackHandle,
    reqDef: RequirementDefinition,
    artifactPath: string,
    jsonPointer: string
): RequirementVerdict {
    const fullPath = path.join(pack.root_path, artifactPath);

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        // Simple JSON pointer resolution
        const value = resolveSimpleJsonPointer(data, jsonPointer);

        if (value === undefined) {
            return {
                requirement_id: reqDef.id,
                status: 'FAIL',
                pointers: [makeJsonPointer(artifactPath, jsonPointer, reqDef.id)],
                message: `JSON pointer not found: ${jsonPointer}`,
                taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
            };
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeJsonPointer(artifactPath, jsonPointer, reqDef.id)],
            message: `Evidence found at: ${jsonPointer}`,
        };
    } catch (e) {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeJsonPointer(artifactPath, jsonPointer, reqDef.id)],
            message: `JSON parse error in ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }
}

function evaluateNdjsonEvidence(
    pack: PackHandle,
    reqDef: RequirementDefinition,
    artifactPath: string,
    locator?: string
): RequirementVerdict {
    const fullPath = path.join(pack.root_path, artifactPath);

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        if (lines.length === 0) {
            return {
                requirement_id: reqDef.id,
                status: 'FAIL',
                pointers: [makeFilePointer(artifactPath, reqDef.id)],
                message: `NDJSON file is empty: ${artifactPath}`,
                taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
            };
        }

        // If specific line requested
        if (locator) {
            const lineIndex = parseInt(locator, 10);
            if (isNaN(lineIndex) || lineIndex < 0 || lineIndex >= lines.length) {
                return {
                    requirement_id: reqDef.id,
                    status: 'FAIL',
                    pointers: [makeNdjsonLinePointer(artifactPath, lineIndex, reqDef.id)],
                    message: `NDJSON line not found: ${locator}`,
                    taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
                };
            }

            // Validate line is valid JSON
            try {
                JSON.parse(lines[lineIndex]);
            } catch {
                return {
                    requirement_id: reqDef.id,
                    status: 'FAIL',
                    pointers: [makeNdjsonLinePointer(artifactPath, lineIndex, reqDef.id)],
                    message: `NDJSON line ${lineIndex} is invalid JSON`,
                    taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
                };
            }
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `NDJSON evidence present: ${lines.length} lines`,
        };
    } catch (e) {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `NDJSON read error: ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }
}

// =============================================================================
// Helpers
// =============================================================================

function resolveSimpleJsonPointer(obj: unknown, pointer: string): unknown {
    if (!pointer || pointer === '/') {
        return obj;
    }

    const parts = pointer.replace(/^\//, '').split('/');
    let current: unknown = obj;

    for (const part of parts) {
        const key = part.replace(/~1/g, '/').replace(/~0/g, '~');

        if (current === null || current === undefined) {
            return undefined;
        }

        if (Array.isArray(current)) {
            const index = parseInt(key, 10);
            if (isNaN(index) || index < 0 || index >= current.length) {
                return undefined;
            }
            current = current[index];
        } else if (typeof current === 'object') {
            current = (current as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }

    return current;
}

function createNotEvaluatedReport(
    pack: PackHandle,
    verifyReport: VerificationReport,
    rulesetVersion: string,
    reason: string
): EvaluationReport {
    const report: EvaluationReport = {
        report_version: '1.0',
        ruleset_version: rulesetVersion,
        pack_id: pack.manifest_raw?.pack_id || 'unknown',
        pack_root_hash: verifyReport.hashes.pack_root_hash,
        protocol_version: verifyReport.protocol_version || '',
        gf_verdicts: [],
        verdict_hash: '',
        evaluated_at: new Date().toISOString(),
    };

    // Add a NOT_EVALUATED verdict placeholder
    report.gf_verdicts.push({
        gf_id: 'GLOBAL',
        status: 'NOT_EVALUATED',
        requirements: [],
        failures: [{
            taxonomy: FailureTaxonomy.ADMISSION_FAILED,
            message: reason,
            pointers: [],
        }],
    });

    report.verdict_hash = computeVerdictHash(report);
    return report;
}
