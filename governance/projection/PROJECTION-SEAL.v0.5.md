---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-047"
---

# Projection Seal v0.5

> **Seal Date**: 2026-01-20  
> **Status**: ✅ SEALED  
> **Commit**: `58692d5`

---

## Certification

This document certifies that **Validation Lab v0.5** has achieved:

| Metric | Value |
|--------|-------|
| Projection Alignment | **18/18 PASS (100%)** |
| Truth Chain Status | **FROZEN** |
| PTM Coverage | **18/18 routes** |

---

## Key Pages — Required Assets Verified

### Index Pages

| Route | Required Asset | Status |
|-------|----------------|--------|
| `/runs` | Curated runs from `runsets.yaml` | ✅ |
| `/rulesets` | 3 rulesets with clause/guarantee counts | ✅ |
| `/coverage` | D1-D4 domains from `test-vectors/v0.5/allowlist-v0.5.yaml` | ✅ |
| `/adjudication` | Bundles from adjudication-index.json | ✅ |

### Detail Pages

| Route | Required Asset | Status |
|-------|----------------|--------|
| `/rulesets/ruleset-1.2` | 12 clauses (D1-D4 grouped) | ✅ |
| `/rulesets/ruleset-1.0` | golden_flows → LG-01~05 | ✅ |
| `/examples/evidence-producers/*` | langgraph/autogen/sk substrates | ✅ |

### Navigation & Identity

| Element | Required | Status |
|---------|----------|--------|
| Footer version | v0.5 Frozen | ✅ |
| Top nav Coverage link | Present | ✅ |
| Footer Coverage link | Present | ✅ |
| Footer Producers link | Present | ✅ |

---

## Verification Commands

All commands executed and passed:

```bash
npm run typecheck   # ✅ PASS
npm run build       # ✅ PASS
npm run gate:ptm    # ✅ PASS (3 rulesets, 6 samples)
```

---

## SSOT Sources

| Page | SSOT File |
|------|-----------|
| `/coverage` | `test-vectors/v0.5/allowlist-v0.5.yaml` |
| `/runs` | `governance/runsets.yaml` |
| `/rulesets/ruleset-1.2` | `data/rulesets/ruleset-1.2/manifest.yaml` |
| `/examples/evidence-producers/*` | `producers/*/run.mjs` |

---

## Files Modified

- `app/coverage/page.tsx`
- `app/examples/evidence-producers/[substrate]/page.tsx`
- `app/rulesets/[version]/page.tsx`
- `app/rulesets/page.tsx`
- `lib/rulesets/loadRuleset.ts`
- `components/Nav.tsx`
- `components/layout/Footer.tsx`

---

## Governance References

- `governance/TRUTH-CHAIN-FREEZE.md`
- `governance/projection/PROJECTION_REQUIREMENTS.v0.5.md`
- `governance/page-truth/ptm-0.5.yaml`

---

**Sealed by**: AI Assistant  
**Date**: 2026-01-20T00:08:00Z
