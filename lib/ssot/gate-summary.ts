import { readJson } from "./io";

export interface GateSummaryModel {
    total: number;
    counts: {
        pass: number;
        fail: number;
        other: number;
    };
    sealed: boolean;
    seal_source: "derived" | "explicit" | "unknown";
    seal_rule: string;
}

interface GateStatusData {
    gates: Array<{
        status: string;
    }>;
    artifact_hash?: string;
}

export function getGateSummaryModel(): GateSummaryModel {
    try {
        const data = readJson<GateStatusData>("public/_meta/gates/gate-status.json");
        const gates = Array.isArray(data?.gates) ? data.gates : [];

        const counts = gates.reduce(
            (acc, r) => {
                const v = (r?.status || "").toLowerCase();
                if (v === "pass") acc.pass++;
                else if (v === "fail") acc.fail++;
                else acc.other++;
                return acc;
            },
            { pass: 0, fail: 0, other: 0 }
        );

        // Seal Logic: No failures + at least one gate + artifact_hash exists
        // artifact_hash proves the seal ceremony completed.
        const hasHash = !!data?.artifact_hash;
        const sealed = counts.fail === 0 && gates.length > 0 && hasHash;

        return {
            total: gates.length,
            counts,
            sealed,
            seal_source: "derived",
            seal_rule: "sealed = (fail==0 && count>0 && has_hash)",
        };
    } catch {
        return {
            total: 0,
            counts: { pass: 0, fail: 0, other: 0 },
            sealed: false,
            seal_source: "unknown",
            seal_rule: "error"
        }
    }
}
