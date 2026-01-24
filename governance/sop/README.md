# SOP Directory

This directory contains **Standard Operating Procedures (SOPs)** that govern how changes are made, verified, and reported in this repository.

## Non-Normative / Non-Endorsement Boundary

SOPs are operational governance. They do NOT define MPLP protocol requirements and MUST NOT be interpreted as certification or endorsement of any framework/vendor/substrate.

## Current SOPs

- `SOP-VLAB-PROJ-SYNC-01.md` — Projection + registry synchronization workflow
  - Core concept: keep repository projections consistent and auditable (routes/artifacts/truth-sources/gates), and ensure each change is associated with a Task Completion Report.

## Enforcement

SOP compliance is enforced through gates (CI and/or local execution), including (names may vary by repo configuration):

- `gate:projection-map`
- `gate:no-ssot-duplication`
- `gate:post-task-association`

See:
- `governance/registry/GATES.yaml`
- `governance/reports/README.md` (how to file evidence)
- `governance/templates/README.md` (report templates)
