#!/usr/bin/env bash
# =============================================================================
# RESEARCH-VLAB-CAP-01 Evidence Collection Script
# 
# Purpose: Generate reproducible evidence artifacts for capability research report
# Output: artifacts/RESEARCH-VLAB-CAP-01/*.json, *.txt
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUT_DIR="$REPO_ROOT/artifacts/RESEARCH-VLAB-CAP-01"

echo "=== RESEARCH-VLAB-CAP-01 Evidence Collection ==="
echo "Repository: $REPO_ROOT"
echo "Output: $OUT_DIR"
echo ""

mkdir -p "$OUT_DIR"
cd "$REPO_ROOT"

# -----------------------------------------------------------------------------
# 0) Pin commit and timestamp
# -----------------------------------------------------------------------------
echo ">>> Pinning commit and timestamp..."
git rev-parse HEAD > "$OUT_DIR/repo_commit.txt"
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$OUT_DIR/scan_timestamp_utc.txt"
echo "Commit: $(cat $OUT_DIR/repo_commit.txt)"
echo "Timestamp: $(cat $OUT_DIR/scan_timestamp_utc.txt)"

# -----------------------------------------------------------------------------
# 1) Snapshot runsets.yaml
# -----------------------------------------------------------------------------
echo ">>> Snapshotting runsets.yaml..."
if [ -f "governance/runsets.yaml" ]; then
  cp "governance/runsets.yaml" "$OUT_DIR/runsets.yaml.snapshot"
  echo "Copied governance/runsets.yaml"
else
  echo "WARN: governance/runsets.yaml not found"
fi

# -----------------------------------------------------------------------------
# 2) Count verdict files
# -----------------------------------------------------------------------------
echo ">>> Counting verdict files..."
find data/runs -maxdepth 2 -name "verdict.json" > "$OUT_DIR/verdict_files.txt" 2>/dev/null || true
VERDICT_COUNT=$(wc -l < "$OUT_DIR/verdict_files.txt" | tr -d ' ')
echo "Verdict files: $VERDICT_COUNT"

# -----------------------------------------------------------------------------
# 3) Count FAIL runs by name pattern
# -----------------------------------------------------------------------------
echo ">>> Counting FAIL runs by name pattern..."
ls -1d data/runs/*fail* 2>/dev/null > "$OUT_DIR/fail_runs_by_name.txt" || true
FAIL_BY_NAME=$(wc -l < "$OUT_DIR/fail_runs_by_name.txt" | tr -d ' ')
echo "FAIL runs (by name): $FAIL_BY_NAME"

# -----------------------------------------------------------------------------
# 4) Count cross-substrate runs (v05-*)
# -----------------------------------------------------------------------------
echo ">>> Counting cross-substrate runs..."
ls -1d data/runs/v05-* 2>/dev/null > "$OUT_DIR/cross_substrate_runs.txt" || true
CROSS_COUNT=$(wc -l < "$OUT_DIR/cross_substrate_runs.txt" | tr -d ' ')
echo "Cross-substrate runs: $CROSS_COUNT"

# -----------------------------------------------------------------------------
# 5) Count producers
# -----------------------------------------------------------------------------
echo ">>> Counting producers..."
ls -1 producers/ 2>/dev/null | grep -v "contract" > "$OUT_DIR/producers.txt" || true
PRODUCER_COUNT=$(wc -l < "$OUT_DIR/producers.txt" | tr -d ' ')
echo "Producers: $PRODUCER_COUNT"

# -----------------------------------------------------------------------------
# 6) Count rulesets
# -----------------------------------------------------------------------------
echo ">>> Counting rulesets..."
ls -1 lib/rulesets/ 2>/dev/null | grep "^ruleset-" > "$OUT_DIR/rulesets.txt" || true
RULESET_COUNT=$(wc -l < "$OUT_DIR/rulesets.txt" | tr -d ' ')
echo "Rulesets: $RULESET_COUNT"

# -----------------------------------------------------------------------------
# 7) Count by domain tag (D1-D4)
# -----------------------------------------------------------------------------
echo ">>> Counting by domain tag..."
cat > "$OUT_DIR/domain_counts.json" << EOF
{
  "D1": $(ls -1d data/runs/*d1* 2>/dev/null | wc -l | tr -d ' '),
  "D2": $(ls -1d data/runs/*d2* 2>/dev/null | wc -l | tr -d ' '),
  "D3": $(ls -1d data/runs/*d3* 2>/dev/null | wc -l | tr -d ' '),
  "D4": $(ls -1d data/runs/*d4* 2>/dev/null | wc -l | tr -d ' ')
}
EOF
cat "$OUT_DIR/domain_counts.json"

# -----------------------------------------------------------------------------
# 8) Generate summary JSON
# -----------------------------------------------------------------------------
echo ">>> Generating summary..."
cat > "$OUT_DIR/summary.json" << EOF
{
  "repo_commit": "$(cat $OUT_DIR/repo_commit.txt)",
  "scan_timestamp_utc": "$(cat $OUT_DIR/scan_timestamp_utc.txt)",
  "counts": {
    "verdict_files": $VERDICT_COUNT,
    "fail_runs_by_name": $FAIL_BY_NAME,
    "cross_substrate_runs": $CROSS_COUNT,
    "producers": $PRODUCER_COUNT,
    "rulesets": $RULESET_COUNT
  },
  "artifacts_dir": "$OUT_DIR"
}
EOF

echo ""
echo "=== Done ==="
echo "Artifacts generated in: $OUT_DIR"
ls -la "$OUT_DIR"
