# V2 Gate Exemption Markers

## Overview

Exemption markers allow specific lines of code to bypass gate checks when the violation is legitimate and necessary. This mechanism prevents false positives while maintaining strict architectural discipline.

## Marker Format

Use inline comments with the format:

```
// @v2-exempt <GATE_CATEGORY> <reason>
```

or for the previous line:

```
// @v2-exempt <GATE_CATEGORY> <reason>
<code that would normally fail>
```

## Supported Gates and Markers

### GATE-V2-NO-LEGACY-01: No V1 Legacy Content

**Marker**: `@v2-exempt NO_LEGACY pattern-definition`

**Usage**: Only for pattern definition lines that inherently contain V1 references

**Example**:
```typescript
// @v2-exempt NO_LEGACY pattern-definition
const FORBIDDEN_PATTERNS = [
  /validation_lab_v1/i,  // @v2-exempt NO_LEGACY pattern-definition
  /_v1_/,                // @v2-exempt NO_LEGACY pattern-definition
];
```

**Allowed Locations**: Gate implementation files only

---

### GATE-V2-HOST-ALLOW-01: Host Allowlist Only

**Marker**: `@v2-exempt HOST_ALLOW localhost dev-only`

**Usage**: Only for localhost usage in development configuration

**Example**:
```typescript
// @v2-exempt HOST_ALLOW localhost dev-only
const baseUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000' // @v2-exempt HOST_ALLOW localhost dev-only
  : CANONICAL_HOST;
```

**Allowed Locations**:
- `app/_registry/data-registry.ts` (dev URL construction)
- `next.config.js` (dev server config)
- `.env.development.example` (example files only)
- `scripts/dev/*` (development utilities)

**Forbidden**: Preview domains (`vercel.app`, `ngrok`, etc.) have NO exemptions

---

## Gate Behavior

### Exemption Checking Logic

1. **Same-line check**: If marker appears on the same line as the violation
2. **Previous-line check**: If marker appears on the line immediately before

Both checks use `line.includes(EXEMPT_MARKER)` for simplicity.

### Strict Scope

- Exemption markers only work for their specific gate category
- `@v2-exempt HOST_ALLOW` does NOT exempt from `NO_LEGACY` checks
- Each gate maintains its own `EXEMPT_MARKER` constant

---

## Anti-Abuse Measures

### Limited Exemption Targets

- **NO_LEGACY**: Only pattern definitions in gate files
- **HOST_ALLOW**: Only localhost in dev config (checked against allowlisted file paths)

### Audit Trail

All exemption markers are visible in code and version-controlled. Any abuse is immediately visible in code review.

### Gate Evolution

Future gates may NOT support exemption markers if the violation type should have zero tolerance.

---

## Examples

### ✅ CORRECT: Localhost in dev config

```typescript
// @v2-exempt HOST_ALLOW localhost dev-only
const devUrl = 'http://localhost:3000';
```

### ❌ INCORRECT: Preview domain (no exemptions allowed)

```typescript
// @v2-exempt HOST_ALLOW preview
const previewUrl = 'https://my-app.vercel.app'; // STILL FAILS
```

### ✅ CORRECT: Pattern definition

```typescript
// @v2-exempt NO_LEGACY pattern-definition
const patterns = [/_v1_/];
```

### ❌ INCORRECT: Actual V1 import (no exemptions allowed)

```typescript
// @v2-exempt NO_LEGACY
import { something } from '../v1/legacy'; // STILL FAILS
```

---

## Verification

After adding exemption markers, verify gates pass:

```bash
npm run gate:all
```

All gates should show `✅ PASSED` if exemptions are correctly applied.

---

## Phase 0 Status

With exemption markers applied:
- ✅ GATE-V2-NO-LEGACY-01: PASS
- ✅ GATE-V2-HOST-ALLOW-01: PASS
- ✅ GATE-V2-CROSSLINK-SSOT-01: PASS
- ✅ GATE-V2-PROJ-01: PASS

**Total**: 4/4 gates passing
