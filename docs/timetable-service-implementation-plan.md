# Timetable Service Implementation Plan

This document records implementation direction for the timetable service redesign. Domain language and boundaries live in `CONTEXT.md`; this file captures code-facing choices that should guide the next implementation pass.

## Decisions

### Use a new timetable storage boundary

The redesigned timetable service should use a new persisted storage boundary, separate from the existing `timetable-storage` state. The new storage should model **Term Plan Groups** and **Timetable Plan Alternatives** directly, including the planning term, section information state, representative plan reference, candidate courses, selected sections, preferred free times, and plan status.

Existing saved timetable data should not be silently migrated into the current planning term because it does not record a term. It should be exposed through a compatibility path as **Legacy Plans with Unknown Term**, then ask the user to choose the planning term, optionally showing a suggested term when selected course and section data match a known timetable source.

### Persist the edited plan directly

The editor should persist changes directly into the opened **Timetable Plan Alternative**. It should not maintain a separate persisted "current editing session" object. This keeps refresh/navigation behavior predictable: a draft plan, selected candidate courses, selected sections, and preferred free times survive page transitions because the plan alternative itself is the durable editing target.

### Do not introduce edit rollback

Creating a plan alternative should make a durable draft immediately. The editor does not need a separate cancel/rollback flow that returns the plan to its pre-edit state; users can delete an unwanted alternative instead. Avoiding rollback keeps the storage model simple and prevents a second transient edit-session layer from appearing beside the persisted plan alternative.

### Derive grid spans from selected sections

The new storage model should not persist scheduled grid spans. A plan alternative should store selected sections as the source of truth, and the timetable grid should derive spans from those sections at render time. This avoids drift between section meeting data and duplicated span data, which exists in the legacy store.

### Identify candidates by normalized course code within a plan

Course candidates should have stable IDs inside a plan alternative, but candidate merge behavior should be based on normalized course code. A single plan alternative should not contain duplicate candidates for the same normalized course code; instead, the candidate should accumulate multiple reasons such as roadmap, graduation requirement, or direct add. Equivalent courses and renamed course codes should be shown as related information, not automatically merged into one candidate.

### Attach selected sections to candidates

The selected section for a course should be stored on the course candidate, not in a separate source-of-truth selected sections list. This preserves the reason a selected course entered the plan while still allowing the grid to derive its full selected-section list from candidates with selected sections. Directly adding a section from search or the full offering list should first create or merge a direct-add candidate, then attach the chosen section to that candidate.

### Store a section key plus a minimal snapshot

When a candidate has a selected section, store both a stable section key and a minimal display snapshot. The key allows the plan to reconnect to current offering data when available, while the snapshot keeps older plans readable if the source offering file changes or disappears. The snapshot should be limited to fields needed for display and grid reconstruction, such as course code, section, title, meetings, instructors, room, credits, and category.
