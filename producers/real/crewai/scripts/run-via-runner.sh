#!/bin/bash
# CrewAI Producer - Runner Wrapper
# 
# Executes the CrewAI producer inside a sealed Python container environment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PRODUCER_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RUNNER_LIB="$REPO_ROOT/runners/_lib"

# Parse arguments
RUN_ID="crewai-d1-real-runner-001"
while [[ $# -gt 0 ]]; do
  case $1 in
    --run-id)
      RUN_ID="$2"
      shift 2
      ;;
    --run-id=*)
      RUN_ID="${1#--run-id=}"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

PACK_DIR="$REPO_ROOT/data/runs/v2/real/crewai/$RUN_ID"

echo "🔨 CrewAI Producer via Runner"
echo "   Runner: python"
echo "   Run ID: $RUN_ID"
echo "   Pack dir: $PACK_DIR"

# 1. Generate/Verify Lockfile (Host-side for manifest prep)
echo "📦 Managing dependencies (uv lock via container)..."
docker run --rm \
  -v "$REPO_ROOT:/workspace" \
  -w "/workspace/producers/crewai" \
  mplp-runner:python-3.11 \
  uv lock --quiet

LOCK_FILE="$PRODUCER_ROOT/uv.lock"
# Use absolute path for sha256sum to be safe
LOCK_SHA=$(sha256sum "$LOCK_FILE" | cut -d' ' -f1)
echo "   Lock SHA256: $LOCK_SHA"

# 2. Execute via runner
# The command installs dependencies and runs the producer via 'uv run'
"$RUNNER_LIB/run-in-container.sh" \
  --runner python \
  --cmd "cd producers/crewai && uv sync --quiet && export RUN_ID=$RUN_ID && export OUT_DIR=/workspace/out && uv run python src/produce-real.py" \
  --out-dir "$PACK_DIR"

# 3. Post-Seal Correction (Patching the lock_sha256 into manifest)
# run-in-container.sh already patches image_digest, but we need to patch the lock_sha we computed.
echo "📋 Patching manifest with lock_sha256..."
TMP_MANIFEST=$(mktemp)
jq --arg lock_sha "$LOCK_SHA" '.lock_ref.lock_sha256 = $lock_sha' "$PACK_DIR/manifest.json" > "$TMP_MANIFEST"
mv "$TMP_MANIFEST" "$PACK_DIR/manifest.json"

# Re-run canonical hash and integrity check since we modified manifest
# Actually, run-in-container.sh does this, but we modified it AFTER it finished.
# Best practice: Patch the manifest file BEFORE run-in-container.sh finishes? 
# No, run-in-container.sh is generic. 
# Better: We calculate the final canonical hash at the very end.
echo "🔄 Refreshing sealing artifacts..."
npx tsx "$REPO_ROOT/canonicalization/canonicalize.ts" "$PACK_DIR" > /tmp/can_hash
CANONICAL_HASH=$(cat /tmp/can_hash)
jq --arg can_hash "$CANONICAL_HASH" '.hashes.canonical_pack_root_hash = $can_hash' "$PACK_DIR/manifest.json" > "$TMP_MANIFEST"
mv "$TMP_MANIFEST" "$PACK_DIR/manifest.json"

cd "$PACK_DIR"
find . -type f ! -path "./integrity/*" -print0 | xargs -0 sha256sum | sed 's| \./| |' > integrity/sha256sums.txt

echo ""
echo "✅ CrewAI Runner execution complete"
echo "   Canonical Hash: $CANONICAL_HASH"
echo ""
