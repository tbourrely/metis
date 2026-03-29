# AGENTS.md — Metis Coding Agent Guidelines

This file provides operational instructions for automated coding agents working in this repository. Make the smallest possible change to fix an issue. Prefer surgical edits over wide refactors.

---

## Repository Structure

Monorepo with two independent workspaces. Each has its own `node_modules`, build toolchain, and test runner.

```
backend/   NestJS API (Node, TypeScript, Jest, TypeORM, PostgreSQL)
frontend/  React SPA (Vite, TypeScript, Vitest, TanStack Router, Tailwind)
```

---

## Backend Commands

All commands run from `backend/`.

| Task | Command |
|------|---------|
| Install | `npm install` |
| Build | `npm run build` |
| Dev server | `npm run start:dev` |
| Lint (auto-fix) | `npm run lint` |
| Format | `npm run format` |
| All tests | `npm test` |
| Single test file | `npx jest --testPathPatterns="<filename>"` |
| Single test by name | `npx jest --testPathPatterns="<file>" --testNamePattern="<name>"` |
| Watch mode | `npm run test:watch` |
| Coverage | `npm run test:cov` |
| E2E tests | `npm run test:e2e` |

> **Note:** `--testPathPattern` was replaced by `--testPathPatterns` in Jest 30.

---

## Frontend Commands

All commands run from `frontend/`.

| Task | Command |
|------|---------|
| Install | `npm install` |
| Build | `npm run build` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| All tests | `npm run test -- --run` |
| Single test file | `npx vitest run src/path/to/file.spec.tsx` |
| Watch mode | `npm test` |

> Always use `npm run test -- --run` (not `--watch`) in CI / after edits to verify nothing is broken.

---

## Definition of Done

**A task is not complete until all of the following pass with zero errors in the relevant workspace(s):**

1. **Build:** `npm run build` — no TypeScript or compilation errors.
2. **Lint:** `npm run lint` — no lint errors. Fix any introduced by the change; do not add new lint rules or disable existing ones.
3. **Tests:** all relevant tests pass — run the full suite (`npm test` / `npm run test -- --run`) or at minimum the files touched by the change.

Do not consider work done, and do not ask for review, until these three checks are green. If a pre-existing test outside the scope of the change fails, report the name and stack trace and stop — do not attempt broad fixes without explicit approval.

---

## Backend Code Style

### TypeScript

- `strict: true` equivalent enforced: `noImplicitAny`, `strictNullChecks`, `strictBindCallApply`.
- Target: `ES2023`, module system: `nodenext`.
- Path aliases: `@modules/*` → `src/modules/*`, `@libs/*` → `src/libs/*`.
- Do not use `as any` unless absolutely necessary (the ESLint rule `@typescript-eslint/no-explicit-any` is off, but use explicit types instead).
- When dealing with `any`-typed third-party data, narrow via `as Record<string, unknown>` and access with `?.['key']` rather than `.key`.

### Formatting (Prettier)

- Single quotes (`'`).
- Trailing commas everywhere (`"trailingComma": "all"`).
- Enforced via `eslint-plugin-prettier`; run `npm run format` to auto-fix.

### Imports

- Use `@modules/` and `@libs/` path aliases for cross-module imports, not relative `../..` paths.
- Relative imports within the same feature/command are fine.
- Group: external packages first, then internal aliases, then relative.
- Use `import type` for type-only imports.

### Architecture

- CQRS via `@nestjs/cqrs`: commands live in `src/modules/<module>/commands/<action>/`, queries in `queries/<action>/`.
- Each command folder contains: `<action>.command.ts`, `<action>.dto.ts`, `<action>.http.controller.ts`, `<action>.service.ts`, `<action>.service.spec.ts`.
- Domain objects live in `domain/`: `resource.entity.ts`, `resource.types.ts`, `resource.errors.ts`.
- Dependency injection uses string tokens from `di-tokens.ts`; inject with `@Inject(TOKEN)`.
- Use `oxide.ts` `Result<T, E>` (`Ok`, `Err`, `match`) for fallible operations — never throw from services, return `Err(...)` instead.
- Controllers map `Result` errors to HTTP exceptions (`ConflictException`, `InternalServerErrorException`, etc.).

