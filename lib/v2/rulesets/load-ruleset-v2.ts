import fs from 'fs';
import path from 'path';

export interface V2RulesetModel {
    id: string;
    version: string;
    name: string;
    status: string;
    clauses: {
        id: string;
        text: string;
        category?: string;
    }[];
}

interface V2Clause {
    id: string;
    description: string;
    name: string;
    severity: string;
    pointer: string;
    eval_type: string;
}

const V2_RULESETS_DIR = path.join(process.cwd(), 'public/_data/v2/rulesets');

export function loadV2Ruleset(id: string): V2RulesetModel | null {
    // 1. Try exact match ID
    const filePath = path.join(V2_RULESETS_DIR, `${id}.json`);

    // 2. Fallback: if V2.0.1 is requested but mapped to base file (Naive assumption or need logic)
    // Actually, based on index.json, both have "ruleset_id": "ruleset-v2.0.0".
    // So the URL /rulesets/ruleset-v2.0.0 maps to this ID.

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const data = raw.data || {};

        return {
            id: data.id || id,
            version: data.version || '2.0.0',
            name: data.name || 'Unknown Ruleset',
            status: data.status || 'Active',
            clauses: (data.clauses || []).map((c: V2Clause) => ({
                id: c.id,
                text: c.description,
                name: c.name,
                severity: c.severity,
                pointer: c.pointer,
                category: c.eval_type
            }))
        };
    } catch (e) {
        console.error(`Failed to load V2 Ruleset ${id}`, e);
        return null;
    }
}
