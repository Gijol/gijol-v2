# Browser Performance Architecture Plan

Date: 2026-07-16

## Purpose

This document records the browser-weight analysis performed before moving authentication, user data, and course-data queries to an OCI-hosted backend. The immediate goal is to remove large catalog data and repeated full-dataset work from browser-facing modules without changing the graduation domain decisions already recorded in ADR-0001, ADR-0002, and ADR-0004.

## Measured baseline before implementation

Measurements were taken from an optimized `next build` and from the built route handlers using the current generated catalog.

| Measurement | Current result |
| --- | ---: |
| `course-catalog.snapshot.json` | 15,720,859 bytes |
| Browser snapshot chunk | 10,796,330 bytes raw / 713,911 bytes gzip |
| Initial course-search response | 1,213 records / approximately 11.78 MB |
| Minimal list projection for all 1,213 records | approximately 403 KB |
| `/dashboard/course/search` First Load JS | 862 KB |
| `/dashboard` First Load JS | 876 KB |
| `/dashboard/graduation/lab` First Load JS | 888 KB |
| Legacy `/api/courses` response | approximately 896 KB |
| 2026-2 timetable response | 507 sections / approximately 233 KB |

The snapshot chunk is included by the dashboard, course-search, and graduation-lab routes. Compression reduces transfer size, but the browser must still parse and retain the expanded JSON objects. Course search then filters the complete collection before slicing 24 visible rows.

## Implementation status

### Opportunity 1 completed: server-owned catalog query

Implemented on 2026-07-16:

- `server-catalog-query.ts` is the only runtime module that imports the generated snapshot;
- search and recommendation modules now require data through their interfaces;
- API routes share process-local search and recommendation indexes;
- dashboard recommendation UI projects the authoritative graduation API result;
- graduation Lab keeps local parse/normalize/engine diagnostics but requests catalog-backed refinement from the server;
- source import tests and a post-build browser-chunk check enforce the seam.

Optimized build after the change:

| Route | Before | After |
| --- | ---: | ---: |
| `/dashboard` First Load JS | 876 KB | 187 KB |
| `/dashboard/course/search` First Load JS | 862 KB | 176 KB |
| `/dashboard/graduation/lab` First Load JS | 888 KB | 199 KB |
| Browser snapshot chunk | 10,796,330 bytes raw | absent |

The approximately 11.78 MB initial course-search response is intentionally unchanged. It is the next delivery unit: server-side discovery, projections, facets, and pagination.

## Root causes

### Catalog ownership leaks into browser modules

`features/course-catalog/search.ts` and `features/course-catalog/recommendations.ts` import the generated snapshot and use it as a default argument. Browser callers that only need filtering or recommendation behaviour therefore inherit the static dataset as an implicit dependency.

Affected paths include:

- `pages/dashboard/course/search/index.tsx`
- `lib/hooks/useRecommendedCourses.ts`
- `pages/dashboard/index.tsx`
- `pages/dashboard/graduation/lab.tsx`

### Course search transports detail data as list data

The search screen requests up to 2,000 records on mount. Each record includes descriptions, source references, complete offering history, offering groups, manual listings, facets, and precomputed match text. Filtering, facet derivation, and pagination then run in the browser.

The current route reports `pageNumber: 0` and slices only after building, filtering, and normalizing the full collection, so it does not provide real server-side pagination.

### Derived graduation state is persisted with source state

`useGraduationStore` persists parsed input, normalized taken courses, the derived graduation result, academic context, and upload metadata together. Additional editable-state keys are managed directly by upload callers. Dashboard layout elements read the same full store merely to display whether data exists and when it was uploaded.

### Roadmap pages fetch a redundant legacy catalog

The preset roadmap route already enriches roadmap nodes with catalog data, but the browser also downloads the complete legacy course list for detail lookup. The roadmap creator similarly downloads the entire list before the user searches for a course.

### Timetable browsing logic is duplicated

The planning and legacy course sidebars independently implement department facets, search, filtering, and visible-row limits while both receive the complete term section array.

