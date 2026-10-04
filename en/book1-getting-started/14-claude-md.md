# CLAUDE.md and AGENTS.md

> Verified on 2026-10-04 with Claude Code 2.1.289.

## The problem: Claude does not know you yet

Every time you start a new Claude Code session, Claude begins fresh. It does not know that you prefer TypeScript, that your tests run with Vitest, or that the project's API code lives in `src/api/handlers/`. In a short session you can just say so. Across a long project, repeating yourself gets old, and on a team it means everyone gets slightly different behavior.

The fix is a plain text file that Claude reads at the start of every session. Claude Code's own name for it is `CLAUDE.md`. Many other coding tools read a similar file called `AGENTS.md`, and Claude Code can now read that too. This chapter covers both.

You do not need to be a programmer to write one. If you can write a checklist for a new colleague, you can write a CLAUDE.md.

## What CLAUDE.md is

`CLAUDE.md` is a Markdown text file. You put it in your project folder, and Claude Code loads it into the conversation at the start of each session. Think of it as an onboarding note for a very fast, very literal new hire who forgets everything overnight.

Two honest limits, straight from the documentation:

- Claude treats CLAUDE.md as context, not as enforced configuration. It tries to follow it, but there is no guarantee. If something must happen every time (for example "run the formatter before every commit"), use a hook instead. Hooks are covered in [Hooks](/en/book2-advanced/09-hooks).
- The more specific and short your instructions are, the more reliably Claude follows them.

### Generate a first draft with /init

Inside a Claude Code session, run:

```
/init
```

Claude looks at your project and writes a starting `CLAUDE.md` with the build commands, test instructions, and conventions it can discover. If you already have one, `/init` suggests improvements instead of overwriting it. `/init` also reads other tools' rule files (Cursor rules in `.cursor/rules/` or `.cursorrules`, and Copilot rules in `.github/copilot-instructions.md`) and folds the useful parts in.

Treat the result as a draft. Then add what Claude cannot discover on its own: why you made a decision, what must never happen, who the users are.

## Where CLAUDE.md files can live

There are four places, from broadest to most specific:

| Scope | Location | Who it applies to |
| --- | --- | --- |
| Managed policy | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux and WSL: `/etc/claude-code/CLAUDE.md`; Windows: `C:\Program Files\ClaudeCode\CLAUDE.md` | Everyone on a company-managed machine |
| User | `~/.claude/CLAUDE.md` | You, in every project |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` | Everyone working on the project (usually committed to git) |
| Local | `./CLAUDE.local.md` | You, in this project only. Add it to `.gitignore` |

Two things the first edition of this handbook got wrong or left out:

**Precedence is not "highest wins."** Claude Code does not pick one file and discard the others. It concatenates every file it finds into the context, ordered from broadest scope to most specific, so the project file is read after your user file, and `CLAUDE.local.md` is read last at its level. If two files disagree, Claude may follow either one. Keep them consistent rather than counting on one to override the other. The one exception is the managed policy file: individual users cannot exclude it.

**Folders above you count too.** Claude Code loads `CLAUDE.md` and `CLAUDE.local.md` from the folder you started in and every folder above it. Files in subfolders below you are loaded on demand, when Claude reads a file in that subfolder. That makes a subfolder CLAUDE.md a good place for rules that only matter in one part of a large project.

## Share one file with other tools: AGENTS.md

`AGENTS.md` is a Markdown file of instructions for AI coding agents, used by several tools. If your repository already has one, you do not need to copy it into a second file for Claude.

Starting with Claude Code 2.1.277 (released 2026-09-18), Claude reads `AGENTS.md` as your project instructions when there is no `CLAUDE.md`. Version 2.1.281 extended this to sessions on Amazon Bedrock, Google Vertex AI (Agent Platform), Microsoft Foundry, LLM gateways and sessions with telemetry disabled; on older versions those sessions read `CLAUDE.md` only. Here is the default behavior:

| Your repository has | Claude reads |
| --- | --- |
| An `AGENTS.md` and no `CLAUDE.md` or `CLAUDE.local.md` in your folder or above it | The `AGENTS.md` |
| An `AGENTS.md` and a `CLAUDE.md` (or `CLAUDE.local.md`) | The `CLAUDE.md` files only |
| A `CLAUDE.md` that imports `AGENTS.md` | The `CLAUDE.md`, with the `AGENTS.md` included through the import |

Your personal `~/.claude/CLAUDE.md`, a company-managed CLAUDE.md, and `.claude/rules/` files do not count for this check. They keep loading alongside `AGENTS.md`.

When Claude reads `AGENTS.md` this way, you see a line in the conversation such as `no CLAUDE.md found; AGENTS.md loaded: /path/to/AGENTS.md`.

### The best setup for a team that uses several tools

Keep `AGENTS.md` as the one shared file, and add a small `CLAUDE.md` next to it that imports it:

```markdown
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

Claude reads the imported file first, then your Claude-specific notes below. Other tools keep reading `AGENTS.md` and never see the Claude section. If you do not need any Claude-specific notes, a symlink also works (`ln -s AGENTS.md CLAUDE.md`), but on Windows use the import instead, because symlinks there need special permissions.

### Make Claude read both files

Type `/config` in a session and change **Project instructions**. The values are:

