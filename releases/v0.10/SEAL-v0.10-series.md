# SEAL — v0.10 Series Release Baseline

> **Version**: v0.10.2  
> **Seal Date**: 2026-01-24  
> **Status**: SEALED

---

## 1. Executive Summary

The v0.10 series establishes the **Cross-Verified Evidence Baseline** for the MPLP Validation Lab. It enables machine-readable, reproducible, and explainable cross-substrate evidence comparison without endorsing or certifying any framework.

### Three-Layer Capability Stack

| Layer | Capability | Key Artifacts |
|:---|:---|:---|
| **L1: Identity** | Substrate fingerprinting + Field mapping | `fingerprint.yaml`, `fieldmap/*.yaml` |
| **L2: Normalization** | Canonical projection + Deterministic hashing | `normalized_evidence.json`, `normalized_hash.txt` |
| **L3: Equivalence** | Pairwise comparison + Explainable diffs | `v0.10.2-report.json`, `diffs/**/*.json` |

---

## 2. MUST Objective Evidence

| Objective | Deliverable | Evidence |
|:---|:---|:---|
| **MUST-1** | Cross-substrate same-measure samples | 24 runs across 7 scenario families |
| **MUST-2** | Dispute-level FAIL benchmarks | 12 FAIL samples with evidence closure |
| **MUST-3** | Explainable diff reports | 33 diff files with enumerated codes |

### Evidence Pointers
- Report: `public/_data/cross-verified/v0.10.2-report.json`
- Diffs: `public/_data/cross-verified/diffs/`
- Normalized: `data/derived/normalized/`

---

## 3. Toolchain Fingerprint (RR-02)

| Component | Value |
|:---|:---|
| Node.js | v25.2.1 (tested range: >=20) |
| package-lock.json | `ffef849740b000212493b9020e70ba81...` |
| normalization-spec.yaml | `5b3546c7bba986948c9fe711a37d3532...` |
| hash-scope.yaml | `7d4591693d6554d021726150e55cf5bb...` |
| equivalence-criteria.yaml | `10465de9cf369f44f11c47987961a418...` |
| normalize-pack.ts | `9f8b01bcc8e1d4684223c84617d12f0d...` |
| compute-equivalence.ts | `da731ffd28df74f482a0617cfa08cea3...` |

---

## 4. Reproduction Command (RR-01)

```bash
npm run derive:cross-verified
```

This single command:
1. Clears `data/derived/normalized/` and `public/_data/cross-verified/`
2. Normalizes the sample set (24 packs)
3. Computes pairwise equivalence
4. Runs GATE-11/12/13 verification

---

## 5. Gate Verification Results

```text
🟢 VLAB-GATE-08: Substrate Alignment — PASS
🟢 VLAB-GATE-09: Fieldmap Coverage — PASS (11/11 elements)
🟢 VLAB-GATE-10: FMM SSOT Derivation — PASS
🟢 VLAB-GATE-11: Normalized Determinism — PASS (24/24)
🟢 VLAB-GATE-12: Diff Coverage — PASS (33/33)
🟢 VLAB-GATE-13: FAIL Benchmark Closure — PASS (12/12)
```

---

## 6. Non-Endorsement Boundary

> [!IMPORTANT]
> **This release does not constitute:**
> - Framework certification or compliance verification
> - Capability endorsement or recommendation
> - Interoperability guarantee or compatibility claim
>
> Equivalence refers to **evidence projection similarity** under the specified ruleset and hash scope, not framework quality or fitness for purpose.

---

## 7. Future Change Rules

Any modification to the following requires version bump and re-seal:

| Asset | Change Policy |
|:---|:---|
| `normalization-spec.yaml` | Bump version, regenerate all normalized packs |
| `hash-scope.yaml` | Bump version, invalidate all existing hashes |
| `equivalence-criteria.yaml` | Bump version, regenerate all diffs |
| `core-evidence-elements.yaml` | Bump version, update all fieldmaps |

Changes must produce a diff report comparing old vs new outputs.

---

## 8. Signatories

- **Prepared By**: Validation Lab Automation
- **Seal Date**: 2026-01-24T09:14:48+08:00
- **Baseline Commit**: `4708f25`

---

*This document is the authoritative reference for the v0.10 series baseline. External citations should reference this SEAL document.*
