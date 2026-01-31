# Base Runner

Minimal Ubuntu-based image providing common utilities for all MPLP runners.

## Contents

- Ubuntu 22.04 LTS
- curl, git, jq, ca-certificates

## Usage

This is not meant to be used directly. Substrate-specific runners should build FROM this base.

Example:

```dockerfile
FROM mplp-runner:base
RUN apt-get update && apt-get install -y nodejs npm
```
