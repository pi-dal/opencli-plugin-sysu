# SYSU OpenCLI Plugin Design

Date: 2026-03-28
Status: Approved by user in chat, pending final spec review
Scope: Build a TypeScript OpenCLI plugin named `sysu` for Sun Yat-sen University teaching affairs queries

## 1. Goal

Create a TypeScript OpenCLI plugin that exposes commonly used SYSU teaching affairs queries through `opencli sysu ...` commands while reusing the user's existing Chrome login state.

The first release should prioritize:

- Full-school opening courses query
- Classroom occupancy and free-classroom query
- Detail lookup for classroom occupancy records
- Detail lookup for scheduled course records referenced from classroom occupancy results

The plugin should feel close to the original web UI, especially for filters, but still behave like a practical CLI rather than a browser form clone.

## 2. Product Decisions

### 2.1 Top-level command

Use `sysu` as the site name:

```bash
opencli sysu ...
```

### 2.2 Commands in v1

```bash
opencli sysu courses
opencli sysu classrooms
opencli sysu classroom-occupy-detail <id>
opencli sysu classroom-schedule-detail <id>
```

Command intent:

- `courses`: full-school opening course list query
- `classrooms`: classroom occupancy and free-classroom list query
- `classroom-occupy-detail <id>`: detail for a classroom occupancy record
- `classroom-schedule-detail <id>`: detail for a scheduled class record tied to a classroom result

### 2.3 Positional argument rule

Identifiers should use positional args when they are the main subject of the command.

- `classroom-occupy-detail <id>`
- `classroom-schedule-detail <id>`

This follows OpenCLI adapter conventions.

## 3. Authentication and Runtime Strategy

### 3.1 Authentication strategy

Use `cookie` strategy.

Reasoning:

- The target site already works in the user's Chrome session.
- Browser inspection confirmed valid session cookies on `jwxt.sysu.edu.cn`.
- The data is fetched from authenticated endpoints, but does not appear to require a bespoke JS signing layer for the target routes.

### 3.2 Runtime model

The plugin should reuse Chrome login state through OpenCLI browser execution and make authenticated requests from page context or the host browser environment, not by implementing username/password login.

If login is missing or expired, commands must fail with a clear actionable message.

## 4. Confirmed Site Findings

### 4.1 Full-school opening courses page

Page URL:

```text
https://jwxt.sysu.edu.cn/jwxt/mk/#/openingCoursesStu?code=jwxsd_qxkckk&resourceName=...
```

Observed primary list endpoint:

```text
/jwxt/schedule/agg/schoolOpeningCoursesSchedule/querySchoolOpeningCourses
```

Observed lookup endpoints:

- `/jwxt/base-info/acadyearterm/showNewAcadlist`
- `/jwxt/base-info/acadyearterm/findAcadyeartermNamesBox`
- `/jwxt/base-info/department/findCommonDepartmentPull`
- `/jwxt/base-info/campus/findCampusNamesBox`
- `/jwxt/base-info/codedata/findcodedataNames`
- `/jwxt/base-info/teaching-building/pull`
- `/jwxt/base-info/classroom/getClassRoomAllPull`

### 4.2 Classroom occupancy page

Page URL:

```text
https://jwxt.sysu.edu.cn/jwxt/mk/schedule-web/#/classroomCheckStu?code=jwxsd_jsskqkjkxjscx&resourceName=...
```

Observed primary list endpoint in the student route bundle:

```text
/schedule/agg/classroomOccupy/pageCheckList
```

Observed detail endpoints in the same bundle:

- `/schedule/agg/classroomOccupy/detail`
- `/schedule/agg/classroomOccupy/scheduleDetailCheck`
- `/schedule/agg/classesStudyObj/list`

Observed lookup and helper usage in the bundle:

- campus lookup
- teaching building lookup
- classroom lookup by multi-condition
- class section lookup
- occupy type lookup
- school calendar weekly lookup
- week list lookup

The front-end submits the classroom list request as:

```json
{
  "pageNo": 1,
  "pageSize": 10,
  "total": true,
  "param": {
    "...": "search fields"
  }
}
```

## 5. Command Design

### 5.1 `opencli sysu courses`

Purpose:

- Query full-school opening course records
- Preserve the major filter surface from the web UI

Recommended args:

