---
name: 'Workspace Architecture And Build Rules'
description: 'Use when working in this monorepo, especially for backend/frontend/database/shared boundaries, TypeScript module format decisions, import extension style, and package-scoped build commands.'
applyTo: '**'
---

# Workspace Architecture Rules

Use these rules whenever you add, modify, or wire code across workspaces.

## Workspace Responsibilities

- `workspaces/backend`: server runtime, HTTP router/controllers/services, and backend-specific orchestration.
- `workspaces/frontend`: SPA client that communicates with backend APIs.
- `workspaces/database`: TypeORM entities, data source, migrations, and DB lifecycle tooling.
- `workspaces/shared`: shared typings/utilities for backend and frontend, including daily.dev related generated/shared types.

## Dependency Boundaries

- Frontend must not add or install `@ye-yu/database` directly.
- Prefer consuming shared contracts through `@ye-yu/shared` for frontend/backend interoperability.
- Keep database-specific logic (TypeORM repositories, migration logic, data source bootstrapping) inside the database workspace.

## Module System Rules

- `workspaces/database` is CommonJS (`"type": "commonjs"`).
- `workspaces/backend`, `workspaces/frontend`, and `workspaces/shared` are ESM (`"type": "module"`).
- Do not change package module type unless explicitly requested.

## TypeORM And Database Rules

- Follow current TypeORM conventions/APIs when adding or updating entities, data source config, and migrations.
- The current database engine is SQLite (`better-sqlite3`), so keep migration/entity changes SQLite-compatible unless asked to change database vendors.
- Generate migrations from the database workspace using the package script flow, not ad-hoc commands.

## Build And Command Rules

- Use package-specific scripts for builds (for example `pnpm --filter @ye-yu/backend build`, or `pnpm build` from the target workspace).
- Do not replace workspace scripts with one-off compile commands unless explicitly requested.
- Prefer `pnpm --filter <package> <script>` from repo root for targeted workspace operations.

## Import And TS Syntax Rules

- Use literal file-name imports with explicit `.ts` extensions for local TypeScript module paths in ESM workspaces (`backend`, `frontend`, `shared`), matching the repository's `verbatimModuleSyntax` and runtime strategy.
- Database workspace import style follows CommonJS/runtime conventions and may not require `.ts` extensions in the same way.
- Keep import/export syntax aligned with each workspace module mode (ESM vs CommonJS).

## Generated Output Handling

- Do not hand-edit generated build artifacts such as `workspaces/database/build/**` or workspace `dist/**` outputs.
- Apply changes in source files (`src/**`, bin generators, configs), then rebuild/regenerate.

## Daily.dev Shared Types

- If backend/frontend needs daily.dev contracts, source them from `workspaces/shared` exports rather than duplicating types in consumer workspaces.
