---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-007"
---

# SEO Indexing Policy — v0.5 Seal

> **Document ID**: REL-LAB-0.5-SEO-INDEXING  
> **Frozen At**: 2026-01-20  
> **Commit**: ae84e11

---

## Indexing Policy Matrix

| Page | robots.ts | Page Meta | Sitemap | Status |
|------|-----------|-----------|---------|--------|
| `/` | allow | index:true | ✓ | ✅ Indexable |
| `/about` | allow | index:true | ✓ | ✅ Indexable |
| `/adjudication` | allow | index:true | ✓ | ✅ Indexable |
| `/coverage` | allow | index:true | ✓ | ✅ Indexable |
| `/coverage/adjudication` | allow | index:true | ✓ | ✅ Indexable |
| `/rulesets` | allow | index:true | ✓ | ✅ Indexable |
| `/guarantees` | allow | index:true | ✓ | ✅ Indexable |
| `/policies/contract` | allow | index:true | ✓ | ✅ Indexable |
| `/policies/intake` | allow | index:true | ✓ | ✅ Indexable |
| `/policies/substrate-scope` | allow | index:true | ✓ | ✅ Indexable |
| `/runs` | allow | index:false | ✗ | ⚪ Accessible, Not Indexed |
| `/runs/[run_id]` | allow | index:false | ✗ | ⚪ Accessible, Not Indexed |
| `/builder` | disallow | index:false | ✗ | 🔒 Internal |
| `/statement` | disallow | — | ✗ | 🔒 Internal |
| `/api/*` | disallow | — | ✗ | 🔒 Technical |

---

## Policy Rationale

### Indexable Pages (Explanation & Governance)
These pages form the **public semantic entry points**:
- Enable discovery by search engines and AI crawlers
- Provide understanding of Lab scope, boundaries, and evidence structure
- Support the "Evidence-Based Verdicts" narrative

### Accessible but Not Indexed (Data Lists)
These pages are **accessible for verification** but not indexed:
- Curated runs list may contain many entries
- Prevents noise in search results
- Users can still deep-link to specific runs

### Disallowed Routes (Internal/Technical)
These routes are **completely hidden** from crawlers:
- API endpoints (technical)
- Builder tool (internal dev)
- Statement page (orphan/deprecated)

---

## CI Gate Integration

This policy should be validated by CI gates:

### R5 — SEO Surface Gate
```yaml
checks:
  - robots.txt returns expected content
  - sitemap.xml contains exactly 11 URLs
  - Each sitemap URL returns 200
  - Each sitemap URL has meta robots index:true
  - /runs has meta robots index:false
  - Disallowed paths not in sitemap
```

### Fail Conditions
- Sitemap contains noindex page
- robots.ts disallows sitemap URL
- Page meta conflicts with policy

---

## Traceability

- **sitemap.ts**: 11 pages indexed
- **robots.ts**: allow public, disallow internal
- **Page metadata**: Aligned per matrix above
- **NAVIGATION_MAP.yaml**: Machine-readable link SSOT
