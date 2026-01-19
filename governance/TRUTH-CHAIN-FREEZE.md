# Truth Chain Freeze Statement — v0.5

> **Document ID**: VLAB-TRUTH-CHAIN-01  
> **Status**: GOVERNANCE-FROZEN  
> **Effective Date**: 2026-01-19  
> **Governed By**: VLAB-DGB-01

---

## Executive Summary

Validation Lab v0.5 establishes a **complete Truth Chain** ensuring that all UI pages are backed by verifiable truth sources and executable gates.

**Key Achievement**: 100% route coverage (18/18) with machine-verifiable bindings.

---

## What This Means for Third Parties

### ✅ Page Semantics Are Verifiable

- Every page has declared truth sources
- Every data display can be traced to a file or registry
- Gates enforce page-truth consistency

### ✅ Verdicts Are Reproducible

- Lab verdict = local recompute verdict (shadow-parity)
- Signed proofs are independently verifiable (Ed25519)
- Ruleset adjudicators are loadable and executable

### ✅ Data Boundaries Are Machine-Readable

- Curated runs, cross-substrate runs, and test vectors are explicitly disjoint
- Runset relationships are defined in `runsets.yaml`
- Gates enforce boundary integrity

---

## Truth Chain Architecture

```
Registry (SSOT)              PTM (Projection)             Gates (Verification)
┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│ ROUTES.yaml      │───────▶ │ ptm-0.5.yaml     │───────▶ │ gate:ptm         │
│ TRUTH_SOURCES    │         │ (18/18 routes)   │         │ (PASS)           │
│ GATES.yaml       │         └──────────────────┘         └──────────────────┘
└──────────────────┘
```

---

## Frozen Capabilities (v0.5)

| Capability | Status | Evidence |
|------------|--------|----------|
| Route Coverage | 18/18 (100%) | `gate:ptm` PASS |
| Truth Sources | 18 registered | `TRUTH_SOURCES.yaml` |
| Gates | 23 bound | `GATES.yaml` |
| Sample Runs | 6 verified | `ui_test_samples` |
| Runset Integrity | Disjoint | `gate:runset-consistency` PASS |
| Ruleset Registry | 3 loadable | `gate:registry` PASS |
| Shadow Parity | 26/26 match | `gate:shadow-parity` PASS |

---

## Technical Debt (Acknowledged & Scheduled)

| Item | Status | Scheduled |
|------|--------|-----------|
| R2B: GATES.yaml entrypoint migration | Deferred | v0.7 |
| R2C: Remove `lib/gates/` | Deferred | v0.7 |
| PTM generator script | Optional | Future |

### Debt Containment Policy

- **Prohibition**: No new files may be added to `lib/gates/` (v0.6+)
- **Compatibility**: Existing gate entrypoints remain functional
- **Migration**: v0.7 will complete entrypoint unification

---

## External Verification Commands

```bash
# Verify Truth Chain
npm run gate:ptm           # Routes: 18/18, Samples: 6 verified
npm run gate:registry      # Rulesets: 3/3 loadable
npm run gate:runset-consistency  # curated: 23, cross: 24, disjoint

# Verify Reproducibility
npm run gate:shadow-parity # 26/26 parity match
npm run gate:cross-substrate  # 24/24 cross-platform parity
```

---

## Non-Negotiable Constraints

1. **Registry is SSOT** — PTM is projection only
2. **PTM coverage must remain 100%** — new routes require registration
3. **New gates go to `scripts/gates/` or `lib/runtime-checks/`** — lib/gates prohibited
4. **Sample-based validation for dynamic routes** — abstract patterns not sufficient

---

## One-Line Summary

> **Validation Lab v0.5 provides evidence-based, vendor-neutral, machine-verifiable verdicts for MPLP lifecycle guarantees, backed by a complete Truth Chain from UI to data sources.**

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-19
