#!/usr/bin/env node
/**
 * GATE-TERM-LAB — Terminology Gate for Validation Lab
 * 
 * Checks app/ for forbidden terminology:
 * - "Golden Flow" (must use "Lifecycle Guarantees")
 * - GF-0[1-9] in external display (allowed only in internal IDs like gf-01)
 * 
 * Exit 0 = PASS, Exit 1 = FAIL
 */

import { execSync } from 'child_process';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('GATE-TERM-LAB: Validation Lab Terminology Gate');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

let violations = 0;

// Check for "Golden Flow" in TSX files (external display)
try {
    const goldenFlowResult = execSync(
        `grep -rn "Golden Flow" app/ --include="*.tsx" 2>/dev/null || true`,
        { encoding: 'utf-8' }
    ).trim();

    if (goldenFlowResult) {
        console.log('\n❌ VIOLATION: "Golden Flow" found in external display');
        console.log('   Use "Lifecycle Guarantees" instead');
        console.log(goldenFlowResult);
        violations++;
    } else {
        console.log('✅ No "Golden Flow" in external display');
    }
} catch (e) {
    // grep returns exit 1 when no match, which is OK
}

// Check for GF-0x (uppercase) in JSX display text only
// Note: GF-0x in code (arrays, object keys) is allowed for data access
// Only JSX text output like >GF-01< should use >LG-01<
try {
    const gfResult = execSync(
        `grep -rn ">GF-0[1-9]" app/ --include="*.tsx" 2>/dev/null || true`,
        { encoding: 'utf-8' }
    ).trim();

    if (gfResult) {
        console.log('\n❌ VIOLATION: "GF-0x" found in JSX display text');
        console.log('   Use "LG-0x" instead for external display');
        console.log(gfResult);
        violations++;
    } else {
        console.log('✅ No "GF-0x" in JSX display text (data keys OK)');
    }
} catch (e) {
    // grep returns exit 1 when no match, which is OK
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (violations > 0) {
    console.log(`❌ GATE FAILED: ${violations} terminology violation(s)`);
    process.exit(1);
} else {
    console.log('✅ GATE PASSED: Lab terminology compliant');
    process.exit(0);
}
