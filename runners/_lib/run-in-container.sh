#!/usr/bin/env bash
# Runner Framework — Unified Container Execution
#
# Usage:
#   ./run-in-container.sh --runner node-20 --cmd "npm run produce" --out-dir /path/to/pack
#
# Contract:
#   - Builds runner image if needed
#   - Runs container with bind-mounted OUT_DIR
#   - Writes reports/runner.meta.json with container_digest + env_fingerprint

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNERS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$RUNNERS_ROOT/.." && pwd)"

# Defaults
RUNNER=""
CMD=""
OUT_DIR=""
WORKDIR="/workspace"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --runner)
      RUNNER="$2"
      shift 2
      ;;
    --cmd)
      CMD="$2"
      shift 2
      ;;
    --out-dir)
      OUT_DIR="$2"
      shift 2
      ;;
    --workdir)
      WORKDIR="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate required args
if [[ -z "$RUNNER" ]] || [[ -z "$CMD" ]] || [[ -z "$OUT_DIR" ]]; then
  echo "Usage: $0 --runner <runner-id> --cmd <command> --out-dir <path>"
  exit 1
fi

RUNNER_DIR="$RUNNERS_ROOT/$RUNNER"
if [[ ! -d "$RUNNER_DIR" ]]; then
  echo "Error: Runner '$RUNNER' not found at $RUNNER_DIR"
  exit 1
fi

# Build image if Dockerfile exists
IMAGE_TAG="mplp-runner:$RUNNER"
if [[ -f "$RUNNER_DIR/Dockerfile" ]]; then
  echo "Building runner image: $IMAGE_TAG"
  docker build -t "$IMAGE_TAG" "$RUNNER_DIR"
fi

# Capture stable image digest
IMAGE_DIGEST=$(docker image inspect --format '{{.Id}}' "$IMAGE_TAG" 2>/dev/null || echo "unknown")

# Create output directory structure
mkdir -p "$OUT_DIR/reports"
mkdir -p "$OUT_DIR/integrity"

# Run container with fingerprinting
echo "Running container: $IMAGE_TAG"

# Run fingerprint script inside container to get true runtime environment
ENV_FINGERPRINT=$(docker run --rm \
  -v "$REPO_ROOT:$WORKDIR" \
  -v "$SCRIPT_DIR/env-fingerprint.sh:/tmp/env-fingerprint.sh" \
  "$IMAGE_TAG" \
  bash /tmp/env-fingerprint.sh --runner "$RUNNER")

# Run main command
docker run --rm \
  -v "$REPO_ROOT:$WORKDIR" \
  -v "$OUT_DIR:$WORKDIR/out" \
  -w "$WORKDIR" \
  "$IMAGE_TAG" \
  sh -c "$CMD"

# Post-Execution: Sealing the Pack
echo "Sealing evidence pack..."

EXECUTED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# Write runner metadata
cat > "$OUT_DIR/reports/runner.meta.json" <<EOF
{
  "runner_id": "$RUNNER",
  "image_digest": "$IMAGE_DIGEST",
  "image_tag": "$IMAGE_TAG",
  "environment_fingerprint": $ENV_FINGERPRINT,
  "workdir": "$WORKDIR",
  "executed_at": "$EXECUTED_AT"
}
EOF

# Patch manifest.json if it exists
MANIFEST_PATH="$OUT_DIR/manifest.json"
if [[ -f "$MANIFEST_PATH" ]]; then
  echo "Patching manifest.json with environment provenance..."
  # Use jq to update env_ref
  TMP_MANIFEST=$(mktemp)
  jq --arg image_digest "$IMAGE_DIGEST" \
     --arg runner_id "$RUNNER" \
     --arg executed_at "$EXECUTED_AT" \
     --argjson fingerprint "$ENV_FINGERPRINT" \
     '.env_ref = {
        runner_type: "container",
        runner_id: $runner_id,
        image_digest: $image_digest,
        environment_fingerprint: $fingerprint,
        executed_at: $executed_at,
        note: "Sealed by runner"
      }' "$MANIFEST_PATH" > "$TMP_MANIFEST"
  mv "$TMP_MANIFEST" "$MANIFEST_PATH"
fi

# Compute canonical hash (timestamp-independent)
echo "Computing canonical hash..."
CANONICAL_HASH=$(npx tsx "$REPO_ROOT/canonicalization/canonicalize.ts" "$OUT_DIR" 2>/dev/null || echo "unknown")

# Patch manifest with canonical hash
if [[ -f "$MANIFEST_PATH" && "$CANONICAL_HASH" != "unknown" ]]; then
  TMP_MANIFEST=$(mktemp)
  jq --arg canonical_hash "$CANONICAL_HASH" \
     '.hashes.canonical_pack_root_hash = $canonical_hash' "$MANIFEST_PATH" > "$TMP_MANIFEST"
  mv "$TMP_MANIFEST" "$MANIFEST_PATH"
  echo "✓ Canonical hash recorded: $CANONICAL_HASH"
fi

# Re-calculate integrity/sha256sums.txt (raw hashes)
echo "Re-calculating integrity hashes..."
cd "$OUT_DIR"
# List all files except manifest.json and integrity/sha256sums.txt to avoid circularity if manifest hash is separate
# Actually, standard v2: manifest.json is NOT in sha256sums, it has its own hash in verification.
# But for now, let's hash everything except the integrity file itself.
find . -type f ! -path "./integrity/*" -print0 | xargs -0 sha256sum | sed 's| \./| |' > integrity/sha256sums.txt

echo "✓ Pack sealed successfully"
echo "✓ Image digest: $IMAGE_DIGEST"
