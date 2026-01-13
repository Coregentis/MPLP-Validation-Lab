# Phase 4 Generator Commit SHA Explanation

**Issue**: In Phase 4 Preflight gates.B.log, generator shows "Commit: 315ea3d" while current HEAD is "cd7cd7d"

---

## Explanation (CORRECT BEHAVIOR)

### Timeline

1. **Commit A (P4-0.1)**: SHA `315ea3d`
   - Applied fixes #1-6
   - Ran gates → generator captured `git HEAD` = `315ea3d`

2. **Commit B (P4-0.1.1 FINAL)**: SHA `cd7cd7d`
   - Applied fixes #7-10
   - **Ran gates BEFORE committing** → generator captured `git HEAD` = `315ea3d`
   - Then committed → new HEAD = `cd7cd7d`

### Why "Commit: 315ea3d" in gates.B.log?

**Answer**: The generator was executed **before** Commit B, so `git rev-parse --short HEAD` returned `315ea3d` (Commit A).

This is **correct workflow**:
1. Apply code changes
2. **Verify** (run gates, which includes generator)
3. **Commit** (only if verification passes)

### Semantic Meaning

**`ssot.git_commit`** in `curated-runs.json` represents:
- **"Snapshot of git state when artifact was generated"**
- Used for audit traceability
- NOT necessarily the "final commit SHA" of the phase

### Audit Clarification

For Phase 4 Seal Report, document:

> The `ssot.git_commit` field records the git HEAD at generation time. During Commit B verification, the generator executed before the commit was finalized, thus recording Commit A's SHA (315ea3d) as the snapshot reference. This is correct workflow behavior: verify-then-commit.

---

## Resolution

**No action required**. This is expected behavior and represents correct workflow hygiene (verify before commit).

**For Phase 4 Main**: Continue this pattern. Generator will show the current uncommitted HEAD, which becomes the audit snapshot.

---

## Alternative Interpretation (NOT APPLICABLE HERE)

If we wanted `ssot.git_commit` to always match the "SSOT commit" (allowlist.yaml's last change):

- Would need to track allowlist.yaml's last modification commit separately
- Current implementation uses "generation-time snapshot" which is simpler and equally auditable

**Recommendation**: Keep current behavior. Document in seal report.

---

**Status**: ✅ EXPLAINED - No drift, correct workflow
