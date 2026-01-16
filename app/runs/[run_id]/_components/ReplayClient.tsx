'use client';

/**
 * Replay Client — Client-side component for evidence replay with state management.
 *
 * GOVERNANCE: Part of P0 Evidence Replayer (VLAB-DGB-01)
 */

import { useState, useCallback } from 'react';
import { TimelinePanel, type TimelineEvent } from './TimelinePanel';
import { StateDiffPanel, type DiffData } from './StateDiffPanel';
import { VerdictPanel, type VerdictData } from './VerdictPanel';
import { parseReplayLocator, isEventLocator, isDiffLocator } from '@/lib/runs/replayLocator';
import type { EvidencePointer } from '@/lib/verdict/types';

interface ReplayClientProps {
    events: TimelineEvent[];
    verdict: VerdictData | null;
    diffs: Record<string, DiffData>;  // keyed by diff path
}

export function ReplayClient({ events, verdict, diffs }: ReplayClientProps) {
    const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
    const [selectedDiff, setSelectedDiff] = useState<DiffData | null>(null);

    const handleEventSelect = useCallback((eventId: string) => {
        setSelectedEventId(eventId);
        // Scroll to event in timeline
        const element = document.getElementById(`event-${eventId}`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const handlePointerClick = useCallback((pointer: EvidencePointer) => {
        const locator = parseReplayLocator(pointer.locator);

        if (isEventLocator(locator)) {
            handleEventSelect(locator.eventId);
        } else if (isDiffLocator(locator)) {
            // Load diff from diffs map
            const diff = diffs[locator.diffPath];
            if (diff) {
                setSelectedDiff(diff);
            }
        }
    }, [diffs, handleEventSelect]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
            {/* Timeline Panel */}
            <div className="lg:col-span-1">
                <TimelinePanel
                    events={events}
                    selectedEventId={selectedEventId}
                    onEventSelect={handleEventSelect}
                />
            </div>

            {/* State Diff Panel */}
            <div className="lg:col-span-1">
                <StateDiffPanel diff={selectedDiff} />
            </div>

            {/* Verdict Panel */}
            <div className="lg:col-span-1">
                <VerdictPanel
                    verdict={verdict}
                    onPointerClick={handlePointerClick}
                />
            </div>
        </div>
    );
}