| Value | What Claude reads |
| --- | --- |
| `claude-md-or-agents-md` (default) | `CLAUDE.md` files, or `AGENTS.md` if there is no CLAUDE.md |
| `claude-md-and-agents-md` | Both, `CLAUDE.md` first |
| `claude-md` | `CLAUDE.md` only |
| `managed-only` | Only your organization's managed CLAUDE.md, plus auto memory |

Watch for one trap: adding a personal `CLAUDE.local.md` to a project that relies on `AGENTS.md` counts as having a CLAUDE.md, so Claude stops reading `AGENTS.md`. Set the option to `claude-md-and-agents-md` to keep both.

If Claude does not seem to know what your AGENTS.md says, see [Troubleshooting](/en/book1-getting-started/troubleshooting#claude-ignores-my-agents-md).

## Writing your first CLAUDE.md

Create a file named `CLAUDE.md` in your project folder. Here is a small, realistic example for a personal portfolio site:

```markdown
# My Portfolio Site

## Build and run

- `npm install` installs dependencies
- `npm run dev` starts the preview on port 3000
- `npm test` runs the tests; they must pass before any commit

## Rules for this project

- Images go in `public/images/` and must be WebP, under 200 KB
- The site has exactly four pages: Home, Work, About, Contact. Ask before adding one
- Colors come from `tailwind.config.ts`. Never hard-code a hex value
- All page text lives in `src/content/data.ts`. The owner edits that file directly, so keep its format simple

## Context

This is a portfolio for a graphic designer. Visual polish matters more than feature count. The owner is not technical.
```

The principle: **write down what Claude cannot work out by reading the code.** Build commands and folder layout are discoverable. "Images must be WebP under 200 KB" and "the owner edits `data.ts` by hand" are decisions only you know.

### What makes an instruction work

- **Be concrete.** "Use 2-space indentation" beats "format code nicely." "API handlers live in `src/api/handlers/`" beats "keep files organized."
- **Make it checkable.** "Run `npm test` before committing" is something you can verify. "Write robust code" is not.
- **Keep it short.** Aim for under 200 lines per file. Long files use more of Claude's working memory and reduce how well it follows each rule. Claude Code warns you at startup if a file is over the recommended length, and skips a file larger than 4 MiB.
- **Do not contradict yourself.** If two rules clash, Claude may pick either. Review your files from time to time.
- **Leave notes for humans.** Block-level HTML comments (`<!-- note to maintainers -->`) are stripped before the file reaches Claude, so they cost nothing.

To have Claude audit your instruction files for stale or conflicting content, run `/doctor prompt-audit` (needs Claude Code 2.1.283 or later). It reports findings and proposes edits; nothing changes until you ask.

### Split a long file: imports and rules

**Imports.** Write `@path/to/file` inside a CLAUDE.md and Claude loads that file too:

```markdown
See @README for the project overview and @docs/git-instructions.md for our git workflow.
```

Relative paths are resolved from the file that contains the import, and imports can chain up to four levels deep. Imports help you organize, but they do not save space: imported files load at startup like everything else. To mention a path without importing it, wrap it in backticks.

**Rules.** For instructions that only matter in part of the project, put one Markdown file per topic in `.claude/rules/`, for example `testing.md`. A rule file can include a `paths` list at the top, and then it loads only when Claude works with matching files:

```markdown
---
paths:
  - "src/api/**/*.ts"
---

- All API endpoints must validate their input
- Use the standard error response format
```

Rules without `paths` load at startup like CLAUDE.md. Personal rules that apply to every project go in `~/.claude/rules/`. Instructions that are a multi-step procedure are better packaged as a skill, which loads only when needed (see [Custom Skills](/en/book2-advanced/02-custom-skills)).

## CLAUDE.md or just telling Claude in chat?

For a one-off request, chat is fine. CLAUDE.md wins when you want the instruction to apply every time:

1. **Consistency.** Every session and every teammate gets the same instructions.
2. **History.** In git, a change to the standards comes with a commit message saying why.
3. **It survives `/compact`.** When a long conversation is summarized to free up space, the project-root CLAUDE.md is re-read from disk. Something you only said in chat may be lost.

A good habit from the documentation: add a line to CLAUDE.md when Claude makes the same mistake twice, when a code review catches something Claude should have known, or when you catch yourself typing the same correction again.

### Check that it worked

1. Start a new session in the project folder and run `/context`. Under **Memory files** you should see your `CLAUDE.md` (or `AGENTS.md`).
2. Run `/memory`. It lists the instruction files and auto memory locations Claude can see; open any of them from there.
3. Ask Claude something your file answers, such as "What command runs the tests in this project?" The answer should match what you wrote.

If a file is missing from the list, it is in a location that is not loaded for this session. If it is listed but ignored, make the wording more specific and look for contradictions.

## Sources

- Anthropic, "How Claude remembers your project" (CLAUDE.md, AGENTS.md, rules, imports, troubleshooting), Claude Code documentation, accessed 2026-10-04. https://code.claude.com/docs/en/memory
- Anthropic, Claude Code Glossary (AGENTS.md, CLAUDE.md, system reminder), accessed 2026-10-04. https://code.claude.com/docs/en/glossary
- Anthropic, Claude Code commands reference (`/init`, `/memory`, `/context`, `/doctor`), accessed 2026-10-04. https://code.claude.com/docs/en/commands

Next: [Memory](/en/book1-getting-started/15-memory)
