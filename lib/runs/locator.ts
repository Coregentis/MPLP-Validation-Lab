/**
 * Locator Parser
 * 
 * Parses locator strings to identify content positions within evidence files.
 * 
 * Supported formats:
 * - Line range: "L10" or "L10-L20"
 * - JSON pointer: "/path/to/key"
 * - Event index: "event:5" (for NDJSON)
 */

export interface LocatorResult {
    type: 'line' | 'json_pointer' | 'event' | 'unknown';
    startLine?: number;
    endLine?: number;
    pointer?: string;
    eventIndex?: number;
    raw: string;
}

/**
 * Parse a locator string into structured format
 */
export function parseLocator(locator: string | undefined | null): LocatorResult | null {
    if (!locator) return null;

    const raw = locator.trim();
    if (!raw) return null;

    // Line range: L10 or L10-L20
    const lineMatch = raw.match(/^L(\d+)(?:-L(\d+))?$/i);
    if (lineMatch) {
        const startLine = parseInt(lineMatch[1], 10);
        const endLine = lineMatch[2] ? parseInt(lineMatch[2], 10) : startLine;
        return {
            type: 'line',
            startLine,
            endLine,
            raw,
        };
    }

    // JSON pointer: /path/to/key
    if (raw.startsWith('/')) {
        return {
            type: 'json_pointer',
            pointer: raw,
            raw,
        };
    }

    // Event index: event:5
    const eventMatch = raw.match(/^event:(\d+)$/i);
    if (eventMatch) {
        return {
            type: 'event',
            eventIndex: parseInt(eventMatch[1], 10),
            raw,
        };
    }

    return {
        type: 'unknown',
        raw,
    };
}

/**
 * Get context lines around a target line for preview
 */
export function getLineContext(
    lines: string[],
    startLine: number,
    endLine: number,
    contextBefore: number = 3,
    contextAfter: number = 3
): { lines: { num: number; content: string; highlight: boolean }[]; totalLines: number } {
    const start = Math.max(0, startLine - 1 - contextBefore);
    const end = Math.min(lines.length, endLine + contextAfter);

    const result = [];
    for (let i = start; i < end; i++) {
        result.push({
            num: i + 1,
            content: lines[i],
            highlight: i + 1 >= startLine && i + 1 <= endLine,
        });
    }

    return {
        lines: result,
        totalLines: lines.length,
    };
}

/**
 * Get NDJSON event by index
 */
export function getNDJSONEvent(
    content: string,
    eventIndex: number,
    contextEvents: number = 2
): { events: { index: number; content: string; highlight: boolean }[]; totalEvents: number } {
    const lines = content.split('\n').filter(l => l.trim());
    const start = Math.max(0, eventIndex - contextEvents);
    const end = Math.min(lines.length, eventIndex + 1 + contextEvents);

    const result = [];
    for (let i = start; i < end; i++) {
        result.push({
            index: i,
            content: lines[i],
            highlight: i === eventIndex,
        });
    }

    return {
        events: result,
        totalEvents: lines.length,
    };
}
