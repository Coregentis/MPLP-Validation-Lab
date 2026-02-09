# Path Seal: Self-Audit Path 01

**Status**: SEALED  
**Date**: 2026-02-03T10:40:15Z  
**Commit**: `8ab2dd8a601041186d4b80b237127bebfdfa375d`

---

## 1. Scope

**Path Definition**: Run → Ruleset → Release Seal

| Step | Route | Purpose |
|------|-------|---------|
| 1 | `/runs` | Entry: understand tiers, domains |
| 2 | `/rulesets/[id]` | Explanation: D1-D4 clauses |
| 3 | `/releases` | Legend: what is a seal |
| 4 | `/releases/[id]` | Terminus: verify locally |

**User Goal**: From any run, trace to ruleset domains, then to release seal, download evidence, and verify hash locally — without asking AI.

---

## 2. Evidence (TestIDs)

### /runs
- `runs-legend`
- `tier-def-reproduced`
- `domain-chip-d1`

### /rulesets/[id]
- `ruleset-domains`
- `ruleset-domain-d1`, `d2`, `d3`, `d4`
- `ruleset-domain-d1-def`, `ruleset-domain-d1-evidence`

### /releases
- `releases-legend`

### /releases/[id]
- `seal-status`
- `seal-hash`
- `seal-downloads`
- `seal-verify-steps`
- `seal-non-certification`

---

## 3. Gates

### PSC Required Sections
All testids listed above are enforced via `page-semantic-contracts.json`.

### Forbidden Patterns
```
certified, compliant, certification, endorsed, approved, guaranteed
```

### Sample Params
- `/releases/[build_id]`: `rc-20260131161432`
- `/rulesets/[ruleset_id]`: `ruleset-v2.0.1`

### Last PASS
- **Gate**: Build + PSC structural check
- **Commit**: `8ab2dd8a601041186d4b80b237127bebfdfa375d`
- **Result**: PASS (5/5 seal testids present)

---

## 4. Safety Obligations

### Non-Certification Notice
Present on:
- Global banner (all pages)
- `/releases` legend
- `/releases/[id]` seal card (`seal-non-certification`)

### Hash Disambiguation
- `seal-hash` displays: `sha256(seal.md)`
- Clarification: "fingerprints this seal record only"
- Evidence packs verified by local recheck

---

## References
- PSC: `audit/semantic/page-semantic-contracts.json`
- Release sample: `releases/unified/rc-20260131161432/`
