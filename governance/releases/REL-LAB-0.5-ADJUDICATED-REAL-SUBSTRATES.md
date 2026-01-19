# Release Proof: Real Substrate Adjudicated Verdicts

> **Version**: v0.5  
> **Commit**: `7a1977d`  
> **Date**: 2026-01-20  
> **Status**: ✅ SEALED

---

## Summary

Two real substrates (MCP protocol, LangChain framework) now have recheckable adjudications with deterministic verdict hashes under GF-01.

---

## Adjudicated Real Substrate Verdicts

| Run ID | Substrate | Verdict Status | verdict_hash |
|--------|-----------|----------------|--------------|
| `gf-01-mcp-pass` | MCP (Protocol) | ADJUDICATED | `3db969b9cdda1f0a654ae20be6cfba47f9f62bce4030e267a9b98325728f6594` |
| `gf-01-langchain-pass` | LangChain (Framework) | ADJUDICATED | `4372ae42ce357fdbd540c20de850849cb814e8dd16f976ed48245ecb69eb25ac` |

---

## Recheck Determinism Proof

Both verdicts have been rechecked and produce identical hashes:

```
gf-01-mcp-pass:
  Recheck verdict_hash: 3db969b9cdda1f0a654ae20be6cfba47f9f62bce4030e267a9b98325728f6594
  Status: UNCHANGED ✅

gf-01-langchain-pass:
  Recheck verdict_hash: 4372ae42ce357fdbd540c20de850849cb814e8dd16f976ed48245ecb69eb25ac
  Status: UNCHANGED ✅
```

---

## Admission Remediation Record

The following admission failures were fixed to achieve ADJUDICATED status:

| Check ID | Taxonomy | Fix Applied |
|----------|----------|-------------|
| `MAN-001` | MANIFEST_PARSE_FAILED | Added `pack_version: "1.0.0"` to manifest.json |
| `INT-003` | INTEGRITY_HASH_MISMATCH | Added `input.pointer.json` hash to sha256sums.txt |
| `INT-002` | INTEGRITY_HASH_MISMATCH | Regenerated `integrity/pack.sha256` after above fixes |

---

## SSOT Consistency Check

| Source | Count | Status |
|--------|-------|--------|
| `substrate-index.yaml` | MCP + LangChain = ADJUDICATED | ✅ |
| `export/adjudication-index.json` | 6 bundles (4 ADJUDICATED) | ✅ |
| `public/_data/curated-runs.json` | 27 runs (4 adjudicated) | ✅ |

---

## Governance Boundary Statement

> [!IMPORTANT]
> **Non-certification · Non-endorsement · No execution hosting**
>
> These verdicts are evidence-based outputs under versioned rulesets.
> They do not constitute certification, endorsement, or ranking of any framework or protocol.
> The Lab evaluates evidence packs, not execution environments.

---

## Release Gate Checklist

- [x] **R0**: Local build PASS
- [x] **R1**: Recheck determinism verified (hash unchanged)
- [x] **R2**: SSOT consistency verified
- [x] **R3**: Governance boundary hygiene verified

---

**Sealed by**: Validation Lab Automation  
**Witnessed at**: 2026-01-20T01:36:00Z
