# Build Policy: Lint Tolerance

**Status**: Active
**Effective Date**: 2026-01-31

## Policy Declaration

This repository currently operates under a **Tolerant Lint Policy** for production builds.

### Rationale
The Validation Lab codebase contains legacy code from V1 prototypes that generates significant lint warnings/errors. To unblock the V2 Unified Release and Seal Ceremony without requiring a complete rewrite of legacy logic, we explicitly allow builds to proceed despite lint failures.

### Controls
To mitigate risks associated with this policy:
1. **Explicit Declaration**: All seals generated under this policy must carry the `lint_policy: tolerant` attribute.
2. **Debt Monitoring**: Every seal ceremony must generate a `lint-audit.json` report to track technical debt.
3. **No New Debt**: New code (V2 components) should adhere to strict linting where possible locally, even if the global build is tolerant.

### Scope
This tolerance applies specifically to **ESLint errors** inherited from the V1 codebase. It does NOT cover:
- TypeScript compilation errors (Strictly enforced by `npm run typecheck` in build).
- Tests/Unit checks (Must pass if added).
- Runtime/HTTP Audit failures (Must pass `audit:http:local`).

### Exit Criteria (Roadmap to Strict)
Return to `lint_policy: strict` is mandatory when ANY of the following are met:
1. **Zero Error Count**: The `lint-audit.json` reports 0 errors.
2. **Major Refactor**: The legacy V1 components (`app/v1/**` or similar) are replaced by V2 implementations.
3. **Date Milestone**: By **2026-06-30** (End of Q2), regardless of refactor status.

### Enforcement
- **Drift Prevention**: `GATE-UNIFIED-BUILD-LINT-POLICY-01` ensures this document exists if config is tolerant.
- **Strict Reversion**: Upon meeting Exit Criteria, `next.config.ts` MUST be updated to remove `ignoreDuringBuilds`, and this document marked as `Archived`.
```typescript
eslint: {
    ignoreDuringBuilds: true,
}
```
