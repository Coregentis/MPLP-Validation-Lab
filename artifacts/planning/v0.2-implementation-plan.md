# MPLP v0.2 — Production Implementation Plan

> **Audit Status**: PASS (Ready to Execute)

---

## A) W6 — Cross-substrate S4

### Equivalence Record Required Fields

```json
{
  "scenario_id": "gf-01",
  "ruleset_version": "1.0",
  "evaluator": "local-cli",
  "evaluator_version": "commit-sha or package-version",
  "equivalence_type": "cross_substrate",
  "packs": [
    { "substrate": "langchain", "pack_root_hash": "...", "verdict_hash": "..." },
    { "substrate": "a2a", "pack_root_hash": "...", "verdict_hash": "..." }
  ],
  "evidence_minimums": {
    "context_present": true,
    "plan_present": true,
    "trace_present": true,
    "timeline_present": true,
    "integrity_present": true
  },
  "verdict_match": true
}
```

**Location**: `Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json` ONLY

### verify_equivalence.ts Constraints

```typescript
// ONLY allowed:
// 1. Check evidence_minimums (file presence)
// 2. Call local evaluator CLI (from repo)
// 3. Compare verdict_hash
// FORBIDDEN: Generate PASS/FAIL text (evaluator does that)
```

### Curated Runs

```yaml
- run_id: gf-01-cross-substrate-langchain
  substrate_claim_level: reproduced
  substrate_execution: reproduced
  repro_ref: tests/cross-substrate/gf-01/langchain/generate_pack.py
  equivalence_ref: Validation_Lab/releases/v0.2/artifacts/equivalence/gf-01.json
```

---

## B) W7 — MCP Tool-call (S1)

### Strength Honesty Statement

README must include:

```markdown
## Strength Level: S1 (Presence)

This flow validates presence-level tool event shapes only.  
Field semantics are not standardized in v0.2.  
Cross-artifact links (Plan↔Trace step_id) deferred to v0.3.

> ⚠️ **BYO Execution**  
> This server runs locally on your machine.  
> The Lab does not execute it and does not host submissions.
```

---

## C) P2 — Gates

### PJT-02 Executable Criteria

| Extension | Check |
|-----------|-------|
| `.sh` | `bash -n` or shebang present |
| `.py` | `python -m py_compile` |
| **All** | No network access imports (static check) |

---

## Execution Order (Minimize Rework)

1. W6 pack generators (langchain/a2a)
2. Local evaluator CLI with ruleset-1.0
3. verify_equivalence.ts
4. Freeze equivalence record → releases/
5. Update allowlist
6. W7 echo + invariants + README
7. PJT gates → CI
8. Seal + manifest

---

## Audit Must-Pass Checklist

- [ ] **1. Evaluator identity**: record has `evaluator` + `evaluator_version`
- [ ] **2. No verdict text**: verify_equivalence only compares hashes
- [ ] **3. Dual flags**: reproduced runs have both `claim_level` + `execution` = reproduced
- [ ] **4. Evidence minimums**: includes `trace_present` (align with ruleset)
- [ ] **5. S1 honesty**: W7 README states "presence-level only"
- [ ] **6. PJT-02 criteria**: executable checks documented in gate README

---

## Merge Blockers (P0)

1. ✅ Equivalence record only in releases/ (not packs)
2. ✅ Reproduced runs: `claim_level` + `execution` + `repro_ref` + `equivalence_ref`
3. ✅ verify_equivalence: local-cli only, hash-compare only
4. ✅ W7: S1 fixed, schema pointers real
5. ✅ BYO boundary in all READMEs
6. ✅ PJT gates in CI
7. ✅ v0.2 seal + manifest entry
