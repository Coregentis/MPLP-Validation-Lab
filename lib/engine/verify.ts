/**
 * Evidence Pack Verification
 * 
 * Core verification engine for Validation Lab.
 * Implements checks per:
 * - evidence-pack-contract-v1.0.md
 * - ruleset-contract-v1.0.md
 * - admission-criteria-v1.0.md
 * 
 * IMPORTANT: No execution capability - only verification.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import {
    PackHandle,
    VerificationReport,
    CheckResult,
    BlockingFailure,
    ComputedHashes,
    VerifyOptions,
    EPC_CONSTANTS,
    CheckCategory,
} from './types';
import { AdmissionStatus, EvidencePointer } from '../verdict/types';
import { FailureTaxonomy } from '../verdict/taxonomy';
import { hashFile, hashString } from './ingest';

// =============================================================================
// Main Verification Function
// =============================================================================

/**
 * Verify an evidence pack.
 * 
 * @param pack PackHandle from ingest()
 * @param options Verification options
 * @returns VerificationReport
 */
export async function verify(
    pack: PackHandle,
    options: VerifyOptions = {}
): Promise<VerificationReport> {
    const startTime = Date.now();
    const checks: CheckResult[] = [];
    const blockingFailures: BlockingFailure[] = [];

    const rulesetVersion = options.ruleset_version || 'ruleset-1.0';
    const labRoot = path.resolve(__dirname, '../..');

    // Execute checks in order per admission-criteria-v1.0.md

    // === ADMISSION: Security Checks ===
    checks.push(await checkFileCount(pack));
    checks.push(await checkTotalSize(pack));
    checks.push(await checkAllowedExtensions(pack));
    checks.push(await checkPathTraversal(pack));

    // === ADMISSION: Structure Checks ===
    checks.push(await checkRequiredFiles(pack));
    checks.push(await checkRequiredDirs(pack));
    checks.push(await checkLayoutVersion(pack));

    // === INTEGRITY Checks ===
    const integrityChecks = await runIntegrityChecks(pack);
    checks.push(...integrityChecks);

    // === MANIFEST Checks ===
    const manifestChecks = await runManifestChecks(pack);
    checks.push(...manifestChecks);

    // === VERSION BINDING Checks ===
    const syncReportPath = options.sync_report_path || path.join(labRoot, 'SYNC_REPORT.json');
    const rulesetPath = path.join(labRoot, 'data/rulesets', rulesetVersion);
    const versionChecks = await runVersionBindingChecks(pack, rulesetPath, syncReportPath);
    checks.push(...versionChecks);

    // === TIMELINE Checks ===
    const timelineChecks = await runTimelineChecks(pack);
    checks.push(...timelineChecks);

    // Collect blocking failures
    for (const check of checks) {
        if (check.status === 'FAIL' && check.taxonomy) {
            blockingFailures.push({
                check_id: check.check_id,
                taxonomy: check.taxonomy,
                message: check.message,
                pointers: check.pointers || [],
            });
        }
    }

    // Determine admission status
    let admissionStatus: AdmissionStatus;
    if (blockingFailures.length > 0) {
        admissionStatus = 'NOT_ADMISSIBLE';
    } else if (checks.some(c => c.status === 'WARN')) {
        admissionStatus = options.strict ? 'NOT_ADMISSIBLE' : 'ADMISSIBLE';
    } else {
        admissionStatus = 'ADMISSIBLE';
    }

    // Compute hashes
    const hashes = await computeHashes(pack, syncReportPath);

    const endTime = Date.now();

    const report: VerificationReport = {
        report_version: '1.0',
        verified_at: new Date().toISOString(),
        pack_id: pack.manifest_raw?.pack_id || 'unknown',
        pack_path: pack.root_path,
        admission_status: admissionStatus,
        checks,
        blocking_failures: blockingFailures,
        hashes,
        ruleset_version: rulesetVersion,
        protocol_version: pack.manifest_raw?.protocol_version,
        total_duration_ms: endTime - startTime,
    };

    // Compute report hash
    const reportJson = JSON.stringify(report, null, 2);
    report.hashes.report_hash = hashString(reportJson);

    return report;
}

// =============================================================================
// Admission: Security Checks
// =============================================================================

