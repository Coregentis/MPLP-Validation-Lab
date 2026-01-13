# Phase 5: Website/Docs Link-Only Strategy

**Date**: 2026-01-11  
**Objective**: Minimal cross-linking between three entry points  
**Status**: PLANNED (not executed - awaiting confirmation)

---

## Principle

**Link-only + single-sentence boundary**: Provide discoverability without semantic expansion, certification language, or execution hosting implications.

---

## Hard Constraints

### What NOT to add:
- ❌ No certification/badge/ranking/score language
- ❌ No "upload your code" or "we execute" claims
- ❌ No new explanation pages (all explanations stay within Lab)
- ❌ No new structured entities (JSON-LD frozen at Website level)
- ❌ No normative language in Docs (MUST/SHALL)

### What TO add:
- ✅ Single link per entry point
- ✅ Single-sentence boundary statement
- ✅ Minimal, functional navigation

---

## Commit W1: Website Link-Only

### Objective
Add ONE external link to Validation Lab with boundary statement on mplp.io (Website).

### Recommended Placement (choose ONE)

**Option A** (Top Navigation):
- Add nav item: `Validation Lab` (external link)
- Minimal impact, high discoverability

**Option B** (Governance/Evidence Chain page):
- Add "External Resources" section at bottom
- Single line: link + boundary statement

### Recommended Text

**Link text**: `Validation Lab` or `Evidence & Conformance Lab`

**Boundary statement** (single sentence, placed next to link):
> "Evidence-based verdict viewing and export; not a certification program and does not host execution."

### Forbidden Terms Checklist

Before committing, grep for:
```bash
rg -n "certification|certified|badge|ranking|score|we execute|upload your agent|host execution" <website_dir>
```

Expected: No new matches beyond existing frozen uses.

### Verification

- [ ] Website builds successfully
- [ ] No new JSON-LD entities added
- [ ] No new "certification" language
- [ ] Link points to correct Lab URL
- [ ] Boundary statement present

### Commit Message

```
chore(phase-5): Add website link-only entry to Validation Lab (no semantic expansion)

Phase 5 - Website Discovery:
- Single external link to Validation Lab
- Boundary statement: evidence-based, non-certification, non-hosting
- No new explanation pages
- No new structured entities

Verification: Build PASS, no forbidden terms
```

---

## Commit D1: Docs External Reference Link

### Objective
Add ONE external reference link to Validation Lab on docs.mplp.io (Docs) with "non-normative" declaration.

### Recommended Placement (choose ONE)

**Option A** (Docs Homepage "Related Sites"):
- Add one line: `Validation Lab` (external link, non-normative)

**Option B** (Governance/Evaluation page):
- Add "External Reference" subsection (2 lines max)

### Recommended Text

**Link text**: `Validation Lab (External Reference)`

**Boundary statement** (single sentence):
> "External reference (non-normative): evidence viewing/export site."

### Forbidden Elements Checklist

- [ ] No new JSON-LD
- [ ] No MUST/SHALL/REQUIRED normative keywords
- [ ] No integration into protocol specification
- [ ] Clearly marked as "external" and "non-normative"

### Verification

- [ ] Docs builds successfully
- [ ] No new normative requirements
- [ ] Link marked as external reference
- [ ] No JSON-LD added

### Commit Message

```
chore(phase-5): Add docs external reference link to Validation Lab (non-normative)

Phase 5 - Docs Reference:
- Single external reference link (non-normative)
- Clear boundary: viewing/export only
- No protocol specification changes
- No new JSON-LD

Verification: Build PASS, non-normative only
```

---

## Execution Sequence (NOT YET EXECUTED)

### Step 1: Website (W1)
1. Choose placement (nav or governance page)
2. Add link + boundary statement
3. Run build + forbidden terms check
4. Commit W1
5. **DO NOT PUSH** (await review)

### Step 2: Docs (D1)
1. Choose placement (homepage or governance page)
2. Add link + "non-normative" statement
3. Run build
4. Commit D1
5. **DO NOT PUSH** (await review)

### Step 3: Review & Seal
1. Review both commits
2. Confirm boundary statements correct
3. Create phase-5-seal.md
4. Push to respective repos (or await further direction)

---

## Phase 5 Seal Template (to be created after execution)

```markdown
# Phase 5 Seal: Website/Docs Link-Only

**Date**: 2026-01-11
**Commits**: 2 (W1 + D1)

## Website (W1)
- Commit: [SHA]
- Placement: [top nav / governance page]
- Boundary: "Evidence-based... not certification... does not host execution"

## Docs (D1)
- Commit: [SHA]
- Placement: [homepage / governance page]
- Boundary: "External reference (non-normative)"

## Verification
- Build: PASS (both)
- Forbidden terms: 0 new matches
- JSON-LD: No changes
- Normative language: No additions

**Status**: SEALED
```

---

## Risk Mitigation

### Failure Mode A: Writing Too Much
**Risk**: Explaining "how Lab works" leads to certification/hosting perception.  
**Mitigation**: Link-only. All explanations remain within Lab's own About/Builder pages.

### Failure Mode B: Writing Too Little
**Risk**: No discoverability → adoption barrier.  
**Mitigation**: One link per entry point is sufficient for discovery path closure.

---

## Next Steps After Phase 5

1. **Phase 6**: Final acceptance + Release Note seal
2. Consolidate all seal reports (Phase 3, 4, 5)
3. Generate master evidence manifest
4. Mark v0.1 as release-ready

---

**Status**: PLANNED  
**Awaiting**: User confirmation before executing W1 and D1 commits  
**Current State**: Phase 4 SEALED, Phase 5 strategy documented
