# RC-6 Final Seal (PR-10)

**Build ID:** `rc-6-20260128`
**Git Tag:** `lab-v2-rc-20260128`
**Date:** 2026-01-31

## 1. Seal Integrity
This release is cryptographically sealed by the following SSOT hashes. Any deviation in these files invalidates the seal.

| SSOT Component | SHA-256 Hash |
| :--- | :--- |
| **Role Model** | `f32171e6...9f` |
| **Role Journeys** | `b19e2d23...df` |
| **Case Shelves** | `55928c18...42` |
| **Tripod Map** | `6e7667b7...8d` |
| **Component Registry** | `016e06b1...c9` |
| **Page Bindings** | `8e1a90e3...11` |

## 2. Gate Verification
**Total Gates:** 49
**Status:** ✅ ALL PASS
**Report:** [rc-6-gates-report.json](./rc-6-gates-report.json)

Includes critical new gates:
- `GATE-V2-TRIPOD-INBOUND-01`: Inbound Routing Integrity
- `GATE-V2-TRIPOD-OUTBOUND-01`: Outbound Link Integrity
- `GATE-V2-NO-HANDWRITE-COPY-01`: Zero Hardcoded Strings

## 3. Copy Tokenization Sweep
**Status:** DONE
The Pre-Seal Hardening Sweep has been completed. All functional UI components are now fully tokenized.

**Policy:**
- **Scanning Scope:** `registry.tokens` values in `component-registry-v1.yaml`.
- **Enforcement:** `GATE-V2-NO-HANDWRITE-COPY-01`.
- **Conclusion:** Key UI copy (titles, labels, empty states) is now governed by the registry. Drifts will be caught by the gate.

**Tokenized Components:**
- `ManifestViewer`: 100% Tokenized
- `ClauseList`: 100% Tokenized
- `RegMappingGrid`: 100% Tokenized
- `DisputePanel`: 100% Tokenized
- `EvidenceList`: 100% Tokenized

## 4. Tripod Map Integration
**Status:** COMPLETED
The Validation Lab now uses a strict Inbound/Outbound mapping for all cross-site navigation.

- **Inbound Routes:** 2 (Governed by `tripod-entry-map-v1.yaml`)
- **Outbound Links:** 2 (Governed by `tripod-entry-map-v1.yaml`)
- **Disclaimers:** Enforced on all transitions.

## 5. Deployment Proofs
See [rc-6-walkthrough.md](./rc-6-walkthrough.md) for the 4-Role Manual Proof Pack.
