# Use Crisp Accessible Motion for Workflow UI

Interactive workflow screens should prioritize immediate feedback, stable scanning, and reduced-motion accessibility over decorative motion. Shared UI primitives should carry the default motion rules: avoid `transition-all`, animate only specific GPU-friendly properties where possible, honor `prefers-reduced-motion`, keep frequent interactions short or static, and reserve richer motion for landing or rare explanatory moments where it does not slow repeated work.
