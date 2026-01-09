# VLAB-GATE-00: Upstream Pin Verification

**Gate ID**: VLAB-GATE-00  
**Status**: ACTIVE  
**Effective Date**: 2026-01-09  
**Governed By**: VLAB-DGB-01

---

## Purpose

Ensures that Validation Lab's truth sources (schemas, invariants) are pinned to a specific upstream MPLP-Protocol commit, preventing dual truth source drift.

---

## Trigger

This gate MUST run on:
- Every PR that modifies `lib/schemas/**` or `lib/invariants/**`
- Every PR that modifies `UPSTREAM_BASELINE.yaml`
- Every release build

---

## Checks

### Check 1: Baseline File Exists

| Condition | Pass | Fail |
|:---|:---|:---|
| `UPSTREAM_BASELINE.yaml` exists | ✅ PASS | 🔴 FAIL: Block merge |

### Check 2: Commit SHA Valid

| Condition | Pass | Fail |
|:---|:---|:---|
| `upstream.commit` is valid 40-char SHA | ✅ PASS | 🔴 FAIL: Block merge |
| Commit exists in upstream repo | ✅ PASS | 🔴 FAIL: Block merge |

### Check 3: Sync Report Exists

| Condition | Pass | Fail |
|:---|:---|:---|
| `SYNC_REPORT.json` exists | ✅ PASS | 🔴 FAIL: Block merge |
| Report references same commit as baseline | ✅ PASS | 🔴 FAIL: Block merge |

### Check 4: File Hash Verification

For each file in `SYNC_REPORT.json`:

| Condition | Pass | Fail |
|:---|:---|:---|
| File exists at declared path | ✅ PASS | 🔴 FAIL: Block merge |
| Computed SHA-256 matches declared hash | ✅ PASS | 🔴 FAIL: Block merge |

---

## Implementation

```bash
#!/bin/bash
# scripts/verify-upstream-pin.sh

set -e

# Check baseline exists
if [ ! -f "UPSTREAM_BASELINE.yaml" ]; then
  echo "❌ GATE-00 FAIL: UPSTREAM_BASELINE.yaml not found"
  exit 1
fi

# Check sync report exists
if [ ! -f "SYNC_REPORT.json" ]; then
  echo "❌ GATE-00 FAIL: SYNC_REPORT.json not found"
  exit 1
fi

# Verify hashes match
node scripts/verify-sync-hashes.js

echo "✅ GATE-00 PASS: Upstream pin verified"
```

---

## Failure Response

If this gate fails:
1. PR cannot be merged
2. Developer must run `pnpm sync:schemas` and `pnpm sync:invariants`
3. Re-commit with updated `SYNC_REPORT.json`

---

## Audit Evidence

Gate produces:
- `GATE-00-RESULT.json` with pass/fail and file list
- Stored in CI artifacts

---

**Document Status**: Gate Definition  
**Version**: 1.0.0
