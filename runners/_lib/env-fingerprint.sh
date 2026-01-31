#!/usr/bin/env bash
# Environment Fingerprinting
#
# Generates stable environment fingerprint for runner metadata
# Output: JSON object with os/arch/runtime versions

set -euo pipefail

RUNNER=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --runner)
      RUNNER="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Get runtime version based on runner type
RUNTIME_VERSION="unknown"

case "$RUNNER" in
  node-*)
    if command -v node &> /dev/null; then
      RUNTIME_VERSION=$(node --version | sed 's/^v//')
    fi
    RUNTIME_TYPE="node"
    ;;
  python-*)
    if command -v python3 &> /dev/null; then
      RUNTIME_VERSION=$(python3 --version | awk '{print $2}')
    fi
    RUNTIME_TYPE="python"
    ;;
  dotnet-*)
    if command -v dotnet &> /dev/null; then
      RUNTIME_VERSION=$(dotnet --version)
    fi
    RUNTIME_TYPE="dotnet"
    ;;
  *)
    RUNTIME_TYPE="unknown"
    ;;
esac

# Output stable JSON (field order matters for hashing)
cat <<EOF
{
  "os": "$OS",
  "arch": "$ARCH",
  "runtime_type": "$RUNTIME_TYPE",
  "runtime_version": "$RUNTIME_VERSION"
}
EOF
