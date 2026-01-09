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

    // Blocker1: Severity-aware GF status aggregation
    // Filter requirements by severity for status determination
    const requiredReqs = requirements.filter((r, i) => gfDef.requirements[i].severity === 'required');
    const recommendedReqs = requirements.filter((r, i) => gfDef.requirements[i].severity === 'recommended');
    // Optional requirements do NOT participate in GF status

    const hasRequiredFail = requiredReqs.some(r => r.status === 'FAIL');
    const hasRecommendedNotEvaluated = recommendedReqs.some(r => r.status === 'NOT_EVALUATED');

    let status: 'PASS' | 'FAIL' | 'NOT_EVALUATED';
    if (hasRequiredFail) {
        status = 'FAIL';
    } else if (hasRecommendedNotEvaluated) {
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

    // Blocker2: Security check - prevent path traversal in artifact paths
    if (!isPathSafe(artifactPath)) {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id, 'Path traversal detected')],
            message: `Invalid artifact path (security): ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }

    const fullPath = safeJoinPath(pack.root_path, artifactPath);

    // Security: verify resolved path is within pack root
    if (!fullPath) {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id, 'Path outside pack root')],
            message: `Artifact path escapes pack root: ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }

    // Check file exists
    if (!fs.existsSync(fullPath)) {
        // Blocker1: Severity-aware handling
        if (reqDef.severity === 'optional') {
            // Optional: missing = NOT_EVALUATED, does not affect GF status
            return {
                requirement_id: reqDef.id,
                status: 'NOT_EVALUATED',
                pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id)],
                message: `Optional evidence not present: ${artifactPath}`,
                // No taxonomy = informational only
            };
        }

        if (reqDef.severity === 'recommended') {
            // Recommended: missing = NOT_EVALUATED, may affect GF but not FAIL
            return {
                requirement_id: reqDef.id,
                status: 'NOT_EVALUATED',
                pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id)],
                message: `Recommended evidence not present: ${artifactPath}`,
            };
        }

        // Required: missing = FAIL
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [makeMissingEvidencePointer(artifactPath, reqDef.id)],
            message: `Required evidence missing: ${artifactPath}`,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
        };
    }

    // Evidence type-specific checks (pass validated fullPath)
    switch (evidence.type) {
        case 'file':
            return evaluateFileEvidence(fullPath, reqDef, artifactPath);

        case 'json_pointer':
            return evaluateJsonPointerEvidence(fullPath, reqDef, artifactPath, evidence.locator || '');

        case 'ndjson_line':
            return evaluateNdjsonEvidence(fullPath, reqDef, artifactPath, evidence.locator);

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

/**
 * Severity-aware failure helper.
 * Returns NOT_EVALUATED for optional/recommended, FAIL for required.
 */
function createSeverityAwareFailure(
    reqDef: RequirementDefinition,
    artifactPath: string,
    message: string,
    pointer: EvidencePointer
): RequirementVerdict {
    // Blocker B: Severity Policy for invalid evidence
    // - required invalid → FAIL
    // - recommended invalid → NOT_EVALUATED
    // - optional invalid → NOT_EVALUATED
    if (reqDef.severity === 'required') {
        return {
            requirement_id: reqDef.id,
            status: 'FAIL',
            pointers: [pointer],
            message,
            taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_INVALID,
        };
    }

    // recommended or optional: NOT_EVALUATED (not FAIL)
    return {
        requirement_id: reqDef.id,
        status: 'NOT_EVALUATED',
        pointers: [pointer],
        message: `[${reqDef.severity}] ${message}`,
    };
}

function evaluateFileEvidence(
    fullPath: string,  // Blocker A: use validated fullPath
    reqDef: RequirementDefinition,
    artifactPath: string
): RequirementVerdict {
    try {
        const stat = fs.statSync(fullPath);
        if (stat.size === 0) {
            return createSeverityAwareFailure(
                reqDef,
                artifactPath,
                `Evidence file is empty: ${artifactPath}`,
                makeFilePointer(artifactPath, reqDef.id, 'File is empty')
            );
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `Evidence present: ${artifactPath}`,
        };
    } catch (e) {
        return createSeverityAwareFailure(
            reqDef,
            artifactPath,
            `Evidence file read error: ${artifactPath}`,
            makeFilePointer(artifactPath, reqDef.id)
        );
    }
}

function evaluateJsonPointerEvidence(
    fullPath: string,  // Blocker A: use validated fullPath
    reqDef: RequirementDefinition,
    artifactPath: string,
    jsonPointer: string
): RequirementVerdict {
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        // Simple JSON pointer resolution
        const value = resolveSimpleJsonPointer(data, jsonPointer);

        if (value === undefined) {
            // Pointer not found is semantic MISSING (not INVALID)
            if (reqDef.severity === 'required') {
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
                status: 'NOT_EVALUATED',
                pointers: [makeJsonPointer(artifactPath, jsonPointer, reqDef.id)],
                message: `[${reqDef.severity}] JSON pointer not found: ${jsonPointer}`,
            };
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeJsonPointer(artifactPath, jsonPointer, reqDef.id)],
            message: `Evidence found at: ${jsonPointer}`,
        };
    } catch (e) {
        return createSeverityAwareFailure(
            reqDef,
            artifactPath,
            `JSON parse error in ${artifactPath}`,
            makeJsonPointer(artifactPath, jsonPointer, reqDef.id)
        );
    }
}

