import { glob } from 'glob';
import { readJson } from '../_lib/io';
import fs from 'node:fs';
import yaml from 'yaml';
import path from 'node:path';
import { GateDefinition, pass, fail, GateFailure } from '../_lib/gate-runner';

export const gateRegMappingSSOT: GateDefinition = {
    gate_id: 'GATE-V2-REG-MAPPING-SSOT-01',
    name: 'Reg Mapping SSOT Integrity',
    execute: async () => {
        const failures: GateFailure[] = [];

        // 1. Validate SSOT File
        const ssotPath = path.resolve('governance/reg-mapping/reg-mapping-v1.md');
        if (!fs.existsSync(ssotPath)) {
            return fail('GATE-V2-REG-MAPPING-SSOT-01', 'SSOT Check', 'Missing SSOT file', [{ message: 'governance/reg-mapping/reg-mapping-v1.md not found', severity: 'error' }]);
        }

        const content = fs.readFileSync(ssotPath, 'utf8');
        const match = content.match(/```yaml([\s\S]*?)```/);

        if (!match || !match[1]) {
            failures.push({ message: 'No embedded YAML block found in reg-mapping-v1.md', severity: 'error' });
        } else {
            try {
                const doc = yaml.parse(match[1]);
                const ssot = doc.reg_mapping;

                if (!ssot) {
                    failures.push({ message: 'Missing root key: reg_mapping', severity: 'error' });
                } else {
                    // Structure & Invariants
                    if (typeof ssot.non_normative !== 'boolean' || !ssot.non_normative) {
                        failures.push({ message: 'SSOT must be marked "non_normative: true"', severity: 'error' });
                    }
                    if (ssot.status !== 'frozen') {
                        failures.push({ message: 'SSOT status must be "frozen" for RC-4', severity: 'warning' });
                    }

                    // Disclaimer Check (Exact Phrase)
                    const REQUIRED_DISCLAIMER_PHRASE = "Reading aid only. Not compliance. Not certification. Not endorsement.";
                    const disclaimerList = ssot.disclaimer_text_exact || [];
                    if (!disclaimerList.includes(REQUIRED_DISCLAIMER_PHRASE)) {
                        failures.push({ message: `Missing mandatory disclaimer phrase: "${REQUIRED_DISCLAIMER_PHRASE}"`, severity: 'error' });
                    }

                    // Forbidden Terms Scan (in keys and values, except forbidden_terms list itself)
                    const FORBIDDEN_TERMS = ['compliant', 'compliance', 'certified', 'certification', 'attested', 'endorsement', 'audit_passed'];

                    // We need to verify that forbidden terms DO NOT appear in the content, 
                    // EXCEPT in the disclaimer (negated) or in the 'forbidden_terms' list definition itself.
                    // Simple string scan of the whole file is risky because it contains the definition of forbidden terms.
                    // We should scan the 'mapping' section specifically.

                    const mappingStr = JSON.stringify(ssot.mapping).toLowerCase();
                    for (const term of FORBIDDEN_TERMS) {
                        if (mappingStr.includes(term)) {
                            failures.push({ message: `Forbidden term '${term}' found in mapping data`, severity: 'error' });
                        }
                    }

                    // Also scan the 'purpose' field
                    if (ssot.purpose) {
                        const purposeLower = ssot.purpose.toLowerCase();
                        for (const term of FORBIDDEN_TERMS) {
                            if (purposeLower.includes(term)) {
                                // "endorsed" or "endorsement" might be in purpose if negated? 
                                // Best to strictly ban them in purpose to avoid ambiguity.
                                failures.push({ message: `Forbidden term '${term}' found in purpose field`, severity: 'error' });
                            }
                        }
                    }
                }
            } catch (e: any) {
                failures.push({ message: `Invalid YAML in SSOT: ${e.message}`, severity: 'error' });
            }
        }

        if (failures.length > 0) {
            return fail('GATE-V2-REG-MAPPING-SSOT-01', 'Reg Mapping SSOT Integrity', `Found ${failures.length} violations`, failures);
        }

        return pass('GATE-V2-REG-MAPPING-SSOT-01', 'Reg Mapping SSOT Verified');
    }
};
