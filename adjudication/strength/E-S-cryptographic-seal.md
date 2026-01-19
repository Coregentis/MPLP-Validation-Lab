---
doc_type: reference
normativity: non-normative
authority: Validation Lab
status: active
strength_id: E-S
---

# E-S — Cryptographic Seal (Non-Repudiation Boundary)

E-S indicates an evidence snapshot is cryptographically sealed so that:
- post-seal modification is detectable,
- third parties can verify digest/signature envelopes,
- the snapshot can be used as a non-repudiation anchor.

## What E-S provides
- immutability proof boundary for a frozen snapshot
- continuity for evidence claims ("this exact snapshot was the adjudicated basis")

## What E-S does NOT provide
- stronger correctness than the underlying ruleset evaluation
- any certification/endorsement meaning

## Anchors
- P2 Signed Proof snapshot: `releases/v0.5/artifacts/signed-proof/`
- SIGN-02 over full Type-B: `releases/v0.7.3/artifacts/signed-proof/SIGN-02/`
