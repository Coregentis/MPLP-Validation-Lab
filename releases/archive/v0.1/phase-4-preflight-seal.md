# Phase 4 Preflight Seal Summary

**Date**: 2026-01-11  
**Status**: READY FOR EXECUTION  
**Commits**: 2 (P4-0.1, P4-0.1.1)

---

## Execution Sequence (Two Commits)

### Commit A: P4-0.1 (Fixes #1-6)

**Objective**: Eliminate runtime crashes + SSOT drift high-risk issues, restore Gate 08/09 authority.

**Files Modified**:
- `app/runs/[run_id]/_components/EvidencePackBrowser.tsx` (Fix #1)
- `components/ProvenanceFooter.tsx` (Fix #2)
- `lib/curated/types.ts` (Fix #3)
- `scripts/generate-curated-runs.mjs` (Fix #4)
- `package.json` (Fix #5: restore GATE-08)
- `lib/gates/gate-09-ssot-projection.ts` (Fix #6)

**Must Pass After Commit**:
```bash
npx tsc --noEmit
npm run generate:curated
npm run gates  # (04, 05, 06, 07, 08, 09)
```

**Commit Message**:
```
fix(phase-4): Apply P4-0.1 preflight fixes

Critical fixes before Phase 4 execution:

1. EvidencePackBrowser: Remove encodeURIComponent (blocking - route mismatch)
2. ProvenanceFooter: Props injection for ssot (blocking - fs in client)
3. CuratedRunRecord: Align types with allowlist SSOT (high-risk - schema drift)
4. Generator: Add structure validation (high-risk - parse errors)
5. gates: Restore GATE-08 for curated immutability (consistency)
6. GATE-09: Strict allowlist path matching (consistency)

All TypeScript errors resolved
Gates 04-09 PASS
Ready for P4-0.1.1 supplemental fixes
```

---

### Commit B: P4-0.1.1 (Fixes #7-10 + Engineering Hygiene)

**Objective**: Engineering precision (UI correctness + Gate authority + production stability + Gate-10 unified workflow).

**Files Modified**:
- `lib/curated/types.ts` (Fix #7: widen RulesetVersion)
- `app/runs/[run_id]/_components/RunSummaryCard.tsx` (Fix #7: display as-is)
- `lib/gates/gate-09-ssot-projection.ts` (Fix #8: final version, supersedes P4-0.1 Fix #6)
- `package.json` (Fix #9: js-yaml to dependencies + Fix #10: add gate:10)
- `lib/gates/gate-10-curated-invariants.ts` (Fix #10: new file)

**Engineering Hygiene** (applied in Commit B):
1. Delete unused `getAllTsFiles()` function from GATE-10
2. Fix error handling: `e.message` → `e instanceof Error ? e.message : String(e)`

**Must Pass After Commit**:
```bash
npx tsc --noEmit
npm run generate:curated
npm run gates  # (04, 05, 06, 07, 08, 09, 10)
npm ci --omit=dev && npm run generate:curated  # Production verification
```

**Commit Message**:
```
fix(phase-4): Apply P4-0.1.1 supplemental fixes (FINAL)

Engineering detail corrections:

7. ruleset_version: Type widened to string, display as-is (no double prefix)
8. GATE-09: Repo-relative path matching with startsWith() (merged with P4-0.1 Fix #6)
9. js-yaml: Moved to dependencies (supports --omit=dev production builds)
10. GATE-10: Precision drift detection (UI layer SSOT/YAML prohibition)

Engineering hygiene:
- Removed unused getAllTsFiles() from GATE-10
- Fixed error handling for strict TypeScript

All TypeScript errors resolved
All gates PASS (04, 05, 06, 07, 08, 09, 10)
Production build verified (--omit=dev)
Phase 4 Preflight: SEALED
```

---

## Seal Verification Sequence

Execute in order. All outputs should be captured for seal record.

### 1. TypeScript Compilation

```bash
npx tsc --noEmit
```

**Expected**: No errors

---

### 2. Curated Artifact Generation

```bash
npm run generate:curated
cat public/_data/curated-runs.json | jq '.runs | length'
```

**Expected**:
- Generation succeeds
- Output: `3`

---

### 3. All Gates (04-10)

```bash
npm run gates
```

**Expected**: ALL PASS

```
[GATE-04] Language Lint: PASS (172 files, 0 matches)
[GATE-05] No Exec Hosting: PASS (69 files, 0 matches)
[GATE-06] Robots Policy: PASS (1 file, 0 matches)
[GATE-07] PII Leak: PASS (6 files, 0 matches)
[GATE-08] Curated Immutability: PASS (3 entries validated)
[GATE-09] SSOT Projection: PASS (0 hardcoded hashes)
[GATE-10] Curated Invariants: PASS (4 checks)
```

---

### 4. Production Environment (No devDependencies)

```bash
rm -rf node_modules package-lock.json
npm ci --omit=dev
npm run generate:curated
```

**Expected**: SUCCESS (no "Cannot find module 'js-yaml'" error)

---

### 5. Frozen Boundaries Verification

```bash
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

**Expected**: Empty output or "✅ Clean"

---

## Hard Prerequisites for P4-1 Entry

Phase 4 Preflight is SEALED only when ALL of the following are satisfied:

### Commits
- [ ] P4-0.1 committed (Fixes #1-6)
- [ ] P4-0.1.1 committed (Fixes #7-10 + hygiene)
- [ ] Both commits have unique SHA (traceable)

### Gates
- [ ] `npm run gates` covers and PASS: 04, 05, 06, 07, 08, 09, 10
- [ ] No gate failures or warnings

### Production Build
- [ ] `npm ci --omit=dev && npm run generate:curated` PASS
- [ ] js-yaml in dependencies (not devDependencies)

### Code Integrity
- [ ] GATE-09 `isAllowlisted()` exists in ONLY ONE FINAL VERSION (no duplicate implementations)
- [ ] GATE-10 Check #4 has no `getAllTsFiles()` remnant
- [ ] Error handling uses `instanceof Error` guard

### TypeScript
- [ ] `npx tsc --noEmit` PASS (no errors)

### Frozen Boundaries
- [ ] No modifications to: `data/rulesets/ruleset-1.0/**`, `app/policies/contract/**`, `app/policies/strength/**`

---

## Code-Level Hygiene Fixes (Apply in Commit B)

### Fix 1: Remove Unused getAllTsFiles()

**File**: `lib/gates/gate-10-curated-invariants.ts`

**Action**: Delete the following function entirely (not used after Check #4 refinement):

```typescript
function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}
```

---

### Fix 2: Error Handling for Strict TypeScript

**File**: `lib/gates/gate-10-curated-invariants.ts`

**Line**: Check #1 catch block

**OLD**:
```typescript
} catch (e) {
  failures.push(`Failed to load curated runs: ${e.message}`);
  return { passed: false, checks, failures };
}
```

**NEW**:
```typescript
} catch (e) {
  failures.push(`Failed to load curated runs: ${e instanceof Error ? e.message : String(e)}`);
  return { passed: false, checks, failures };
}
```

---

## Seal Outputs (To Be Captured)

After both commits applied and all verifications pass, capture:

1. **Commit SHAs**:
   ```bash
   git log --oneline | head -2
   ```

2. **Gates Output**:
   ```bash
   npm run gates 2>&1 | tee phase-4-preflight-gates.log
   ```

3. **Production Verification**:
   ```bash
   npm ci --omit=dev && npm run generate:curated 2>&1 | tee phase-4-preflight-production.log
   ```

4. **TypeScript Status**:
   ```bash
   npx tsc --noEmit 2>&1 | tee phase-4-preflight-tsc.log
   ```

---

## Next Steps After Seal

1. ✅ Update `phase-4-checklist.md` with Preflight Seal Header
2. ✅ Mark P4-0 as complete in task.md
3. → **Execute P4-1**: Build Artifact Generator

---

**Phase 3**: ✅ SEALED  
**Phase 4 Preflight**: ✅ READY FOR SEAL (awaiting execution)  
**Phase 4 Main**: ⏳ WAITING (blocked on Preflight seal)

---

## Seal Criteria Summary

| Criterion | Command | Expected |
|-----------|---------|----------|
| TypeScript | `npx tsc --noEmit` | No errors |
| Artifact | `npm run generate:curated` | 3 runs |
| Gates | `npm run gates` | ALL PASS (04-10) |
| Production | `npm ci --omit=dev && npm run generate:curated` | SUCCESS |
| Frozen | `git diff \| grep ruleset/contract/strength` | Empty |

**Status**: All criteria defined, awaiting execution and commit capture.
