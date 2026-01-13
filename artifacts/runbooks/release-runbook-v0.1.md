# MPLP Validation Lab v0.1 Release Runbook

**Release Version**: v0.1  
**Target Date**: 2026-01-11  
**Status**: READY TO EXECUTE

---

## Pre-Release Checklist

- [x] Phase 6 acceptance complete (ACCEPTED)
- [x] All gates PASS (04-10)
- [x] Frozen boundaries CLEAN
- [x] Master evidence manifest created
- [x] Release notes prepared
- [ ] Production deployment executed
- [ ] Entry model closure verified (production)
- [ ] Git tag created
- [ ] GitHub release published
- [ ] Evidence archived

---

## Step 0: Release Freeze Point

**Objective**: Lock the release cut to prevent scope drift

**Actions**:
1. Record current commit SHA for Validation Lab repo
2. Create `RELEASE_CUT_v0.1.md` documenting freeze point

**Freeze Point Artifacts**:
- `phase-6-final-acceptance.md`
- `release-notes-v0.1.md`
- `master-evidence-manifest.v0.1.json`

**Rule**: Any changes after this point MUST go into v0.1.1 or v0.2, NOT v0.1

**Evidence**: Freeze point commit SHA recorded in release documentation

---

## Step 1: Docs Branch Strategy Resolution

**Current State**: D1 commit (`aa86b28a`) on `dev` branch

**Objective**: Resolve branch strategy for public visibility

### Option A: Merge to Main (RECOMMENDED)

**Steps**:
1. Create PR: `dev` → `main` with D1 changes
2. Merge and record merge commit SHA
3. Update `phase-6-final-acceptance.md` Open Items section
4. Update `master-evidence-manifest.v0.1.json`:
   ```json
   "docs": {
     "commit": "aa86b28a",
     "branch": "main",
     "merge_commit": "[MERGE_SHA]"
   }
   ```

**Verification**:
```bash
cd docs
git checkout main
git log | grep -A 5 "Validation Lab"
```

### Option B: Document `dev` as Release Branch

**Steps**:
1. Add deployment documentation to docs repo
2. Update manifest:
   ```json
   "docs": {
     "commit": "aa86b28a",
     "branch": "dev",
     "deployment": {
       "source_branch": "dev",
       "note": "Docs deploys from dev branch"
     }
   }
   ```

### Option C: Deploy from `dev` (Temporary)

**Not recommended for v0.1 final state**

**Deadline**: Resolve within 24-48 hours of release

---

## Step 2: Lab Production Deployment

**Target**: https://lab.mplp.io

**Pre-Deployment**:
1. Ensure environment variables configured
2. Verify build succeeds: `npm run build`
3. Confirm all gates pass: `npm run gates`

### Production Path Validation

**Critical Paths** (must return 200):

```bash
# Base routes
curl -I https://lab.mplp.io/
curl -I https://lab.mplp.io/runs
curl -I https://lab.mplp.io/about
curl -I https://lab.mplp.io/builder

# Run detail pages (all 3 curated runs)
curl -I https://lab.mplp.io/runs/gf-01-langchain-pass
curl -I https://lab.mplp.io/runs/sample-pass
curl -I https://lab.mplp.io/runs/sample-not-admissible

# API routes (view - inline)
curl -I https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/manifest.json
curl -I https://lab.mplp.io/api/runs/sample-pass/files/integrity/sha256sums.txt

# API routes (download - attachment)
curl -I https://lab.mplp.io/api/runs/gf-01-langchain-pass/download/manifest.json
```

**Expected**: All return `200 OK`

### Security Boundary Verification

**Test Non-Whitelisted File** (must return 403):
```bash
curl -i https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/secret.txt
```
Expected: `403 Forbidden` with safe error message (no path leakage)

**Test Path Traversal** (must return 403):
```bash
curl -i "https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/../../../package.json"
curl -i "https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/..%2Fmanifest.json"
```
Expected: `403 Forbidden`

**Test Invalid Segments** (must return 403):
```bash
curl -i "https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/artifacts//context.json"
```
Expected: `403 Forbidden`

### Robots/Noindex Verification

