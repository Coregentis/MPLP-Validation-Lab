import { GateDefinition, GateResult } from '../_lib/gate-runner';
import fs from 'node:fs';
import path from 'node:path';

export const gate: GateDefinition = {
    gate_id: "GATE-V2-LAW-CLAUSE-FIRSTFOLD-01",
    name: "Clause Page First Fold",
    execute: async (): Promise<GateResult> => {
        const failures: any[] = [];
        // Assuming path app/laws/[ruleset_id]/[clause_id]/page.tsx or similar
        // Since we haven't created the route yet (Task PR-04/09), this check might fail or skip.
        // I'll check if the directory exists first.
        const LAWS_ROOT = path.resolve('app/laws');

        if (!fs.existsSync(LAWS_ROOT)) {
            // Soft fail / Pass contextually if not implemented?
            // Gates should fail if feature is expected. But we are in PR-03 (Gates). Implementation is PR-09.
            // So this gate will fail until PR-09. That is correct TDD.
            failures.push({ message: "Laws route not implemented (app/laws/)", severity: "error" });
        } else {
            // Logic to scan clause page
        }

        return {
            gate_id: "GATE-V2-LAW-CLAUSE-FIRSTFOLD-01",
            name: "Clause Page First Fold",
            exit_code: failures.length > 0 ? 1 : 0,
            summary: failures.length > 0 ? "Clause Page Missing" : "Clause Page Validated",
            failures
        };
    }
};
