#!/usr/bin/env tsx
/**
 * AUDIT-13: SEAL Format Compliance
 * 
 * Verifies:
 * 1. SEAL document exists for current lab_series
 * 2. SEAL can be parsed (supports both table and text formats)
 * 3. Required fields are extractable and match manifest
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');

interface Manifest {
    lab_series: string;
    baseline_commit_sha: string;
}

interface SealData {
    baseline_commit?: string;
    manifest_hash?: string;
    sample_set_hash?: string;
    format: 'table' | 'text' | 'mixed';
}

function parseSealDocument(content: string): SealData {
    const data: SealData = { format: 'mixed' };

    // Try text format first
    const textCommitMatch = content.match(/\*\*Baseline Commit\*\*:\s*`([^`]+)`/);
    if (textCommitMatch) {
        data.baseline_commit = textCommitMatch[1];
        data.format = 'text';
    }

    // Try table format for commit
    if (!data.baseline_commit) {
        // Look for baseline_commit_sha in manifest anchor line
        const tableCommitMatch = content.match(/baseline_commit_sha["\s:]+([0-9a-f]{40})/);
        if (tableCommitMatch) {
            data.baseline_commit = tableCommitMatch[1];
            data.format = 'table';
        }
    }

    // Extract manifest hash from table
    const manifestHashMatch = content.match(/\|\s*\*\*(?:Release Manifest|Lab Manifest)\*\*\s*\|[^|]+\|\s*`([0-9a-f]{64})`/);
    if (manifestHashMatch) {
        data.manifest_hash = manifestHashMatch[1];
    }

    // Extract sample set hash
    const sampleHashMatch = content.match(/\|\s*\*\*(?:Sample Set|Shadow Input)\*\*\s*\|[^|]+\|\s*`([0-9a-f]{64})`/);
    if (sampleHashMatch) {
        data.sample_set_hash = sampleHashMatch[1];
    }

    return data;
}

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Load manifest to get lab_series
    if (!fs.existsSync(MANIFEST_PATH)) {
        reporter.blocker({
            code: 'AUDIT-13-MANIFEST-MISSING',
            layer: 'LAYER_3_SSOT',
            file: MANIFEST_PATH,
            message: 'Lab manifest does not exist',
            suggested_fix: 'Create lab manifest'
        });
        return;
    }

    let manifest: Manifest;
    try {
        manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (error) {
        reporter.blocker({
            code: 'AUDIT-13-MANIFEST-INVALID',
            layer: 'LAYER_3_SSOT',
            file: MANIFEST_PATH,
            message: `Could not parse manifest: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON syntax'
        });
        return;
    }

    const labSeries = manifest.lab_series || 'v0.17.0';
    const sealPath = path.join(PROJECT_ROOT, `governance/seals/SEAL-${labSeries}.md`);

    // Check SEAL exists
    if (!fs.existsSync(sealPath)) {
        reporter.blocker({
            code: 'AUDIT-13-SEAL-MISSING',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: `SEAL document not found for ${labSeries}`,
            suggested_fix: `Create SEAL-${labSeries}.md or update lab_series in manifest`,
            context: { lab_series: labSeries, expected_path: sealPath }
        });
        return;
    }

    // Read SEAL content
    let sealContent: string;
    try {
        sealContent = fs.readFileSync(sealPath, 'utf8');
    } catch (error) {
        reporter.blocker({
            code: 'AUDIT-13-SEAL-UNREADABLE',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: `Could not read SEAL document: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Check file permissions'
        });
        return;
    }

    // Parse SEAL (supports both formats)
    const sealData = parseSealDocument(sealContent);

    // Verify baseline commit can be extracted
    if (!sealData.baseline_commit) {
        reporter.blocker({
            code: 'AUDIT-13-SEAL-MISSING-COMMIT',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: 'Could not extract baseline_commit_sha from SEAL (tried both table and text formats)',
            suggested_fix: 'Ensure SEAL contains baseline_commit_sha in parseable format',
            context: { lab_series: labSeries, format_detected: sealData.format }
        });
    } else {
        // Verify commit matches manifest
        if (manifest.baseline_commit_sha && sealData.baseline_commit !== manifest.baseline_commit_sha) {
            reporter.critical({
                code: 'AUDIT-13-SEAL-COMMIT-MISMATCH',
                layer: 'LAYER_7_GATES',
                file: sealPath,
                message: `SEAL baseline_commit mismatch with manifest`,
                suggested_fix: `Update SEAL or manifest to match: ${manifest.baseline_commit_sha}`,
                context: {
                    manifest_commit: manifest.baseline_commit_sha,
                    seal_commit: sealData.baseline_commit
                }
            });
        }
    }

    // Check for required sustainability boundaries (both formats)
    const hasStopline = sealContent.includes('Stopline') || sealContent.includes('stopline');
    const hasOneDimension = sealContent.includes('One-Dimension') || sealContent.includes('one-dimension');

    if (!hasStopline && !hasOneDimension) {
        reporter.critical({
            code: 'AUDIT-13-SEAL-MISSING-BOUNDARIES',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: 'SEAL missing required sustainability boundaries (Stopline or One-Dimension)',
            suggested_fix: 'Add sustainability boundary statement to SEAL',
            context: { lab_series: labSeries }
        });
    }

    // Informational: report detected format
    if (sealData.format === 'table') {
        reporter.cosmetic({
            code: 'AUDIT-13-SEAL-TABLE-FORMAT',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: `SEAL uses table format (parseable)`,
            suggested_fix: 'No action needed - format is supported',
            context: { lab_series: labSeries }
        });
    }
}
