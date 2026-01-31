#!/usr/bin/env bash
# MCP Producer - Runner Integration Wrapper
#
# Executes MCP producer via runner to obtain container_digest
# Usage: ./run-via-runner.sh [--run-id <id>]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
RUNNER_LIB="$REPO_ROOT/runners/_lib"

# Parse arguments
RUN_ID="mcp-d1-real-runner-001"
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

PACK_DIR="$REPO_ROOT/data/runs/v2/real/mcp/$RUN_ID"

echo "🔨 MCP Producer via Runner"
echo "   Runner: node-20"
echo "   Run ID: $RUN_ID"
echo "   Pack dir: $PACK_DIR"
echo ""

# Execute via runner
"$RUNNER_LIB/run-in-container.sh" \
  --runner node-20 \
  --cmd "cd producers/mcp && npm install --silent && npm run produce-real -- --scenario=d1_basic_pass --run-id=$RUN_ID --out-dir=/workspace/out" \
  --out-dir "$PACK_DIR"

echo ""
echo "✅ Runner execution complete"
echo ""

# Verify runner metadata was created
if [[ -f "$PACK_DIR/reports/runner.meta.json" ]]; then
  echo "✅ runner.meta.json created"
  IMAGE_DIGEST=$(jq -r '.image_digest' "$PACK_DIR/reports/runner.meta.json" 2>/dev/null || echo "unknown")
  echo "   Image digest: $IMAGE_DIGEST"
else
  echo "❌ runner.meta.json NOT found"
  exit 1
fi

# Verify manifest has image_digest
if [[ -f "$PACK_DIR/manifest.json" ]]; then
  MANIFEST_DIGEST=$(jq -r '.env_ref.image_digest' "$PACK_DIR/manifest.json" 2>/dev/null || echo "null")
  if [[ "$MANIFEST_DIGEST" != "null" && "$MANIFEST_DIGEST" != "" ]]; then
    echo "✅ manifest.json env_ref.image_digest populated"
  else
    echo "⚠️  manifest.json env_ref.image_digest NOT populated"
  fi
fi

echo ""
echo "Pack location: $PACK_DIR"
