# MPLP Validation Lab V2 - Post-Deploy Audit Template

**Release Candidate**: `{{BUILD_ID}}`  
**Deployment URL**: `https://lab.mplp.io`  
**Audit Date**: `{{DATE}}`  

---

## 1. Release Identity & SSOT
Verification of the release's binary and manifest integrity.

- [ ] **Git Anchor**: Verified tag `lab-v2-rc-{{TIMESTAMP}}` matches commit `{{GIT_COMMIT}}`.
- [ ] **Inventory Count**: Verified exact match across `v2-rc.json`, `v2-seal.md`, and `/runs`.
  - Expected: `{{REAL_COUNT}} REAL, {{SYNTHETIC_COUNT}} SYNTHETIC`.
- [ ] **Ruleset Version**: Verified `Ruleset v2.0.0` is active and `Evolution Diffpacks` are available.

---

## 2. Production Hygiene (Canary Test)
Ensuring zero-drift between lab standards and production deployment.

- [ ] **Canonical Lock**: Verified `<link rel="canonical">` points to `lab.mplp.io`.
- [ ] **Robots/Sitemap**: Verified `robots.txt` is publicly accessible and correct.
- [ ] **Leak Check**: Verified no `vercel.app` or `localhost` strings in production HTML/JS.

---

## 3. Evidence Pointer De-reference (Sampling)
Testing the de-resolution of `mplp://` pointers.

| Sample Run ID | Pointer | Resolved Value (Abstract) | Status |
| :--- | :--- | :--- | :--- |
| `{{RUN_ID_1}}` | `mplp://manifest/env_ref/image_digest` | `sha256:...` | [ ] |
| `{{RUN_ID_1}}` | `mplp://artifact/trace.json#/verdict` | `PASS` | [ ] |
| `{{RUN_ID_2}}` | `mplp://timeline/events.ndjson` | `List of NDJSON events` | [ ] |

---

## 4. Maintenance Freeze Declaration
- [ ] No further un-versioned changes allowed to this `build_id`.
- [ ] Any addition of REAL runs requires a new RC Manifest.
- [ ] UI logic is strictly `projection-only`.

---
**Verdict**: **{{VERDICT}}**
