/**
 * Export JSON Loader
 * 
 * Server-side loader for export JSON files.
 * Uses fs.readFileSync to read from process.cwd()/export/ at runtime.
 * 
 * This ensures export files are treated as runtime assets, not bundled imports.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const EXPORT_DIR = join(process.cwd(), 'export');
const ADJUDICATION_DIR = join(process.cwd(), 'adjudication');

/**
 * Load a JSON file from the export directory
 */
export function loadExportJson<T>(fileName: string): T {
    const filePath = join(EXPORT_DIR, fileName);
    if (!existsSync(filePath)) {
        throw new Error(`Missing export file: export/${fileName}`);
    }
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

/**
 * Load a JSON file from an adjudication bundle
 */
export function loadAdjudicationFile<T>(runId: string, fileName: string): T | null {
    const filePath = join(ADJUDICATION_DIR, runId, fileName);
    if (!existsSync(filePath)) {
        return null;
    }
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
}

/**
 * Load a text file from an adjudication bundle
 */
export function loadAdjudicationTextFile(runId: string, fileName: string): string | null {
    const filePath = join(ADJUDICATION_DIR, runId, fileName);
    if (!existsSync(filePath)) {
        return null;
    }
    return readFileSync(filePath, 'utf-8');
}

/**
 * Check if an adjudication bundle exists
 */
export function adjudicationBundleExists(runId: string): boolean {
    const bundlePath = join(ADJUDICATION_DIR, runId);
    return existsSync(bundlePath);
}

// Type definitions for export JSON files
export interface AdjudicationEntry {
    run_id: string;
    bundle_path: string;
    verdict_path: string;
    verdict_hash: string;
    ruleset_version: string;
    protocol_pin: string;
    admission_status: string;
    overall_status: string;
    adjudicated_at: string;
}

export interface AdjudicationIndex {
    adjudications: AdjudicationEntry[];
}

export interface Verdict {
    adjudication_version: string;
    run_id: string;
    verifier: {
        id: string;
        version: string;
    };
    ruleset_version: string;
    protocol_pin: string;
    adjudicated_at: string;
    admission_status: string;
    golden_flow_results: {
        [key: string]: {
            status: string;
            evidence_refs: string[];
        };
    };
    overall_status: string;
    verdict_hash: string;
}
