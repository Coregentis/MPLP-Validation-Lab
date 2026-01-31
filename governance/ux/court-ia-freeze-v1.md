# Court IA Freeze V1

> **Status**: FROZEN
> **Domain**: Information Architecture
> **Enforcement**: Gate-V2-IA-Structure

## 1. Object Model
The Validation Lab strictly adheres to a 3-Object Model:

### 1.1 Cases (The Unit of Adjudication)
- **Route**: `/cases/[id]`
- **SSOT**: `manifest.json` + `verdict.json`
- **Mandatory Blocks**:
    - Verdict Badge (PASS/FAIL)
    - Ruling Card (Ruleset Ref)
    - Evidence CTA

### 1.2 Laws (The Standard of Adjudication)
- **Route**: `/laws` (Browser) -> `/laws/[ruleset_id]/[clause_id]` (Detail)
- **SSOT**: `ruleset.v2.md`
- **Mandatory Blocks (Clause Page)**:
    - Intent (One-liner)
    - Required Surfaces (Icons)
    - Example Cases (PASS & FAIL)
    - Mapping Matrix (Reading Aid)

### 1.3 Evidence (The Proof of Fact)
- **Route**: `/cases/[id]/evidence`
- **SSOT**: `artifacts/*`, `timeline/*`
- **Mandatory Blocks**:
    - Docket List
    - Player/Viewer
    - Deep Link Support (`?ptr=`)

## 2. Global Navigation
- **Home**: `/` (The Docket)
- **Start**: `/start` (Role Gateway)
- **Policies**: `/policies` (Boundaries)

## 3. Route Aliases
- `/runs/*` -> Redirect to `/cases/*`

## 4. Canonical Pointers
All evidence deep links must strictly adhere to the `mplp` scheme:
- **Valid**: `mplp://timeline/event/[id]`, `mplp://artifacts/[file]`, `mplp://manifest/[path]`
- **Invalid**: `http(s)://`, `ruleset://`
- **Enforcement**: Gate-V2-Schema-Strictness
