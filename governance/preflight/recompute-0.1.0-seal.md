# Phase 2 Seal — @mplp/recompute 0.1.0 (Bundled ruleset-1.0)

**Sealed**: 2026-01-10  
**Sprint**: Cross-Vendor Evidence Spine v0.1  
**Commit**: c08f983

---

## Build Evidence

### Build Command

```bash
> @mplp/recompute@0.1.0 build
> tsc
```

**Status**: ✅ Success (exit code 0)

### Dist Contents

```
total 40
-rw-r--r--@ 1 jasonwang  staff   328 Jan 10 21:24 index.d.ts
-rw-r--r--@ 1 jasonwang  staff   120 Jan 10 21:24 index.d.ts.map
-rw-r--r--@ 1 jasonwang  staff  4816 Jan 10 21:24 index.js
-rw-r--r--@ 1 jasonwang  staff  2718 Jan 10 21:24 index.js.map
```

### Bin Entry

```json
"bin": {
    "mplp-recompute": "dist/index.js"
}
```

---

## Determinism Evidence (sample-pass)

### Run 1

```json
{
  "ruleset_source": "bundled",
  "ruleset_version": "1.0",
  "pack_id": "test-minimal-pass-001",
  "verdict_hash": "e11afbd22eb42f9dbffa81ef40a01ab3c430ac9072a5e14c085c8e499217b890",
  "match": null,
  "curated_hash": null
}
```

### Run 2 (Same Pack)

```json
{
  "ruleset_source": "bundled",
  "ruleset_version": "1.0",
  "pack_id": "test-minimal-pass-001",
  "verdict_hash": "e11afbd22eb42f9dbffa81ef40a01ab3c430ac9072a5e14c085c8e499217b890",
  "match": null,
  "curated_hash": null
}
```

**Verdict Hash Match**: ✅ Identical (`e11afbd2...217b890`)

---

## Ruleset Strategy Enforcement

### Unknown Ruleset Rejection

```bash
node packages/recompute/dist/index.js data/runs/sample-pass --ruleset 9.9
```

**Output**:
```
Error: Only ruleset version 1.0 is supported (got: 9.9)
This CLI bundles ruleset-1.0 for deterministic recomputation.
```

**Exit Code**: 2

**Status**: ✅ Correctly rejected

---

## Frozen Declarations

| Property | Value |
|:---|:---|
| `ruleset_source` | `bundled` (frozen) |
| `ruleset_version` | `1.0` (frozen) |
| Network Dependencies | None (offline capable) |
| Supported Rulesets | Only `--ruleset 1.0` |

---

## Risk Notes

### test-gf01-only Recomputation

**Observed**:
```json
{
  "verdict_hash": "0000000000000000000000000000000000000000000000000000000000000000"
}
```

**Status**: ⚠️ Requires P3-0 Sanity Gate investigation

**Rationale**: 
- `sample-pass` produces stable non-zero hash
- `test-gf01-only` produces all-zero hash
- Indicates potential fallback path in recompute logic
- Must verify before Phase 3 curated packs generation

**Action**: Execute P3-0 Sanity Gate before proceeding to Phase 3

---

## Deliverables

- ✅ `packages/recompute/` (standalone CLI)
- ✅ `packages/recompute/src/rulesets/ruleset-1.0/` (bundled)
- ✅ `packages/recompute/README.md`
- ✅ `docs/third-party-verification.md`

---

## Acceptance Criteria

- [x] Build success
- [x] Deterministic recomputation (sample-pass)
- [x] Offline capable
- [x] Unknown ruleset rejected
- [ ] Sanity gate for non-sample-pass packs (P3-0 pending)

---

**Phase 2 Status**: SEALED (pending P3-0 sanity verification)

**Authority**: MPLP Validation Lab Governance  
**Change Policy**: Frozen for Sprint v0.1
