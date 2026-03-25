# Chapter 17: Memory Architecture

## Two Memory Systems, One Goal

Claude Code has no persistent memory between sessions by default. Each conversation begins with a fresh context window. But two complementary systems carry knowledge across that boundary:

**CLAUDE.md files** — instructions you write, loaded at the start of every session. Human-authored, deliberate, structured.

**Auto memory** — notes Claude writes itself based on what it learns during sessions. Automatic, accumulative, stored in `~/.claude/projects/<project>/memory/`.

Understanding how each system works, what it is suited for, and how they interact lets you design a memory architecture that makes Claude progressively more effective on your project over time — rather than starting from scratch each session.

---

## The CLAUDE.md System

CLAUDE.md files are plain markdown files that Claude reads at session start. Think of them as a briefing document: they tell Claude what it needs to know before the conversation begins.

### Scope Hierarchy

CLAUDE.md files can exist at multiple levels, each with a different scope:

| Location | Scope | Shared with |
|----------|-------|-------------|
| `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS) or `/etc/claude-code/CLAUDE.md` (Linux) | Organization-wide (managed policy) | All users on the machine |
| `~/.claude/CLAUDE.md` | Personal (all projects) | Just you |
| `./CLAUDE.md` or `./.claude/CLAUDE.md` | Project | Team via version control |
| Subdirectory `./src/api/CLAUDE.md` | Subdirectory (loaded on demand) | Team via version control |

The organization-wide managed policy location is deployed by IT administrators. Individual users cannot override it.

More specific locations take precedence. The hierarchy lets you set organization-wide standards, personal preferences, and project-specific conventions all in the same coherent system.

### What Belongs in CLAUDE.md

CLAUDE.md is loaded into every session — consuming tokens every time. This means you should include only content that genuinely improves Claude's output and would not be obvious from reading the code.

**Good CLAUDE.md content:**

```markdown
# Build and Test
- Build: `npm run build`
- Test: `npm test -- --testPathPattern=` (run single test file, not full suite)
- Lint: `npm run lint` (always run after file edits)
- Type check: `npm run typecheck`

# Architecture
- API handlers live in src/api/handlers/ — one file per resource
- Business logic lives in src/services/ — handlers should be thin
- Database queries go in src/db/queries/ — never write SQL in handlers

# Code Conventions
- Use named exports, not default exports
- Prefer functional components in React
- Error handling: throw domain-specific errors, catch at handler level

# Non-obvious Gotchas
- POSTGRES_URL must be set in .env for tests to run
- Running tests requires the Redis container: `docker compose up redis -d`
- The payment service uses webhooks in dev — start ngrok before testing
```

**Poor CLAUDE.md content** (either obvious, irrelevant, or too detailed):
- "Write clean code" (Claude already tries to do this)
- Detailed API documentation for public libraries (link to docs instead)
- Information that changes every day
- Instructions for every possible scenario (causes the important ones to get lost)

**The conciseness test:** For each line, ask: "Would removing this cause Claude to make a specific mistake on this project?" If not, cut it.

### `.claude/rules/` — Modular, Path-Scoped Instructions

For larger projects, break instructions into topic-specific files in `.claude/rules/`. These can be path-scoped so they only load when Claude is working with matching files:

```
.claude/
├── CLAUDE.md           # Core project instructions (short)
└── rules/
    ├── testing.md      # Test patterns (always loaded)
    ├── api.md          # API conventions (always loaded)
    └── migrations.md   # Database migration rules (always loaded)
```

With path-scoped rules:

```markdown
<!-- .claude/rules/api-handlers.md -->
---
paths:
  - "src/api/handlers/**/*.ts"
---

# API Handler Rules
- Validate all inputs with zod before any processing
- Return 422 for validation errors, 400 for malformed requests
- Never throw raw database errors to the client
- Include request ID in all error responses
```

This rule only loads into context when Claude is editing files in `src/api/handlers/`, keeping it out of context when Claude is working on unrelated files.

### Importing External Files

CLAUDE.md can pull in other files using `@path/to/file` syntax:

```markdown
# Project Overview
See @README.md for project architecture.
Available npm scripts: @package.json

