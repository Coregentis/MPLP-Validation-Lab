#!/usr/bin/env bash
# Smoke test for dotnet-8 runner

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER_ID="dotnet-8"
TEST_OUT_DIR="/tmp/mplp-runner-smoke-$RUNNER_ID-$$"

echo "=== Dotnet-8 Runner Smoke Test ==="

# Build image
echo "Building image..."
docker build -t "mplp-runner:$RUNNER_ID" "$SCRIPT_DIR"

# Create test output directory
mkdir -p "$TEST_OUT_DIR/reports"

# Run smoke command
echo "Running smoke command..."
"$SCRIPT_DIR/../_lib/run-in-container.sh" \
  --runner "$RUNNER_ID" \
  --cmd "dotnet --version && echo 'smoke-test-pass' > out/smoke.txt" \
  --out-dir "$TEST_OUT_DIR"

# Validate outputs
if [[ ! -f "$TEST_OUT_DIR/reports/runner.meta.json" ]]; then
  echo "❌ FAIL: runner.meta.json not found"
  exit 1
fi

if [[ ! -f "$TEST_OUT_DIR/smoke.txt" ]]; then
  echo "❌ FAIL: smoke.txt not found"
  exit 1
fi

CONTAINER_DIGEST=$(jq -r '.container_digest' "$TEST_OUT_DIR/reports/runner.meta.json")
if [[ "$CONTAINER_DIGEST" == "unknown" ]] || [[ -z "$CONTAINER_DIGEST" ]]; then
  echo "❌ FAIL: Invalid container_digest"
  exit 1
fi

echo "✅ PASS: Dotnet-8 runner smoke test"
echo "   Container digest: $CONTAINER_DIGEST"

# Cleanup
rm -rf "$TEST_OUT_DIR"
