# Chapter 14: CLAUDE.md — Your AI's Instruction Manual

## The Problem Claude Code Doesn't Know You Yet

Every time you start a new Claude Code session, Claude begins fresh. It does not know that you prefer TypeScript over JavaScript. It does not know that you use Prettier for formatting and Vitest for tests. It does not know that your project's API handlers live in `src/api/handlers/` or that you never commit directly to main.

In a short session, this is fine — you give Claude context as you work. But across a long project, repeating the same context in every session is tedious. And on a team, ensuring every developer gets the same Claude behavior requires something more systematic.

That something is `CLAUDE.md`.

---

## What CLAUDE.md Is

`CLAUDE.md` is a plain text file written in Markdown that you place in your project. Claude Code reads it automatically at the start of every session.

Think of it as an employee onboarding document — except this employee is Claude, and it reads the document flawlessly every single time without forgetting anything.

You can also generate a starting CLAUDE.md automatically. Inside a Claude Code session, run:

```
/init
```

Claude will analyze your project and create a `CLAUDE.md` with build commands, test instructions, and conventions it discovers. From there, you refine it with things Claude would not discover on its own: business context, team preferences, architectural decisions.

Whatever you put in CLAUDE.md, Claude treats as context for the current session. Write good instructions and Claude will follow them consistently. Write vague instructions and results will vary.

---

## The Hierarchy: Global, Project, Directory

CLAUDE.md files can exist in three different locations, each with different scope. More specific locations take precedence over broader ones.

### Global CLAUDE.md — Applies to All Your Projects

Located at: `~/.claude/CLAUDE.md`

This is your personal instruction set that applies everywhere, across all your projects. Good candidates:

- Your coding style preferences (tabs vs. spaces, quote style)
- Your preferred libraries for common tasks
- Personal workflow shortcuts you want Claude to know
- How you like explanations structured

Example:
```markdown
## Personal Preferences

- I prefer tabs for indentation, 2 spaces wide
- Always use TypeScript, never plain JavaScript
- I use pnpm as my package manager, not npm or yarn
- When writing tests, use Vitest and the describe/it pattern
- Explain things at an intermediate level — I know the basics
  but do not assume deep expertise
```

### Project CLAUDE.md — Applies to One Project

Located at: `./CLAUDE.md` or `./.claude/CLAUDE.md` (in your project folder)

This is the most important one for day-to-day work. It lives in your project repository and is usually committed to version control so your whole team shares it.

Good candidates:
- Build and test commands
- Project architecture overview
- Coding standards for this project
- Important file locations
- What to never do in this project

This file is shared with your whole team through git, so focus on project-level standards rather than personal preferences.

### Directory-Specific CLAUDE.md — Applies to a Subdirectory

You can also put CLAUDE.md files inside subdirectories. Claude loads them when it reads files in those directories.

This is useful in large projects where different parts of the codebase have different conventions — the frontend might have different rules than the backend, for example.

---

## Writing Your First CLAUDE.md

Create a file named `CLAUDE.md` in your project root. Here is a solid template to start from:

```markdown
# Project Name: My Portfolio Site

## Build & Run

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build for production: `npm run build`
- Run tests: `npm test`

## Project Structure

- `src/components/` — React components
- `src/pages/` — Top-level page components
- `src/api/` — API utility functions
- `src/styles/` — Global CSS files
- `public/` — Static assets

## Coding Standards

- Use TypeScript for all new files
- Components use functional style with hooks, no class components
- Use 2-space indentation
- All API functions should include error handling

## Important Rules

- Never commit directly to main branch
- Never hardcode API keys or secrets in code
- Run `npm test` before committing
- All new components need a corresponding test file

## Context

This is a personal portfolio site for a graphic designer. The main
goals are: visual appeal, fast loading, and easy content updates.
We are not using a CMS — content is hard-coded for simplicity.
```

---

## Writing Effective Instructions

The way you write instructions significantly affects how well Claude follows them. Here are the patterns that work best:

### Be concrete and specific

Not specific: "Format code properly."
Specific: "Use 2-space indentation. Single quotes for strings. Trailing commas in multi-line arrays and objects."

Not specific: "Keep things organized."
Specific: "API handlers live in `src/api/handlers/`. Database models live in `src/models/`. Utility functions live in `src/utils/`."

### Use verifiable instructions

Instructions that describe something you can check work better than instructions about abstractions:

Good: "Every API endpoint must include a try/catch block"
Hard to verify: "Write robust code"

### Keep the file concise

Target under 200 lines. Claude reads the entire CLAUDE.md at the start of every session. A bloated file:
1. Consumes more context (the context window has limits)
2. Dilutes the signal — important rules get lost in noise
3. Is harder for Claude to adhere to consistently

If you have a lot to document, use references to other files:

```markdown
## Architecture

See @docs/architecture.md for the full architecture overview.

## API Guidelines

See @docs/api-guidelines.md for API design standards.
```

The `@` syntax tells Claude to also read those files.

### Avoid contradictions

If two rules say different things about the same situation, Claude may pick one arbitrarily. Review your CLAUDE.md periodically for conflicts.

---

## Common Patterns From Real Projects

### Pattern: Team workflow rules

```markdown
## Git Workflow

- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Commit messages follow Conventional Commits format
- PRs require at least one review before merging
- Never force-push to main or develop branches
- Squash commits when merging feature branches
```

### Pattern: Code style rules

```markdown
## Code Style

- TypeScript strict mode is enabled — no `any` types
- Use explicit return types on all functions
- Prefer named exports over default exports
- Keep files under 400 lines; split large files into modules
- No console.log in production code; use the logger utility
```

### Pattern: Project context for better suggestions

```markdown
## Project Context

This is a B2B SaaS application for construction project management.
Users are primarily project managers and site supervisors, not
technical users. Design decisions should prioritize clarity over
cleverness. The main user action is reviewing and approving material
orders.

## Performance Constraints

- This app is used on construction sites with slow mobile connections
- Keep bundle size small; avoid large dependencies
- Prefer lazy loading for non-critical features
```

### Pattern: Do/don't lists

```markdown
## Do

- Use the existing `Button` component for all buttons
- Check the `src/utils/validators.js` file before writing new validation
- Add JSDoc comments to all exported functions

## Don't

- Don't install new dependencies without team discussion
- Don't modify files in `src/generated/` — they are auto-generated
- Don't use the old `fetch` wrapper in `src/legacy/` — use `src/api/client.js`
```

---

## Viewing Your Loaded Instructions

To see which CLAUDE.md files are currently loaded and take effect in your session, run:

```
/memory
```

This shows every instruction file that Claude has loaded, from all three levels. If an instruction is not being followed, check here first — the file might not be in the right location.

---

## CLAUDE.md vs. Just Telling Claude in Chat

You might wonder: why not just tell Claude what you need at the start of each conversation?

You can, and for one-off tasks, that is often fine. But CLAUDE.md has several advantages:

1. **Consistency.** Every session, every team member, every agent subprocesses — they all get the same instructions automatically.

2. **It is version-controlled.** When you update the standards, the update is in git with a commit message explaining why.

3. **It does not consume your attention.** You are not spending mental energy on "did I remember to tell Claude my preferences?" — they are always there.

4. **It persists across context.** If you run `/compact` to compress a long conversation, your CLAUDE.md instructions survive. One-off instructions in the chat do not.

---

**Next up:** [Chapter 15 — Memory System](./15-memory.md) — How Claude builds up knowledge about your project over time, automatically.
