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

## 5. Gate Verification Results (Hardened Suite)

```text
🟢 VLAB-GATE-08: Substrate Alignment — PASS
🟢 VLAB-GATE-09: Fieldmap Coverage — PASS (11/11 elements)
🟢 VLAB-GATE-10: FMM SSOT Derivation — PASS
🟢 VLAB-GATE-11: Normalized Determinism — PASS (24/24)
🟢 VLAB-GATE-12: Diff Coverage — PASS (33/33)
🟢 VLAB-GATE-13: FAIL Benchmark Closure — PASS (12/12 in-scope benchmarks)
🟢 VLAB-GATE-21: IA Discovery Depth — PASS
🟢 VLAB-GATE-24: Footer Budget Alignment — PASS
🟢 VLAB-GATE-25: Protocol Anchor SSOT — PASS
🟢 VLAB-GATE-30: FAIL Benchmark Disclosure (MUST-2) — PASS
🟢 VLAB-GATE-31: Cross-Verified Diff Integrity — PASS
🟢 VLAB-GATE-32: Ruleset Diff Interpretability (MUST-3) — PASS
```

---

## 6. Visibility & Hardening (P4.1/P5)

The v0.10.2 series adds a primary **Validation Hub** (`/validation`) and **Evidence Gallery** (`/validation/samples`) to ensure that L3 Equivalence data is interpretable by non-experts.

### Interpretability Narrative (Transition Phase)
> [!NOTE]
> Observed low equivalence rates (e.g., in `d1-outcome`) are an expected outcome of the current structural normalization migration. 
> These results reflect the **different levels of framework-native event capture** across substrates (Autogen, LangGraph, SK) and the ongoing convergence of the Field Mapping Matrix (FMM).
> 
> **Low equivalence DOES NOT indicate framework failure; it indicates projection variance.** As rulesets evolve in v0.11, normalization weights will align to increase semantic convergence.

---

## 7. Toolchain & Asset Hashes (Release-Grade)

To ensure absolute reproducibility, this baseline locks the primary report and mapping artifacts:

| Asset | SHA256 Hash |
|:---|:---|
| **Cross-Verified Report** | `b65996d81c3b774a32c9c4b4797914ceb248046a45bba24176fc61da188346b5` |
| **Sample Set Manifest** | `98c1fb4ae6bdc96b0e6146740172cce516c692f342a4ffca597d933100b87b54` |
| **Normalization Spec** | `5b3546c7bba986948c9fe711a37d3532f86b9b...` |

---

## 8. Non-Endorsement Boundary

> [!IMPORTANT]
> **This release does not constitute:**
> - Framework certification or compliance verification
> - Capability endorsement or recommendation
> - Interoperability guarantee or compatibility claim
>
> Equivalence refers to **evidence projection similarity** under the specified ruleset and hash scope, not framework quality or fitness for purpose.

---

## 9. Future Change Rules

Any modification to the following requires version bump and re-seal:

| Asset | Change Policy |
|:---|:---|
| `normalization-spec.yaml` | Bump version, regenerate all normalized packs |
| `hash-scope.yaml` | Bump version, invalidate all existing hashes |
| `equivalence-criteria.yaml` | Bump version, regenerate all diffs |
| `core-evidence-elements.yaml` | Bump version, update all fieldmaps |

Changes must produce a diff report comparing old vs new outputs.

---

---

## 9. Replication & Verification (RR-01)

### CI Reproduction Control
> [!IMPORTANT]
> `BASELINE_TIMESTAMP` is a reproduction control for CI audit; it is excluded from hash scope. Use the timestamp `2026-01-24T15:56:02.140Z` to regenerate bit-identical reports.

```bash
BASELINE_TIMESTAMP="2026-01-24T15:56:02.140Z" npm run derive:cross-verified
```

---

## 10. Signatories

- **Prepared By**: Validation Lab Automation (Antigravity P5 Actualization)
- **Seal Date**: 2026-01-24T23:55:00+08:00
- **Baseline Commit**: `v0.10.2-sealed`
- **Baseline Commit SHA**: `4708f2597b83ec5510b65a443a992634f19b2520`

---

*This document is the authoritative reference for the v0.10 series baseline. External citations should reference this SEAL document.*
