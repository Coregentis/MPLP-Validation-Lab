# Phase 0 Seal — Validation Lab v0.3 (P0 Evidence Regime)

> **Release ID**: Validation Lab v0.3  
> **Seal Date**: 2026-01-14  
> **Evidence Regime Version**: 1.0  
> **Authority**: Validation Lab (Non-Normative)

---

## Overview

v0.3 introduces the **P0 Evidence Regime** — a set of artifacts and gates that upgrade Validation Lab from "having evidence" to "having an evidence regime":

- **P0-1**: Environment Fingerprint — enables third-party reproducibility verification
- **P0-2**: Repro Bundle — makes "reproducible" a verifiable claim
- **P0-3**: Failure Evidence — proves evaluator can deterministically FAIL

---

## P0-1: Environment Fingerprint

| Run ID | Platform | Arch | Python | Node |
|--------|----------|------|--------|------|
| gf-01-langchain-official-v0.2 | darwin | arm64 | 3.9.6 | - |
| gf-01-a2a-official-v0.2 | darwin | arm64 | 3.9.6 | - |
| gf-01-mcp-official-v0.2 | darwin | arm64 | - | v25.2.1 |

**Schema**: `artifacts/env/env-fingerprint.schema.json`

---

## P0-2: Repro Bundle

| Run ID | Entry Script | Constraint |
|--------|--------------|------------|
| gf-01-langchain-official-v0.2 | `gf-01-langchain-official-v0.2.repro.sh` | no_absolute_paths=true |
| gf-01-a2a-official-v0.2 | `gf-01-a2a-official-v0.2.repro.sh` | no_absolute_paths=true |
| gf-01-mcp-official-v0.2 | `gf-01-mcp-official-v0.2.repro.sh` | no_absolute_paths=true |

**Schema**: `artifacts/repro/repro-bundle.schema.json`

---

## P0-3: Failure Evidence (NEG-01)

**Pack**: `artifacts/negative/NEG-01/pack`  
**Missing Artifact**: `artifacts/trace.json`  
**Expected Verdict**: FAIL

**Evaluator Output**:
```json
{
  "report_version": "1",
  "verdict": "FAIL",
  "failed_checks": [
    {
      "check": "file_exists:artifacts/trace.json",
      "invariant_id": "INV-PACK-002",
      "message": "Trace artifact required",
      "severity": "error"
    }
  ]
}
```

---

## Gate Verdicts

| Gate | Verdict | Report |
|------|---------|--------|
| P0-ENV | ✅ PASS | gates/p0-env-gate.report.json |
| P0-REPRO | ✅ PASS | gates/p0-repro-gate.report.json |
| P0-NEGATIVE | ✅ PASS | gates/p0-negative-gate.report.json |

---

## Authority & Normativity

> **These schemas and artifacts are Non-Normative.**  
> They belong to Validation Lab's evidence regime, not MPLP Protocol specification.  
> They do not constitute certification, endorsement, or protocol requirements.

---

## Compatibility with v0.2

- v0.2 tag (`validation-lab/v0.2.0`) remains frozen
- v0.3 artifacts reference v0.2 runs but do not modify them
- Evaluator changes are backward-compatible (`report_version`)

---

## Seal Attestation

- **Sealed By**: Antigravity Agent
- **Seal Date**: 2026-01-14T00:15:00+08:00
- **manifest_sha256**: `d7679dc802114026b238482e6d6097d29e0c9a36023f4fa2a6eb57bc85ea4bff`
- **content_sha256** (lines 1-90): `9c3f76f95d0b281ed6828afe7fcea9d9008d5dae444210545a9cf108badb0e09`
