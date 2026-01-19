# OPS-RUNBOOK-KEYCUTOVER-01
# Validation Lab Production Key Cutover

**Status**: PENDING  
**Created**: 2026-01-19  
**Scope**: Coregentis/MPLP-Validation-Lab only

---

## 0. Hard Boundaries (Non-Negotiable)

| ALLOWED | NOT ALLOWED |
|---------|-------------|
| Validation Lab sub-repo CI holds prod private key | MPLP main repo holds any Validation Lab private key |
| Offline terminal key generation | Private key via chat/email/ticket |
| GitHub Secrets input box paste only | Private key in repo/logs/screenshots |

**Grace Key Expiry**: After 2026-02-18, `vlab-v0.5-test-001` status MUST change from `grace` → `retired` (or `revoked`), and `key_policy.accepted_statuses` updated to `["active"]` only.

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

## 2. Inject Secret (GitHub Only)

| Setting | Value |
|---------|-------|
| **Repo** | `Coregentis/MPLP-Validation-Lab` |
| **Secret Name** | `VLAB_SIGNING_KEY_ED25519_PROD` |
| **Value** | Private key base64 (no comments) |

**Format Constraint**: Value MUST be single-line base64 (no newlines, no quotes, no leading/trailing whitespace).

---

## 3. Trigger CI Verification

```bash
git commit --allow-empty -m "ops: trigger keycutover verification"
git push
```

**Required PASS**:
- [ ] `gate:proof-signature` → 26/26
- [ ] `gate:secret-hygiene` → 0 violations
- [ ] `gate:key-policy` → PASS

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

- [ ] Offline key generated
- [ ] GitHub Secret injected
- [ ] CI `gate:proof-signature` PASS
- [ ] Temp files/clipboard cleared
- [ ] Create event record: `governance/ops/ops-events/KEYCUTOVER-YYYY-MM-DD.md` with: commit SHA, CI run URL, passed gates (NO private key material)
- [ ] This runbook marked COMPLETE
