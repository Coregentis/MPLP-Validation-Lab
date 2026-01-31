# Python 3.11 Runner
#
# Aligned with substrate registry: runner_id=python-3.11

FROM python:3.11-slim

# Install additional utilities
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install poetry for lockfile management
RUN pip install --no-cache-dir poetry

# Set working directory
WORKDIR /workspace

# Verify versions
RUN python --version && pip --version && poetry --version

# Default command
CMD ["/bin/bash"]
