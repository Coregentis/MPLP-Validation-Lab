/**
 * PR-10: UI Semantic Snapshot Tests
 * 
 * 3 DOM assertion tests (not visual snapshots):
 * 1. /runs - v0.2/v0.3 section split + scope note
 * 2. v0.3 PASS run - domain_meta, RulesetEvalResult display
 * 3. v0.3 FAIL run - reason_code badge, MISSING_EVIDENCE_POINTERS
 * 
 * These tests lock the "adjudication readability" contract.
 * Visual changes are OK; semantic removal is NOT OK.
 */

import { test, expect } from '@playwright/test';

// =============================================================================
// Test 1: Runs Page Section Split
// =============================================================================

test.describe('Runs Page Semantic Structure', () => {
    test('has v0.2 and v0.3 section headers with scope note', async ({ page }) => {
        await page.goto('/runs');
        await page.waitForLoadState('networkidle');

        // v0.3 section header
        const v03Header = page.locator('h2', { hasText: /Four-Domain Packs.*v0\.3/i });
        await expect(v03Header).toBeVisible();

        // v0.2 section header  
        const v02Header = page.locator('h2', { hasText: /GoldenFlow Packs.*v0\.2/i });
        await expect(v02Header).toBeVisible();

        // Scope Note contains key semantic (NOT_ADJUDICATED in the scope note area)
        // Use the scope note container which has border-l-2
        const scopeNoteContainer = page.locator('.border-l-2').first();
        await expect(scopeNoteContainer).toBeVisible();
        await expect(scopeNoteContainer).toContainText('NOT_ADJUDICATED');

        // Scope Note mentions ruleset-1.1 for v0.3
        await expect(scopeNoteContainer).toContainText('ruleset-1.1');
    });
});

// =============================================================================
// Test 2: v0.3 PASS Run Detail
// =============================================================================

test.describe('v0.3 PASS Run Semantic Structure', () => {
    const runId = 'arb-d1-budget-pass-fixture-v0.3';

    test('displays RulesetEvalResult with domain_meta and evidence', async ({ page }) => {
        await page.goto(`/runs/${runId}`);
        await page.waitForLoadState('networkidle');

        // Ruleset Evaluation panel exists
        const evalPanel = page.locator('h2', { hasText: 'Ruleset Evaluation' });
        await expect(evalPanel).toBeVisible();

        // Ruleset ID displayed (in the panel header)
        const rulesetId = page.locator('span', { hasText: 'ruleset-1.1' }).first();
        await expect(rulesetId).toBeVisible();

        // Domain meta: D1 Budget Decision Record
        const domainD1 = page.locator('text=D1:').first();
        await expect(domainD1).toBeVisible();

        const domainName = page.locator('text=Budget Decision Record').first();
        await expect(domainName).toBeVisible();

        // PASS status badge (in the panel, not in the summary card)
        const passBadge = page.locator('span.uppercase', { hasText: 'PASS' }).first();
        await expect(passBadge).toBeVisible();

        // Click clause row to expand drilldown
        const clauseRow = page.locator('tr', { hasText: 'CL-D1-01' });
        await clauseRow.click();

        // After expansion: evidence content visible (at least one field)
        // Look for Notes section which indicates successful evidence resolution
        const notesSection = page.locator('text=Notes:');
        await expect(notesSection).toBeVisible({ timeout: 5000 });
    });
});

// =============================================================================
// Test 3: v0.3 FAIL Run Detail
// =============================================================================

test.describe('v0.3 FAIL Run Semantic Structure', () => {
    const runId = 'arb-d1-budget-fail-fixture-v0.3';

    test('displays reason_code and MISSING_EVIDENCE_POINTERS on drilldown', async ({ page }) => {
        await page.goto(`/runs/${runId}`);
        await page.waitForLoadState('networkidle');

        // FAIL status badge (in the panel header area)
        const failBadge = page.locator('span.uppercase', { hasText: 'FAIL' }).first();
        await expect(failBadge).toBeVisible();

        // Topline reason_code badge exists (contains BUNDLE-POINTER-MISSING)
        const reasonCodeBadge = page.locator('code', { hasText: /BUNDLE-POINTER-MISSING/i }).first();
        await expect(reasonCodeBadge).toBeVisible();

        // Click clause row to expand drilldown
        const clauseRow = page.locator('tr', { hasText: 'CL-D1-01' });
        await clauseRow.click();

        // After expansion: MISSING_EVIDENCE_POINTERS indicator
        const missingIndicator = page.locator('code', { hasText: 'MISSING_EVIDENCE_POINTERS' });
        await expect(missingIndicator).toBeVisible({ timeout: 5000 });
    });
});
