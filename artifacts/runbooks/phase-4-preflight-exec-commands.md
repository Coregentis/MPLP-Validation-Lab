# Phase 4 Preflight - Quick Execution Commands

**Date**: 2026-01-11  
**Execution Mode**: (2) Manual Execution  
**Critical Fix**: npm ci requires package-lock.json (do NOT delete)

---

## Prerequisites (10-Second Check)

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD
node -v
npm -v
```

**Expected**: Clean status, node v25.2.1, npm 11.6.2

---

## Commit A: P4-0.1 (After Applying Fixes #1-6)

### Verification + Log Capture

```bash
# TypeScript
npx tsc --noEmit 2>&1 | tee phase-4-preflight-tsc.A.log

# Generator
npm run generate:curated 2>&1 | tee phase-4-preflight-generate.A.log

# Gates (04-09 expected at this stage)
npm run gates 2>&1 | tee phase-4-preflight-gates.A.log

# Frozen boundaries
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

### Commit

```bash
cat > .gitmsg.P4-0.1 <<'EOF'
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
EOF

git add -A
git commit -F .gitmsg.P4-0.1
git rev-parse HEAD > phase-4-preflight-commit-A.sha
```

---

## Commit B: P4-0.1.1 FINAL (After Applying Fixes #7-10 + Hygiene)

### Pre-Verification Checks (Optional but Recommended)

```bash
# Verify GATE-09 has only ONE isAllowlisted implementation
rg "function isAllowlisted" -n lib/gates/gate-09-ssot-projection.ts

# Verify js-yaml in dependencies (NOT devDependencies)
node -e "const p=require('./package.json'); console.log('deps:', !!(p.dependencies&&p.dependencies['js-yaml']), 'devDeps:', !!(p.devDependencies&&p.devDependencies['js-yaml']))"

# Verify gates script includes 08, 09, 10
cat package.json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const p=JSON.parse(s); console.log(p.scripts.gates);})"
```

**Expected**:
- Single isAllowlisted definition
- deps: true, devDeps: false
- Script includes gate:08, gate:09, gate:10

### Verification + Log Capture

```bash
# TypeScript
npx tsc --noEmit 2>&1 | tee phase-4-preflight-tsc.B.log

# Generator
npm run generate:curated 2>&1 | tee phase-4-preflight-generate.B.log

# All Gates (04-10)
npm run gates 2>&1 | tee phase-4-preflight-gates.B.log
```

### Production Verification (CORRECTED)

```bash
# Clean node_modules only (KEEP package-lock.json for npm ci)
rm -rf node_modules

# Production install
npm ci --omit=dev 2>&1 | tee phase-4-preflight-production.B.ci.log

# Verify generator
npm run generate:curated 2>&1 | tee phase-4-preflight-production.B.generate.log
```

**Optional**: Restore dev dependencies

```bash
npm ci
```

### Frozen Boundaries Check

```bash
git diff --name-only | grep -E "data/rulesets/ruleset-1.0|app/policies/contract|app/policies/strength" || echo "✅ Clean"
```

### Commit

```bash
cat > .gitmsg.P4-0.1.1 <<'EOF'
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
EOF

git add -A
git commit -F .gitmsg.P4-0.1.1
git rev-parse HEAD > phase-4-preflight-commit-B.sha
```

---

## Final Outputs (Required for Phase 4 Main Unlock)

After both commits complete, provide:

### 1. Commit Evidence

```bash
git log --oneline | head -2
```

### 2. Final Gates Output

```bash
cat phase-4-preflight-gates.B.log
```

---

**Execution Mode**: Manual (2)  
**Status**: Ready to execute  
**Next**: Provide two outputs above after completion
