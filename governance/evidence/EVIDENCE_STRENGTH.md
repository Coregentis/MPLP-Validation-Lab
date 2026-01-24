---
entry_surface: validation_lab
doc_type: governance
status: active
authority: validation_lab_governance
mplp_protocol_version: "1.0.0"
doc_id: "VLAB-GOV-054"
---

# Evidence Strength Policy (E-A/E-B/E-S)

> **Authority**: Validation Lab Governance  
> **Non-endorsement**: This document defines evidence levels. It does not certify any producer.

---

## 1. Evidence Levels

| Level | Definition | Requirement |
|-------|------------|-------------|
| **E-A** | Basic evidence | Artifact pointer present |
| **E-B** | Verified evidence| Hash matches and content verifiable |
| **E-S** | Signed evidence | **MUST** have a valid cryptographic signature (`signed_proof_ref`) |

---

## 2. Enforcement

- v0.6 enforces `E-S` signature requirement via `gate:coverage-claim`.
- Claims lacking required proof strength will be rejected.
