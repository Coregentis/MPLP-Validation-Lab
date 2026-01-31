import fs from 'node:fs';
import path from 'node:path';

// This file is allowed to use FS as it resides outside of 'app/'
const DATA_ROOT = path.resolve('public/_data/v2');

export function getRunsIndex() {
    const p = path.join(DATA_ROOT, 'runs', 'index.json');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getRunDetail(packId: string) {
    const p = path.join(DATA_ROOT, 'runs', `${packId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getRunEvidence(packId: string) {
    const p = path.join(DATA_ROOT, 'runs', `${packId}.evidence.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getRulesetsIndex() {
    const p = path.join(DATA_ROOT, 'rulesets', 'index.json');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getRegMapping() {
    const p = path.join(DATA_ROOT, 'reg-mapping.json');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function getFMM() {
    const p = path.join(DATA_ROOT, 'fmm', 'mappings.json');
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}
