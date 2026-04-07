import * as fs from 'fs';
import * as path from 'path';
import { loadYamlStrict } from '@/lib/utils/yaml-loader';

interface ProducerMatrix {
    substrates?: Record<string, {
        name?: string;
        producer_path?: string;
        status?: string;
    }>;
}

export interface ProducerCatalogEntry {
    routeId: string;
    name: string;
    type: string;
    description: string;
    status: string;
    runScriptPath: string;
}

function loadProducerMatrix(): ProducerMatrix {
    const matrixPath = path.join(process.cwd(), 'producers', 'contract', 'matrix.yaml');
    return loadYamlStrict<ProducerMatrix>(matrixPath);
}

function formatProducerDescription(name: string): string {
    return `Reference evidence producer for ${name}.`;
}

function formatProducerStatus(runScriptExists: boolean): string {
    return runScriptExists ? 'Available' : 'Planned';
}

export function listProducerCatalog(): ProducerCatalogEntry[] {
    const matrix = loadProducerMatrix();
    const substrates = matrix.substrates ?? {};

    return Object.entries(substrates)
        .map(([routeId, substrate]) => {
            const producerPath = substrate.producer_path;
            if (!producerPath) {
                return null;
            }

            const runScriptPath = path.posix.join(producerPath, 'run.mjs');
            const absoluteRunScriptPath = path.join(process.cwd(), runScriptPath);

            if (!fs.existsSync(absoluteRunScriptPath)) {
                return null;
            }

            return {
                routeId,
                name: substrate.name ?? routeId,
                type: 'Framework',
                description: formatProducerDescription(substrate.name ?? routeId),
                status: formatProducerStatus(true),
                runScriptPath,
            };
        })
        .filter((entry): entry is ProducerCatalogEntry => entry !== null);
}

export function getProducerCatalogEntry(substrate: string): ProducerCatalogEntry | undefined {
    return listProducerCatalog().find((entry) => entry.routeId === substrate);
}

export function listProducerStaticParams(): Array<{ substrate: string }> {
    return listProducerCatalog().map((entry) => ({ substrate: entry.routeId }));
}
