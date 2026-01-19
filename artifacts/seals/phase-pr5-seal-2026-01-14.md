# PR-5 Seal — Adjudication Pipeline

**Sealed**: 2026-01-14T18:15:00Z  
**Status**: SCOPE LOCKED ✅

---

## SSOT Entry Points

The adjudication pipeline has exactly 3 implementation files:

```
lib/adjudication/
├── adjudicate.ts           # Main pipeline (310 lines)
├── deterministicHash.ts    # Canonical hash utility (70 lines)
└── (future: evaluate.ts if expanded)
```

**CLI Entry**: `src/cli/vlab.ts` → `cmdAdjudicate(runId)`

**Ruleset Pin**: `verifier/VERIFIER_IDENTITY.json` → `.upstream_pin`

---

## Determinism Contract

### Excluded Fields (NOT included in verdict_hash)

| Field | Reason |
|:---|:---|
| `adjudicated_at` | Timestamp varies per run |
| `_meta` | Non-semantic metadata |
| `generated_at` | Alternative timestamp field |
| `computed_at` | Alternative timestamp field |

### Canonicalization Rules

1. Object keys sorted alphabetically (recursive)
2. Excluded fields removed before hashing
3. JSON stringified with no whitespace variation
4. SHA-256 digest (64-char hex)

**Implementation**: `lib/adjudication/deterministicHash.ts` → `computeDeterministicHash()`

---

## Bundle Structure (7 files, immutable)

```
adjudication/<run_id>/
├── input.pointer.json        # Input reference (copy)
├── verifier.identity.json    # Verifier snapshot
├── verifier.fingerprint.json # Engine/ruleset hashes
├── verify.report.json        # Admission + integrity
├── evaluate.report.json      # GF verdicts
├── verdict.json              # Final verdict + verdict_hash
└── sha256sums.txt            # Integrity seal
```

---

## Hash Anchors (at seal time)

```
engine_hash:        35dd34ee... (lib/engine/verify.ts)
ingest_hash:        a7b2c91f... (lib/engine/ingest.ts)
adjudication_hash:  6afde436... (first gf-01-smoke verdict)
ruleset_version:    1.0
```

---

## Test Coverage

| File | Tests | Coverage |
|:---|:---|:---|
| `tests/adjudication/adjudicate.spec.ts` | 7 | Determinism + bundle structure |

**Total Tests**: 42/42 passing

---

## Scope Lock Declaration

> [!IMPORTANT]
> PR-5 is now **scope-locked**. The following changes are PROHIBITED without a new PR:

### Prohibited Changes

1. **Canonicalization rules** — Cannot change verdict_hash computation algorithm
2. **Bundle file set** — Cannot add/remove/rename the 7 bundle files
3. **Excluded fields** — Cannot change which fields are excluded from hash
4. **Semantic leakage** — Cannot add ranking/recommendation/certification fields

### Allowed Changes

- Bug fixes that don't alter hash determinism
- Performance improvements to evaluation
- Additional evidence_refs (extend, not modify)

---

## Verification Commands

```bash
# Run adjudication
npm run vlab:adjudicate gf-01-smoke

# Verify determinism (run twice, compare hash)
npm run vlab:adjudicate gf-01-smoke
cat adjudication/gf-01-smoke/verdict.json | grep verdict_hash
# Should be: 6afde43633358e9a423fa50e0d838091a07737bb39004c0e4b2dc0a224279f67

# Run all tests
npm run test  # 42/42 pass
```

---

## Dependencies

| Dependency | Source |
|:---|:---|
| `lib/engine/ingest.ts` | PR-1 |
| `lib/engine/verify.ts` | PR-1 |
| `verifier/VERIFIER_IDENTITY.json` | PR-1 |
| `data/runs/*/input.pointer.json` | Input format (this PR) |

---

**Sealed by**: Validation Lab Governance  
**Prerequisite**: PR-4 (Test Infrastructure) sealed  
**Next phase**: PR-6 (Adjudication Export Interface)
