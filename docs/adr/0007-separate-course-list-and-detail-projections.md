# Separate Course Discovery List and Detail Projections

**Course Discovery** will apply query semantics, facets, stable ordering, page limits, and list projection on the server, returning only the fields needed to render one result page. Description, source references, complete offering groups, manual listings, and match text remain detail data fetched after a user selects a course, because transporting detail history with every list row wastes bandwidth and browser memory, makes pagination misleading, and couples the browser to the static Course Catalog implementation.
