import fs from "fs";
import path from "path";

export function readJson<T>(relPath: string): T {
    const p = path.join(process.cwd(), relPath);
    try {
        const raw = fs.readFileSync(p, "utf-8");
        return JSON.parse(raw) as T;
    } catch (e) {
        // If file missing or invalid, rethrow or return empty?
        // We prefer failing fast for expected files, or handling in caller.
        // Given the caller pattern (try/catch blocks in models), rethrowing is fine.
        throw e;
    }
}
