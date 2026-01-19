# OPS-RUNBOOK-KEYCUTOVER-01
# Validation Lab Production Key Cutover

**Status**: PENDING  
**Created**: 2026-01-19  
**Scope**: Coregentis/MPLP-Validation-Lab only

> **Purpose**: This runbook validates the **Production Signing Chain**, not website deployment.  
> Vercel handles deployment; GitHub Actions handles signing and gates.

---

## 0. Hard Boundaries (Non-Negotiable)

| ALLOWED | NOT ALLOWED |
|---------|-------------|
| GitHub Actions CI holds prod private key | Vercel holds any prod private key |
| Validation Lab sub-repo CI only | MPLP main repo holds any private key |
| Offline terminal key generation | Private key via chat/email/ticket |
| GitHub Secrets input box paste only | Private key in repo/logs/screenshots |

**Vercel Constraint**: `VLAB_SIGNING_KEY_ED25519_PROD` MUST NOT exist in Vercel Environment Variables.

**Grace Key Expiry**: After 2026-02-18, `vlab-v0.5-test-001` status MUST change from `grace` → `retired`.

---

## 1. Generate Key (Offline Only)

```bash
# In Validation Lab repo, local terminal only
cd /path/to/Validation_Lab
node tools/gen-ed25519.mjs
```

**Verify output**:
- `key_id` matches `vlab-prod-2026-01b`
- `public_key_ed25519` matches `VERIFIER_IDENTITY.json`

**Immediately after**:
- Clear clipboard
- Delete temp files

---

## 2. Inject Secret (GitHub Secrets Only)

| Setting | Value |
|---------|-------|
| **Repo** | `Coregentis/MPLP-Validation-Lab` |
| **Secret Name** | `VLAB_SIGNING_KEY_ED25519_PROD` |
| **Value** | Private key base64 (no comments) |

**Format Constraint**: Value MUST be single-line base64 (no newlines, no quotes, no leading/trailing whitespace).

**NOT in Vercel**: Do NOT add this secret to Vercel Environment Variables.

---

## 3. Trigger CI Signing Verification (GitHub Actions)

> This step validates the signing chain, NOT website deployment.

```bash
git commit --allow-empty -m "ops: trigger keycutover verification"
git push
```

**Required PASS (GitHub Actions)**:
- [ ] `gate:proof-signature` → 26/26 (production mode)
- [ ] `gate:secret-hygiene` → 0 violations
- [ ] `gate:key-policy` → PASS

**Note**: Vercel deployment is separate and does NOT require production signing key.

---

## 4. Rollback (If CI Fails)

| Action | Command |
|--------|---------|
| Check key match | Compare `active_signing_key` with secret |
| Check repo scope | Verify `repo_scope` in `key_policy` |
| Rotate if needed | Generate new key, mark old as `revoked` |

**NEVER**: Extract/debug private key material

---

## 5. Completion Checklist

### Engineering Completion (CI-only)
- [ ] Offline key generated
- [ ] GitHub Secret injected (NOT in Vercel)
- [ ] CI `gate:proof-signature` PASS (production mode)
- [ ] Temp files/clipboard cleared

### Audit Record
- [ ] Create event record: `governance/ops/ops-events/KEYCUTOVER-YYYY-MM-DD.md`
- [ ] Include: commit SHA, CI run URL, passed gates (NO private key material)
- [ ] This runbook marked COMPLETE
