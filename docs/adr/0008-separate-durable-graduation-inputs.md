# ADR-0008: Separate durable graduation inputs from derived outcomes

- Status: Accepted
- Date: 2026-07-16

## Context

The browser previously persisted four different concerns in one Zustand payload: the parsed transcript, a normalized copy of its courses, the complete graduation evaluation including recommendations, and academic context. Upload callers also read and wrote an unversioned editable key directly. Because the global dashboard shell imported that store only to show upload availability and date, every page could synchronously parse the full graduation payload during hydration.

The normalized course list is reproducible from the transcript. The graduation outcome and recommendations are reproducible from the course list and academic context through the graduation API. Persisting all three representations increases storage, permits stale outcomes, and spreads migration knowledge across callers.

## Decision

The graduation persistence Module stores only the grade-preserving transcript and academic context as canonical durable state. Its persisted schema has an explicit version and migration function.

- `takenCourses` is an in-memory projection regenerated from the transcript during hydration.
- `gradStatus` and recommendations are in-memory derived outcomes and are regenerated through `/api/graduation/grad-status` after hydration.
- A source revision check prevents an older regeneration response from replacing a newly uploaded result.
- Editable transcript recovery uses a separately versioned draft lifecycle owned by the persistence Module.
- Dashboard shell consumers use a small metadata Adapter containing only `hasData` and `lastUploadDate`.
- Academic-context edits update the canonical context and outcome without changing `lastUploadDate`; only transcript commits represent uploads.

The existing `gijol_parsed_processed_state` and `gijol_parsed_editable_state` keys remain readable. Migration discards persisted normalized courses and outcomes, and malformed values resolve to an empty recoverable state.

## Consequences

The storage Interface now has stronger Locality: JSON shapes, versions, draft recovery, and metadata migration live under `lib/stores`. The metadata Seam removes the full transcript store from the global shell import graph. A future authenticated database Adapter can replace the local durable operations without making the graduation outcome authoritative storage.

Reloading a page with graduation data makes one evaluation request because final outcomes are intentionally not durable. Until that request completes, consumers receive `gradStatus: null`; course history remains immediately available from the synchronous projection. If regeneration fails, the canonical input remains intact and the store exposes the error for recovery UI.

## Verification

- Migration tests assert that legacy `takenCourses` and `gradStatus` are discarded.
- Projection tests assert that normalized courses regenerate from the transcript.
- Draft tests cover raw legacy values, versioned values, malformed JSON, and reset.
- Type checking protects all existing graduation consumers during the Interface transition.
