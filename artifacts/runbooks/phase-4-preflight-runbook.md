# Phase 4 Preflight Execution Runbook

**Date**: 2026-01-11  
**Objective**: Execute P4-0.1 and P4-0.1.1, capture evidence, seal Preflight  
**Status**: READY TO EXECUTE

---

## Prerequisites (10-Second Check)

```bash
# 1. Clean working directory
git status --porcelain
# Expected: (empty - no uncommitted changes)

# 2. Confirm branch (main or execution branch)
git rev-parse --abbrev-ref HEAD
# Note: Follow your governance policy for branch strategy

# 3. Record environment (optional but recommended)
node -v
npm -v
```

**Checkpoint**: All prerequisites met → Proceed to Commit A

---

## Commit A: P4-0.1 (Fixes #1-6)

### Files to Modify

**Reference**: `phase-4-preflight-fixes.md`

1. `app/runs/[run_id]/_components/EvidencePackBrowser.tsx` (Fix #1)
2. `components/ProvenanceFooter.tsx` (Fix #2)
3. `lib/curated/types.ts` (Fix #3)
4. `scripts/generate-curated-runs.mjs` (Fix #4)
5. `package.json` (Fix #5 - restore gate:08)
6. `lib/gates/gate-09-ssot-projection.ts` (Fix #6 - initial version)

### Verification (CAPTURE ALL LOGS)

```bash
# TypeScript compilation
npx tsc --noEmit 2>&1 | tee phase-4-preflight-tsc.A.log

# Artifact generation
npm run generate:curated 2>&1 | tee phase-4-preflight-generate.A.log

# Gates (04-09 expected at this stage)
npm run gates 2>&1 | tee phase-4-preflight-gates.A.log
```

**Expected**: All PASS

### Frozen Boundaries Check

```bash
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

**Expected**: `✅ Clean` (no output before "||")

### Commit

```bash
git add -A
git commit -m "fix(phase-4): Apply P4-0.1 preflight fixes

Critical fixes before Phase 4 execution:

1. EvidencePackBrowser: Remove encodeURIComponent (blocking - route mismatch)
2. ProvenanceFooter: Props injection for ssot (blocking - fs in client)
3. CuratedRunRecord: Align types with allowlist SSOT (high-risk - schema drift)
4. Generator: Add structure validation (high-risk - parse errors)
5. gates: Restore GATE-08 for curated immutability (consistency)
6. GATE-09: Strict allowlist path matching (consistency)

All TypeScript errors resolved
Gates 04-09 PASS
Ready for P4-0.1.1 supplemental fixes"
```

**Capture**: Commit SHA

```bash
git rev-parse HEAD > phase-4-preflight-commit-A.sha
```

---

## Commit B: P4-0.1.1 FINAL (Fixes #7-10 + Hygiene)

### Files to Modify

**Reference**: `phase-4-preflight-fixes-p4-0-1-1.md` (FINAL revision)

**Fix #7** - ruleset_version:
- `lib/curated/types.ts`: `export type RulesetVersion = string;`
- `app/runs/[run_id]/_components/RunSummaryCard.tsx`: Display `{run.ruleset_version}` (no prefix)

**Fix #8** - GATE-09 FINAL (CRITICAL):
- `lib/gates/gate-09-ssot-projection.ts`: Replace with FINAL `isAllowlisted()` implementation
- Uses `path.relative() + startsWith()` for repo-relative matching
- **Supersedes P4-0.1 Fix #6** (ensure only ONE implementation exists)

**Fix #9** - js-yaml dependency:
- `package.json`: Move `js-yaml` to `dependencies` (NOT `devDependencies`)

**Fix #10** - GATE-10:
- Create `lib/gates/gate-10-curated-invariants.ts`
- Update `package.json`: Add `gate:10` and include in `npm run gates`

**Engineering Hygiene** (apply in Commit B):
1. Delete unused `getAllTsFiles()` function from GATE-10
2. Fix error handling: `catch (e)` → `e instanceof Error ? e.message : String(e)`

### Verification (CAPTURE ALL LOGS)

```bash
# TypeScript compilation
npx tsc --noEmit 2>&1 | tee phase-4-preflight-tsc.B.log

# Artifact generation
npm run generate:curated 2>&1 | tee phase-4-preflight-generate.B.log

# All gates (04-10 expected)
npm run gates 2>&1 | tee phase-4-preflight-gates.B.log
```

**Expected**: ALL PASS (04, 05, 06, 07, 08, 09, 10)

### Production Verification (CRITICAL)

```bash
# Clean node_modules only (KEEP package-lock.json for npm ci)
rm -rf node_modules

# Install production dependencies only
npm ci --omit=dev 2>&1 | tee phase-4-preflight-production.B.ci.log

# Verify generator works without devDependencies
npm run generate:curated 2>&1 | tee phase-4-preflight-production.B.generate.log
```

**Expected**: SUCCESS (no "Cannot find module 'js-yaml'" error)

**Optional**: Restore dev dependencies for continued development

```bash
npm ci
```

### Frozen Boundaries Check

```bash
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

**Expected**: `✅ Clean`

### Commit

```bash
git add -A
git commit -m "fix(phase-4): Apply P4-0.1.1 supplemental fixes (FINAL)

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
Phase 4 Preflight: SEALED"
```

**Capture**: Commit SHA

```bash
git rev-parse HEAD > phase-4-preflight-commit-B.sha
```

---

## Preflight Execution Seal Evidence

### Record Commit SHAs

```bash
# Get both commit SHAs
git log --oneline | head -2
```

**Save output to**: `phase-4-preflight-commits.txt`

### Log Files Captured (6 Total)

**Commit A**:
1. `phase-4-preflight-tsc.A.log`
2. `phase-4-preflight-generate.A.log`
3. `phase-4-preflight-gates.A.log`

**Commit B**:
4. `phase-4-preflight-tsc.B.log`
5. `phase-4-preflight-generate.B.log`
6. `phase-4-preflight-gates.B.log`
7. `phase-4-preflight-production.B.ci.log`
8. `phase-4-preflight-production.B.generate.log`

### Update Seal Documentation

Add **Execution Evidence** section to `phase-4-preflight-seal.md`:

```markdown
## Execution Evidence (SEALED)

**Date**: 2026-01-11
**Executor**: [Your Name/ID]

### Commits

**Commit A** (P4-0.1): [SHA from phase-4-preflight-commit-A.sha]
**Commit B** (P4-0.1.1 FINAL): [SHA from phase-4-preflight-commit-B.sha]

Reference: `git log --oneline | head -2`

### Verification Logs

- TypeScript: `phase-4-preflight-tsc.B.log` (PASS)
- Generator: `phase-4-preflight-generate.B.log` (3 runs)
- Gates: `phase-4-preflight-gates.B.log` (ALL PASS 04-10)
- Production: `phase-4-preflight-production.B.*.log` (SUCCESS)

### Frozen Boundaries

Status: ✅ CLEAN (no modifications to ruleset/contract/strength)

### Seal Status

✅ **PREFLIGHT EXECUTION SEALED**

All hard prerequisites for P4-1 entry satisfied.
```

---

## Post-Execution Updates

### 1. Update phase-4-checklist.md

Add **Preflight Seal Header** at top:

```markdown
## Preflight Seal (EXECUTED)

**Commits**:
- P4-0.1: [SHA]
- P4-0.1.1 FINAL: [SHA]

**Gates**: ALL PASS (04, 05, 06, 07, 08, 09, 10)
**Production**: VERIFIED (--omit=dev)
**Frozen**: CLEAN

**Status**: ✅ SEALED - P4-1 UNBLOCKED
```

### 2. Update task.md

Mark P4-0 complete:

```markdown
## Phase 4 Preflight

- [x] P4-0.1 Applied (Commit [SHA])
- [x] P4-0.1.1 Applied (Commit [SHA])
- [x] All gates PASS (04-10)
- [x] Production verified (--omit=dev)
- [x] Preflight SEALED

**Status**: ✅ COMPLETE

## Phase 4 Main

**Entry Condition**: Gates 04-10 PASS + omit=dev PASS ✅ SATISFIED

**Status**: UNBLOCKED → Ready for P4-1
```

---

## Unblocking Phase 4 Main

After Preflight SEALED, provide to continuation agent:

1. **Commit evidence**:
   ```bash
   git log --oneline | head -2
   ```

2. **Gates output**:
   ```bash
   cat phase-4-preflight-gates.B.log
   ```

These two outputs enable Phase 4 Main execution planning (P4-1→P4-8).

---

## Execution Checklist

- [ ] Prerequisites checked (clean status, branch confirmed)
- [ ] Commit A applied and verified (logs captured)
- [ ] Commit A pushed/stored
- [ ] Commit B applied and verified (logs captured)
- [ ] Commit B pushed/stored
- [ ] Production verification PASS (--omit=dev)
- [ ] Frozen boundaries CLEAN
- [ ] Seal documentation updated
- [ ] phase-4-checklist.md header added
- [ ] task.md P4-0 marked complete
- [ ] Commit SHAs and gates output ready for handoff

---

**Phase 3**: ✅ SEALED (commit c988e71)  
**Phase 4 Preflight**: ⏳ READY TO EXECUTE (runbook complete)  
**Phase 4 Main**: ⏳ BLOCKED (awaiting Preflight seal)

---

**EXECUTE RUNBOOK → CAPTURE EVIDENCE → SEAL → UNBLOCK P4-1**
