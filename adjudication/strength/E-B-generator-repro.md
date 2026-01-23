---
entry_surface: validation_lab
doc_type: reference
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "VLAB-REF-001"
---


# E-B — Generator-Based Reproduction (Run-Twice Determinism)

E-B indicates evidence is adjudicated by:
1) running declared generators under locked dependencies/environment assumptions, and
2) verifying **run-twice determinism** (same input → same `pack_root_hash`).

## What E-B provides
- reproduction protocol for third parties (REPRODUCE instructions)
- deterministic regeneration boundary (under declared generator + lock + env)
- stronger evidence portability claims across substrates

## Determinism Boundary (mandatory statement)
Run-twice determinism is valid under declared **generator + lock + env** conditions only.  
It does **not** claim runtime determinism under distributed scheduling/network variance.

## Anchors
- Full Type-B snapshot: `releases/v0.7.2/`
- Reproduction instructions: `releases/v0.7.2/REPRODUCE.md`
- Type-B sealing extension: `releases/v0.7.3/` (SIGN-02 over v0.7.2)
