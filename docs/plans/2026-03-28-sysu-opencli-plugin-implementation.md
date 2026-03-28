# SYSU OpenCLI Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a pnpm-managed TypeScript OpenCLI plugin named `sysu` that provides course, classroom, and detail queries against the SYSU teaching affairs system.

**Architecture:** The plugin will expose four TS command files backed by shared helpers for authenticated request execution, lookup resolution, validation, normalization, and CLI error construction. Tests will cover request-shape construction, validation rules, lookup matching, and output normalization before command files are implemented.

**Tech Stack:** TypeScript, pnpm, Vitest, OpenCLI plugin manifest, Node.js ESM

### Task 1: Scaffold the plugin and test environment

**Files:**
- Create: `package.json`
- Create: `opencli-plugin.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`

**Step 1: Create package and test configuration**

- Use `pnpm` package management
- Add scripts for `test`, `test:run`, and `typecheck`
- Add `peerDependencies` for `@jackwener/opencli`
- Add `devDependencies` for `typescript` and `vitest`

**Step 2: Install dependencies**

Run: `pnpm install`
Expected: lockfile created and install succeeds

**Step 3: Verify test runner boots**

Run: `pnpm test --run`
Expected: completes with no tests found or a clean empty-suite result

### Task 2: Define and test validation behavior first

**Files:**
- Create: `tests/lib/validate.test.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/validate.ts`
- Create: `src/lib/errors.ts`

**Step 1: Write the failing tests**

Cover:
- classroom mode requires `time` or `week`
- classroom time mode requires `date-from` and `date-to`
- classroom week mode requires `year-term`, `week-from`, `week-to`
- classroom query requires `building` or `classroom`
- date range cannot exceed 30 days
- week range cannot exceed 4 weeks
- section and week ranges must be ordered

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/lib/validate.test.ts`
Expected: FAIL because validation helpers do not exist yet

**Step 3: Write minimal implementation**

- Add shared error types
- Add validation helpers for `courses` and `classrooms`
- Keep implementation minimal and aligned with approved spec

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/lib/validate.test.ts`
Expected: PASS

### Task 3: Define and test lookup resolution

**Files:**
- Create: `tests/lib/lookup.test.ts`
- Create: `src/lib/lookup.ts`

**Step 1: Write the failing tests**

Cover:
- exact match lookup succeeds
- alias match lookup succeeds
- unknown value throws a lookup error
- duplicate match is rejected

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/lib/lookup.test.ts`
Expected: FAIL because lookup helpers do not exist yet

**Step 3: Write minimal implementation**

- Implement exact-match lookup
- Implement optional alias-table resolution
- Keep ambiguous or unknown input as explicit failure

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/lib/lookup.test.ts`
Expected: PASS

### Task 4: Define and test normalization behavior

**Files:**
- Create: `tests/lib/normalize.test.ts`
- Create: `src/lib/normalize.ts`

**Step 1: Write the failing tests**

Cover:
- course list normalization
- classroom row normalization
- `occupiedSections` summary generation
- occupancy detail normalization
- schedule detail normalization with `studyObjects`

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/lib/normalize.test.ts`
Expected: FAIL because normalization helpers do not exist yet

**Step 3: Write minimal implementation**

- Add pure transformation functions only
- Avoid any network or OpenCLI runtime dependency in these helpers

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/lib/normalize.test.ts`
Expected: PASS

### Task 5: Define the API/request builder layer with tests

**Files:**
- Create: `tests/lib/api.test.ts`
- Create: `src/lib/api.ts`

**Step 1: Write the failing tests**

Cover:
- course request parameter mapping
- classroom `pageCheckList` request envelope creation
- detail request parameter mapping
- lookup-backed field mapping

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/lib/api.test.ts`
Expected: FAIL because request builder helpers do not exist yet

**Step 3: Write minimal implementation**

- Add endpoint constants
- Add request-shape builders
- Keep browser runtime execution separated from pure builders

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/lib/api.test.ts`
Expected: PASS

### Task 6: Implement command registration for `courses`

**Files:**
- Create: `tests/commands/courses.test.ts`
- Create: `courses.ts`

**Step 1: Write the failing tests**

Cover:
- command metadata is registered correctly
- args map to the validated request builder
- raw and normalized output modes are selectable

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/commands/courses.test.ts`
Expected: FAIL because `courses.ts` does not exist yet

**Step 3: Write minimal implementation**

- Register the `sysu courses` command
- Wire validation, lookup resolution, request building, and normalization

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/commands/courses.test.ts`
Expected: PASS

### Task 7: Implement command registration for `classrooms`

**Files:**
- Create: `tests/commands/classrooms.test.ts`
- Create: `classrooms.ts`

**Step 1: Write the failing tests**

Cover:
- classroom command metadata
- time mode flow
- week mode flow
- raw and normalized output modes

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/commands/classrooms.test.ts`
Expected: FAIL because `classrooms.ts` does not exist yet

**Step 3: Write minimal implementation**

- Register the `sysu classrooms` command
- Use shared validation and request building

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/commands/classrooms.test.ts`
Expected: PASS

### Task 8: Implement the two detail commands

**Files:**
- Create: `tests/commands/details.test.ts`
- Create: `classroom-occupy-detail.ts`
- Create: `classroom-schedule-detail.ts`

**Step 1: Write the failing tests**

Cover:
- occupy detail command requires positional id
- schedule detail command requires positional id plus `occupy-pro` and `classroom-id`
- normalized detail outputs

**Step 2: Run the targeted tests to verify they fail**

Run: `pnpm vitest run tests/commands/details.test.ts`
Expected: FAIL because detail command files do not exist yet

**Step 3: Write minimal implementation**

- Register both detail commands
- Use shared request builders and normalization helpers

**Step 4: Re-run the targeted tests**

Run: `pnpm vitest run tests/commands/details.test.ts`
Expected: PASS

### Task 9: Verify the whole suite and package shape

**Files:**
- Modify: `package.json` if script cleanup is needed

**Step 1: Run the full test suite**

Run: `pnpm test --run`
Expected: all tests PASS

**Step 2: Run type checking**

Run: `pnpm typecheck`
Expected: PASS

**Step 3: Verify plugin files exist**

Run: `ls -la`
Expected: command files, manifest, config, tests, and src helpers all present

### Task 10: Optional real-site sanity verification

**Files:**
- No code changes required

**Step 1: Run one or two real queries manually after implementation**

Examples:

```bash
opencli sysu courses --year-term 2025-2 --limit 5
opencli sysu classrooms --mode week --year-term 2025-2 --building 东A --week-from 1 --week-to 1 --section-from 1 --section-to 2 --limit 5
```

**Step 2: Compare with the browser UI**

Expected: spot-checked results align with the SYSU teaching affairs pages
