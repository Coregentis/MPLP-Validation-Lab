---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-043"
---

# Canonical Hosts v0.1

**Document Version**: 1.0  
**Effective Date**: 2026-01-10  
**Sprint**: Cross-Vendor Evidence Spine v0.1

---

## Purpose

This document establishes the single source of truth (SSOT) for canonical hosts in MPLP Validation Lab.

All non-canonical hosts MUST enforce `noindex, nofollow` via GATE-09.

---

## Canonical Hosts (FROZEN for v0.1)

| Host | Environment | Status |
|:---|:---|:---:|
| `lab.mplp.io` | Production | ✅ Canonical |
| `localhost` | Development | ✅ Canonical (dev only) |

---

## Non-Canonical Hosts

All other hosts, including but not limited to:
- Preview domains (Vercel, Cloudflare Tunnel)
- Staging environments
- Custom domains

**MUST** return:
- HTTP Header: `X-Robots-Tag: noindex, nofollow`
- OR Page-level: `<meta name="robots" content="noindex, nofollow">`

---

## Enforcement

**GATE-09**: Canonical Host Enforcement (`lib/gates/gate-09-canonical-host.ts`)

**Configuration Source**: `lib/config/canonical-hosts.ts`

---

## Change Policy

Changes to this list require:
1. Governance review
2. Version bump (v0.1 → v0.2)
3. Impact assessment on SEO/GEO indexing

---

**Authority**: MPLP Validation Lab Governance  
**Status**: FROZEN for Sprint v0.1
