# Phase 2 Seal — Validation Lab v0.5 (P2 Signed Proof)

> **Release ID**: Validation Lab v0.5  
> **Seal Date**: 2026-01-14  
> **Evidence Regime Version**: 1.0  
> **P2 Signed Proof Version**: 1  
> **Authority**: Validation Lab (Non-Normative)

---

## Overview

v0.5 introduces **P2 Signed Proof** — cryptographic signatures providing integrity and attribution for release artifacts:

- **Integrity**: Any file modification is detectable
- **Attribution**: Who sealed, when, and what was covered
- **Still Non-Certification**: Signature attests to artifact hashes, not compliance

---

## P2-1: Signed Proof (SIGN-01)

### Coverage

| Field | Value |
|-------|-------|
| Target Release | v0.4.0 |
| Target Root | `Validation_Lab/releases/v0.4/` |
| Files Covered | 16 |
| Algorithm | ed25519 |
| Key ID | mplp-validation-lab-release-key-01 |

### Target Artifacts Signed

- `MANIFEST.json`
- `phase-1-p1-state-evolution-seal.md`
- All P1-SNAP and P1-VFY gate reports
- All snapshot and verifier schemas
- All snapshot states/diffs
- All VFY-01 verifier files

### Signature Verification

```bash
# Verify signature using Node.js crypto
node -e "
const crypto = require('crypto');
const fs = require('fs');
const pubKey = crypto.createPublicKey(fs.readFileSync('public_key.txt'));
const payload = fs.readFileSync('payload.json');
const sig = Buffer.from(JSON.parse(fs.readFileSync('signature.json')).signature, 'base64');
console.log('Signature valid:', crypto.verify(null, payload, pubKey, sig));
"
```

---

## Non-Certification Boundary

> This is **NOT** a certification, endorsement, ranking, or compliance attestation.  
> The signature only attests that the signer produced the referenced artifact hashes at signing time.  
> MPLP / Validation Lab does **NOT** host execution environments and does not certify any substrate/framework.

---

## Gate Verdicts

| Gate | Verdict | Report |
|------|---------|--------|
| P2-SIGN | ✅ PASS | gates/p2-sign-gate.report.json |

---

## Schemas (Non-Normative)

| Schema | Purpose |
|--------|---------|
| `signed-proof.schema.json` | Describes signed proof package |
| `signature-envelope.schema.json` | Ed25519 signature envelope format |

---

## Compatibility

- References releases: v0.2.0, v0.3.0, v0.4.0
- Does not modify prior releases: ✅

---

## Seal Attestation

- **Sealed By**: Antigravity Agent
- **Seal Date**: 2026-01-14T01:05:00+08:00
- **manifest_sha256**: `e35eba386f13b9c44e62c90cb1959aecb4cf8b7b0db1d504fa2ce5b94b1095c2`
- **content_sha256** (lines 1-78): `5d10a1b8401d182baf65afb414b9f23aeb180763fd0d35e91cb8900892e56538`
