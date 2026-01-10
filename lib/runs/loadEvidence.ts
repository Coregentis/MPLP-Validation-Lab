/**
 * Evidence File Loader
 * 
 * Loads evidence files from run directories with security checks.
 * Supports content preview with locator-based navigation.
 */

import * as path from 'path';
import * as fs from 'fs';
import { safeJoinPath, safeGetFileStats, MAX_PREVIEW_SIZE } from '@/lib/security/allowlist';
import { parseLocator, getLineContext, getNDJSONEvent, LocatorResult } from './locator';

const RUNS_ROOT = path.join(process.cwd(), 'data', 'runs');

export interface EvidenceLoadResult {
    success: boolean;
    error?: string;
    filePath?: string;
    fileName?: string;
    contentType?: 'text' | 'json' | 'ndjson' | 'yaml' | 'binary';
    content?: string;
    lines?: { num: number; content: string; highlight: boolean }[];
    totalLines?: number;
    locator?: LocatorResult | null;
    tooLarge?: boolean;
    fileSize?: number;
}

/** Allowed evidence file extensions */
const TEXT_EXTENSIONS = ['.json', '.yaml', '.yml', '.txt', '.ndjson', '.log', '.md'];

/**
 * Check if file extension is previewable
 */
function isPreviewable(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return TEXT_EXTENSIONS.includes(ext);
}

/**
 * Determine content type from filename
 */
function getContentType(filename: string): EvidenceLoadResult['contentType'] {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
        case '.json':
            return 'json';
        case '.yaml':
        case '.yml':
            return 'yaml';
        case '.ndjson':
            return 'ndjson';
        case '.txt':
        case '.log':
        case '.md':
            return 'text';
        default:
            return 'binary';
    }
}

/**
 * Load evidence file content for preview
 */
export function loadEvidence(
    runId: string,
    artifactPath: string,
    locatorStr?: string
): EvidenceLoadResult {
    // Validate run_id pattern
    if (!runId || !/^[a-z0-9][a-z0-9._-]*$/i.test(runId)) {
        return { success: false, error: 'Invalid run_id' };
    }

    // Build safe path
    const fullPath = safeJoinPath(RUNS_ROOT, runId, artifactPath);
    if (!fullPath) {
        return { success: false, error: 'Invalid path' };
    }

    // Check file exists
    const stats = safeGetFileStats(fullPath);
    if (!stats) {
        return { success: false, error: 'File not found' };
    }

    const fileName = path.basename(artifactPath);

    // Check if previewable
    if (!isPreviewable(fileName)) {
        return {
            success: true,
            filePath: artifactPath,
            fileName,
            contentType: 'binary',
            error: 'Binary file - not previewable',
        };
    }

    // Check size
    if (stats.size > MAX_PREVIEW_SIZE) {
        return {
            success: true,
            filePath: artifactPath,
            fileName,
            contentType: getContentType(fileName),
            tooLarge: true,
            fileSize: stats.size,
            error: 'File too large for preview',
        };
    }

    // Read content
    let content: string;
    try {
        content = fs.readFileSync(fullPath, 'utf-8');
    } catch {
        return { success: false, error: 'Failed to read file' };
    }

    const contentType = getContentType(fileName);
    const locator = parseLocator(locatorStr);

    // Apply locator if present
    if (locator) {
        const lines = content.split('\n');

        if (locator.type === 'line' && locator.startLine && locator.endLine) {
            const context = getLineContext(lines, locator.startLine, locator.endLine);
            return {
                success: true,
                filePath: artifactPath,
                fileName,
                contentType,
                lines: context.lines,
                totalLines: context.totalLines,
                locator,
            };
        }

        if (locator.type === 'event' && contentType === 'ndjson' && locator.eventIndex !== undefined) {
            const events = getNDJSONEvent(content, locator.eventIndex);
            return {
                success: true,
                filePath: artifactPath,
                fileName,
                contentType,
                lines: events.events.map(e => ({
                    num: e.index,
                    content: e.content,
                    highlight: e.highlight,
                })),
                totalLines: events.totalEvents,
                locator,
            };
        }
    }

    // Return full content with line numbers
    const allLines = content.split('\n').map((line, i) => ({
        num: i + 1,
        content: line,
        highlight: false,
    }));

    return {
        success: true,
        filePath: artifactPath,
        fileName,
        contentType,
        content,
        lines: allLines.slice(0, 500), // Limit to first 500 lines for UI
        totalLines: allLines.length,
        locator,
    };
}

/**
 * List evidence files in a run directory (for discovery)
 */
export function listEvidenceFiles(runId: string): string[] {
    const runPath = safeJoinPath(RUNS_ROOT, runId);
    if (!runPath) return [];

    try {
        const entries = fs.readdirSync(runPath, { withFileTypes: true, recursive: true });
        return entries
            .filter(e => e.isFile())
            .map(e => {
                const filePath = path.join(e.parentPath || e.path, e.name);
                return path.relative(runPath, filePath);
            })
            .filter(f => !f.startsWith('.'));
    } catch {
        return [];
    }
}