### Error Handling

- Domain errors extend `Error` with descriptive messages (see `resource.errors.ts`).
- Services return `Result<T, Error>` — never throw.
- Controllers use `match(result, { Ok: ..., Err: ... })` to convert to HTTP exceptions.
- Gateways catch exceptions internally and return `Err(new Error(...))`.

### Naming Conventions (Backend)

- Classes: `PascalCase` (e.g., `CreateService`, `ResourceEntity`).
- Files: `kebab-case` with dot-separated segments (e.g., `create.service.ts`, `resource.gateway.ts`).
- Constants/tokens: `SCREAMING_SNAKE_CASE` (e.g., `RESOURCE_REPOSITORY`).
- Methods/variables: `camelCase`.
- Test files: `<name>.spec.ts` colocated next to the file under test.

### Testing (Backend — Jest)

- Test files match `*.spec.ts` under `src/`.
- Use `@nestjs/testing` `Test.createTestingModule` for service unit tests; provide mock implementations via `useValue: { method: jest.fn() }`.
- Spy with `jest.spyOn(...).mockResolvedValue(...)` — never mutate the real implementation.
- For integration tests that hit real networks: mock the parts that cannot run in Jest (e.g., `pdf-parse` requires `--experimental-vm-modules`; spy on the method instead).
- Avoid relying on real DNS timeouts — mock `globalThis.fetch` and private methods to fail fast.
- Use `jest.spyOn(instance as any, 'privateMethod')` to spy on private methods when needed.
- `mockGetInfo` and similar module-level mocks: use `getMockImplementation()` to check if a mock is configured before delegating.
- Always call `mockReset()` in `beforeEach` for shared mocks.

---

## Frontend Code Style

### TypeScript

- `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`.
- Target: `ES2022`, module: `ESNext`, bundler resolution.
- Never cast to `any` in tests — add required fields to fixtures instead.

### Formatting

- Double quotes for JSX attributes (Vite default).
- ESLint enforces `react-hooks` and `react-refresh` rules.

### Component Conventions

- PascalCase folder per component: `src/features/<feature>/components/ComponentName/`
  - `ComponentName.tsx` — implementation
  - `ComponentName.spec.tsx` — tests
  - `index.tsx` — re-exports default (keeps import paths stable)
- Hooks: `src/features/<feature>/hooks/use<Name>.ts`, named with `use` prefix, default export.
- Types: `src/features/<feature>/types/<name>.ts`, plain `type` aliases (not `interface` unless extending).
- Shared utilities: `src/lib/`.

### Naming Conventions (Frontend)

- Components/pages: `PascalCase`.
- Hooks: `camelCase` with `use` prefix (e.g., `useCreateResource`, `useDeleteResource`).
- Files: match the export name (`ComponentName.tsx`, `useHookName.ts`).
- Routes: generated in `src/routeTree.gen.ts` — do not edit manually.

### Error Handling (Frontend)

- Hooks expose `{ error: Error | null, loading: boolean }` state.
- HTTP errors: check `res.ok` and `res.status`; throw `new Error(...)` with descriptive messages.
- Use `try/catch/finally` in async functions; always reset loading state in `finally`.

### Testing (Frontend — Vitest)

- Test files: `*.spec.tsx` or `*.spec.ts` colocated next to the source file.
- Test environment: `jsdom`; setup file at `src/test/setup.ts`.
- Use `@testing-library/react` for component tests.
- Run CI-style: `npm run test -- --run` (exits after one pass, no watch).
- Prefer real fixtures with explicit types over `as unknown as T` casts.

---

## General Rules

- Make the smallest possible change. No wide refactors without explicit human approval.
- Do not commit secrets or private data.
- Use `git mv` for renames to preserve history.
- Conventional commit messages: `fix(scope): ...`, `feat(scope): ...`, `chore(scope): ...`.
- If tests fail beyond the scope of the change, report the failing test names and stack traces — do not attempt broad fixes unilaterally.
- Search with `rg` (ripgrep) or `git grep` before renaming exports to find all usages.
