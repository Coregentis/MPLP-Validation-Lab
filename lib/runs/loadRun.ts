/**
 * Run Loader
 * 
 * Loads run data from data/runs/{run_id}/
 * 
 * Principles:
 * - UI does NOT introduce new fields, only reads engine output
 * - Missing files are reported, NOT fabricated
 * - No execution hosting, no upload
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadYamlStrict } from '@/lib/utils/yaml-loader';
import type { RunData, RunListItem } from './types';

const RUNS_ROOT = path.resolve(process.cwd(), 'data/runs');

function readJsonSafe(filePath: string): unknown | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(content);
    } catch {
        return null;
    }
}

/**
 * List all run IDs in data/runs/
 */
export function listRunIds(): string[] {
    if (!fs.existsSync(RUNS_ROOT)) return [];

    try {
        return fs.readdirSync(RUNS_ROOT).filter((d) => {
            const p = path.join(RUNS_ROOT, d);
            return fs.statSync(p).isDirectory();
        });
    } catch {
        return [];
    }
}

/**
 * List runs with summary info for index page
 */
export function listRuns(): RunListItem[] {
    const ids = listRunIds();

    return ids.map((run_id) => {
        const data = loadRun(run_id);
        return {
            run_id,
            pack_id: data.manifest?.pack_id || data.evaluationReport?.pack_id,
            admission_status: data.verifyReport?.admission_status,
            verdict_hash: data.evaluationReport?.verdict_hash,
        };
    });
}

/**
 * Load full run data from data/runs/{run_id}/
 */
export function loadRun(runId: string): RunData {
    const base = path.join(RUNS_ROOT, runId);

    const out: RunData = {
        run_id: runId,
        missing: [],
    };

    // Manifest: prefer manifest.yaml, fallback to manifest.json
    const manifestYamlPath = path.join(base, 'manifest.yaml');
    const manifestJsonPath = path.join(base, 'manifest.json');

    if (fs.existsSync(manifestYamlPath)) {
        try {
            out.manifest = loadYamlStrict<RunData['manifest']>(manifestYamlPath);
        } catch {
            out.missing.push('manifest.yaml (parse error)');
        }
    } else if (fs.existsSync(manifestJsonPath)) {
        const data = readJsonSafe(manifestJsonPath);
        if (data) out.manifest = data as RunData['manifest'];
        else out.missing.push('manifest.json (parse error)');
    } else {
        out.missing.push('manifest.yaml | manifest.json');
    }

    // Verify Report
    const verifyPath = path.join(base, 'verify.report.json');
    if (fs.existsSync(verifyPath)) {
        const data = readJsonSafe(verifyPath);
        if (data) out.verifyReport = data as RunData['verifyReport'];
        else out.missing.push('verify.report.json (parse error)');
    } else {
        out.missing.push('verify.report.json');
    }

    // Evaluation Report
    const evalPath = path.join(base, 'evaluation.report.json');
    if (fs.existsSync(evalPath)) {
        const data = readJsonSafe(evalPath);
        if (data) out.evaluationReport = data as RunData['evaluationReport'];
        else out.missing.push('evaluation.report.json (parse error)');
    } else {
        out.missing.push('evaluation.report.json');
    }

    // SHA256 sums
    const sumsPath = path.join(base, 'sha256sums.txt');
    if (fs.existsSync(sumsPath)) {
        try {
            out.sha256sumsText = fs.readFileSync(sumsPath, 'utf-8');
        } catch {
            out.missing.push('sha256sums.txt (read error)');
        }
    } else {
        out.missing.push('sha256sums.txt');
    }

    return out;
}

/**
 * Check if a run exists
 */
export function runExists(runId: string): boolean {
    const runPath = path.join(RUNS_ROOT, runId);
    return fs.existsSync(runPath) && fs.statSync(runPath).isDirectory();
}
