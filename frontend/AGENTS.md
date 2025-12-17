AGENTS.md

Purpose

This file documents concise, pragmatic guidelines for automated agents (e.g., Copilot CLI) working on this frontend project so changes are small, testable and predictable.

Quick commands

- Install / run dev: npm install && npm run dev
- Build (TypeScript + Vite): npm run build
- Run tests (CI style): npm run test -- --run
- Run linter: npm run lint

Edit & commit rules (must follow)

- Make the smallest possible change to fix the issue. Prefer surgical edits over wide refactors.
- Always run the TypeScript build (npm run build) and tests (npm run test -- --run) after edits that touch code.
- Run the linter (npm run lint) and fix lint errors if they are related to the change; do not add new lint rules.
- Use git mv for renames when possible to preserve history; stage and commit logically grouped changes with a short conventional commit message (e.g., "fix(component): ...", "chore(hooks): rename ...").
- Do not add secrets or private data to the repo.

Search & refactor guidance

- Use repo-aware search (git grep, ripgrep) to find usages when renaming files/exports.
- Prefer updating imports to use index re-exports after colocating components, not updating every callsite to a deeper path unless necessary.
- When changing public API (exported hook/component name), update both filename and all usages; run build and tests.

Component & project conventions

- Colocate component files: use a PascalCase folder per component under src/features/*/components/ComponentName with:
  - ComponentName.tsx (component implementation)
  - ComponentName.spec.tsx (tests)
  - index.tsx (re-export default) — keeps imports stable (import X from './X')
  - optional Component.module.css or styles
- Hooks live under src/features/<feature>/hooks and should be named with the `use` prefix and singular semantics (useResource, useResources, useDeleteResource).
- Types live under src/features/<feature>/types and are imported with relative paths adjusted when files are moved.

Testing guidance

- Tests are run with Vitest in CI mode via: npm run test -- --run. Use this command when verifying changes.
- Prefer updating test fixtures to match type definitions rather than casting to any; when fixtures are awkward, use narrow, explicit types.

TypeScript notes

- Keep types strict. If a test or fixture is missing required properties, prefer adding the required fields or typing fixtures explicitly.
- If a change introduces type regressions across many files, prefer incremental fixes limited to directly related tests or files.

When you (the agent) are uncertain

- Make only the minimal change and run build/tests; if tests fail beyond the scope of the change, report back with failing test names and stack traces and do NOT attempt wide refactors without explicit human approval.

Contact / context

- Repo root for these guidelines: frontend/
- This document is a quick operational checklist; it does not replace human review—always create a short commit and let maintainers review larger design changes.
