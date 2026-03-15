# Chapter 19: CLAUDE.md Best Practices

## What Makes a CLAUDE.md Effective

After working through the mechanics of CLAUDE.md in previous chapters, this chapter focuses on what actually works in practice — patterns that produce consistent, high-quality Claude behavior across different project types.

The core principle: CLAUDE.md is loaded into every session and consumes tokens every time. This means more is not better. A CLAUDE.md that is 500 lines long will cause Claude to ignore half of it, because no model reliably follows a huge block of instructions equally. The most effective CLAUDE.md files are ruthlessly focused: they contain only the things that would cause Claude to make a specific, concrete mistake if omitted.

---

## What to Include vs Exclude

**Include:**

- Bash commands Claude cannot guess from the project structure (`pnpm` instead of `npm`, non-standard test patterns)
- Code style rules that diverge from widely-used defaults
- Architectural decisions that constrain where code should live
- Non-obvious environment requirements
- Repository-specific workflows (branch naming, commit format, PR conventions)
- Common gotchas or non-obvious behaviors discovered through experience

**Exclude:**

- Standard conventions Claude already knows (REST conventions, common naming patterns)
- Things Claude can discover by reading the code
- Detailed API documentation for well-known public libraries
- Anything that changes frequently
- Long explanations or tutorials (link to docs instead)
- Self-evident advice ("write clean code," "think before acting")

**The test for any line in CLAUDE.md:** "Would removing this cause Claude to make a specific mistake on this project that it would not make on a typical project?" If the answer is no, the line does not belong.

---

## Project-Type Templates

### Web Application Template

```markdown
# [Project Name]

## Quick Reference
- Dev server: `pnpm dev` (port 5173)
- Tests: `pnpm test` (Vitest)
- Build: `pnpm build`
- Lint: `pnpm lint` — run after file edits
- Type check: `pnpm typecheck`

## Architecture
- API routes: src/server/routes/ (one file per resource)
- Business logic: src/server/services/ (routes should be thin)
- Database queries: src/server/db/queries/ (no SQL outside this dir)
- React components: src/client/components/ (feature-based, not type-based)
- Shared types: src/shared/types/

## Code Conventions
- Named exports only (no default exports)
- Zod for all runtime validation at API boundaries
- Error handling: domain errors in src/errors/, caught at route level
- Database: Drizzle ORM — do not write raw SQL unless necessary

## Environment
- Copy .env.example to .env before running
- Postgres must be running: `docker compose up db -d`
- Redis required for sessions: `docker compose up redis -d`
```

### REST API / Node.js Backend Template

```markdown
# [Service Name]

## Commands
- Start: `npm start`
- Dev: `npm run dev` (nodemon)
- Test: `npm test` — run all
- Test single: `npm test -- --grep "test name"`
- DB migrations: `npm run migrate`

## Service Architecture
This service owns the [domain] domain.
External dependencies: [list services this calls]
Owned by: [team name]

## API Conventions
- All endpoints versioned: /api/v2/
- Auth via Bearer token in Authorization header
- Errors: { error: string, code: string, details?: object }
- Pagination: { data: [], meta: { total, page, limit } }

## Database
- PostgreSQL via pg driver (no ORM)
- Queries in src/db/queries/ — one file per entity
- Migrations in db/migrations/ — never edit existing migrations

## Critical Rules
- Never log PII (email, name, IP) at INFO level or above
- Rate limit all public endpoints — see src/middleware/rateLimiter.ts
- Input validation required on all POST/PUT/PATCH handlers
```

### Python Library Template

```markdown
# [Library Name]

## Development
- Setup: `uv sync` (uses uv, not pip)
- Tests: `pytest`
- Type check: `mypy src/`
- Lint: `ruff check src/ tests/`
- Format: `ruff format src/ tests/`

## Package Structure
- Public API: exported from src/[package]/__init__.py
- Do not expose internal modules in __init__.py
- Type stubs: src/[package]/py.typed marker required

## Conventions
- Type hints required on all public functions and methods
- Docstrings in NumPy format for public API
- No external dependencies unless unavoidable (this is a library)
- Exception hierarchy defined in src/[package]/exceptions.py

## Testing
- Unit tests: tests/unit/ (no I/O, mock everything external)
- Integration tests: tests/integration/ (marked with @pytest.mark.integration)
- Run integration tests: `pytest -m integration`
```

### Monorepo Template

