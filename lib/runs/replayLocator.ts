/**
 * Replay Locator Parser — Parses evidence pointer locators for replay navigation.
 *
 * GOVERNANCE: Part of P0 Evidence Replayer (VLAB-DGB-01)
 * 
 * Locator formats supported:
 *   - event:<event_id>     → Jump to timeline event
 *   - diff:<path>          → Load diff file
 *   - jsonptr:<pointer>    → JSON pointer (future extension)
 *   - L<start>-L<end>      → Line range (existing format)
 */

export type ReplayLocatorType = 'event' | 'diff' | 'jsonptr' | 'line' | 'unknown';

export interface ReplayLocator {
    type: ReplayLocatorType;
    /** Event ID for event type */
    eventId?: string;
    /** Diff file path for diff type */
    diffPath?: string;
    /** JSON pointer for jsonptr type */
    pointer?: string;
    /** Line range for line type */
    startLine?: number;
    endLine?: number;
    /** Original locator string */
    raw: string;
}

/**
 * Parse a locator string into a structured ReplayLocator.
 */
export function parseReplayLocator(locator: string | undefined): ReplayLocator | null {
    if (!locator) return null;

    const trimmed = locator.trim();

    // event:<event_id>
    if (trimmed.startsWith('event:')) {
        const eventId = trimmed.slice(6);
        return {
            type: 'event',
            eventId,
            raw: trimmed,
        };
    }

    // diff:<path>
    if (trimmed.startsWith('diff:')) {
        const diffPath = trimmed.slice(5);
        return {
            type: 'diff',
            diffPath,
            raw: trimmed,
        };
    }

    // jsonptr:<pointer>
    if (trimmed.startsWith('jsonptr:')) {
        const pointer = trimmed.slice(8);
        return {
            type: 'jsonptr',
            pointer,
            raw: trimmed,
        };
    }

    // L<start>-L<end> (e.g., L10-L20)
    const lineMatch = trimmed.match(/^L(\d+)-L(\d+)$/i);
    if (lineMatch) {
        return {
            type: 'line',
            startLine: parseInt(lineMatch[1], 10),
            endLine: parseInt(lineMatch[2], 10),
            raw: trimmed,
        };
    }

    // L<line> (single line)
    const singleLineMatch = trimmed.match(/^L(\d+)$/i);
    if (singleLineMatch) {
        const line = parseInt(singleLineMatch[1], 10);
        return {
            type: 'line',
            startLine: line,
            endLine: line,
            raw: trimmed,
        };
    }

    // Unknown format
    return {
        type: 'unknown',
        raw: trimmed,
    };
}

/**
 * Check if a locator points to an event.
 */
export function isEventLocator(locator: ReplayLocator | null): locator is ReplayLocator & { type: 'event'; eventId: string } {
    return locator?.type === 'event' && !!locator.eventId;
}

/**
 * Check if a locator points to a diff file.
 */
export function isDiffLocator(locator: ReplayLocator | null): locator is ReplayLocator & { type: 'diff'; diffPath: string } {
    return locator?.type === 'diff' && !!locator.diffPath;
}