**Check Run Detail Pages** (must have noindex):
```bash
curl -s https://lab.mplp.io/runs/sample-pass | grep -i "noindex"
```
Expected: Find `<meta name="robots" content="noindex,nofollow">` or equivalent

### Cache Headers Verification

**Check API Responses**:
```bash
curl -I https://lab.mplp.io/api/runs/gf-01-langchain-pass/files/manifest.json
```

**Expected Headers**:
- `Cache-Control: public, max-age=31536000, immutable`
- `X-Content-Type-Options: nosniff`
- `Content-Type: application/json; charset=utf-8`

**Check Download Route**:
```bash
curl -I https://lab.mplp.io/api/runs/gf-01-langchain-pass/download/manifest.json
```

**Expected Headers**:
- `Content-Disposition: attachment; filename="manifest.json"`
- `Content-Type: application/octet-stream`

---

## Step 3: Entry Model Closure (Production Verification)

**Objective**: Verify three-entry integration is live and functional

### Website Verification

**URL**: https://mplp.io/governance/evidence-chain

**Checklist**:
- [ ] Page loads successfully
- [ ] "External Resources" section visible
- [ ] Link to `https://lab.mplp.io` present
- [ ] Boundary statement complete: "Evidence-based verdict viewing and export; not a certification program and does not host execution"
- [ ] Link opens correctly (target="_blank")

**Verification Command**:
```bash
curl -s https://mplp.io/governance/evidence-chain | grep -A 5 "Validation Lab"
```

### Docs Verification

**URL**: https://docs.mplp.io/evaluation/conformance

