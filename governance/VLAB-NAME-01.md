# VLAB-NAME-01: Canonical Naming Policy

**Policy ID**: VLAB-NAME-01  
**Status**: GOVERNANCE-FROZEN  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

This policy defines the **canonical naming hierarchy** for MPLP Validation Lab across all surfaces (UI, documentation, citations, manifests). It ensures consistent identity while maintaining the "non-certification / non-endorsement" boundary.

---

## Naming Hierarchy

### Tier 1: Public Name (UI / Hero / Navigation)

```
MPLP Validation Lab
```

Use in: Site header, navigation, browser title, URLs, GitHub repo name

### Tier 2: Formal Definition (Hero second line / About first paragraph)

```
Evidence & Conformance Laboratory for MPLP Lifecycle Invariants (Non-certifying)
```

Use in: Hero subtitle, About page opening, any first-impression surface

### Tier 3: Citation Name (Academic / Standard references / Export manifests)

```
MPLP Evidence & Conformance Lab
```

or abbreviated:
```
MPLP Conformance Lab
```

Use in: Papers, standards references, verdict export manifests (`lab_identity.citation`)

---

## Definition of "Conformance"

> **Conformance** = evidence meets requirements of a versioned ruleset, as determined by deterministic evaluation.

This is NOT:
- Certification by a third-party body
- Regulatory compliance determination
- Endorsement or approval

---

## Forbidden Framing

The following terms/phrases are **PROHIBITED** in any Lab surface:

| Forbidden | Reason |
|:---|:---|
| certified | Implies official certification |
| accredited | Implies accreditation body |
| compliance score | Implies regulatory compliance |
| compliance certified | Conflates conformance with regulation |
| MPLP approved | Implies endorsement |
| badge / seal / stamp | Implies certification mark |
| ranking / score | Implies comparative scoring |

See also: VLAB-GATE-04 (Non-endorsement Language)

---

## Required Disclaimers

Every first-impression surface (Home, Run Detail header) MUST include:

> Not certification. Not regulatory compliance. Not hosted execution.

This may be displayed as banner, subtitle, or footer — but must be **visible without scrolling on desktop viewport**.

---

## Export Manifest Fields (Phase C)

When implementing verdict export, include:

```json
{
  "lab_identity": {
    "name": "MPLP Validation Lab",
    "formal_definition": "Evidence & Conformance Laboratory for MPLP Lifecycle Invariants (Non-certifying)",
    "citation": "MPLP Evidence & Conformance Lab",
    "version": "1.0",
    "domain": "lab.mplp.io",
    "repo": "https://github.com/Coregentis/MPLP-Validation-Lab"
  }
}
```

> Note: These are Lab metadata fields, not MPLP protocol fields.

---

## Domain Policy

### Canonical Domain

```
lab.mplp.io
```

Use as: Primary URL, canonical link, sitemap, all external references

### Redirect Domains (Optional)

The following may redirect 301 to `lab.mplp.io`:
- `validation.mplp.io`
- `validate.mplp.io`
- `val.mplp.io`

> **Note**: Only `lab.mplp.io` participates in indexing and sitemap. Redirect domains must NOT be indexed.

---

## Amendment Process

Changes to this naming policy require:
1. VLAB-DGB-01 governance review
2. Impact assessment on existing surfaces
3. Version bump

---

**Document Status**: Governance Frozen  
**Version**: 1.0.0
