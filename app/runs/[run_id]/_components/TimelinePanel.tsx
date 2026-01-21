/**
 * Timeline Panel — Displays event sequence from evidence pack timeline.
 *
 * GOVERNANCE: Part of P0 Evidence Replayer (VLAB-DGB-01)
 */

export interface TimelineEvent {
    event_id: string;
    event_type: string;
    timestamp: string;
    source_module: string;
    payload?: Record<string, unknown>;
}

interface TimelinePanelProps {
    events: TimelineEvent[];
    selectedEventId?: string;
    onEventSelect?: (eventId: string) => void;
}

const eventTypeColors: Record<string, string> = {
    'context.created': 'bg-mplp-blue-soft/20 text-mplp-blue-soft border-mplp-blue-soft/30',
    'plan.created': 'bg-mplp-indigo/20 text-mplp-indigo border-mplp-indigo/30',
    'trace.started': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'step.executed': 'bg-mplp-emerald/20 text-mplp-emerald border-mplp-emerald/30',
    'trace.completed': 'bg-green-500/20 text-green-400 border-green-500/30',
};

function getEventTypeColor(eventType: string): string {
    return eventTypeColors[eventType] || 'bg-mplp-dark-soft/40 text-mplp-text-muted border-mplp-border/30';
}

export function TimelinePanel({ events, selectedEventId, onEventSelect }: TimelinePanelProps) {
    return (
        <section className="bg-mplp-dark-soft/60 border border-mplp-border/30 rounded-xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="bg-mplp-dark-soft/80 px-4 py-3 border-b border-mplp-border/30 flex justify-between items-center shrink-0">
                <h2 className="text-sm font-bold uppercase tracking-wider text-mplp-text">Timeline</h2>
                <span className="text-xs text-mplp-text-muted">{events.length} events</span>
            </div>

            {/* Event List */}
            <ul className="divide-y divide-mplp-border/20 overflow-y-auto flex-grow">
                {events.map((event, index) => {
                    const isSelected = event.event_id === selectedEventId;
                    return (
                        <li
                            key={event.event_id}
                            id={`event-${event.event_id}`}
                            className={`px-4 py-3 cursor-pointer transition-colors ${isSelected
                                ? 'bg-mplp-blue-soft/20 border-l-2 border-mplp-blue-soft'
                                : 'hover:bg-mplp-dark-soft/40 border-l-2 border-transparent'
                                }`}
                            onClick={() => onEventSelect?.(event.event_id)}
                        >
                            <div className="flex items-start gap-3">
                                {/* Index */}
                                <span className="text-xs font-mono text-mplp-text-muted/60 w-4 shrink-0">
                                    {index + 1}
                                </span>

                                <div className="flex-grow min-w-0">
                                    {/* Event Type Pill */}
                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border mb-1 ${getEventTypeColor(event.event_type)}`}>
                                        {event.event_type}
                                    </span>

                                    {/* Event ID */}
                                    <p className="font-mono text-xs text-mplp-text truncate">
                                        {event.event_id}
                                    </p>

                                    {/* Timestamp */}
                                    <p className="text-[10px] text-mplp-text-muted/60 mt-1">
                                        {event.timestamp.slice(11, 19)} UTC
                                    </p>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Empty State */}
            {events.length === 0 && (
                <div className="p-4 text-sm text-mplp-text-muted text-center">
                    No events in timeline
                </div>
            )}
        </section>
    );
}
