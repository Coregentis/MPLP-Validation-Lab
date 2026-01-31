#!/usr/bin/env bash
# Write SHA-256 checksums for evidence pack integrity
#
# Usage:
#   ./write-sha256sums.sh <pack-root-dir>

set -euo pipefail

PACK_ROOT="${1:?Pack root directory required}"

if [[ ! -d "$PACK_ROOT" ]]; then
  echo "Error: Pack root not found: $PACK_ROOT"
  exit 1
fi

OUTPUT_FILE="$PACK_ROOT/integrity/sha256sums.txt"
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Clear existing file
> "$OUTPUT_FILE"

# Hash critical files
cd "$PACK_ROOT"

# Hash order matters for determinism
FILES=(
  "manifest.json"
  "artifacts/context.json"
  "artifacts/plan.json"
  "artifacts/confirm.json"
  "artifacts/trace.json"
  "timeline/events.ndjson"
  "reports/verify.report.json"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    sha256sum "$file" >> "$OUTPUT_FILE"
  fi
done

echo "✓ SHA-256 checksums written to $OUTPUT_FILE"
