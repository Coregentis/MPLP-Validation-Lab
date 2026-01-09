/**
 * File Scanning Utilities
 * 
 * Recursive file walking, content reading, match location.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ScanOptions {
    includeExtensions: string[];   // e.g. [".ts", ".tsx", ".md"]
    excludeDirs: string[];         // e.g. ["node_modules", ".next", "dist"]
    maxFileSizeBytes?: number;     // default: 2MB
}

export interface TextMatch {
    index: number;     // 0-based char index
    line: number;      // 1-based
    column: number;    // 1-based
    excerpt: string;   // small excerpt
}

export function walkFiles(root: string, opts: ScanOptions): string[] {
    const results: string[] = [];
    const maxSize = opts.maxFileSizeBytes ?? 2 * 1024 * 1024;

    function walk(dir: string) {
        let entries: fs.Dirent[];
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch {
            return;
        }

        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                if (opts.excludeDirs.includes(ent.name)) continue;
                walk(full);
                continue;
            }
            if (!ent.isFile()) continue;

            const ext = path.extname(ent.name).toLowerCase();
            if (!opts.includeExtensions.includes(ext)) continue;

            try {
                const stat = fs.statSync(full);
                if (stat.size > maxSize) continue;
            } catch {
                continue;
            }
            results.push(full);
        }
    }

    walk(root);
    return results;
}

export function readTextFileSafe(filePath: string): string | null {
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch {
        return null;
    }
}

export function findAllOccurrences(content: string, needle: string): number[] {
    const idxs: number[] = [];
    if (!needle) return idxs;
    let start = 0;
    while (true) {
        const i = content.indexOf(needle, start);
        if (i === -1) break;
        idxs.push(i);
        start = i + Math.max(1, needle.length);
    }
    return idxs;
}

export function locateIndex(content: string, index: number): { line: number; column: number } {
    // 1-based line/column
    let line = 1;
    let col = 1;
    for (let i = 0; i < index && i < content.length; i++) {
        const ch = content[i];
        if (ch === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }
    }
    return { line, column: col };
}

export function excerptAt(content: string, index: number, width = 40): string {
    const start = Math.max(0, index - width);
    const end = Math.min(content.length, index + width);
    return content.slice(start, end).replace(/\s+/g, ' ').trim();
}