function evaluateNdjsonEvidence(
    fullPath: string,  // Blocker A: use validated fullPath
    reqDef: RequirementDefinition,
    artifactPath: string,
    locator?: string
): RequirementVerdict {
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        if (lines.length === 0) {
            return createSeverityAwareFailure(
                reqDef,
                artifactPath,
                `NDJSON file is empty: ${artifactPath}`,
                makeFilePointer(artifactPath, reqDef.id)
            );
        }

        // If specific line requested
        if (locator) {
            const lineIndex = parseInt(locator, 10);
            // Blocker4: Handle NaN separately from out-of-range
            if (isNaN(lineIndex)) {
                return createSeverityAwareFailure(
                    reqDef,
                    artifactPath,
                    `NDJSON locator is not a valid number: ${locator}`,
                    makeFilePointer(artifactPath, reqDef.id, `Invalid locator: ${locator}`)
                );
            }
            if (lineIndex < 0 || lineIndex >= lines.length) {
                // Line not found = MISSING semantic
                if (reqDef.severity === 'required') {
                    return {
                        requirement_id: reqDef.id,
                        status: 'FAIL',
                        pointers: [makeNdjsonLinePointer(artifactPath, lineIndex, reqDef.id)],
                        message: `NDJSON line not found: ${locator}`,
                        taxonomy: FailureTaxonomy.REQUIREMENT_EVIDENCE_MISSING,
                    };
                }
                return {
                    requirement_id: reqDef.id,
                    status: 'NOT_EVALUATED',
                    pointers: [makeNdjsonLinePointer(artifactPath, lineIndex, reqDef.id)],
                    message: `[${reqDef.severity}] NDJSON line not found: ${locator}`,
                };
            }

            // Validate line is valid JSON
            try {
                JSON.parse(lines[lineIndex]);
            } catch {
                return createSeverityAwareFailure(
                    reqDef,
                    artifactPath,
                    `NDJSON line ${lineIndex} is invalid JSON`,
                    makeNdjsonLinePointer(artifactPath, lineIndex, reqDef.id)
                );
            }
        }

        return {
            requirement_id: reqDef.id,
            status: 'PASS',
            pointers: [makeFilePointer(artifactPath, reqDef.id)],
            message: `NDJSON evidence present: ${lines.length} lines`,
        };
    } catch (e) {
        return createSeverityAwareFailure(
            reqDef,
            artifactPath,
            `NDJSON read error: ${artifactPath}`,
            makeFilePointer(artifactPath, reqDef.id)
        );
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

    // Blocker3: GLOBAL failure must have pointers for audit trail
    // Aggregate blocking failures from verify report if available
    const globalPointers: EvidencePointer[] = [];
    if (verifyReport.blocking_failures && verifyReport.blocking_failures.length > 0) {
        for (const bf of verifyReport.blocking_failures.slice(0, 5)) {
            globalPointers.push(...(bf.pointers || []));
        }
    }
    // If no pointers from blocking failures, add ruleset/manifest pointer
    if (globalPointers.length === 0) {
        globalPointers.push(makeFilePointer(
            `data/rulesets/${rulesetVersion}/manifest.yaml`,
            'GLOBAL',
            reason
        ));
    }

    report.gf_verdicts.push({
        gf_id: 'GLOBAL',
        status: 'NOT_EVALUATED',
        requirements: [],
        failures: [{
            taxonomy: FailureTaxonomy.ADMISSION_FAILED,
            message: reason,
            pointers: sortPointers(globalPointers),
        }],
    });

    report.verdict_hash = computeVerdictHash(report);
    return report;
}

// =============================================================================
// Security Helpers (Blocker2)
// =============================================================================

/**
 * Check if artifact path is safe (no traversal, no absolute paths).
 */
function isPathSafe(artifactPath: string): boolean {
    if (!artifactPath) return false;

    // Reject absolute paths
    if (artifactPath.startsWith('/') || /^[A-Za-z]:/.test(artifactPath)) {
        return false;
    }

    // Reject path traversal
    if (artifactPath.includes('..')) {
        return false;
    }

    // Reject backslashes (Windows path separator)
    if (artifactPath.includes('\\')) {
        return false;
    }

    return true;
}

/**
 * Safely join paths and verify result is within root.
 * Returns null if path escapes root.
 */
function safeJoinPath(root: string, relative: string): string | null {
    const resolved = path.resolve(root, relative);
    const normalizedRoot = path.resolve(root) + path.sep;

    if (!resolved.startsWith(normalizedRoot) && resolved !== path.resolve(root)) {
        return null;
    }

    return resolved;
}
