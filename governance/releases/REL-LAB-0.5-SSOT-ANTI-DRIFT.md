# REL-LAB-0.5 SSOT Anti-Drift Seal

**Seal ID**: `REL-LAB-0.5-SSOT-ANTI-DRIFT`  
**Scope**: site-v0.5  
**Sealed At**: 2026-01-20  
**Status**: SEALED

---

## Abstract

This seal certifies that all 20 Validation Lab pages have been audited for SSOT compliance and that governance gates are in place to prevent future drift. This is an **evidence-sealing document**, not a certification or endorsement of any substrate or framework.

---

## Evidence Commits

| Commit | Description |
|--------|-------------|
| `4034072` | Complete 20-page audit with P1/P2/P3 fixes |
| `265ae25` | P2/P3 anti-drift implementation with SSOT-driven pages |
| `3616ce2` | Correct adjudication_status enum in EXPORT_CONTRACT_CHANGELOG |
| `1f66421` | Resolve SSOT inversion in methodology + add G-SSOT-SUBSTRATE-01 gate |

---

## Hardcode Classification Framework (A/B/C)

| Type | Policy | CI Gate Required |
|------|--------|------------------|
| **A-Type** (Drift-prone facts) | MUST be SSOT-driven | Yes |
| **B-Type** (Stable definitions) | MAY hardcode with source declaration | Optional |
| **C-Type** (UI narrative) | MAY hardcode | No |

---

## Active CI Gates

| Gate ID | Protects | Status |
|---------|----------|--------|
| `G-SSOT-SUBSTRATE-01` | METHOD doc ↔ substrate-index.yaml | ✅ Active |
| `G-GUARANTEES-SSOT-01` | LIFECYCLE_GUARANTEES.yaml integrity | ✅ Active |
| `G-REL-01` | Release index integrity | ✅ Active |
| `G-TOP-01` | Top-level directory whitelist | ✅ Active |

---

## Verification Command

```bash
# Run all SSOT gates
node scripts/ci/substrate-ssot-gate.mjs && \
node scripts/ci/guarantees-ssot-gate.mjs && \
node scripts/ci/release-index-gate.mjs
```

Expected output:
```
✅ GATE PASSED: METHOD doc snapshot matches SSOT
✅ GATE PASSED: LIFECYCLE_GUARANTEES.yaml valid (5 guarantees, freeze: site-v0.5)
✅ GATE PASSED: Release index valid
```

---

## Pages Fixed in This Seal

| Page | Issue | Resolution |
|------|-------|------------|
| `/methodology` | Hardcoded substrate data | SSOT pointer + snapshot pattern |
| `/page.tsx` | Hardcoded v0.5/v1.2 | `loadRelease()` from SSOT |
| `/guarantees` | Hardcoded LG definitions | `LIFECYCLE_GUARANTEES.yaml` |
| `/policies/contract` | SSOT doc wrong enum | Fixed PENDING→NOT_ADJUDICATED |
| `/policies/substrate-scope` | Wrong substrates (CrewAI/ACP) | `loadTier0Substrates()` |
| `/examples/[substrate]` | Hardcoded SUBSTRATES | B-type source declaration |
| `/policies/strength` | Hardcoded ruleset-1.0 | Freeze tag comment |

---

## Projection Authority Reference

This seal confirms the following projection hierarchy:

```
substrate-index.yaml       → Source of truth for substrates
release-index.yaml         → Source of truth for releases  
LIFECYCLE_GUARANTEES.yaml  → Source of truth for LG definitions
export/*.json              → Contract surface for consumers
governance/*.md            → Narrative only; MUST NOT embed live tables
app/**/*.tsx               → Projections; load from SSOT at build time
```

---

## Boundary Statement

> **Non-certification**: This seal documents technical SSOT governance. It does not:
> - Certify or endorse any substrate
> - Evaluate runtime performance
> - Grant compliance marks

---

## Seal Authority

- **Sealed by**: Validation Lab SSOT Audit
- **Governance scope**: site-v0.5
- **Freeze tag**: `rel-lab-0.5`