async function checkFileCount(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const count = pack.file_inventory.length;

    if (count > EPC_CONSTANTS.MAX_FILE_COUNT) {
        return {
            check_id: 'ADM-SEC-001',
            name: 'File Count Limit',
            category: 'ADMISSION_SECURITY',
            status: 'FAIL',
            message: `Pack contains ${count} files, exceeds limit of ${EPC_CONSTANTS.MAX_FILE_COUNT}`,
            taxonomy: FailureTaxonomy.PACK_TOO_LARGE,
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-SEC-001',
        name: 'File Count Limit',
        category: 'ADMISSION_SECURITY',
        status: 'PASS',
        message: `${count} files (limit: ${EPC_CONSTANTS.MAX_FILE_COUNT})`,
        duration_ms: Date.now() - start,
    };
}

async function checkTotalSize(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const sizeMB = (pack.total_size_bytes / (1024 * 1024)).toFixed(2);
    const limitMB = EPC_CONSTANTS.MAX_PACK_SIZE_BYTES / (1024 * 1024);

    if (pack.total_size_bytes > EPC_CONSTANTS.MAX_PACK_SIZE_BYTES) {
        return {
            check_id: 'ADM-SEC-002',
            name: 'Pack Size Limit',
            category: 'ADMISSION_SECURITY',
            status: 'FAIL',
            message: `Pack size ${sizeMB} MB exceeds limit of ${limitMB} MB`,
            taxonomy: FailureTaxonomy.PACK_TOO_LARGE,
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-SEC-002',
        name: 'Pack Size Limit',
        category: 'ADMISSION_SECURITY',
        status: 'PASS',
        message: `${sizeMB} MB (limit: ${limitMB} MB)`,
        duration_ms: Date.now() - start,
    };
}

async function checkAllowedExtensions(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const disallowed: string[] = [];

    for (const file of pack.file_inventory) {
        const ext = path.extname(file).toLowerCase();
        if (ext && !(EPC_CONSTANTS.ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
            disallowed.push(file);
        }
    }

    if (disallowed.length > 0) {
        return {
            check_id: 'ADM-SEC-003',
            name: 'Allowed Extensions',
            category: 'ADMISSION_SECURITY',
            status: 'FAIL',
            message: `Disallowed file extensions: ${disallowed.slice(0, 5).join(', ')}${disallowed.length > 5 ? '...' : ''}`,
            taxonomy: FailureTaxonomy.DISALLOWED_FILE_TYPE,
            pointers: disallowed.slice(0, 5).map(f => ({
                artifact_path: f,
                content_hash: '',
                locator: `file:${f}`,
                requirement_id: 'EPC-§9',
            })),
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-SEC-003',
        name: 'Allowed Extensions',
        category: 'ADMISSION_SECURITY',
        status: 'PASS',
        message: 'All file extensions are allowed',
        duration_ms: Date.now() - start,
    };
}

async function checkPathTraversal(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const violations: string[] = [];

    for (const file of pack.file_inventory) {
        // Check for path traversal patterns
        if (file.includes('..') || file.startsWith('/') || file.includes('\\')) {
            violations.push(file);
        }
    }

    if (violations.length > 0) {
        return {
            check_id: 'ADM-SEC-004',
            name: 'Path Traversal',
            category: 'ADMISSION_SECURITY',
            status: 'FAIL',
            message: `Path traversal patterns detected: ${violations.slice(0, 3).join(', ')}`,
            taxonomy: FailureTaxonomy.PATH_TRAVERSAL_DETECTED,
            pointers: violations.slice(0, 3).map(f => ({
                artifact_path: f,
                content_hash: '',
                locator: `file:${f}`,
                requirement_id: 'EPC-§9',
            })),
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-SEC-004',
        name: 'Path Traversal',
        category: 'ADMISSION_SECURITY',
        status: 'PASS',
        message: 'No path traversal patterns detected',
        duration_ms: Date.now() - start,
    };
}

// =============================================================================
// Admission: Structure Checks
// =============================================================================

async function checkRequiredFiles(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const missing: string[] = [];

    for (const required of EPC_CONSTANTS.REQUIRED_FILES) {
        if (!pack.file_inventory.includes(required)) {
            missing.push(required);
        }
    }

    if (missing.length > 0) {
        return {
            check_id: 'ADM-STR-001',
            name: 'Required Files',
            category: 'ADMISSION_STRUCTURE',
            status: 'FAIL',
            message: `Missing required files: ${missing.join(', ')}`,
            taxonomy: FailureTaxonomy.REQUIRED_ARTIFACT_MISSING,
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-STR-001',
        name: 'Required Files',
        category: 'ADMISSION_STRUCTURE',
        status: 'PASS',
        message: 'All required files present',
        duration_ms: Date.now() - start,
    };
}

async function checkRequiredDirs(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const missing: string[] = [];

    for (const dir of EPC_CONSTANTS.REQUIRED_DIRS) {
        const hasDir = pack.file_inventory.some(f => f.startsWith(dir + '/'));
        if (!hasDir) {
            missing.push(dir);
        }
    }

    if (missing.length > 0) {
        return {
            check_id: 'ADM-STR-002',
            name: 'Required Directories',
            category: 'ADMISSION_STRUCTURE',
            status: 'FAIL',
            message: `Missing required directories: ${missing.join(', ')}`,
            taxonomy: FailureTaxonomy.REQUIRED_ARTIFACT_MISSING,
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-STR-002',
        name: 'Required Directories',
        category: 'ADMISSION_STRUCTURE',
        status: 'PASS',
        message: 'All required directories present',
        duration_ms: Date.now() - start,
    };
}

async function checkLayoutVersion(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();

    if (pack.layout_version === 'unknown') {
        return {
            check_id: 'ADM-STR-003',
            name: 'Layout Version',
            category: 'ADMISSION_STRUCTURE',
            status: 'FAIL',
            message: 'Could not detect EPC layout version',
            taxonomy: FailureTaxonomy.MANIFEST_PARSE_FAILED,
            duration_ms: Date.now() - start,
        };
    }

    return {
        check_id: 'ADM-STR-003',
        name: 'Layout Version',
        category: 'ADMISSION_STRUCTURE',
        status: 'PASS',
        message: `EPC layout version: ${pack.layout_version}`,
        duration_ms: Date.now() - start,
    };
}

// =============================================================================
// Integrity Checks
// =============================================================================

async function runIntegrityChecks(pack: PackHandle): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];

    // Check sha256sums.txt file verification
    checks.push(await checkSha256Sums(pack));

    // Check pack.sha256
    checks.push(await checkPackHash(pack));

    // Check coverage: all pack files must be in sha256sums.txt (C-HARD-03)
    checks.push(await checkSha256Coverage(pack));

    return checks;
}

async function checkSha256Sums(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const sumsPath = path.join(pack.root_path, 'integrity/sha256sums.txt');

    if (!fs.existsSync(sumsPath)) {
        return {
            check_id: 'INT-001',
            name: 'SHA256 Sums File',
            category: 'INTEGRITY',
            status: 'FAIL',
            message: 'integrity/sha256sums.txt not found',
            taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
            duration_ms: Date.now() - start,
        };
    }

    try {
        const content = fs.readFileSync(sumsPath, 'utf-8');
        const lines = content.trim().split('\n');
        const mismatches: string[] = [];

        for (const line of lines) {
            const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
            if (!match) continue;

            const [, expectedHash, relativePath] = match;
            const filePath = path.join(pack.root_path, relativePath);

            if (!fs.existsSync(filePath)) {
                mismatches.push(`${relativePath} (missing)`);
                continue;
            }

            const actualHash = hashFile(filePath);
            if (actualHash !== expectedHash) {
                mismatches.push(`${relativePath} (hash mismatch)`);
            }
        }

        if (mismatches.length > 0) {
            return {
                check_id: 'INT-001',
                name: 'SHA256 Sums Verification',
                category: 'INTEGRITY',
                status: 'FAIL',
                message: `Hash verification failed: ${mismatches.slice(0, 3).join(', ')}${mismatches.length > 3 ? '...' : ''}`,
                taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
                pointers: mismatches.slice(0, 3).map(f => ({
                    artifact_path: f.split(' ')[0],
                    content_hash: '',
                    locator: `file:${f.split(' ')[0]}`,
                    requirement_id: 'EPC-§7',
                })),
                duration_ms: Date.now() - start,
            };
        }

        return {
            check_id: 'INT-001',
            name: 'SHA256 Sums Verification',
            category: 'INTEGRITY',
            status: 'PASS',
            message: `${lines.length} files verified`,
            duration_ms: Date.now() - start,
        };
    } catch (e) {
        return {
            check_id: 'INT-001',
            name: 'SHA256 Sums Verification',
            category: 'INTEGRITY',
            status: 'FAIL',
            message: `Error reading sha256sums.txt: ${e}`,
            taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
            duration_ms: Date.now() - start,
        };
    }
}

async function checkPackHash(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const packHashPath = path.join(pack.root_path, 'integrity/pack.sha256');
    const sumsPath = path.join(pack.root_path, 'integrity/sha256sums.txt');

    if (!fs.existsSync(packHashPath)) {
        return {
            check_id: 'INT-002',
            name: 'Pack Root Hash',
            category: 'INTEGRITY',
            status: 'FAIL',
            message: 'integrity/pack.sha256 not found',
            taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
            duration_ms: Date.now() - start,
        };
    }

    try {
        // Read expected hash
        const expectedHash = fs.readFileSync(packHashPath, 'utf-8').trim().split(/\s/)[0];

        // Compute normalized hash per EPC v1.0 (B2 fix)
        const sumsContent = fs.readFileSync(sumsPath, 'utf-8');
        const normalizedSums = normalizeSha256Sums(sumsContent);
        const computedHash = hashString(normalizedSums);

        if (computedHash !== expectedHash) {
            return {
                check_id: 'INT-002',
                name: 'Pack Root Hash',
                category: 'INTEGRITY',
                status: 'FAIL',
                message: `Pack hash mismatch: expected ${expectedHash.slice(0, 16)}..., computed ${computedHash.slice(0, 16)}...`,
                taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
                duration_ms: Date.now() - start,
            };
        }

        return {
            check_id: 'INT-002',
            name: 'Pack Root Hash',
            category: 'INTEGRITY',
            status: 'PASS',
            message: `Pack root hash verified: ${computedHash.slice(0, 16)}...`,
            duration_ms: Date.now() - start,
        };
    } catch (e) {
        return {
            check_id: 'INT-002',
            name: 'Pack Root Hash',
            category: 'INTEGRITY',
            status: 'FAIL',
            message: `Error verifying pack hash: ${e}`,
            taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
            duration_ms: Date.now() - start,
        };
    }
}

/**
 * C-HARD-03: Check that all pack files are covered by sha256sums.txt
 * This prevents attacks where extra files are added but not hashed.
 */
async function checkSha256Coverage(pack: PackHandle): Promise<CheckResult> {
    const start = Date.now();
    const sumsPath = path.join(pack.root_path, 'integrity/sha256sums.txt');

    // Files that are excluded from coverage check (per EPC §7)
    const excludedFiles = new Set([
        'integrity/pack.sha256',  // Self-reference excluded
        'integrity/sha256sums.txt', // Self-reference
    ]);

    if (!fs.existsSync(sumsPath)) {
        return {
            check_id: 'INT-003',
            name: 'SHA256 Coverage',
            category: 'INTEGRITY',
            status: 'SKIP',
            message: 'sha256sums.txt not found',
            duration_ms: Date.now() - start,
        };
    }

    try {
        const content = fs.readFileSync(sumsPath, 'utf-8');
        const lines = content.trim().split('\n');

        // Build set of files declared in sha256sums.txt
        const declaredFiles = new Set<string>();
        for (const line of lines) {
            const match = line.match(/^[a-f0-9]{64}\s+(.+)$/);
            if (match) {
                declaredFiles.add(match[1]);
            }
        }

        // Check coverage: all pack files must be in sha256sums
        const uncovered: string[] = [];
        for (const file of pack.file_inventory) {
            if (!excludedFiles.has(file) && !declaredFiles.has(file)) {
                uncovered.push(file);
            }
        }

        // Check orphans: all declared files must exist in pack
        const orphans: string[] = [];
        for (const declaredFile of declaredFiles) {
            if (!pack.file_inventory.includes(declaredFile)) {
                orphans.push(declaredFile);
            }
        }

        if (uncovered.length > 0) {
            return {
                check_id: 'INT-003',
                name: 'SHA256 Coverage',
                category: 'INTEGRITY',
                status: 'FAIL',
                message: `Uncovered files: ${uncovered.slice(0, 3).join(', ')}${uncovered.length > 3 ? '...' : ''}`,
                taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
                pointers: uncovered.slice(0, 3).map(f => ({
                    artifact_path: f,
                    content_hash: '',
                    locator: `file:${f}`,
                    requirement_id: 'EPC-§7',
                })),
                duration_ms: Date.now() - start,
            };
        }

        if (orphans.length > 0) {
            return {
                check_id: 'INT-003',
                name: 'SHA256 Coverage',
                category: 'INTEGRITY',
                status: 'FAIL',
                message: `Orphan entries in sha256sums: ${orphans.slice(0, 3).join(', ')}`,
                taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
                duration_ms: Date.now() - start,
            };
        }

        return {
            check_id: 'INT-003',
            name: 'SHA256 Coverage',
            category: 'INTEGRITY',
            status: 'PASS',
            message: `Coverage complete: ${pack.file_inventory.length - excludedFiles.size} files covered`,
            duration_ms: Date.now() - start,
        };
    } catch (e) {
        return {
            check_id: 'INT-003',
            name: 'SHA256 Coverage',
            category: 'INTEGRITY',
            status: 'FAIL',
            message: `Error checking coverage: ${e}`,
            taxonomy: FailureTaxonomy.INTEGRITY_HASH_MISMATCH,
            duration_ms: Date.now() - start,
        };
    }
}

/**
 * Normalize sha256sums.txt per EPC v1.0:
 * - Sort by path (lexicographic ascending)
 * - LF line endings
 * - No trailing newline
 */
function normalizeSha256Sums(content: string): string {
    const lines = content.trim().split(/\r?\n/);
    const entries = lines
        .filter(l => l.match(/^[a-f0-9]{64}\s+.+$/))
        .map(l => {
            const [hash, ...pathParts] = l.split(/\s+/);
            return { hash, path: pathParts.join(' ') };
        })
        .sort((a, b) => a.path.localeCompare(b.path));

    return entries.map(e => `${e.hash}  ${e.path}`).join('\n');
}

// =============================================================================
// Manifest Checks
// =============================================================================

async function runManifestChecks(pack: PackHandle): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];
    const start = Date.now();

    if (!pack.manifest_raw) {
        checks.push({
            check_id: 'MAN-001',
            name: 'Manifest Parse',
            category: 'MANIFEST',
            status: 'FAIL',
            message: 'Could not parse manifest.json',
            taxonomy: FailureTaxonomy.MANIFEST_PARSE_FAILED,
            duration_ms: Date.now() - start,
        });
        return checks;
    }

    const manifest = pack.manifest_raw;

    // Check required fields
    const requiredFields = ['pack_version', 'pack_id', 'created_at', 'protocol_version', 'scenario_id'];
    const missing = requiredFields.filter(f => !(f in manifest));

    if (missing.length > 0) {
        checks.push({
            check_id: 'MAN-001',
            name: 'Required Manifest Fields',
            category: 'MANIFEST',
            status: 'FAIL',
            message: `Missing required fields: ${missing.join(', ')}`,
            taxonomy: FailureTaxonomy.MANIFEST_PARSE_FAILED,
            duration_ms: Date.now() - start,
        });
    } else {
        checks.push({
            check_id: 'MAN-001',
            name: 'Required Manifest Fields',
            category: 'MANIFEST',
            status: 'PASS',
            message: 'All required fields present',
            duration_ms: Date.now() - start,
        });
    }

    // Check artifacts_included matches actual files
    if (manifest.artifacts_included) {
        const declared = new Set(manifest.artifacts_included);
        const actual = new Set(
            pack.file_inventory
                .filter(f => f.startsWith('artifacts/'))
                .map(f => path.basename(f, '.json'))
        );

        const missing = [...declared].filter(a => !actual.has(a));

        if (missing.length > 0) {
            checks.push({
                check_id: 'MAN-002',
                name: 'Artifacts Consistency',
                category: 'MANIFEST',
                status: 'WARN',
                message: `Declared artifacts not found: ${missing.join(', ')}`,
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'MAN-002',
                name: 'Artifacts Consistency',
                category: 'MANIFEST',
                status: 'PASS',
                message: 'Declared artifacts match actual files',
                duration_ms: Date.now() - start,
            });
        }
    }

    return checks;
}

// =============================================================================
// Version Binding Checks
// =============================================================================

async function runVersionBindingChecks(
    pack: PackHandle,
    rulesetPath: string,
    syncReportPath: string
): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];
    const start = Date.now();

    // Load ruleset manifest
    const rulesetManifestPath = path.join(rulesetPath, 'manifest.yaml');
    if (!fs.existsSync(rulesetManifestPath)) {
        checks.push({
            check_id: 'VER-001',
            name: 'Ruleset Manifest',
            category: 'VERSION_BINDING',
            status: 'SKIP',
            message: `Ruleset manifest not found: ${rulesetManifestPath}`,
            duration_ms: Date.now() - start,
        });
        return checks;
    }

    // Load SYNC_REPORT.json
    if (!fs.existsSync(syncReportPath)) {
        checks.push({
            check_id: 'VER-002',
            name: 'Sync Report',
            category: 'VERSION_BINDING',
            status: 'SKIP',
            message: `SYNC_REPORT.json not found: ${syncReportPath}`,
            duration_ms: Date.now() - start,
        });
        return checks;
    }

    try {
        const syncReport = JSON.parse(fs.readFileSync(syncReportPath, 'utf-8'));
        const rulesetManifestContent = fs.readFileSync(rulesetManifestPath, 'utf-8');

        // Parse ruleset manifest (simple YAML parsing for key fields)
        // Note: These are under "protocol:" section in manifest
        const rulesetSchemaHash = extractYamlValue(rulesetManifestContent, 'schemas_bundle_sha256');
        const rulesetInvariantHash = extractYamlValue(rulesetManifestContent, 'invariants_bundle_sha256');
        // protocol.version is nested, but our simple extractor will find it
        const rulesetProtocolVersion = extractYamlNestedValue(rulesetManifestContent, 'protocol', 'version');

        // SYNC_REPORT has integrity.* structure
        const syncSchemaHash = syncReport.integrity?.schemas_bundle_sha256;
        const syncInvariantHash = syncReport.integrity?.invariants_bundle_sha256;

        // VER-001: Sync Report valid
        checks.push({
            check_id: 'VER-001',
            name: 'Sync Report Loaded',
            category: 'VERSION_BINDING',
            status: 'PASS',
            message: `Upstream commit: ${syncReport.upstream_commit?.slice(0, 8)}...`,
            duration_ms: Date.now() - start,
        });

        // VER-002: Protocol version present in pack
        if (pack.manifest_raw?.protocol_version) {
            checks.push({
                check_id: 'VER-002',
                name: 'Protocol Version Present',
                category: 'VERSION_BINDING',
                status: 'PASS',
                message: `Pack protocol version: ${pack.manifest_raw.protocol_version}`,
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'VER-002',
                name: 'Protocol Version Present',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'Pack manifest missing protocol_version',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        }

        // VER-003: Schemas bundle hash binding (C-HARD-02) - REQUIRED
        if (!rulesetSchemaHash) {
            checks.push({
                check_id: 'VER-003',
                name: 'Schemas Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'Ruleset manifest missing schemas_bundle_sha256',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (!syncSchemaHash) {
            checks.push({
                check_id: 'VER-003',
                name: 'Schemas Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'SYNC_REPORT missing integrity.schemas_bundle_sha256',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (rulesetSchemaHash === syncSchemaHash) {
            checks.push({
                check_id: 'VER-003',
                name: 'Schemas Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'PASS',
                message: `Schemas hash: ${rulesetSchemaHash.slice(0, 16)}...`,
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'VER-003',
                name: 'Schemas Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: `Schemas hash mismatch: ruleset=${rulesetSchemaHash.slice(0, 16)}... sync=${syncSchemaHash.slice(0, 16)}...`,
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        }

        // VER-004: Invariants bundle hash binding (C-HARD-02) - REQUIRED
        if (!rulesetInvariantHash) {
            checks.push({
                check_id: 'VER-004',
                name: 'Invariants Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'Ruleset manifest missing invariants_bundle_sha256',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (!syncInvariantHash) {
            checks.push({
                check_id: 'VER-004',
                name: 'Invariants Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'SYNC_REPORT missing integrity.invariants_bundle_sha256',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (rulesetInvariantHash === syncInvariantHash) {
            checks.push({
                check_id: 'VER-004',
                name: 'Invariants Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'PASS',
                message: `Invariants hash: ${rulesetInvariantHash.slice(0, 16)}...`,
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'VER-004',
                name: 'Invariants Bundle Hash',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: `Invariants hash mismatch: ruleset=${rulesetInvariantHash.slice(0, 16)}... sync=${syncInvariantHash.slice(0, 16)}...`,
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        }

        // VER-005: Protocol Version Binding (C-HARD-04) - REQUIRED
        // Ruleset protocol.version must match pack protocol_version
        const packProtocolVersion = pack.manifest_raw?.protocol_version;
        if (!rulesetProtocolVersion) {
            checks.push({
                check_id: 'VER-005',
                name: 'Protocol Version Binding',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'Ruleset manifest missing protocol.version',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (!packProtocolVersion) {
            checks.push({
                check_id: 'VER-005',
                name: 'Protocol Version Binding',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: 'Pack missing protocol_version for binding check',
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        } else if (rulesetProtocolVersion === packProtocolVersion) {
            checks.push({
                check_id: 'VER-005',
                name: 'Protocol Version Binding',
                category: 'VERSION_BINDING',
                status: 'PASS',
                message: `Protocol versions match: ${rulesetProtocolVersion}`,
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'VER-005',
                name: 'Protocol Version Binding',
                category: 'VERSION_BINDING',
                status: 'FAIL',
                message: `Protocol version mismatch: ruleset=${rulesetProtocolVersion} pack=${packProtocolVersion}`,
                taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
                duration_ms: Date.now() - start,
            });
        }

    } catch (e) {
        checks.push({
            check_id: 'VER-001',
            name: 'Version Binding Parse',
            category: 'VERSION_BINDING',
            status: 'FAIL',
            message: `Error parsing version binding files: ${e}`,
            taxonomy: FailureTaxonomy.VERSION_BINDING_FAILED,
            duration_ms: Date.now() - start,
        });
    }

    return checks;
}

/**
 * Simple YAML value extractor (avoids full YAML parser dependency)
 */
function extractYamlValue(content: string, key: string): string | null {
    const regex = new RegExp(`${key}:\\s*["']?([^"'\\n]+)["']?`);
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extract nested YAML value (e.g., protocol.version from "protocol:\n  version: 1.0")
 * Simple approach: find parent key, then find child key in subsequent indented lines
 */
function extractYamlNestedValue(content: string, parent: string, child: string): string | null {
    const lines = content.split('\n');
    let inParent = false;

    for (const line of lines) {
        // Check if this is the parent key
        if (line.match(new RegExp(`^${parent}:\\s*$`))) {
            inParent = true;
            continue;
        }

        // If we're in parent section and line is indented
        if (inParent) {
            if (line.match(/^\s+\w/)) {
                // Check for child key
                const childMatch = line.match(new RegExp(`^\\s+${child}:\\s*["']?([^"'\\n]+)["']?`));
                if (childMatch) {
                    return childMatch[1].trim();
                }
            } else if (line.match(/^\w/)) {
                // New top-level key, exit parent section
                inParent = false;
            }
        }
    }
    return null;
}

// =============================================================================
// Timeline Checks
// =============================================================================

async function runTimelineChecks(pack: PackHandle): Promise<CheckResult[]> {
    const checks: CheckResult[] = [];
    const start = Date.now();

    const eventsPath = path.join(pack.root_path, 'timeline/events.ndjson');

    if (!fs.existsSync(eventsPath)) {
        checks.push({
            check_id: 'TL-001',
            name: 'Timeline File',
            category: 'TIMELINE',
            status: 'SKIP',
            message: 'timeline/events.ndjson not found',
            duration_ms: Date.now() - start,
        });
        return checks;
    }

    try {
        const content = fs.readFileSync(eventsPath, 'utf-8');
        const lines = content.trim().split('\n').filter(l => l.trim());

        if (lines.length === 0) {
            checks.push({
                check_id: 'TL-001',
                name: 'Timeline Events',
                category: 'TIMELINE',
                status: 'WARN',
                message: 'Timeline is empty',
                duration_ms: Date.now() - start,
            });
            return checks;
        }

        // Parse events and check order
        const events: Array<{ timestamp: string; event_id: string; line: number }> = [];
        const parseErrors: number[] = [];

        for (let i = 0; i < lines.length; i++) {
            try {
                const event = JSON.parse(lines[i]);
                events.push({
                    timestamp: event.timestamp || '',
                    event_id: event.event_id || '',
                    line: i + 1,
                });
            } catch {
                parseErrors.push(i + 1);
            }
        }

        if (parseErrors.length > 0) {
            checks.push({
                check_id: 'TL-001',
                name: 'Timeline Parse',
                category: 'TIMELINE',
                status: 'FAIL',
                message: `JSON parse errors at lines: ${parseErrors.slice(0, 5).join(', ')}`,
                taxonomy: FailureTaxonomy.TIMELINE_PARSE_FAILED,
                duration_ms: Date.now() - start,
            });
            return checks;
        }

        // Check total order (timestamp primary, event_id secondary)
        let orderViolations: number[] = [];

        for (let i = 1; i < events.length; i++) {
            const prev = events[i - 1];
            const curr = events[i];

            if (curr.timestamp < prev.timestamp) {
                orderViolations.push(curr.line);
            } else if (curr.timestamp === prev.timestamp && curr.event_id < prev.event_id) {
                orderViolations.push(curr.line);
            }
        }

        if (orderViolations.length > 0) {
            checks.push({
                check_id: 'TL-002',
                name: 'Timeline Total Order',
                category: 'TIMELINE',
                status: 'FAIL',
                message: `Order violations at lines: ${orderViolations.slice(0, 5).join(', ')}`,
                taxonomy: FailureTaxonomy.TIMELINE_NOT_TOTALLY_ORDERED,
                pointers: orderViolations.slice(0, 3).map(l => ({
                    artifact_path: 'timeline/events.ndjson',
                    content_hash: '',
                    locator: `ndjson:timeline/events.ndjson#${l - 1}`,
                    requirement_id: 'EPC-§5',
                })),
                duration_ms: Date.now() - start,
            });
        } else {
            checks.push({
                check_id: 'TL-002',
                name: 'Timeline Total Order',
                category: 'TIMELINE',
                status: 'PASS',
                message: `${events.length} events in total order`,
                duration_ms: Date.now() - start,
            });
        }
    } catch (e) {
        checks.push({
            check_id: 'TL-001',
            name: 'Timeline Read',
            category: 'TIMELINE',
            status: 'FAIL',
            message: `Error reading timeline: ${e}`,
            taxonomy: FailureTaxonomy.TIMELINE_PARSE_FAILED,
            duration_ms: Date.now() - start,
        });
    }

    return checks;
}

// =============================================================================
// Hash Computation
// =============================================================================

async function computeHashes(pack: PackHandle, syncReportPath: string): Promise<ComputedHashes> {
    let packRootHash = '';
    let manifestHash = '';
    let schemasBundleHash = '';
    let invariantsBundleHash = '';

    // Pack root hash
    const sumsPath = path.join(pack.root_path, 'integrity/sha256sums.txt');
    if (fs.existsSync(sumsPath)) {
        const content = fs.readFileSync(sumsPath, 'utf-8');
        packRootHash = hashString(normalizeSha256Sums(content));
    }

    // Manifest hash
    const manifestPath = path.join(pack.root_path, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
        manifestHash = hashFile(manifestPath);
    }

    // Bundle hashes from SYNC_REPORT
    if (fs.existsSync(syncReportPath)) {
        try {
            const syncReport = JSON.parse(fs.readFileSync(syncReportPath, 'utf-8'));
            schemasBundleHash = syncReport.schemas_bundle_sha256 || '';
            invariantsBundleHash = syncReport.invariants_bundle_sha256 || '';
        } catch {
            // Ignore parse errors
        }
    }

    return {
        pack_root_hash: packRootHash,
        manifest_hash: manifestHash,
        schemas_bundle_hash: schemasBundleHash,
        invariants_bundle_hash: invariantsBundleHash,
    };
}
