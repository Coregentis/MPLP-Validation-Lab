import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as yaml from 'js-yaml';

/**
 * normalize-pack.ts
 * Implements v0.10.2.1: Normalized Projection per governance SSOTs
 * 
 * Reads: normalization-spec.yaml, hash-scope.yaml
 * Outputs: normalized_evidence.json, normalized_hash.txt
 */

const PROJECT_ROOT = process.cwd();
const GOVERNANCE_DIR = path.join(PROJECT_ROOT, 'governance/mappings');
const RUNS_DIR = path.join(PROJECT_ROOT, 'data/runs');
const DERIVED_DIR = path.join(PROJECT_ROOT, 'data/derived/normalized');

// Load SSOTs
const normSpec = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'normalization-spec.yaml'), 'utf8')) as any;
const hashScope = yaml.load(fs.readFileSync(path.join(GOVERNANCE_DIR, 'hash-scope.yaml'), 'utf8')) as any;

interface NormalizedEvidence {
    _meta: {
        normalization_spec_version: string;
        hash_scope_version: string;
        source_run_id: string;
        generated_at: string;
    };
    manifest: Record<string, any>;
    timeline: { events: any[] };
    artifacts: Record<string, any>;
    verdict: Record<string, any>;
}

/**
 * Normalize a single pack according to SSOT rules
 */
function normalizePack(runId: string): { normalized: NormalizedEvidence; hash: string } | null {
    const packDir = path.join(RUNS_DIR, runId);

    if (!fs.existsSync(packDir)) {
        console.error(`❌ Pack not found: ${runId}`);
        return null;
    }

    // Load pack components
    const manifestPath = path.join(packDir, 'manifest.json');
    const timelinePath = path.join(packDir, 'timeline.json');
    const verdictPath = path.join(packDir, 'verdict.json');
    const planPath = path.join(packDir, 'artifacts', 'plan.json');
    const tracePath = path.join(packDir, 'artifacts', 'trace.json');

    const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
    const timeline = fs.existsSync(timelinePath) ? JSON.parse(fs.readFileSync(timelinePath, 'utf8')) : { events: [] };
    const verdict = fs.existsSync(verdictPath) ? JSON.parse(fs.readFileSync(verdictPath, 'utf8')) : {};
    const plan = fs.existsSync(planPath) ? JSON.parse(fs.readFileSync(planPath, 'utf8')) : null;
    const trace = fs.existsSync(tracePath) ? JSON.parse(fs.readFileSync(tracePath, 'utf8')) : null;

    // Apply projection rules per normalization-spec.yaml
    const normalized: NormalizedEvidence = {
        _meta: {
            normalization_spec_version: normSpec.version,
            hash_scope_version: hashScope.version,
            source_run_id: runId,
            generated_at: new Date().toISOString()
        },
        manifest: {
            run_id: manifest.run_id || runId,
            scenario_id: manifest.scenario_id,
            scenario_family: manifest.scenario_family || deriveScenarioFamily(manifest.scenario_id, runId),
            ruleset_version: manifest.ruleset_version,
            substrate: manifest.substrate,
            producer_version: manifest.producer_version
            // timestamp: REDACTED per normalization-spec
        },
        timeline: {
            events: normalizeTimelineEvents(timeline.events || [])
        },
        artifacts: {
            'plan.json': plan ? canonicalizeJson(plan) : null,
            'trace.json': trace ? canonicalizeJson(trace) : null,
            'verdict.json': verdict ? canonicalizeJson(verdict) : null
        },
        verdict: {
            status: verdict.status,
            reason_code: verdict.reason_code,
            admission: verdict.admission || { status: 'unknown' }
        }
    };

    // Generate canonical JSON for hashing (excludes _meta.generated_at)
    const hashableContent = createHashableContent(normalized);
    const hash = crypto.createHash('sha256').update(hashableContent).digest('hex');

    return { normalized, hash };
}

/**
 * Derive scenario family from scenario_id or run_id
 * Patterns: v05-d1-langgraph-pass-budget-allow → d1-budget
 */
function deriveScenarioFamily(scenarioId: string | undefined, runId: string): string {
    if (scenarioId && scenarioId !== 'unknown') {
        const match = scenarioId.match(/^(d[1-4])-([a-z]+)/i);
        if (match) return `${match[1]}-${match[2]}`;
    }

    // Extract from run_id: v05-d1-langgraph-pass-budget-allow → d1-budget
    const runMatch = runId.match(/v0\d+-(d[1-4])-[a-z]+-(?:pass|fail)-([a-z]+)/i);
    if (runMatch) {
        return `${runMatch[1]}-${runMatch[2]}`;
    }

    // Fallback: extract d1/d2/d3/d4 from run_id
    const domainMatch = runId.match(/d([1-4])/);
    if (domainMatch) {
        return `d${domainMatch[1]}`;
    }

    return 'unknown';
}

