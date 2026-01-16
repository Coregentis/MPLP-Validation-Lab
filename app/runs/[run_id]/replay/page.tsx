import { getCuratedRuns } from '@/lib/curated/load-curated-runs';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import * as fs from 'fs';
import * as path from 'path';
import { ProvenanceFooter } from '@/components/ProvenanceFooter';
import { ReplayDisclaimer } from '@/app/runs/[run_id]/_components/ReplayDisclaimer';
import { ReplayClient } from '@/app/runs/[run_id]/_components/ReplayClient';
import type { TimelineEvent } from '@/app/runs/[run_id]/_components/TimelinePanel';
import type { DiffData } from '@/app/runs/[run_id]/_components/StateDiffPanel';
import type { VerdictData } from '@/app/runs/[run_id]/_components/VerdictPanel';

// GATE-06: Default to noindex for replay pages
export const metadata = {
    title: 'Evidence Replay',
    robots: { index: false, follow: false }
};

export async function generateStaticParams() {
    const data = getCuratedRuns();
    return data.runs.map(run => ({ run_id: run.run_id }));
}

/**
 * Normalize event format from real packs to TimelineEvent interface.
 * Real packs may use different field names (type/event vs event_id/event_type).
 */
function normalizeEvent(raw: Record<string, unknown>, index: number): TimelineEvent {
    // Check for standard format first
    if (raw.event_id && raw.event_type) {
        return raw as unknown as TimelineEvent;
    }
    // Normalize from real pack format (type/event/context_id etc.)
    return {
        event_id: raw.context_id || raw.plan_id || raw.trace_id || `evt-${index + 1}`,
        event_type: raw.event || raw.type || 'unknown',
        timestamp: raw.timestamp || new Date().toISOString(),
        source_module: raw.type || 'lifecycle',
        payload: raw,
    } as TimelineEvent;
}

/**
 * Load replay data from run directory (data/runs/).
 * NO FALLBACK to fixtures - if data doesn't exist, return empty.
 * This prevents mixing fixture data with real pack data.
 */
function loadReplayData(runId: string): {
    events: TimelineEvent[];
    verdict: VerdictData | null;
    diffs: Record<string, DiffData>;
    source: 'data/runs' | 'not_found';
    hasEvents: boolean;
    hasVerdict: boolean;
    hasDiffs: boolean;
} {
    const dataRunsBase = path.join(process.cwd(), 'data/runs', runId);

    // Check if run directory exists
    const runExists = fs.existsSync(path.join(dataRunsBase, 'manifest.json'));

    if (!runExists) {
        return {
            events: [],
            verdict: null,
            diffs: {},
            source: 'not_found',
            hasEvents: false,
            hasVerdict: false,
            hasDiffs: false,
        };
    }

    // Load events from timeline/events.ndjson
    let events: TimelineEvent[] = [];
    const eventsPath = path.join(dataRunsBase, 'timeline/events.ndjson');
    const hasEvents = fs.existsSync(eventsPath);
    if (hasEvents) {
        const content = fs.readFileSync(eventsPath, 'utf-8');
        events = content
            .split('\n')
            .filter(line => line.trim())
            .map((line, i) => normalizeEvent(JSON.parse(line), i));
    }

    // Load verdict from verdict.json (may not exist)
    let verdict: VerdictData | null = null;
    const verdictPath = path.join(dataRunsBase, 'verdict.json');
    const hasVerdict = fs.existsSync(verdictPath);
    if (hasVerdict) {
        verdict = JSON.parse(fs.readFileSync(verdictPath, 'utf-8')) as VerdictData;
    }

    // Load diffs from snapshots/diffs/ (may not exist)
    const diffs: Record<string, DiffData> = {};
    const diffsDir = path.join(dataRunsBase, 'snapshots/diffs');
    const hasDiffs = fs.existsSync(diffsDir);
    if (hasDiffs) {
        const diffFiles = fs.readdirSync(diffsDir).filter(f => f.endsWith('.json'));
        for (const file of diffFiles) {
            const diffPath = `snapshots/diffs/${file}`;
            const fullPath = path.join(diffsDir, file);
            diffs[diffPath] = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as DiffData;
        }
    }

    return { events, verdict, diffs, source: 'data/runs', hasEvents, hasVerdict, hasDiffs };
}

export default async function ReplayPage({ params }: { params: Promise<{ run_id: string }> }) {
    const { run_id } = await params;
    const data = getCuratedRuns();
    const run = data.runs.find(r => r.run_id === run_id);

    if (!run) {
        notFound();
    }

    // Load replay data (P0: from fixtures)
    const { events, verdict, diffs } = loadReplayData(run_id);

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <nav className="text-sm text-mplp-text-muted mb-2">
                        <Link href="/runs" className="hover:text-mplp-text transition-colors">Runs</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/runs/${run.run_id}`} className="hover:text-mplp-text transition-colors">{run.run_id}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-mplp-text">Replay</span>
                    </nav>
                    <h1 className="text-2xl sm:text-3xl font-bold text-mplp-text">
                        Evidence Replay
                    </h1>
                    <p className="text-sm text-mplp-text-muted mt-1">
                        Run: <code className="font-mono text-mplp-blue-soft">{run.run_id}</code>
                    </p>
                </div>
            </div>

            {/* Non-endorsement Disclaimer */}
            <ReplayDisclaimer />

            {/* Three-Panel Replay Layout */}
            <ReplayClient
                events={events}
                verdict={verdict}
                diffs={diffs}
            />

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-mplp-border/30">
                <ProvenanceFooter ssot={data.ssot} />
            </div>
        </div>
    );
}