```markdown
# [Monorepo Name]

## Workspace Commands
- Install all: `pnpm install` (from root)
- Build all: `pnpm -r build`
- Test all: `pnpm -r test`
- Test workspace: `pnpm --filter @company/[package] test`

## Package Structure
- packages/api — REST API server
- packages/web — Next.js frontend
- packages/shared — Shared types and utilities
- packages/ui — Component library

## Cross-Package Rules
- Shared types belong in packages/shared (never copy types between packages)
- No circular dependencies between packages
- Breaking changes to packages/shared require version bump

## Per-Package Instructions
Each package has its own CLAUDE.md with package-specific details.
When working in a specific package, those instructions take precedence.
```

---

## Auto-Triggers and Enforcement Rules

Auto-triggers in CLAUDE.md turn certain behaviors into reliable habits:

```markdown
## Auto-Triggers

After every file edit:
- Run `npm run lint` and fix any new errors

Before every commit:
- Run `npm test` and confirm tests pass
- Run `npm run typecheck` and fix any errors
- Check that no .env files or secrets are staged

When creating a new API endpoint:
- Add it to the API documentation in docs/api.md
- Add at least one happy-path test
- Add input validation
```

For truly non-negotiable rules, back them up with hooks instead of (or in addition to) CLAUDE.md instructions. Hooks are deterministic; CLAUDE.md instructions are advisory.

```json
// .claude/settings.json — hooks as enforcers for critical rules
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --silent",
            "description": "Auto-lint after file edits"
          }
        ]
      }
    ]
  }
}
```

---

## Environment-Specific Configurations

Different team members have different local setups. Handle this with a personal override pattern:

```markdown
# In the shared project CLAUDE.md:
For personal tool preferences, see @~/.claude/my-overrides.md if it exists.
```

Each developer creates their own `~/.claude/my-overrides.md` with personal settings (preferred test runner flags, editor preferences, etc.) that do not get committed.

For truly environment-specific settings, use conditional logic in your CLAUDE.md:

```markdown
## Environment Notes
If running on Apple Silicon Mac, use `arch -arm64 brew` for homebrew commands.
If running in a Docker container, database is at host `db` not `localhost`.
If GITHUB_ACTIONS is set in environment, skip any interactive confirmations.
```

---

## Team-Wide Standards

When sharing CLAUDE.md across a team, the file becomes a living specification of team standards. Treat it accordingly:

**Version control it.** CLAUDE.md belongs in your repository. Every team member gets the current version when they pull.

**Review it like code.** Changes to CLAUDE.md should go through your normal code review process. A poorly written instruction can cause incorrect behavior for the entire team.

**Evolve it actively.** As your team discovers patterns — correct behaviors to enforce, common mistakes to prevent — add them to CLAUDE.md. The file compounds in value over time.

**Keep a changelog.** Add a brief changelog section or rely on git history. When something stops working, you want to know when the relevant instruction was added or changed.

---

## Anti-Patterns to Avoid

**The over-specified CLAUDE.md.** Every instruction added reduces how much attention Claude pays to every other instruction. Aim for under 200 lines. If you find yourself adding the 50th rule, review whether existing rules are still earning their place.

**Conflicting instructions.** If CLAUDE.md says "use single quotes" and a nested subdirectory CLAUDE.md says "use double quotes," Claude may pick one arbitrarily. Audit for conflicts regularly. The `/memory` command lists all loaded CLAUDE.md files.

**Instructions for things Claude already does correctly.** Instructions that Claude would follow anyway are wasted tokens. If you remove an instruction and Claude's behavior does not change, the instruction should not be there.

**The novelization.** Long paragraphs of explanation instead of concise rules. Claude follows bullet points more reliably than prose paragraphs for operational instructions. Save the narrative prose for when explanation genuinely aids understanding.

**Stale instructions.** As your project evolves, some CLAUDE.md instructions become outdated or wrong. A stale migration command that no longer works is worse than no command — it causes Claude to fail in a confusing way. Review your CLAUDE.md quarterly.

**Over-reliance on CLAUDE.md for transient context.** CLAUDE.md is for persistent standards. Current task context belongs in conversation, WORK_IN_PROGRESS.md, or a task file — not in CLAUDE.md.

---

## Evaluating Your CLAUDE.md

The best test of a CLAUDE.md is whether Claude's behavior changes when you apply it. After making changes:

1. Start a fresh session
2. Give Claude a task that exercises the rules
3. Observe whether the rules are followed
4. Identify which rules are being ignored (often: they are too vague or buried)

A well-calibrated CLAUDE.md produces noticeably different — and better — behavior compared to working without it. If you cannot observe a difference, the file is not pulling its weight.

---

**Next up:** [Chapter 20 — Team Workflows](./20-team-workflows.md) — Collaboration patterns, shared configuration, and knowledge management for engineering teams.
