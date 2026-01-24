# Task Completion Report Template

> **SOP**: SOP-VLAB-PROJ-SYNC-01  
> **Purpose**: Mandatory post-task association update documentation  
> **Usage**: Copy this template for every task completion

---

## 1. Task ID / Scope

**Task ID**: [e.g., P1-1, VLAB-PACK-060-080-P1-1]  
**Scope**: [Brief description of what was accomplished]  
**Date**: [YYYY-MM-DD]

---

## 2. Files Changed (by Repository)

### Validation_Lab
- [path/to/file.ext] - [description of change]
- [...]

### MPLP_website
- [path/to/file.ext] - [description of change]
- [None if no changes]

### docs
- [path/to/file.ext] - [description of change]
- [None if no changes]

---

## 3. Registry Sync

### ROUTES.yaml
**Version**: [old] → [new] (or "No version change")  
**Changes**:
- **Added**: [route paths with surface/priority]
- **Modified**: [route paths with changes]
- **Deleted**: [route paths if any]

### TRUTH_SOURCES.yaml
**Version**: [old] → [new] (or "No version change")  
**Changes**:
- **Added**: [ts.* IDs with descriptions]
- **Modified**: [ts.* IDs with changes]
- **Deleted**: [ts.* IDs if any]

### GATES.yaml
**Version**: [old] → [new] (or "No version change")  
**Changes**:
- **Added**: [gate:* IDs with purposes]
- **Modified**: [gate:* IDs with changes]
- **Deleted**: [gate:* IDs if any]

---

## 4. Projection SSOT

### projection-map.json
**Version**: [version]  
**Changes**:
- **New artifacts**: [artifact_id list]
- **Route updates**: [route → artifact mappings]
- **Forbidden/allowlist**: [category or path changes]
- **No changes** (if applicable)

### PTM (Page Truth Map)
**Changes**:
- **New pages**: [page → truth sources mappings]
- **Modified pages**: [page updates]
- **Not applicable** (if task doesn't affect PTM)

---

## 5. Three-Entry Projection Updates

### Lab UI
**New Routes/Pages**:
- [route] - [description + how to access]

**New Exports**:
- [export path] - [UI reference point]

**No changes** (if applicable)

### Website (Pointer-Only)
**Pointer Additions**:
- [page/section] - [pointer link + boundary statement]

**No changes** (if applicable)

### Docs (Non-Normative Pointer)
**Reference Additions**:
- [doc path] - [pointer link + non-normative disclaimer]

**No changes** (if applicable)

---

## 6. Gate Results (MANDATORY)

### Lab Gates
```
gate:projection-map
  Status: [✅ PASS / ❌ FAIL]
  Mapped Routes: [count]
  Registered Artifacts: [count]
  Notes: [any warnings or key metrics]

gate:no-ssot-duplication
  Status: [✅ PASS / ❌ FAIL]
  Errors: [count]
  Warnings: [count]
  Files Scanned: [Website: N, Docs: N]

build
  Status: [✅ PASS / ❌ FAIL]

typecheck
  Status: [✅ PASS / ❌ FAIL]
```

### Cross-Repo Gates
```
Website: gate:website-pointer-only
  Status: [✅ PASS / ❌ FAIL]
  Files Scanned: [count]

Docs: gate:docs-nonnormative-pointer-only
  Status: [✅ PASS / ❌ FAIL]
  Files Scanned: [count]
```

---

## 7. Hash Anchors

### Registry Files
```
ROUTES.yaml: [SHA256]
TRUTH_SOURCES.yaml: [SHA256]
GATES.yaml: [SHA256]
```

### Key Artifacts
```
[artifact-name.ext]: [SHA256]
[...]
```

### Gate Reports
```
[report-name.json]: [SHA256]
[...]
```

---

## 8. Next Tasks Triggered

**Immediate Follow-On**:
- [Task ID/description]

**Future Work**:
- [Task ID/description]

**None** (if task is self-contained)

---

## 9. Compliance Checklist

- [ ] All Registry files updated (ROUTES, TRUTH_SOURCES, GATES)
- [ ] Projection SSOT synchronized (projection-map, PTM if applicable)
- [ ] Three-entry projection verified (Lab UI, Website pointer, Docs reference)
- [ ] All gates executed and PASSING
- [ ] Hash anchors documented for key files
- [ ] Task Completion Report filed in governance/reports/task-completion/

---

**Report Author**: [Name/Role]  
**Reviewed By**: [Name/Role if applicable]  
**Filed**: [YYYY-MM-DD]