# Team Workflow
@docs/git-workflow.md
```

This keeps your CLAUDE.md short while allowing Claude to access detailed reference material when needed. Imported files are loaded at session start alongside the CLAUDE.md that references them.

---

## Auto Memory

Auto memory is Claude Code's built-in learning system. As you work, Claude observes patterns, corrections, and discoveries and saves notes to a per-project memory directory.

### Storage Location

Auto memory is stored in:
```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Index file (first 200 lines loaded each session)
├── debugging.md       # Debugging patterns Claude has learned
├── api-conventions.md # API design patterns observed
└── environment.md     # Environment setup notes
```

The `<project>` identifier is derived from the git repository, so all subdirectories and worktrees of the same repo share one memory directory.

### What Claude Saves

Claude saves things that would be useful to know at the start of a future session:

- Build commands that were discovered to work
- Test commands for specific modules
- Environment setup steps (discovered when something failed)
- Code patterns observed in the codebase
- Architectural insights from exploring the code
- Preferences you corrected Claude on ("I told Claude to stop doing X, it saved that")

Claude does not save every observation — it is selective about what is worth remembering. A correction you make ("please use single quotes, not double") is likely to be saved. A casual comment is not.

### Viewing and Editing Auto Memory

```text
/memory
```

This command shows all CLAUDE.md files loaded in the current session, lets you toggle auto memory on or off, and provides a link to open the auto memory folder. You can view, edit, or delete any memory file — they are plain markdown.

To explicitly ask Claude to remember something:
```text
Remember that this project uses pnpm, not npm. Always use pnpm commands.
```

Claude saves this to auto memory and applies it in future sessions.

To add something to CLAUDE.md instead:
```text
Add this to CLAUDE.md: always use pnpm, not npm.
```

### Enabling and Disabling Auto Memory

Auto memory requires Claude Code v2.1.59 or later. It is enabled by default. To disable it:

```json
// .claude/settings.json
{
  "autoMemoryEnabled": false
}
```

Or via environment variable:
```bash
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1 claude
```

For most projects, leaving auto memory enabled is beneficial. The memory accumulates useful project knowledge passively. The only reason to disable it is if you want strict control over what Claude knows between sessions (for example, in a security-sensitive environment).

---

## Memory vs CLAUDE.md vs Tasks

These three mechanisms serve different purposes and should not be conflated:

| Mechanism | Written by | When loaded | Best for |
|-----------|-----------|-------------|----------|
| CLAUDE.md | You | Every session start | Persistent rules, conventions, standards |
| Auto memory | Claude | Every session start (first 200 lines of MEMORY.md) | Learned patterns, discovered commands |
| Task files (TODO.md, SPEC.md) | You or Claude | On demand (when Claude reads them) | Current work items, session continuity |

A common pattern for complex projects: CLAUDE.md contains rules and standards, auto memory accumulates project knowledge, and you maintain a TASKS.md file for the current sprint's work that Claude reads at the start of each session:

```markdown
# CLAUDE.md (bottom section)
At the start of each session, read TASKS.md to understand current priorities.
```

---

## Advanced Pattern: Cross-Project Memory

The `autoMemoryDirectory` setting lets you redirect where auto memory is stored. This enables a cross-project memory pattern where related projects share a common knowledge base:

```json
// .claude/settings.json in project-a
{
  "autoMemoryDirectory": "~/shared-memory/platform-team"
}
```

```json
// .claude/settings.json in project-b
{
  "autoMemoryDirectory": "~/shared-memory/platform-team"
}
```

Both projects now accumulate to and read from the same memory directory. Claude's learnings from one project automatically inform work in the other.

This is useful for:
- A frontend and its API server (same domain knowledge)
- Multiple microservices owned by the same team
- A library and its consumer application

**Caution:** cross-project memory can cause confusion if the projects have fundamentally different conventions. Use this pattern only when the projects are genuinely related and share conventions.

---

## Memory File Format and Management

Memory files are plain markdown. Claude uses its standard file tools to read and update them. There is no special format required — Claude creates and maintains the structure naturally.

A typical auto-generated MEMORY.md might look like:

```markdown
# Project Memory

## Build and Environment
- Use `pnpm` not `npm` (corrected 2025-03-08)
- Redis must be running for tests: `docker compose up redis -d`
- POSTGRES_URL must be set in .env

## Testing
- Run single test: `pnpm test -- --testPathPattern=src/api/handlers`
- Integration tests are in tests/integration/ and require DB connection
- See debugging.md for common test failure patterns

## Architecture Notes
- See api-conventions.md for API handler patterns
- Service layer is thin — most logic in domain objects
```

You can edit this file directly. Prune outdated entries, correct wrong information, and add notes yourself. Claude treats your edits as authoritative.

The 200-line limit on the MEMORY.md index is intentional — it forces the index to stay concise while detailed notes live in topic files that Claude reads on demand.

---

## Troubleshooting Memory Issues

**Claude is not following a rule from CLAUDE.md:**

Run `/memory` to verify the file is loaded. Check for conflicting instructions across multiple CLAUDE.md files. Make instructions more specific: "Use 2-space indentation" outperforms "Format code properly." For critical rules, add emphasis: "IMPORTANT: always use pnpm, not npm."

**Claude keeps forgetting something between sessions:**

If Claude keeps re-asking a question you have answered multiple times, the answer has not been saved to memory. Tell Claude explicitly: "Remember for future sessions: [the thing]."

**Memory contains incorrect information:**

Open `/memory`, navigate to the memory folder, and edit the relevant file. Claude's future sessions will use the corrected version.

**Instructions are lost after /compact:**

CLAUDE.md fully survives compaction — Claude re-reads it fresh after compacting. If an instruction was lost, it was given only in conversation (not in CLAUDE.md). Add it to CLAUDE.md to make it persist.

---

**Next up:** [Chapter 18 — Multi-session Workflows](./18-multi-session.md) — Planning and executing work that spans multiple days or weeks.
