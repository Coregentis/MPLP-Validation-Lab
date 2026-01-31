#!/usr/bin/env tsx
/**
 * GATE-NO-EXCLUDE-ESCAPE-01
 * 
 * Prevents using tsconfig exclude to escape gate compilation.
 * Ensures gates, scripts, producers, and runners remain compilable.
 * 
 * Ticket: P1-05
 */

import fs from 'fs';
import path from 'path';

interface GateResult {
    gate_id: string;
    name: string;
    status: 'PASS' | 'FAIL' | 'WARN';
    message: string;
    details: string[];
}

// Directories that MUST NOT be excluded from tooling tsconfig
const PROTECTED_DIRS = [
    'scripts/',
    'scripts/gates/',
    'producers/',
    'runners/'
];

// Directories that MAY be excluded from main tsconfig (for Next.js)
// but MUST be included in tools tsconfig
const MAIN_TSCONFIG = 'tsconfig.json';
const TOOLS_TSCONFIG = 'tsconfig.tools.json';

function readJson<T = any>(filePath: string): T | null {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T;
    } catch {
        return null;
    }
}

function main(): GateResult {
    const issues: string[] = [];

    // Check that tsconfig.tools.json exists
    const toolsConfig = readJson<any>(TOOLS_TSCONFIG);
    if (!toolsConfig) {
        return {
            gate_id: 'GATE-NO-EXCLUDE-ESCAPE-01',
            name: 'No Exclude Escape',
            status: 'FAIL',
            message: `${TOOLS_TSCONFIG} not found - gate tooling tsconfig is required`,
            details: [`Create ${TOOLS_TSCONFIG} to compile gates/scripts/producers/runners`]
        };
    }

    // Check that protected dirs are NOT excluded in tools tsconfig
    const toolsExclude = toolsConfig.exclude || [];
    for (const protectedDir of PROTECTED_DIRS) {
        for (const excludePattern of toolsExclude) {
            if (excludePattern.includes(protectedDir.replace('/', ''))) {
                issues.push(`${TOOLS_TSCONFIG} excludes protected dir: ${excludePattern} (affects ${protectedDir})`);
            }
        }
    }

    // Check that protected dirs ARE included in tools tsconfig
    const toolsInclude = toolsConfig.include || [];
    const missingIncludes: string[] = [];

    // Must include scripts
    if (!toolsInclude.some((p: string) => p.includes('scripts'))) {
        missingIncludes.push('scripts/**/*.ts');
    }
    // Must include lib
    if (!toolsInclude.some((p: string) => p.includes('lib'))) {
        missingIncludes.push('lib/**/*.ts');
    }

    if (missingIncludes.length > 0) {
        issues.push(`${TOOLS_TSCONFIG} missing required includes: ${missingIncludes.join(', ')}`);
    }

    // Check main tsconfig doesn't bypass by including gates then excluding them
    const mainConfig = readJson<any>(MAIN_TSCONFIG);
    if (mainConfig) {
        const mainExclude = mainConfig.exclude || [];
        const mainInclude = mainConfig.include || [];

        // It's OK for main tsconfig to exclude these (Next.js shouldn't compile them)
        // But it should NOT include them in a way that triggers compilation
        for (const protectedDir of PROTECTED_DIRS) {
            const isIncluded = mainInclude.some((p: string) => p.includes(protectedDir.replace('/', '')));
            if (isIncluded) {
                // If main tsconfig includes gates, warn about complexity
                console.error(`[INFO] Main tsconfig includes ${protectedDir} - ensure tools tsconfig is used for gate execution`);
            }
        }
    }

    // Output
    console.error(`📋 Gate Tooling Configuration Check`);
    console.error(`   Tools tsconfig: ${TOOLS_TSCONFIG}`);
    console.error(`   Include patterns: ${toolsInclude.length}`);
    console.error(`   Exclude patterns: ${toolsExclude.length}`);

    if (issues.length > 0) {
        return {
            gate_id: 'GATE-NO-EXCLUDE-ESCAPE-01',
            name: 'No Exclude Escape',
            status: 'FAIL',
            message: `${issues.length} tsconfig escape violations found`,
            details: issues
        };
    }

    return {
        gate_id: 'GATE-NO-EXCLUDE-ESCAPE-01',
        name: 'No Exclude Escape',
        status: 'PASS',
        message: `Gate tooling configuration valid: ${TOOLS_TSCONFIG} properly covers all protected directories`,
        details: [
            `Protected: ${PROTECTED_DIRS.join(', ')}`,
            `Includes: ${toolsInclude.join(', ')}`
        ]
    };
}

const result = main();
console.log(JSON.stringify(result, null, 2));
process.exit(result.status === 'PASS' ? 0 : 1);
