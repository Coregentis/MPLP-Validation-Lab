# Base Runner Image
# 
# Minimal base for all MPLP runners
# Provides common utilities without runtime-specific dependencies

FROM ubuntu:22.04

# Install common utilities
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Default command
CMD ["/bin/bash"]
