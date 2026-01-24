---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-033"
---

# Registry — Validation Lab SSOT Layer

> **Status**: GOVERNANCE-FROZEN (v0.7.2)  
> **Effective Date**: 2026-01-23

---

## Purpose

This directory contains the **Single Source of Truth (SSOT)** for Validation Lab's page-to-truth-source mappings.

| File | Purpose |
|------|---------|
| `ROUTES.yaml` | 18 UI routes with family grouping |
| `TRUTH_SOURCES.yaml` | 18+ truth sources with resolver types |
| `GATES.yaml` | 29 gates (25 Lab + 4 cross-repo) with route bindings |

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Registry (SSOT)                        │
│  ├── ROUTES.yaml                        │
│  ├── TRUTH_SOURCES.yaml                 │
│  └── GATES.yaml                         │
└─────────────────────────────────────────┘
                    │
                    ▼ generates
┌─────────────────────────────────────────┐
│  PTM (Projection Layer)                 │
│  └── page-truth/ptm-0.5.yaml            │
└─────────────────────────────────────────┘
                    │
                    ▼ verified by
┌─────────────────────────────────────────┐
│  Gates (Executable Verification)        │
│  └── gate:ptm (18/18 coverage)          │
└─────────────────────────────────────────┘
```

---

## Governance Rules

### 1. Registry is SSOT

All page semantics, truth sources, and gate bindings are defined in the Registry.
**PTM is a projection — do NOT edit PTM manually.**

### 2. Change Flow (SOP)

Any change to routes, truth sources, or gates MUST follow this flow:

1. Edit Registry file (`ROUTES.yaml`, `TRUTH_SOURCES.yaml`, or `GATES.yaml`)
2. Regenerate PTM (or update `ptm-0.5.yaml` to match)
3. Run `npm run gate:ptm` — MUST PASS
4. Commit with governance review

### 3. New Gate Location Policy

> [!CAUTION]
> **Effective v0.6**: New gates MUST go to `scripts/gates/` or `lib/runtime-checks/`.
> 
> Adding new files to `lib/gates/` is **PROHIBITED**.
> 
> `lib/gates/` is a compatibility layer only and will be removed in v0.7.

### 4. Route Coverage Requirement

PTM coverage MUST remain **18/18 (100%)**.
Any new route MUST be registered in `ROUTES.yaml` before UI implementation.

---

## External Verification

Third parties can verify this Registry by:

1. **Loading YAML files** — all files are machine-readable
2. **Running gates** — `npm run gate:ptm`, `gate:registry`, `gate:runset-consistency`
3. **Checking audit output** — `artifacts/truth-source-inventory.json`

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `governance/page-truth/ptm-0.5.yaml` | Projection layer |
| `governance/runsets.yaml` | Data asset SSOT |
| `governance/REPO_SHAPE.md` | Directory constitution |
| `governance/VLAB-DGB-01.md` | Development governance |

---

**Document Version**: 0.7.2  
**Last Updated**: 2026-01-23
