# Projection Governance

Projection artifacts are machine-readable outputs that support discoverability and auditability. They are governed as **operational infrastructure**, not as protocol truth.

## Non-Normative Boundary

Projection governance is repository-specific. It MUST NOT be interpreted as protocol specification, certification, or endorsement.

## Key Artifacts

- Projection map (SSOT for route ↔ artifact mapping):
  - `export/projection-map.json`

## Seals

Projection stability is formalized via seals:

- `PROJECTION-SEAL.v0.7.2.md` — projection baseline (SEALED)

See the seals catalog:
- `governance/seals/README.md`

## Verification

```bash
shasum -a 256 export/projection-map.json
npm run gate:projection-map
```
