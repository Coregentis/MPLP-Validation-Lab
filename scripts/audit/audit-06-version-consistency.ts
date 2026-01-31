#!/usr/bin/env tsx
/**
 * AUDIT-06: Version Consistency
 * 
 * Verifies that lab_series version is consistent across:
 * - lab-manifest.json
 * - SEAL filename
 * - Constitution filename
 * - Reconciliation report filename
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'public/_meta/lab-manifest.json');
const GOVERNANCE_DIR = path.join(PROJECT_ROOT, 'governance');

interface Manifest {
    lab_series: string;
}

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Load manifest
    if (!fs.existsSync(MANIFEST_PATH)) {
        reporter.blocker({
            code: 'AUDIT-06-MANIFEST-MISSING',
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
            code: 'AUDIT-06-MANIFEST-INVALID',
            layer: 'LAYER_3_SSOT',
            file: MANIFEST_PATH,
            message: `Could not parse manifest: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON syntax'
        });
        return;
    }

    const labSeries = manifest.lab_series;
    if (!labSeries) {
        reporter.blocker({
            code: 'AUDIT-06-MISSING-LAB-SERIES',
            layer: 'LAYER_3_SSOT',
            file: MANIFEST_PATH,
            pointer: '/lab_series',
            message: 'Manifest missing lab_series field',
            suggested_fix: 'Add lab_series field to manifest'
        });
        return;
    }

    // Validate version format (vX.Y.Z)
    if (!/^v\d+\.\d+\.\d+$/.test(labSeries)) {
        reporter.critical({
            code: 'AUDIT-06-INVALID-VERSION-FORMAT',
            layer: 'LAYER_3_SSOT',
            file: MANIFEST_PATH,
            pointer: '/lab_series',
            message: `Invalid lab_series format: "${labSeries}" (expected vX.Y.Z)`,
            suggested_fix: 'Use semantic versioning format: v0.17.0',
            context: { lab_series: labSeries }
        });
    }

    // Check SEAL filename matches
    const sealPath = path.join(GOVERNANCE_DIR, 'seals', `SEAL-${labSeries}.md`);
    if (!fs.existsSync(sealPath)) {
        reporter.blocker({
            code: 'AUDIT-06-SEAL-VERSION-MISMATCH',
            layer: 'LAYER_7_GATES',
            file: sealPath,
            message: `SEAL file for ${labSeries} not found at expected path`,
            suggested_fix: `Create SEAL-${labSeries}.md or correct lab_series in manifest`,
            context: { lab_series: labSeries, expected_path: sealPath }
        });
    }

    // Check Constitution filename matches
    const constitutionPath = path.join(GOVERNANCE_DIR, 'constitutions', `FREEZE-CONSTITUTION-${labSeries}.md`);
    if (!fs.existsSync(constitutionPath)) {
        reporter.important({
            code: 'AUDIT-06-CONSTITUTION-VERSION-MISMATCH',
            layer: 'LAYER_7_GATES',
            file: constitutionPath,
            message: `Constitution file for ${labSeries} not found at expected path`,
            suggested_fix: `Create FREEZE-CONSTITUTION-${labSeries}.md or correct lab_series`,
            context: { lab_series: labSeries, expected_path: constitutionPath }
        });
    }

    // Check Reconciliation report filename matches
    const reconPath = path.join(GOVERNANCE_DIR, 'reconciliation', `ANCHOR-RECONCILIATION-REPORT-${labSeries}.md`);
    if (!fs.existsSync(reconPath)) {
        reporter.important({
            code: 'AUDIT-06-RECONCILIATION-VERSION-MISMATCH',
            layer: 'LAYER_7_GATES',
            file: reconPath,
            message: `Reconciliation report for ${labSeries} not found at expected path`,
            suggested_fix: `Create ANCHOR-RECONCILIATION-REPORT-${labSeries}.md or correct lab_series`,
            context: { lab_series: labSeries, expected_path: reconPath }
        });
    }

    // Verify SEAL content mentions the version
    if (fs.existsSync(sealPath)) {
        const sealContent = fs.readFileSync(sealPath, 'utf8');

        // Check title matches
        if (!sealContent.includes(`# SEAL-${labSeries}`)) {
            reporter.important({
                code: 'AUDIT-06-SEAL-CONTENT-VERSION-MISMATCH',
                layer: 'LAYER_7_GATES',
                file: sealPath,
                message: `SEAL title does not match lab_series ${labSeries}`,
                suggested_fix: `Update SEAL title to "# SEAL-${labSeries}"`,
                context: { lab_series: labSeries }
            });
        }
    }

    // Verify Constitution content mentions the version
    if (fs.existsSync(constitutionPath)) {
        const constitutionContent = fs.readFileSync(constitutionPath, 'utf8');

        if (!constitutionContent.includes(labSeries)) {
            reporter.cosmetic({
                code: 'AUDIT-06-CONSTITUTION-CONTENT-NO-VERSION',
                layer: 'LAYER_7_GATES',
                file: constitutionPath,
                message: `Constitution content does not reference ${labSeries}`,
                suggested_fix: `Consider adding version reference for clarity`,
                context: { lab_series: labSeries }
            });
        }
    }
}
