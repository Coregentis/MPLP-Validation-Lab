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

export const gateSubstrateRegistry: Gate = {
    id: 'GATE-V2-SUBSTRATE-REGISTRY-01',
    name: 'Substrate Registry Check',
    description: 'Verifies existence of the Substrate Registry file.',
    async run() {
        const registryPath = path.join(process.cwd(), 'data/curated-runs/substrate-index.yaml');
        if (fs.existsSync(registryPath)) {
            return { status: 'PASS', message: 'Substrate Registry found' };
        }
        return { status: 'FAIL', message: 'Substrate Registry (substrate-index.yaml) missing' };
    }
};
