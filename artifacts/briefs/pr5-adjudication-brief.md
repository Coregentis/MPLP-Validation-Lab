# PR-5 Implementation Brief — Adjudication Pipeline

**Status**: READY FOR IMPLEMENTATION  
**Prerequisite**: PR-4 sealed ✅

---

## Objective

Implement `vlab adjudicate <run_id>` to generate a **run adjudication bundle** that:
1. Verifies an evidence pack (admission + integrity)
2. Evaluates against ruleset (GF verdicts)
3. Produces a deterministic, hashable verdict bundle

---

## CLI Command

```bash
npm run vlab:adjudicate <run_id>
# Example: npm run vlab:adjudicate gf-01-claude-2026-01-10
```

---

## Input/Output Structure

### Input
```
data/runs/<run_id>/
├── input.pointer.json    # Points to evidence pack location
└── (optional metadata)
```

### Output (7 files)
```
adjudication/<run_id>/
├── input.pointer.json       # Copy of input reference
├── verifier.identity.json   # Snapshot of VERIFIER_IDENTITY
├── verifier.fingerprint.json # Engine + ruleset hashes
├── verify.report.json       # Admission + integrity checks
├── evaluate.report.json     # GF verdicts by ruleset
├── verdict.json             # Final adjudication verdict
└── sha256sums.txt           # Integrity seal
```

---

## verdict.json Schema (Minimal)

```typescript
interface AdjudicationVerdict {
    adjudication_version: "1.0";
    run_id: string;
    adjudicated_at: string;  // ISO 8601
    
    verifier: {
        id: string;
        version: string;
    };
    
    ruleset_version: string;
    protocol_pin: string;    // From VERIFIER_IDENTITY.upstream_pin
    
    admission_status: "ADMISSIBLE" | "NOT_ADMISSIBLE";
    
    golden_flow_results: {
        gf_id: string;       // GF-01, GF-02, etc.
        status: "PASS" | "FAIL" | "NOT_EVALUATED";
        evidence_refs: string[];  // Paths within pack
    }[];
    
    overall_status: "ADJUDICATED" | "INCOMPLETE" | "NOT_ADMISSIBLE";
    
    // Exclude from hash computation (non-deterministic)
    _meta?: {
        generated_by: string;
        notes?: string;
    };
}
```

---

## Determinism Constraints

> [!CAUTION]
> **Critical**: Adjudication must be deterministic.

| Field | Determinism Rule |
|:---|:---|
| `adjudicated_at` | Include in JSON, **exclude** from verdict hash |
| `_meta` | Exclude from hash |
| All other fields | Include in hash |

Verification formula:
```typescript
verdict_hash = SHA256(JSON.stringify(verdict, deterministicReplacer))
// where deterministicReplacer excludes _meta and sorts keys
```

---

## Implementation Checklist

### Phase 5.1: Core Pipeline
- [ ] `src/cli/vlab.ts` — Implement `cmdAdjudicate(run_id)`
- [ ] `lib/adjudication/adjudicate.ts` — Main adjudication function
- [ ] `lib/adjudication/evaluate.ts` — GF evaluation logic
- [ ] `data/runs/` — Sample run input structure

### Phase 5.2: Bundle Generation
- [ ] Generate `adjudication/<run_id>/` directory
- [ ] Compute `sha256sums.txt` for bundle
- [ ] Verify determinism (same input → same hash)

### Phase 5.3: Gate (Optional)
- [ ] `lib/gates/gate-13-adjudication-consistency.ts`
  - Validates bundle completeness
  - Verifies sha256sums match
  - Checks verdict schema

---

## Forbidden Terms (Public Surface Rules Apply)

The adjudication bundle MUST NOT contain:
- "certified", "certification"
- "endorsed", "endorsement"
- "ranked", "ranking"
- "recommended", "recommendation"
- "badge", "seal of approval"

---

## Verification Commands

```bash
# Run adjudication
npm run vlab:adjudicate gf-01-test-run

# Verify determinism
npm run vlab:adjudicate gf-01-test-run
npm run vlab:adjudicate gf-01-test-run
diff adjudication/gf-01-test-run/sha256sums.txt /tmp/second-run/sha256sums.txt
# Should be identical
```

---

## Success Criteria

1. ✅ `vlab adjudicate <run_id>` completes without error
2. ✅ Output bundle has all 7 required files
3. ✅ `verdict.json` contains all required fields
4. ✅ Repeated runs produce identical `verdict_hash`
5. ✅ No forbidden terms in output
6. ✅ Evidence refs in verdict point to valid pack paths

---

**Ready for**: Next AI agent execution  
**Depends on**: PR-4 seal (completed)
