/**
 * Phase D: Strict YAML Loader
 * 
 * Replaces simplified YAML parsing with proper parser that:
 * - Detects duplicate keys (FAIL)
 * - Validates structure
 * - Provides clear error messages
 */

import * as fs from 'fs';
import { parseDocument, YAMLParseError } from 'yaml';

// =============================================================================
// Types
// =============================================================================

export interface YamlLoadResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface YamlLoadOptions {
    /** Strict mode: unknown fields cause errors (default: false for compatibility) */
    strict?: boolean;

    /** File path for error messages */
    filePath?: string;
}

// =============================================================================
// Core Loader
// =============================================================================

/**
 * Load and parse YAML file with strict validation.
 * Detects duplicate keys and provides clear error messages.
 * 
 * @throws Error on parse failure, duplicate keys, or file read error
 */
export function loadYamlStrict<T = unknown>(filePath: string): T {
    if (!fs.existsSync(filePath)) {
        throw new Error(`YAML file not found: ${sanitizePath(filePath)}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return parseYamlStrict<T>(content, { filePath });
}

/**
 * Parse YAML string with strict validation.
 * 
 * @throws Error on parse failure or duplicate keys
 */
export function parseYamlStrict<T = unknown>(
    content: string,
    options: YamlLoadOptions = {}
): T {
    const filePath = options.filePath ? sanitizePath(options.filePath) : '<string>';

    try {
        // Use parseDocument to detect warnings including duplicate keys
        const doc = parseDocument(content, {
            // Strict mode: map entries with identical keys will throw
            uniqueKeys: true,
            // Strict parsing
            strict: true,
        });

        // Check for errors
        if (doc.errors && doc.errors.length > 0) {
            const firstError = doc.errors[0];
            throw new Error(
                `YAML parse error in ${filePath}: ${firstError.message}`
            );
        }

        // Check for warnings (including duplicate keys in some yaml versions)
        if (doc.warnings && doc.warnings.length > 0) {
            const warnings = doc.warnings.map(w => w.message).join('; ');
            throw new Error(
                `YAML validation warning in ${filePath}: ${warnings}`
            );
        }

        const result = doc.toJS();

        if (result === undefined || result === null) {
            throw new Error(`YAML file is empty or null: ${filePath}`);
        }

        return result as T;

    } catch (e) {
        if (e instanceof YAMLParseError) {
            throw new Error(
                `YAML parse error in ${filePath}: ${e.message}`
            );
        }
        throw e;
    }
}

/**
 * Try to load YAML file, returning result object instead of throwing.
 */
export function tryLoadYaml<T = unknown>(
    filePath: string
): YamlLoadResult<T> {
    try {
        const data = loadYamlStrict<T>(filePath);
        return { success: true, data };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : String(e)
        };
    }
}

// =============================================================================
// Path Sanitization (User HARD-04)
// =============================================================================

/**
 * Remove absolute path components for error messages.
 * Prevents non-deterministic error messages in verdict_hash.
 */
export function sanitizePath(filePath: string): string {
    // Extract just the filename or relative path portion
    const parts = filePath.split('/');

    // If it looks like an absolute path, return last 3 components
    if (filePath.startsWith('/')) {
        return parts.slice(-3).join('/');
    }

    return filePath;
}

// =============================================================================
// Schema Validation Helpers
// =============================================================================

/**
 * Validate that an object has required fields.
 * Useful for ruleset manifest and requirements validation.
 */
export function validateRequiredFields<T extends object>(
    obj: T,
    requiredFields: string[],
    context: string
): void {
    const missing: string[] = [];

    for (const field of requiredFields) {
        if (!(field in obj)) {
            missing.push(field);
        }
    }

    if (missing.length > 0) {
        throw new Error(
            `Missing required fields in ${context}: ${missing.join(', ')}`
        );
    }
}

/**
 * Validate that a value is one of allowed options.
 */
export function validateEnum<T>(
    value: T,
    allowed: readonly T[],
    fieldName: string,
    context: string
): void {
    if (!allowed.includes(value)) {
        throw new Error(
            `Invalid ${fieldName} in ${context}: "${value}". Allowed: ${allowed.join(', ')}`
        );
    }
}
