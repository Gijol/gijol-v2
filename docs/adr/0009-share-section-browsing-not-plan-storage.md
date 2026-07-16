# ADR-0009: Share section browsing without merging timetable storage

- Status: Accepted
- Date: 2026-07-16

## Context

The current timetable plan editor and the legacy timetable builder search the same term sections. Both implemented department facets, title/code/instructor search, 30-row progressive display, selection lookup, and time-conflict annotation independently. They also loaded and retained every section for a term even though only a small visible window was rendered.

ADR-0004 requires timetable plan alternatives to remain separate from completed term records. The legacy timetable store is also a compatibility representation for older plans without an explicit term; it is not evidence-backed completed history.

## Decision

One deep section browsing Module owns server-side search, department facets, stable pagination, term caching, request cancellation, progressive browser pages, and time-conflict projection.

The Module exposes a selection interaction Interface with two real Adapters:

- the timetable plan Adapter writes selected section snapshots into a specific plan alternative;
- the legacy Adapter preserves existing selected-section IDs and the legacy saved-timetable format.

Only browsing behavior is shared. The two storage models, their migration behavior, and their ownership remain separate. The server source is also behind a `TimetableSectionSource` Seam so a file Adapter can later be replaced by an OCI data Adapter without changing browsing callers.

## Consequences

The browser receives 30 sections per page rather than the complete term dataset. React Query owns the dashboard term/query cache and forwards cancellation signals for superseded requests. The server parses each term source once per process. Search and conflict semantics now have one test surface, while the Adapter contract ensures both plan representations behave consistently without violating ADR-0004.
