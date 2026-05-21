# Copilot Instructions

## Database Migrations

- When generating a TypeORM migration for the database workspace, run:
  `pnpm migration:generate <proposed migration name>`
- Run that command from `workspaces/database`.
- MUST `cd` to the `database` workspace before running the migration command, as the migration name is resolved relative to the `migrations` directory in that workspace.
