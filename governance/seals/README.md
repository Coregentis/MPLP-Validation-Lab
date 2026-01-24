# Seals Catalog

Seals are **non-normative governance snapshots** that formalize evidence closure and reproducibility anchors at specific points in time. A seal MUST NOT be interpreted as certification, endorsement, ranking, or approval of any framework, vendor, or substrate.

## Seal Index

| Seal ID | Release | Date | Status | Builds on | Path |
|---|---|---:|---|---|---|
| PROJECTION-SEAL.v0.7.2 | v0.7.2 | (see file) | SEALED | - | `governance/projection/PROJECTION-SEAL.v0.7.2.md` |
| CAPABILITY-SEAL.v0.8.0 | v0.8.0 | 2026-01-23 | SEALED | PROJECTION-SEAL.v0.7.2 | `governance/seals/CAPABILITY-SEAL.v0.8.0.md` |
| DIFF-ENHANCEMENT-SEAL.v0.9.0 | v0.9.0 | 2026-01-24 | SEALED | CAPABILITY-SEAL.v0.8.0 | `governance/seals/DIFF-ENHANCEMENT-SEAL.v0.9.0.md` |
| UI-FACETS-REPROPACK-SEAL.v0.9.1 | v0.9.1 | 2026-01-24 | SEALED | DIFF-ENHANCEMENT-SEAL.v0.9.0 | `governance/seals/UI-FACETS-REPROPACK-SEAL.v0.9.1.md` |

## What a Seal Does

A seal documents:

- Commit anchors (immutable references)
- SSOT hash anchors (reproducible verification)
- Gate evidence (executable verification)
- Boundaries (no-certification / non-endorsement constraints)

## What a Seal Does NOT Do

A seal does NOT:

- Certify or endorse frameworks/substrates/vendors
- Rank or score implementations
- Imply production readiness
- Provide compliance or legal approvals

## MUST-2 Mandatory Disclaimer (v0.8)

Any reference to a dispute benchmark FAIL pack MUST state: **dispute-resolution benchmark**, **NOT a blacklist**, and **evidence-pack-specific verdicts only**.
