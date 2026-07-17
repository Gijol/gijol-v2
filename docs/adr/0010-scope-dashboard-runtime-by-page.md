# ADR-0010: Scope dashboard runtime by page

- Status: Accepted
- Date: 2026-07-16

## Context

The global Next.js `_app` imported the dashboard shell, graduation persistence metadata, Sheet navigation, React Query, its development tools, theme runtime, and toast rendering before deciding whether the current pathname was a dashboard page. Public pages received a pass-through `Layout` but still inherited its imports in the shared application chunk.

The Pages Router does not provide nested route layouts, but it supports a per-page `getLayout` Interface.

## Decision

`_app` owns only truly global concerns: viewport metadata, default SEO, the local font, global CSS, and analytics. Every dashboard page explicitly selects a runtime through `getLayout`.

All dashboard layouts return the same outer `DashboardRuntime`, preserving shell state across dashboard navigation. Optional runtime concerns are narrower Adapters:

- `dashboardLayout` provides only the dashboard shell;
- `graduationLayout` adds toast rendering for routes that issue graduation notifications;
- `timetableLayout` adds React Query caching and development tools around timetable content.

The dashboard `Layout` no longer inspects the pathname or implements a public pass-through branch. A post-build check reads every JavaScript chunk reachable from `/_app` and the public index route, rejects dashboard fingerprints, and enforces a 152 KiB gzip JavaScript budget. The budget includes route dependency chunks rather than only the page entry chunk.

## Consequences

The optimized `_app` chunk fell from 230,904 raw / 69,424 gzip bytes to 20,164 raw / 6,120 gzip bytes. The public `/` First Load result fell from 195 KiB to 147 KiB in the production build. Dashboard routes retain the shell, while Query and toast providers are loaded only by their consumers. Adding a dashboard page now requires choosing its runtime explicitly, which is protected by a source-level route-scope test.
