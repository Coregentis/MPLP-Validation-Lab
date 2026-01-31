# .NET 8 Runner
#
# Aligned with substrate registry: runner_id=dotnet-8

FROM mcr.microsoft.com/dotnet/sdk:8.0

# Install additional utilities
RUN apt-get update && apt-get install -y \
    git \
    curl \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Verify version
RUN dotnet --version

# Default command
CMD ["/bin/bash"]
