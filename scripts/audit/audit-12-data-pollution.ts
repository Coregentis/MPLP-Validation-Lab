#!/usr/bin/env tsx
/**
 * AUDIT-12: Data Pollution Detection
  * 
 * Detects garbage data like table headers injected into JSON arrays.
 * Primary target: FMM (Field Mapping Matrix) substrate mappings.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AuditReporter } from './lib/report';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const FMM_PATH = path.join(PROJECT_ROOT, 'public/_data/fmm.json');

interface FMM {
    version: string;
    generated_at: string;
    core_elements: Array<{ pointer: string; description: string }>;
    substrates: Record<string, {
        mappings: Array<{
            source: string;
            target: string;
            rule: string;
        }>;
    }>;
}

// Known header row patterns that should NOT be in data
const HEADER_PATTERNS = [
    { field: 'source', values: ['Source Path', 'Source', 'Group'] },
    { field: 'target', values: ['Target Pointer', 'Target', 'Element'] },
    { field: 'rule', values: ['Rule', 'Status'] }
];

export default async function audit(reporter: AuditReporter): Promise<void> {
    // Check FMM file
    if (!fs.existsSync(FMM_PATH)) {
        reporter.important({
            code: 'AUDIT-12-FMM-MISSING',
            layer: 'LAYER_6_SCHEMA',
            file: FMM_PATH,
            message: 'FMM file does not exist',
            suggested_fix: 'Generate FMM if required'
        });
        return;
    }

    let fmm: FMM;
    try {
        fmm = JSON.parse(fs.readFileSync(FMM_PATH, 'utf8'));
    } catch (error) {
        reporter.critical({
            code: 'AUDIT-12-FMM-INVALID-JSON',
            layer: 'LAYER_6_SCHEMA',
            file: FMM_PATH,
            message: `FMM file is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
            suggested_fix: 'Fix JSON syntax or regenerate FMM'
        });
        return;
    }

    if (!fmm.substrates || typeof fmm.substrates !== 'object') {
        reporter.critical({
            code: 'AUDIT-12-FMM-INVALID-STRUCTURE',
            layer: 'LAYER_6_SCHEMA',
            file: FMM_PATH,
            pointer: '/substrates',
            message: 'FMM missing or invalid "substrates" object',
            suggested_fix: 'Regenerate FMM with correct structure'
        });
        return;
    }

    // Check each substrate's mappings
    Object.entries(fmm.substrates).forEach(([substrateId, substrate]) => {
        if (!substrate.mappings || !Array.isArray(substrate.mappings)) {
            reporter.critical({
                code: 'AUDIT-12-SUBSTRATE-INVALID-MAPPINGS',
                layer: 'LAYER_6_SCHEMA',
                file: FMM_PATH,
                pointer: `/substrates/${substrateId}/mappings`,
                message: `Substrate "${substrateId}" missing or invalid "mappings" array`,
                suggested_fix: 'Regenerate substrate mappings',
                context: { substrate_id: substrateId }
            });
            return;
        }

        substrate.mappings.forEach((mapping, idx) => {
            const mappingPointer = `/substrates/${substrateId}/mappings[${idx}]`;

            // Check for header row pollution
            HEADER_PATTERNS.forEach(pattern => {
                const fieldValue = (mapping as any)[pattern.field];

                if (fieldValue && pattern.values.includes(fieldValue)) {
                    reporter.blocker({
                        code: 'AUDIT-12-HEADER-ROW-POLLUTION',
                        layer: 'LAYER_6_SCHEMA',
                        file: FMM_PATH,
                        pointer: `${mappingPointer}/${pattern.field}`,
                        message: `Garbage header row detected in ${substrateId} mappings: "${pattern.field}": "${fieldValue}"`,
                        suggested_fix: 'Filter out header rows in FMM generation script',
                        context: {
                            substrate_id: substrateId,
                            mapping_index: idx,
                            field: pattern.field,
                            value: fieldValue,
                            full_mapping: mapping
                        }
                    });
                }
            });

            // Check for obviously placeholder/invalid data
            if (mapping.source === mapping.target && mapping.source === mapping.rule) {
                reporter.critical({
                    code: 'AUDIT-12-DUPLICATE-VALUES',
                    layer: 'LAYER_6_SCHEMA',
                    file: FMM_PATH,
                    pointer: mappingPointer,
                    message: `Suspicious mapping with identical source/target/rule in ${substrateId}`,
                    suggested_fix: 'Review mapping data for correctness',
                    context: { substrate_id: substrateId, mapping }
                });
            }

            // Check for empty/null values where they shouldn't be
            if (!mapping.source || !mapping.target || !mapping.rule) {
                reporter.critical({
                    code: 'AUDIT-12-MISSING-REQUIRED-FIELD',
                    layer: 'LAYER_6_SCHEMA',
                    file: FMM_PATH,
                    pointer: mappingPointer,
                    message: `Mapping in ${substrateId} missing required field(s)`,
                    suggested_fix: 'Ensure all mappings have source, target, and rule',
                    context: {
                        substrate_id: substrateId,
                        mapping,
                        missing_source: !mapping.source,
                        missing_target: !mapping.target,
                        missing_rule: !mapping.rule
                    }
                });
            }
        });
    });

    // Check for duplicate substrates (case sensitivity issues)
    const substrateIds = Object.keys(fmm.substrates);
    const lowercaseIds = substrateIds.map(id => id.toLowerCase());
    const uniqueLowercaseIds = new Set(lowercaseIds);

    if (lowercaseIds.length !== uniqueLowercaseIds.size) {
        reporter.important({
            code: 'AUDIT-12-DUPLICATE-SUBSTRATE-IDS',
            layer: 'LAYER_6_SCHEMA',
            file: FMM_PATH,
            pointer: '/substrates',
            message: 'Potential duplicate substrate IDs (case-insensitive)',
            suggested_fix: 'Use consistent casing for substrate IDs',
            context: { substrate_ids: substrateIds }
        });
    }
}
