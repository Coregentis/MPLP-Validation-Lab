/**
 * IO Utilities for Gates
 * 
 * Provides file reading, YAML loading, and directory walking utilities.
 * Used by V2 gates for data access.
 * 
 * Ticket: P1-03
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Read and parse a JSON file
 */
export function readJson<T = any>(filePath: string): T | null {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content) as T;
    } catch (e) {
        console.error(`[io] Failed to parse JSON: ${fullPath}`, e);
        return null;
    }
}

/**
 * Load and parse a YAML file (returns raw content as object via JSON parse of simple YAML)
 * For simplicity, this only supports JSON-like YAML (no advanced YAML features)
 */
export function loadYaml<T = any>(filePath: string): T | null {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // Use js-yaml for robust parsing (supports lists, nesting, etc.)
        const yaml = require('js-yaml');
        return yaml.load(content) as T;
    } catch (e) {
        console.error(`[io] Failed to load YAML: ${fullPath}`, e);
        return null;
    }
}

/**
 * Walk a directory recursively and return all file paths
 */
export function walkDir(dir: string, extensions?: string[]): string[] {
    const fullDir = dir.startsWith('/') ? dir : path.join(process.cwd(), dir);
    const results: string[] = [];

    if (!fs.existsSync(fullDir)) {
        return results;
    }

    const walk = (currentDir: string) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules and hidden directories
                if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    walk(fullPath);
                }
            } else if (entry.isFile()) {
                if (!extensions || extensions.some(ext => entry.name.endsWith(ext))) {
                    results.push(fullPath);
                }
            }
        }
    };

    walk(fullDir);
    return results;
}

/**
 * Calculate SHA256 hash of a file
 */
export function sha256File(filePath: string): string | null {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    try {
        const content = fs.readFileSync(fullPath);
        return crypto.createHash('sha256').update(content).digest('hex');
    } catch (e) {
        console.error(`[io] Failed to hash file: ${fullPath}`, e);
        return null;
    }
}

/**
 * Check if a path exists
 */
export function exists(filePath: string): boolean {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
}

/**
 * Read file content as string
 */
export function readFile(filePath: string): string | null {
    const fullPath = filePath.startsWith('/') ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    try {
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (e) {
        console.error(`[io] Failed to read file: ${fullPath}`, e);
        return null;
    }
}
