/**
 * Lab Manifest SSOT Loader
 * 
 * Centralized access to lab-manifest.json.
 * All version/anchor/boundary reads should go through this module.
 * 
 * P2-0: Single source of truth for Lab governance metadata
 */

import labManifest from '@/public/_meta/lab-manifest.json';

// Type definitions
export interface LabManifest {
    version: string;
    entry: string;
    generated_at: string;
    protocol_version: string;
    schema_bundle_version: string;
    lab_series: string;
    baseline_commit_sha: string;
    tripod: {
        website_anchor: string;
        docs_anchor: string;
        repo_anchor: string;
        lab_anchor: string;
    };
    anchors: {
        validation_hub: string;
        evidence_gallery: string;
        policies_root: string;
        fmm: string;
        cross_verified: string;
        cross_verified_report: string;
        cross_verified_report_sha256: string;
        sample_set_manifest_sha256: string;
        runs: string;
        rulesets: string;
    };
    boundaries: string[];
    gates: {
        public_minimum: string[];
        internal_operational: string[];
    };
}

// Runtime validation
function validateManifest(manifest: unknown): asserts manifest is LabManifest {
    const m = manifest as LabManifest;
    if (!m.lab_series) throw new Error('lab-manifest.json: missing lab_series');
    if (!m.protocol_version) throw new Error('lab-manifest.json: missing protocol_version');
    if (!m.tripod) throw new Error('lab-manifest.json: missing tripod');
    if (!m.boundaries || !Array.isArray(m.boundaries)) {
        throw new Error('lab-manifest.json: missing or invalid boundaries');
    }
}

// Validate on module load
validateManifest(labManifest);

/**
 * Get the current Lab series version (e.g., "v0.10.2")
 */
export function getLabSeries(): string {
    return labManifest.lab_series;
}

/**
 * Get the protocol version (e.g., "1.0.0")
 */
export function getProtocolVersion(): string {
    return labManifest.protocol_version;
}

/**
 * Get the schema bundle version (e.g., "2.0.0")
 */
export function getSchemaBundleVersion(): string {
    return labManifest.schema_bundle_version;
}

/**
 * Get the tripod anchors (website, docs, repo, lab)
 */
export function getTripodAnchors() {
    return labManifest.tripod;
}

/**
 * Get the internal Lab anchors (policies, runs, rulesets, etc.)
 */
export function getLabAnchors() {
    return labManifest.anchors;
}

/**
 * Get the declared boundary IDs
 */
export function getBoundaryIds(): string[] {
    return labManifest.boundaries;
}

/**
 * Get the list of active gates
 */
export function getActiveGates(): string[] {
    return labManifest.gates.internal_operational;
}

/**
 * Get the full manifest (for advanced use cases)
 */
export function getFullManifest(): LabManifest {
    return labManifest as LabManifest;
}
