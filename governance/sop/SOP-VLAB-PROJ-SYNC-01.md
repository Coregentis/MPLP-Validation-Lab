---
sop_id: SOP-VLAB-PROJ-SYNC-01
title: Post-Task Association Update (Mandatory)
status: active
version: 1.0.0
effective_date: 2026-01-23
authority: VLAB-DGB-01
scope: post-task
enforcement: CI + PR gate
applies_to:
  - Validation_Lab
  - MPLP_website
  - docs
---

# SOP-VLAB-PROJ-SYNC-01: Post-Task Association Update

## Purpose

This SOP defines the **mandatory association update loop** that must be executed after completing any task involving:
- New/deleted/modified pages, routes, or navigation
- New/deleted/modified data exports, scripts, or SSOT artifacts  
- New/deleted/modified policy files, governance docs, or boundaries
- Content changes affecting projection across Lab/Website/Docs

**Enforcement**: Tasks are not considered complete until all sections of this SOP are satisfied and verified by gates.

---

## A. Registry Sync (MANDATORY)

All changes MUST be reflected in the Registry three-file set:

### A.1 ROUTES.yaml

**When to update**:
- New route added to Lab UI
- Route deleted or deprecated
- Route ownership/surface/priority changed

**Required fields** for new routes:
- `route`: path
- `introduced_in`: version
- `surface_type`: classification
- `priority`: P0/P1/P2/P3
- `ptm_validation`: validation type
- `description`: purpose

### A.2 TRUTH_SOURCES.yaml

**When to update**:
- New SSOT artifact/file created
- SSOT path pattern changed
- Resolver or type modified

**Required fields** for new truth sources:
- `ts.<id>`: unique identifier
- `path`: file/glob pattern
- `resolver`: file/glob/query/etc
- `type`: yaml/json/md/etc
- `description`: purpose
- `used_by_routes`: list of dependent routes

### A.3 GATES.yaml

**When to update**:
- New gate created
- Gate scope/severity changed
- Gate dependencies modified

**Required fields** for new gates:
- `gate_id`: unique identifier
- `entrypoint`: script path
- `npm_script`: command name
- `verifies`: list of checks
- `applies_to_routes`: applicable routes
- `failure_impact`: consequence description

**DoD-A**: Registry sync completed and internally consistent.

---

## B. Projection SSOT Update (MANDATORY)

### B.1 export/projection-map.json

**When to update**:
- New artifact added
- Route-to-artifact mapping changed
- Forbidden projection categories modified
- Allowlist paths updated

**Required updates**:
- `artifacts[]`: register new artifacts with truth_source, routes, normativity
- `forbidden`: update category patterns if boundary rules change
- `allow`: update allowlists if new exceptions needed

### B.2 governance/page-truth/ptm-*.yaml

**When to update**:
- New page with static PTM validation
- Truth source dependencies changed for existing page

**DoD-B**: `npm run gate:projection-map` MUST PASS.

---

## C. Three-Entry Projection Update (MANDATORY)

### C.1 Lab (SSOT Projection Surface)

**When to update**:
- New route/page added to Lab
- New export artifact generated

**Required**:
- Route accessible via navigation/index/direct link
- Export artifacts have minimum browsable UI (list + download)

### C.2 Website (Pointer-Only)

**When to update**:
- New Lab capability that requires discovery pointer

**Allowed**:
- Pointer link + one-sentence boundary description
- Generic category reference (no substrate enumeration)

**FORBIDDEN**:
- Substrate/framework names
- Coverage percentages
- Verdict status details
- Ruleset requirement specifics

### C.3 Docs (Non-Normative Pointer)

**When to update**:
- New Lab capability requiring reference documentation

**Allowed**:
- Non-normative disclaimer + pointer link
- Conceptual boundary explanation

**FORBIDDEN**:
- Adjudication logic details
- Coverage matrix restatement
- Determinism methodology details
- Verdict computation descriptions

**DoD-C**: All cross-repo gates MUST PASS:
- Website: `gate:website-pointer-only`
- Docs: `gate:docs-nonnormative-pointer-only`

---

## D. Regression Verification (MANDATORY)

All gates MUST be run and results documented.

### D.1 Lab Gates

```bash
npm run gate:projection-map
npm run gate:no-ssot-duplication  
npm run build
npm run typecheck
```

### D.2 Website Gate

```bash
cd ../MPLP_website
npm run gate:website-pointer-only
```

### D.3 Docs Gate

```bash
cd ../docs
npm run gate:docs-nonnormative-pointer-only
```

**DoD-D**: Provide gate execution summary with:
- PASS/FAIL status for each gate
- Error/warning counts
- Key metrics (files scanned, routes validated, etc.)
- Report file hashes (SHA256) if generated

---

## Task Completion Report (MANDATORY FORMAT)

Every task completion MUST include a report following this template:

```markdown
# Task Completion Report

## 1. Task ID / Scope
[Task identifier and brief description]

## 2. Files Changed (by Repository)
Validation_Lab: [list]
Website: [list]
Docs: [list]

## 3. Registry Sync
### ROUTES.yaml
- Version: [old] → [new]
- Changes: [additions/deletions/modifications]

### TRUTH_SOURCES.yaml
- New truth sources: [list with ts.* IDs]
- Modified: [list]

### GATES.yaml
- New gates: [list with gate:* IDs]
- Modified: [list]

## 4. Projection SSOT
### projection-map.json
- New artifacts: [list]
- Route updates: [list]
- Forbidden/allowlist changes: [summary]

### PTM
- New/modified pages: [list]

## 5. Three-Entry Projection Updates
### Lab UI
- New routes/pages: [list with accessibility note]
- New exports: [list with UI reference]

### Website
- Pointer additions: [list or "None"]

### Docs
- Reference additions: [list or "None"]

## 6. Gate Results
Lab Gates:
- gate:projection-map: [PASS/FAIL + metrics]
- gate:no-ssot-duplication: [PASS/FAIL + errors/warnings]
- build: [PASS/FAIL]
- typecheck: [PASS/FAIL]

Cross-Repo Gates:
- Website gate:website-pointer-only: [PASS/FAIL]
- Docs gate:docs-nonnormative-pointer-only: [PASS/FAIL]

## 7. Hash Anchors
[Key files with SHA256 hashes]

## 8. Next Tasks Triggered
[List of follow-on work if applicable]
```

---

## Enforcement

### PR-Level Enforcement

All PRs MUST include:
1. Task Completion Report in `governance/reports/task-completion/<task-id>.md`
2. All gate execution results (PASS required)
3. Hash anchors for modified SSOT/registry files

### CI Enforcement

GitHub Actions will run:
- All applicable gates on every PR
- Block merge if any gate fails
- Verify Task Completion Report exists (via `gate:post-task-association`)

---

## Compliance

**Non-compliance consequences**:
- PR cannot be merged
- Task marked incomplete in tracking
- Projection drift may trigger blocking gate failures

**Compliance verification**:
- All gates PASSING
- Task Completion Report filed  
- Registry/Projection/Three-Entry all synchronized

---

## Related Documents

- `VLAB-DGB-01.md` - Development Governance Baseline
- `REPO_SHAPE.md` - Directory Constitution
- `export/projection-map.json` - Projection SSOT
- `governance/registry/` - Registry three-file set

---

**SOP Owner**: VLAB Governance Delegate  
**Review Cycle**: Per major version (v0.x.0 boundary)  
**Last Updated**: 2026-01-23
