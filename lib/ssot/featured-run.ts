import { readJson } from "./io";

export interface FeaturedRunModel {
    run_id: string | null;
    rule: string;
}

interface CuratedRunsData {
    runs: Array<{
        run_id: string;
        adjudication_status?: string;
        substrate?: string;
    }>;
}

export function getFeaturedRunModel(): FeaturedRunModel {
    try {
        const curated = readJson<CuratedRunsData>("public/_data/curated-runs.json");
        const runs = Array.isArray(curated?.runs) ? curated.runs : [];

        // Prefer an adjudicated pass-like public example from a non-fixture substrate.
        let pick = runs.find((r) =>
            r?.adjudication_status === "ADJUDICATED" &&
            !!r?.substrate &&
            r.substrate !== "fixture" &&
            !/fail/i.test(r.run_id)
        );

        // Fallback: any adjudicated pass-like run.
        if (!pick) {
            pick = runs.find((r) =>
                r?.adjudication_status === "ADJUDICATED" &&
                !/fail/i.test(r.run_id)
            );
        }

        // Fallback: first non-admissible-excluded run that does not look like a fail.
        if (!pick) {
            pick = runs.find((r) =>
                r?.adjudication_status !== "NOT_ADMISSIBLE" &&
                !/fail/i.test(r.run_id)
            );
        }

        // Final fallback to first run if no better option exists.
        if (!pick) {
            pick = runs[0];
        }

        return {
            run_id: pick?.run_id || null,
            rule: "prefer adjudicated pass-like non-fixture run, else safe non-NOT_ADMISSIBLE fallback",
        };
    } catch {
        return { run_id: null, rule: "error" };
    }
}
