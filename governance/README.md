# Validation Lab Governance Index

This directory contains **bounded Lab governance material**.

It does:

- govern Lab role, contracts, gates, projections, and operational policy
- contain runtime-consumed governance/config assets used by the current Lab

It does **not**:

- define MPLP protocol semantics
- create a second protocol truth source
- override repository-backed constitutional or protocol records

## Current Repository Boundary

Within the current repository governance scope:

- `Validation_Lab` is the authoritative Lab home in this repository
- `governance/v2/` is a non-authoritative mirror residue subtree
- `Validation_Lab_V2` is an external archived engineering track, not an active
  Lab authority line

## Handling Classes

| Class | Meaning | Use Rule |
|:---|:---|:---|
| Lab governance authority | active Lab governance text constraining Lab role, contract, gate, or projection behavior | use for current Lab governance only |
| Runtime-consumed active files | machine-readable governance/config files used by current runtime or generators | use as bounded support inputs, not protocol doctrine |
| Historical evidence | seals, reports, closures, and historical release evidence | preserve; do not treat as current guidance |
| Non-authoritative residue | mirror or stale residue that can mislead future edits | do not use as active guidance |

## Current Path Map

| Path / File Family | Class | Status |
|:---|:---|:---|
| `VLAB-DGB-01.md`, `METHOD-VLAB-01_EVALUATION_METHOD.md`, `ADJUDICATION_MATURITY_MODEL.md`, `PROVENANCE_MODEL.md`, `SUBSTRATE_SCOPE_POLICY.md`, `contracts/**`, `erc/**`, `gates/**`, `sop/**`, `runbooks/**` | Lab governance authority | active |
| `LIFECYCLE_GUARANTEES.yaml`, `runsets.yaml`, `registry/**`, `ia/**`, `ux/**`, `mappings/**`, `schemas/**`, `keys/**`, `linkmap.v2.yaml`, `releases/release-index.yaml`, `truth-chain-manifest.json` | runtime-consumed active files | active |
| `seals/**`, `records/**`, `reports/**`, `audits/**`, `projection/**`, `releases/*.md`, `preflight/**`, `plans/**`, `charters/**`, `external/**`, `evolution/**`, `heartbeat/history.json` | historical evidence | retained |
| `v2/**` | non-authoritative residue | non-authoritative mirror subtree |

## Usage Rule

- if the question is about **protocol meaning**, repository doctrine prevails
- if the question is about **bounded Lab operation**, use the active Lab
  governance and runtime-consumed files listed above
- do not treat `governance/v2/` as an active authority line

## Priority References

- Active Lab home: [`../README.md`](../README.md)
- Repository governance index: [`../../governance/README.md`](../../governance/README.md)

---

**Final Boundary**: this directory governs Lab operation only. It does not
define MPLP protocol semantics.
