---
entry_surface: validation_lab
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-GOV-010"
---

# REL-LAB-0.5-WEBSITE-LINK-SEO-IA — Website Link Integrity & SEO Information Architecture Seal

> **Document ID**: REL-LAB-0.5-WEBSITE-LINK-SEO-IA  
> **Frozen At**: 2026-01-20  
> **Status**: SEALED  
> **Commits**: 430c5d2 → 1751826 (9 commits)

---

## 1. Indexing Policy Matrix

Reference: [REL-LAB-0.5-SEO-INDEXING.md](./REL-LAB-0.5-SEO-INDEXING.md)

| Category | Count | Description |
|----------|-------|-------------|
| **Indexable** | 10 | /, /about, /adjudication, /coverage, /coverage/adjudication, /rulesets, /guarantees, /policies/* |
| **Noindex** | 6 | /runs, /runs/[id], /runs/[id]/replay, /runs/[id]/evidence, /rulesets/[version], /adjudication/[id] |
| **Disallowed** | 4 | /api, /builder, /statement, /examples |

---

## 2. Navigation Map Summary

Reference: [NAVIGATION_MAP.yaml](../NAVIGATION_MAP.yaml)

### Navbar (7 + 3)
| Internal | External |
|----------|----------|
| Home, About, Adjudication, Coverage, Rulesets, Guarantees, Contract | Protocol ↗, Docs ↗, GitHub ↗ |

### Footer (3 Columns)
| Governance (6) | Evidence (4) | Community (3) |
|----------------|--------------|---------------|
| About, Guarantees, Rulesets, Contract, Substrate Scope, Intake | Adjudication, Adj Coverage, Test Coverage, Runs | GitHub ↗, Protocol ↗, Docs ↗ |

---

## 3. Link Closure Checklist

### LC-1: Home → Evidence Closure ✅
| From | To | Status |
|------|----|--------|
| Home | /runs | ✅ Resource Cards |
| Home | /adjudication | ✅ Resource Cards |
| Home | /policies/contract | ✅ Governance Cards |

### LC-2: Coverage Dual-Entry Closure ✅
| From | To | Status |
|------|----|--------|
| /coverage | /coverage/adjudication | ✅ Nav Card |
| /coverage | /adjudication | ✅ Nav Card |
| /coverage/adjudication | /coverage | ✅ Footer |
| /coverage/adjudication | /policies/substrate-scope | ✅ Header Link |

### LC-3: Ruleset Explanation Closure ✅
| From | To | Status |
|------|----|--------|
| /rulesets/[version] | /policies/contract | ✅ Manifest Section |
| /rulesets/[version] | /guarantees | ✅ LG Mapping Section |
| /rulesets | /adjudication | ✅ Implied via Nav |

### LC-4: Policy Actionable Closure ✅
| From | To | Status |
|------|----|--------|
| /policies/intake | /runs | ✅ Status Links |
| /policies/intake | /adjudication | ✅ Status Links |
| /policies/substrate-scope | /policies/intake | ✅ Footer Link |

### LC-5: Boundary Statement Closure ✅
| Requirement | Status |
|-------------|--------|
| Every core page can reach /about in ≤1 step | ✅ Footer Governance |
| Footer contains "Non-Certification" microcopy | ✅ Bottom Bar |

---

## 4. Gate Implementation Status

| Gate | Description | Status | Script |
|------|-------------|--------|--------|
| **R4** | Internal Link Integrity | 🟡 Pending | `scripts/ci/link-integrity-gate.mjs` |
| **R5** | SEO Surface Verification | 🟡 Pending | `scripts/ci/seo-surface-gate.mjs` |
| **R6** | Semantic Boundary Check | ⚪ Deferred | weak-mode only |

### R4 Acceptance Criteria
- [ ] All NAVIGATION_MAP internal links resolve to existing routes
- [ ] No disallowed paths (/api, /builder, /statement, /examples) in nav/footer
- [ ] All external links have `rel="noopener noreferrer"`

### R5 Acceptance Criteria
- [ ] sitemap.xml contains exactly 11 indexable URLs
- [ ] Each sitemap URL returns HTTP 200
- [ ] Each sitemap URL has `<meta name="robots" content="index,follow">`
- [ ] /runs has `<meta name="robots" content="noindex">`
- [ ] robots.txt disallow list matches policy

### R6 Weak-Mode Criteria (Deferred)
- [ ] No page contains: certification, certified, badge, ranking, endorsed, compliant
- [ ] No page suggests: "upload code", "we run your", "hosted execution"

---

## 5. Canonical Domain Policy

| Environment | Canonical Host |
|-------------|----------------|
| Production | `https://lab.mplp.io` |
| Development | localhost (no canonical) |
| Tunnel | Must not populate sitemap/robots |

---

## 6. Verification Artifacts

| Artifact | Path |
|----------|------|
| Ruleset 1.0 Test | `/Users/jasonwang/.gemini/.../ruleset_page_test_*.webp` |
| Ruleset 1.1 Test | `/Users/jasonwang/.gemini/.../ruleset_11_verify_*.webp` |

---

## Approval

- **Prepared By**: AI Assistant (2026-01-20)
- **Reviewed By**: _Pending_
- **Sealed At**: _Pending final push_
