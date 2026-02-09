import fs from 'fs';
import path from 'path';

interface GateResult {
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details?: string[];
}

interface Gate {
    id: string;
    name: string;
    description: string;
    run(): Promise<GateResult>;
}

export const gateCanonical: Gate = {
    id: 'GATE-V2-CANONICAL-01',
    name: 'Canonical Anchor Check',
    description: 'Verifies that the README contains a Canonical Anchor reference.',
    async run() {
        try {
            const readmePath = path.join(process.cwd(), 'README.md');
            if (!fs.existsSync(readmePath)) {
                return { status: 'FAIL', message: 'README.md missing' };
            }
            const content = fs.readFileSync(readmePath, 'utf-8');
            if (content.includes('Canonical Anchor')) {
                return { status: 'PASS', message: 'README contains Canonical Anchor' };
            } else {
                return { status: 'FAIL', message: 'README missing Canonical Anchor reference' };
            }
        } catch (e) {
            return { status: 'FAIL', message: `Error checking README: ${e}` };
        }
    }
};
