# AGENTS.md

Project-specific instructions for Codex agents working in this repo.

## Purpose
Keep a small, stable set of instructions that help agents understand the repo, run the app, and make safe edits without re-discovering context every time.

## Project summary
- Vite + React 18 + TypeScript app
- Graph rendering via AntV G6 v5
- UI via Ant Design v5

## How to run
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`

## Conventions
- Keep edits minimal and focused; prefer small MVP changes first.
- Use G6 v5 APIs (`Graph` class, `node/edge` options, `behaviors`, `setSize`, `fitView`).
- Store labels via `style.labelText` (node/edge) to match G6 v5 rendering.

## Files to know
- `src/App.tsx`: main UI + G6 initialization
- `src/styles.css`: global styles

