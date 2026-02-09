import { readJson } from "./io";

type LabStatus = "operational" | "maintenance" | "frozen" | "unknown";
type StatusSource = "explicit" | "inferred" | "unknown";

export interface LabStatusModel {
    status: LabStatus;
    status_source: StatusSource;
    note?: string;
    updated_at?: string;
}

interface LabManifest {
    system_status?: string;
    generated_at?: string;
}

export function getLabStatusModel(): LabStatusModel {
    try {
        const manifest = readJson<LabManifest>("public/_meta/lab-manifest.json");
        // Check key "system_status" first
        const explicit = manifest?.system_status;
        if (explicit) {
            return {
                status: explicit as LabStatus,
                status_source: "explicit",
                updated_at: manifest.generated_at
            };
        }
        // Minimal loop: infer operational but mark it inferred
        return {
            status: "operational" as LabStatus,
            status_source: "inferred",
            note: "system_status missing in manifest",
            updated_at: manifest.generated_at
        };
    } catch {
        return { status: "unknown" as LabStatus, status_source: "unknown" };
    }
}