- `--year-term`
- `--end-year-term`
- `--department`
- `--course-name`
- `--teacher`
- `--campus`
- `--course-category`
- `--class-level`
- `--class-no`
- `--class-name`
- `--teaching-type`
- `--course-code`
- `--building`
- `--classroom`
- `--weekday`
- `--week-from`
- `--week-to`
- `--section-from`
- `--section-to`
- `--page`
- `--limit`
- `--raw`

Notes:

- User-facing args should prefer readable names.
- Internally, these are mapped to the target API's actual request fields.
- Lookup-backed fields should accept human-readable values and resolve them to the corresponding backend code or id.

### 5.2 `opencli sysu classrooms`

Purpose:

- Query classroom occupancy and free-classroom records
- Support both time-based mode and week-based mode, mirroring the UI behavior

Recommended args:

- `--mode time|week`
- `--campus`
- `--building`
- `--classroom`
- `--occupy-type`
- `--section-from`
- `--section-to`
- `--date-from`
- `--date-to`
- `--year-term`
- `--week-from`
- `--week-to`
- `--single-double 0|1|2`
- `--weekdays`
- `--page`
- `--limit`
- `--raw`

Rules:

- `time` mode requires `--date-from` and `--date-to`
- `week` mode requires `--year-term`, `--week-from`, and `--week-to`
- at least one of `--building` or `--classroom` should be required

### 5.3 `opencli sysu classroom-occupy-detail <id>`

Purpose:

- Fetch the occupancy-detail modal data for a record selected from `classrooms`

Recommended args:

- positional `<id>`
- `--raw`

### 5.4 `opencli sysu classroom-schedule-detail <id>`

Purpose:

- Fetch the schedule-detail modal data for a classroom list item

Recommended args:

- positional `<id>`
- `--occupy-pro <code>`
- `--classroom-id <id>`
- `--raw`

Reason:

The inspected front-end route calls the detail API with `id`, `occupyPro`, and `classroomID`. The CLI should require these explicitly rather than guessing.

## 6. Data Mapping

### 6.1 Courses output shape

Default normalized fields:

- `yearTerm`
- `courseName`
- `department`
- `courseCategory`
- `credit`
- `teacher`
- `limitCount`
- `selectedCount`
- `examType`
- `scheduleText`
- `campus`
- `studyTargets`
- `classNo`
- `teachingProgress`

Guidelines:

- The normalized output should stay stable even if the remote raw payload shape changes slightly.
- `scheduleText` and `studyTargets` may remain multiline strings if the backend already returns readable text.
- `--raw` should expose the backend structure with minimal transformation.

### 6.2 Classrooms output shape

Default normalized fields:

- `id`
- `campus`
- `teachingBuildNum`
- `teachingBuild`
- `classroomNum`
- `classroomId`
- `date`
- `dayWeek`
- `oneSection`
- `twoSection`
- `threeSection`
- `fourSection`
- `fiveSection`
- `sixSection`
- `sevenSection`
- `eightSection`
- `nineSection`
- `tenSection`
- `elevenSection`
- `twelveSection`
- `thirteenSection`
- `fourteenSection`
- `fifteenSection`
- `sixteenSection`
- `occupiedSections`

`occupiedSections` is a CLI-friendly derived summary built from section cells so that JSON and table output remain usable without losing the original section-by-section data.

### 6.3 Occupy detail output shape

Default normalized fields:

- `yearTerm`
- `week`
- `date`
- `dayWeek`
- `section`
- `occupyReason`

### 6.4 Schedule detail output shape

Default normalized object:

- `schedule`
- `studyObjects`

`schedule` should include the main course and class metadata, such as:

- `courseNum`
- `courseName`
- `courseEnName`
- `schoolSemester`
- `attendClassOfCampus`
- `classesNum`
- `classesName`
- `totalNum`
- `credit`
- `sumHours`
- `weekHours`
- `openClassUnitName`
- `attendTimePlace`
- `teacher`

`studyObjects` should expose the related "修读对象" rows as a list.

## 7. Lookup Resolution Strategy

Some CLI args represent labels visible in the UI, while the backend may require ids or codes.

The plugin should implement a small lookup-resolution layer:

- load lookup data lazily
- cache lookup data during a single command run
- resolve human-readable values to backend ids/codes
- support exact match first
- optionally support a short curated alias table for common values

Resolution-heavy fields include:

