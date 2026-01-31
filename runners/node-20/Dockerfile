# Node.js 20 Runner
#
# Aligned with substrate registry: runner_id=node-20

FROM node:20-slim

# Install additional utilities
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Verify versions
RUN node --version && npm --version

# Default command
CMD ["/bin/bash"]
