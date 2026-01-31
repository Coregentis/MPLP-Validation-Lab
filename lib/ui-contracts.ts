import type { CuratedRunRecord } from "@/lib/curated/types";

export type HashDisplayMode = "full" | "preview" | "hidden";
export type BadgeTone = "indexable" | "archived" | "adjudicated" | "not_admissible";

export interface RunDisplayContract {
    badgeText: string;
    badgeTone: BadgeTone;
    hashDisplayMode: HashDisplayMode;
    tooltip?: string;
    actions: {
        viewDetail: boolean;
        downloadPack: boolean;
        viewEvidence: boolean;
    };
}

export function isIndexable(run: CuratedRunRecord): boolean {
    // back-compat: undefined => true
    return (run as any).indexable !== false;
}

export function getRunDisplayContract(run: CuratedRunRecord): RunDisplayContract {
    const status = (run as any).adjudication_status;

    if (status === "NOT_ADMISSIBLE") {
        return {
            badgeText: "Not admissible",
            badgeTone: "not_admissible",
            hashDisplayMode: "hidden",
            tooltip: "Intentional: excluded from machine-verifiable indexing.",
            actions: { viewDetail: true, downloadPack: false, viewEvidence: true },
        };
    }

    if (!isIndexable(run)) {
        return {
            badgeText: "Archived",
            badgeTone: "archived",
            hashDisplayMode: "hidden",
            tooltip: (run as any).unavailable_reason ?? "Evidence unavailable",
            actions: { viewDetail: true, downloadPack: false, viewEvidence: true },
        };
    }

    if (status === "ADJUDICATED") {
        return {
            badgeText: "Adjudicated",
            badgeTone: "adjudicated",
            hashDisplayMode: "preview",
            tooltip: "Deterministic verdict under ruleset with evaluation report hash.",
            actions: { viewDetail: true, downloadPack: true, viewEvidence: true },
        };
    }

    return {
        badgeText: "Indexable",
        badgeTone: "indexable",
        hashDisplayMode: "preview",
        tooltip: "Hash-anchored evidence pack available.",
        actions: { viewDetail: true, downloadPack: true, viewEvidence: true },
    };
}