- campus
- department
- teaching building
- classroom
- codedata-backed select fields

The first release should avoid fuzzy guessing. Unknown values should fail clearly instead of silently selecting the wrong option.

## 8. Validation Rules

### 8.1 Shared validation

- `page >= 1`
- `limit >= 1`
- `section-from <= section-to` when both exist

### 8.2 Courses validation

- `week-from <= week-to` when both exist
- all lookup-backed fields must resolve to a single valid value

### 8.3 Classrooms validation

- one of `building` or `classroom` is required
- in `time` mode, `date-from` and `date-to` are required
- in `week` mode, `year-term`, `week-from`, and `week-to` are required
- date range in `time` mode must not exceed 30 days
- week range in `week` mode must not exceed 4 weeks
- `week-from <= week-to`

## 9. Error Handling

Expected errors should be converted to OpenCLI-friendly CLI errors instead of leaking raw exceptions.

Required categories:

### 9.1 Not logged in

Message should explain that the user must log in to SYSU teaching affairs in Chrome first.

### 9.2 Permission or session expired

If an endpoint returns a permission-style response or login expiry, the message should explicitly say the session may have expired and the user should re-open or re-login in Chrome.

### 9.3 Invalid argument combination

The CLI should explain which required pair or mode-specific field is missing or contradictory.

### 9.4 Lookup resolution failure

If a campus, building, classroom, or codedata label cannot be resolved, the CLI should say which value failed and ideally show valid candidates.

### 9.5 Empty data

Empty result sets are normal and should return an empty list, not an error.

## 10. Implementation Boundaries for v1

Included in scope:

- the 4 commands listed above
- major UI filters for courses and classrooms
- normalized output plus `--raw`
- lookup resolution and request validation
- real-browser authenticated fetching via OpenCLI plugin runtime

Excluded from v1:

- interactive selector prompts
- fuzzy lookup matching
- speculative id inference for detail commands
- extra SYSU modules unrelated to these two pages
- automatic repair of login state

## 11. Testing Strategy

### 11.1 Unit tests

Test:

- arg validation
- mode switching logic
- lookup resolution
- response normalization
- derived field generation such as `occupiedSections`

### 11.2 Integration tests

Mock:

- course list endpoint
- classroom list endpoint
- two detail endpoints
- study object endpoint
- lookup endpoints

Cover:

- happy path for all 4 commands
- invalid argument combinations
- empty response cases
- lookup miss cases

### 11.3 Manual verification

Run the plugin against the real site with the user's active Chrome login and compare:

- course list spot checks
- classroom list spot checks
- occupancy detail
- schedule detail

Manual verification is required because the site is authenticated and UI-driven.

## 12. Implementation Recommendation

Use a TypeScript plugin with:

- one command file per command, or a small number of focused files
- shared helpers for:
  - browser-authenticated request execution
  - lookup loading and caching
  - validation
  - normalization

Suggested high-level structure:

```text
opencli-plugin-sysu/
├── package.json
├── opencli-plugin.json
├── courses.ts
├── classrooms.ts
├── classroom-occupy-detail.ts
├── classroom-schedule-detail.ts
└── lib/
    ├── api.ts
    ├── lookup.ts
    ├── normalize.ts
    ├── validate.ts
    └── errors.ts
```

This keeps command registration straightforward and avoids embedding too much logic into a single adapter file.

## 13. Risks

- The target site may change frontend field names without warning.
- Some list endpoints may require exact request-body keys discovered only during implementation-time request replay.
- Some lookup endpoints may return labels inconsistent with what users type naturally.
- The course list endpoint may require a specific HTTP method or request wrapper beyond what static inspection alone shows.

Mitigation:

- verify every main command with browser-authenticated runtime calls
- prefer reusable request helpers
- keep `--raw` available for debugging
- write tests around request-shape construction

## 14. Open Questions Resolved During Design

- Use TS plugin: yes
- Plugin/site name: `sysu`
- Prefer detailed version over minimal version: yes
- Command surface should be close to the UI: yes

## 15. Next Step

After the user reviews this spec, create an implementation plan and only then move to TDD and code changes.

## 16. Process Notes

- This workspace became a git repository after the spec was drafted in this session.
- A local review pass was completed in this session.
- A dedicated subagent spec-review loop was not run because this session cannot use subagents unless the user explicitly asks for them.
