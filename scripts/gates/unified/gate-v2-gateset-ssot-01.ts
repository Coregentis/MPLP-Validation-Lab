import { runGate, fail, pass } from '../_lib/gate-runner';
import fs from 'fs';
import path from 'path';

const V2_GATES_DIR = path.join(process.cwd(), 'scripts/gates/v2');
const RUNNER_PATH = path.join(V2_GATES_DIR, 'run-all.ts');

export const gate = {
    id: 'GATE-V2-GATESET-SSOT-01',
    name: 'V2 Gateset SSOT Consistency',
    run: async () => {
        // 1. Get all check-*.ts files
        const files = fs.readdirSync(V2_GATES_DIR)
            .filter(f => f.startsWith('check-') && f.endsWith('.ts'));

        // 2. Read runner content
        const runnerContent = fs.readFileSync(RUNNER_PATH, 'utf-8');

        // 3. Verify imports
        const missingImports: string[] = [];
        for (const file of files) {
            const importName = file.replace('.ts', '');
            if (!runnerContent.includes(`./${importName}`)) {
                missingImports.push(file);
            }
        }

        if (missingImports.length > 0) {
            return fail('V2 Gate Runner missing imports', missingImports);
        }

        return pass(`All ${files.length} gate checks are imported in run-all.ts`);
    }
};

if (import.meta.url === `file://${process.argv[1]}`) {
    runGate(gate);
}
