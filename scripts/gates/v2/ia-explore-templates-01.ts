import { GateDefinition, GateResult, fail, pass } from '../_lib/gate-runner';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import path from 'node:path';

const PROJECTION_PATH = path.resolve('public/_data/v2/explore-templates.json');

export const gateIAExploreTemplates: GateDefinition = {
    gate_id: 'GATE-V2-EXPLORE-TEMPLATES-01',
    name: 'IA Explore Templates Integrity',
    execute: async (): Promise<GateResult> => {
        if (!fs.existsSync(PROJECTION_PATH)) {
            return fail('GATE-V2-EXPLORE-TEMPLATES-01', 'IA Explore Templates Integrity', 'Projection missing', [{
                message: 'explore-templates.json not found',
                severity: 'error'
            }]);
        }

        const data = readJson(PROJECTION_PATH);
        const templates = data.data?.templates;

        if (!Array.isArray(templates) || templates.length === 0) {
            return fail('GATE-V2-EXPLORE-TEMPLATES-01', 'IA Explore Templates Integrity', 'No templates', [{
                message: 'Templates array empty or missing',
                severity: 'error'
            }]);
        }

        for (const tmpl of templates) {
            if (!tmpl.question || !tmpl.filters) {
                return fail('GATE-V2-EXPLORE-TEMPLATES-01', 'IA Explore Templates Integrity', 'Invalid template', [{
                    message: `Template missing question or filters: ${JSON.stringify(tmpl)}`,
                    severity: 'error'
                }]);
            }
        }

        return pass('GATE-V2-EXPLORE-TEMPLATES-01', 'IA Explore Templates Integrity', 'Explore templates validated');
    }
};
