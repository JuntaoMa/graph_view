# Known Issues

## G6 destroy warnings during development
- Symptoms: Console shows `[G6 v5.x] The graph instance has been destroyed` and `Cannot read properties of undefined (reading 'draw')`.
- Likely cause: React StrictMode triggers mount/unmount while `graph.render()`/`layout()`/`fitView()` async tasks are still running.
- Impact: Mostly dev-only noise; production is usually unaffected.
- Status: Not fixed yet. Investigate a StrictMode-safe graph lifecycle or a single graph instance strategy.

