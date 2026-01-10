feat(phase-4): Add secure API routes for evidence files (M3)

Phase 4 Main - Commit M3 (API + Security):
- P4-5: File view/download APIs with hardened security boundaries

Security layers:
1. Whitelist validation (7 files only)
2. Input validation (no .., \, empty segments)
3. Path containment (runDir + path.sep prefix check)
4. Symlink defense (realpath double-check)
5. No path leakage (safe error messages)

Headers:
- Immutable cache (max-age=31536000)
- X-Content-Type-Options: nosniff
- Content-Disposition: attachment (download route)

Gates: 04-10 ALL PASS
Frozen: CLEAN