**Checklist**:
- [ ] Page loads successfully
- [ ] "External References" section (#8) visible
- [ ] Link to `https://lab.mplp.io` present
- [ ] "External Reference (Non-Normative)" declaration visible
- [ ] Boundary statement complete: "External reference (non-normative): evidence viewing/export site"

**Verification Command**:
```bash
curl -s https://docs.mplp.io/evaluation/conformance | grep -A 3 "Validation Lab"
```

### Full Entry Path Test

**User Journey Simulation**:
1. Start at https://docs.mplp.io/evaluation/conformance
2. Click "Validation Lab" external reference link
3. Arrive at https://lab.mplp.io
4. Navigate to `/runs`
5. Click a run detail (e.g., `gf-01-langchain-pass`)
6. Verify evidence pack browser functional
7. Test file download via API

**All steps must succeed without errors**

---

## Step 4: Git Tag & GitHub Release

### Create Git Tag

**Repository**: Validation_Lab (main repo)

**Commands**:
```bash
cd Validation_Lab
git tag -a v0.1 -m "MPLP Validation Lab v0.1 - Evidence Viewing & Export (Non-Certification)"
git push origin v0.1
```

**Verification**:
```bash
git tag -l
git show v0.1
```

### Create GitHub Release

**Platform**: GitHub (Validation_Lab repository)

**Release Details**:
- **Tag**: `v0.1`
- **Title**: `MPLP Validation Lab v0.1 — Evidence Viewing & Export (Non-Certification)`
- **Description**: Use prepared GitHub release text (see `github-release-v0.1.md`)

**Critical**: Description MUST include "What It Is NOT" section with non-certification boundaries

**Attachments** (Optional, text only):
- `release-notes-v0.1.md`
- `master-evidence-manifest.v0.1.json`
- Link to phase seals (via repo URL)

**DO NOT ATTACH**:
- Badge images
- Score cards
- "Certification" PDFs

---

## Step 5: Evidence Archival

**Objective**: Preserve audit trail for future verification

### Create Release Evidence Directory

```bash
cd Validation_Lab
mkdir -p releases/v0.1
```

### Copy Key Artifacts

```bash
# Seal documents
cp path/to/phase-3-seal.md releases/v0.1/
cp path/to/phase-4-seal.md releases/v0.1/
cp path/to/phase-5-seal.md releases/v0.1/
cp path/to/phase-6-final-acceptance.md releases/v0.1/

# Release artifacts
cp path/to/release-notes-v0.1.md releases/v0.1/
cp path/to/master-evidence-manifest.v0.1.json releases/v0.1/

# Evidence logs (key files)
cp artifacts/gates/phase-6-final-gates.log releases/v0.1/
cp artifacts/gates/phase-6-frozen-boundaries-check.log releases/v0.1/
```

### Create Release Index

**File**: `releases/v0.1/INDEX.md`

**Content**:
```markdown
# MPLP Validation Lab v0.1 Evidence Index

**Release Date**: 2026-01-11  
**Tag**: v0.1  
**Status**: RELEASED

## Entry Points

- Lab: https://lab.mplp.io
- Website: https://mplp.io/governance/evidence-chain
- Docs: https://docs.mplp.io/evaluation/conformance

## Commits

- Phase 3: c988e71
- Phase 4: 315ea3d → cd7cd7d → f6c63c0 → 779b392 → 7a77783 → 7df9dfc
- Phase 5: f2a0af1, aa86b28a

## Ruleset Version

- ruleset-1.0 (presence-level)

## Seal Documents

- phase-3-seal.md
- phase-4-seal.md
- phase-5-seal.md
- phase-6-final-acceptance.md

## Manifest

- master-evidence-manifest.v0.1.json
```

### Commit Archive

```bash
git add releases/v0.1/
git commit -m "archive: Add v0.1 evidence pack"
git push origin main
```

---

## Step 6: Post-Release Verification (First 72 Hours)

### Semantic Drift Risk Monitoring

**Objective**: Ensure no misinterpretation as "certification platform"

**Actions**:

1. **Site-Wide Grep** (production):
```bash
# Check for forbidden terms (should only match intentional boundary statements)
curl -s https://lab.mplp.io/runs | grep -i "certification\|certified\|badge\|ranking"
```

Expected: No matches OR only matches in boundary statements

2. **Social Media Monitoring**:
- Review any announcements for accurate boundary language
- Ensure external communications reference release notes boundaries
- Correct any misinterpretations immediately

3. **User Feedback Review**:
- Monitor for confusion about "what Lab does vs doesn't do"
- Prepare clarification responses based on release notes

### Functional Monitoring

**Daily Checks** (first week):
- [ ] All entry points accessible
- [ ] API routes functional
- [ ] No 500 errors in logs
- [ ] Security boundaries holding

**Weekly Checks** (first month):
- [ ] Gates still PASS
- [ ] No frozen boundary violations
- [ ] Documentation links intact

---

## Rollback Plan

**If Critical Issue Found**:

1. **Immediate**: Add banner to Lab homepage with issue notice
2. **Within 4 hours**: Deploy fix or rollback
3. **Within 24 hours**: Publish v0.1.1 with fix + updated seal

**Rollback Procedure**:
```bash
cd Validation_Lab
git revert [problematic-commit]
git push origin main
# Redeploy
```

---

## Success Criteria

**v0.1 is considered successfully released when**:

- [x] All gates PASS (verified)
- [ ] Lab deployed to https://lab.mplp.io (all paths functional)
- [ ] Website integration live and verified
- [ ] Docs integration live and verified (branch strategy resolved)
- [ ] Git tag `v0.1` created and pushed
- [ ] GitHub release published with correct boundaries
- [ ] Evidence archive committed to repo
- [ ] No semantic drift detected in first 72 hours

---

## Release Announcement Template

**Internal/External Communications** (use with caution):

```
MPLP Validation Lab v0.1 is now available at https://lab.mplp.io

This is an evidence viewing and export tool for MPLP conformance evaluation.

IMPORTANT: This is NOT a certification program. It does not host agent execution 
or provide compliance determinations. See release notes for full details:
[link to release notes]
```

**DO NOT USE**:
- "Get certified"
- "Official validation"
- "Compliance score"
- "Upload your agent"

---

## Post-Release Actions

**Immediate** (Day 0-1):
- Monitor deployment health
- Verify all entry points live
- Watch for semantic misinterpretations

**Short-term** (Week 1):
- Resolve docs branch strategy if not done
- Archive additional evidence if needed
- Address any user confusion

**Medium-term** (Month 1):
- Review feedback for v0.2 planning
- Assess adoption patterns
- Document lessons learned

---

**Release Manager**: [Name]  
**Approval**: Phase 6 Acceptance (ACCEPTED)  
**Runbook Version**: 1.0  
**Last Updated**: 2026-01-11