## Deepening opportunities

### 1. Concentrate snapshot ownership in a server-only catalog query module — completed

Move snapshot loading, indexing, caching, and version knowledge behind one server-only module. Browser-reachable modules should contain data-free normalization and display behaviour only. This preserves the committed static artifacts while preventing them from entering client chunks.

Expected result:

- remove the 10.8 MB raw snapshot chunk from browser routes;
- build catalog indexes once per server process rather than per caller;
- make the later OCI/PostgreSQL adapter a localized replacement;
- test snapshot integration separately from small in-memory fixtures.

### 2. Deepen course discovery around query, facets, pagination, and projections

Make one module own search semantics, stable ordering, facet metadata, page limits, and the difference between list and detail results. Fetch detail history only when a user opens a course.

Expected result:

- eliminate the approximately 11.78 MB initial response;
- remove full-collection filtering from each browser input change;
- reduce browser parse time and retained object count;
- create a stable test surface for page ordering and response-size budgets.

### 3. Separate durable graduation inputs from derived outcomes

Treat taken-course history and academic context as canonical durable state. Treat the graduation outcome and recommendations as reproducible derived state. Keep edit drafts on a separate lifecycle and centralize storage versioning, recovery, and hydration.

Expected result:

- reduce persisted data and synchronous dashboard hydration;
- avoid duplicate source and derived representations;
- prepare real local and authenticated remote adapters;
- test corrupted data, migrations, and derived-state regeneration centrally.

### 4. Remove the redundant roadmap legacy-course transfer

Use the enriched catalog data already attached to preset nodes. For roadmap creation, query only the course candidates required by the current search rather than loading the complete legacy list.

Expected result:

- remove approximately 896 KB from preset startup;
- avoid a second full-catalog parse;
- centralize course-code and alias matching in the roadmap module.

### 5. Consolidate section browsing

Centralize term caching, department facets, search, incremental rows, and conflict annotation. Keep timetable plans and completed-term records separate as required by ADR-0004; only their browsing adapters should vary.

Expected result:

- remove duplicated filtering implementations;
- share one term cache;
- localize the later backend data-source replacement.

### 6. Scope the dashboard shell to dashboard routes

The global app currently imports the dashboard layout and related primitives before determining whether the current route is a dashboard route. Move dashboard ownership to route-scoped layout code and scope query tooling and notifications to actual consumers.

Expected result:

- lower shared JavaScript for public routes;
- prevent dashboard-only persistence and navigation code from becoming global dependencies.

## Recommended delivery order

1. Split snapshot ownership from browser-safe catalog utilities. Completed 2026-07-16.
2. Introduce real server-side course discovery and list/detail projections.
3. Add build-manifest and serialized-response performance budgets.
4. Separate durable graduation inputs from derived outcomes.
5. Remove redundant roadmap catalog fetching.
6. Consolidate timetable section browsing.
7. Scope the dashboard shell and remaining providers by route.

The first two items should be delivered together because changing only the transport still leaves the snapshot in the client import graph, while changing only the import graph still leaves the 11.78 MB search response.

## Regression budgets

The implementation phase should establish automated budgets rather than relying on manual bundle inspection:

- browser routes must not contain known catalog snapshot identifiers;
- course-search list responses must stay below an agreed serialized-byte ceiling;
- course-search results must have stable pagination and ordering;
- list results must not contain detail-only history;
- public routes must not include dashboard-only chunks;
- persisted graduation state must have an explicit schema version and migration tests.

## Existing decisions to preserve

- ADR-0001: graduation rules remain a versioned static catalog committed to the repository. Moving catalog reading to server-only code does not require a runtime database for those rules.
- ADR-0002: calculated graduation requirements continue to use named evaluators with explicit parameters and sources.
- ADR-0004: timetable plans remain separate from completed-term records. Shared browsing infrastructure must not merge their domain objects.
- ADR-0005: ReactFlow, charts, and Excel export already use appropriate demand-loading or motion constraints and are not the primary browser-weight problem.