/**
 * Normalize timeline events per HP-10.2-03 (stable sort, redact timestamps)
 */
function normalizeTimelineEvents(events: any[]): any[] {
    return events
        .map((event, idx) => ({
            event_id: event.event_id || event.id || `evt-${idx}`,
            event_type: event.event_type || event.type,
            actor: event.actor || event.agent || 'unknown',
            sequence: event.sequence ?? event.idx ?? idx,
            payload: event.payload ? canonicalizeJson(event.payload) : null
            // timestamp: REDACTED per normalization-spec
        }))
        .sort((a, b) => {
            // HP-10.2-03: stable_sort_by_sequence_then_event_id
            if (a.sequence !== b.sequence) return a.sequence - b.sequence;
            return String(a.event_id).localeCompare(String(b.event_id));
        });
}

/**
 * Canonicalize JSON per hash-scope.yaml rules
 */
function canonicalizeJson(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (typeof obj !== 'object') {
        if (typeof obj === 'number') {
            // HP-10.2-02: 6 decimal precision, strip trailing zeros
            return parseFloat(obj.toFixed(6));
        }
        if (typeof obj === 'string') {
            // HP-10.2-04: normalize line endings, strip trailing whitespace per line
            return obj.split('\n').map(line => line.replace(/\s+$/, '')).join('\n');
        }
        return obj;
    }
    if (Array.isArray(obj)) {
        return obj.map(item => canonicalizeJson(item));
    }
    // Object: sort keys alphabetically
    const sorted: Record<string, any> = {};
    Object.keys(obj).sort().forEach(key => {
        const value = canonicalizeJson(obj[key]);
        if (value !== null && value !== undefined) {
            sorted[key] = value;
        }
    });
    return sorted;
}

/**
 * Create hashable content (excludes volatile fields)
 */
function createHashableContent(normalized: NormalizedEvidence): string {
    // Clone and remove volatile fields
    const hashable = JSON.parse(JSON.stringify(normalized));
    delete hashable._meta.generated_at;  // Volatile

    // Compact JSON with sorted keys (already done by canonicalize)
    return JSON.stringify(hashable, null, 0);
}

/**
 * Main execution
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: npx tsx scripts/normalize-pack.ts <run_id> | --all | --sample-set');
        process.exit(1);
    }

    let runIds: string[] = [];

    if (args[0] === '--all') {
        runIds = fs.readdirSync(RUNS_DIR).filter(d =>
            fs.statSync(path.join(RUNS_DIR, d)).isDirectory()
        );
    } else if (args[0] === '--sample-set') {
        // v0.10.2 minimum sample set: v05-* runs (cross-substrate)
        runIds = fs.readdirSync(RUNS_DIR).filter(d =>
            d.startsWith('v05-') && fs.statSync(path.join(RUNS_DIR, d)).isDirectory()
        );
    } else {
        runIds = args;
    }

    console.log(`📦 Normalizing ${runIds.length} packs...`);

    let successCount = 0;
    const results: Array<{ run_id: string; hash: string; scenario_family: string }> = [];

    for (const runId of runIds) {
        const result = normalizePack(runId);
        if (result) {
            // Ensure output directory exists
            const outputDir = path.join(DERIVED_DIR, runId);
            fs.mkdirSync(outputDir, { recursive: true });

            // Write outputs
            fs.writeFileSync(
                path.join(outputDir, 'normalized_evidence.json'),
                JSON.stringify(result.normalized, null, 2)
            );
            fs.writeFileSync(
                path.join(outputDir, 'normalized_hash.txt'),
                result.hash
            );

            console.log(`✅ ${runId} → ${result.hash.substring(0, 16)}...`);
            successCount++;
            results.push({
                run_id: runId,
                hash: result.hash,
                scenario_family: result.normalized.manifest.scenario_family
            });
        }
    }

    console.log(`\n📊 Normalized ${successCount}/${runIds.length} packs`);
    console.log(`📁 Output: ${DERIVED_DIR}`);

    // Write summary for downstream processing
    if (results.length > 0) {
        fs.writeFileSync(
            path.join(DERIVED_DIR, '_normalization_summary.json'),
            JSON.stringify({
                generated_at: new Date().toISOString(),
                normalization_spec_version: normSpec.version,
                hash_scope_version: hashScope.version,
                results
            }, null, 2)
        );
    }
}

main();
