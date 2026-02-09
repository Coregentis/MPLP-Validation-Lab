import { readJson } from "./io";

export interface FeaturedRunModel {
    run_id: string | null;
    rule: string;
}

interface CuratedRunsData {
    runs: Array<{
        run_id: string;
        verdict?: string;
    }>;
}

export function getFeaturedRunModel(): FeaturedRunModel {
    try {
        const curated = readJson<CuratedRunsData>("public/_data/curated-runs.json");
        const runs = Array.isArray(curated?.runs) ? curated.runs : [];

        // Rule 1: First "PASS" run
        let pick = runs.find((r) => (r?.verdict || "").toUpperCase() === "PASS");

        // Rule 2: Fallback to first run
        if (!pick) {
            pick = runs[0];
        }

        return {
            run_id: pick?.run_id || null,
            rule: "first PASS else first",
        };
    } catch {
        return { run_id: null, rule: "error" };
    }
}
