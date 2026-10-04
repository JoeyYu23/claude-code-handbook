# Memory Architecture

> Verified on 2026-10-04 with Claude Code 2.1.289.

Every Claude Code session starts with an empty context window. What carries knowledge from one session to the next is a small set of files that load at startup, plus whatever Claude reads on demand. Memory architecture is deciding which knowledge lives where.

Claude Code has two built-in systems. CLAUDE.md files (or AGENTS.md) are instructions you write. Auto memory is notes Claude writes for itself. A third layer has grown up around them: external memory plugins and code-graph indexes, some of them among the most-starred Claude Code repositories on GitHub. This chapter covers the built-ins as they work today, then when an external layer earns its place and when it makes things worse.

For the beginner view of the same features, see [Memory](/en/book1-getting-started/15-memory) and [CLAUDE.md and AGENTS.md](/en/book1-getting-started/14-claude-md).

## Instruction files: CLAUDE.md and AGENTS.md

### Scopes

| Scope | Location | Shared with |
|---|---|---|
| Managed policy | macOS `/Library/Application Support/ClaudeCode/CLAUDE.md`; Linux and WSL `/etc/claude-code/CLAUDE.md`; Windows `C:\Program Files\ClaudeCode\CLAUDE.md` | Everyone in the organization |
| User | `~/.claude/CLAUDE.md` | Just you, all projects |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` (or `AGENTS.md`, see below) | The team, through version control |
| Local | `./CLAUDE.local.md` (add it to `.gitignore`) | Just you, this project |

Two details changed how people should think about this table:

- **Files are concatenated, not overridden.** Claude Code loads CLAUDE.md and CLAUDE.local.md from the working directory and every directory above it, ordered from the filesystem root down, with each directory's CLAUDE.local.md after its CLAUDE.md. Instructions closer to where you launched are read last. Two conflicting files do not resolve cleanly; the docs warn Claude may pick one arbitrarily.
- **Subdirectory files load on demand.** A `src/api/CLAUDE.md` loads when Claude first reads a file in `src/api/`, not at launch.

### AGENTS.md

Since v2.1.277, Claude Code reads `AGENTS.md`, the file Codex and other agents use, when there is no `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` in the working directory or above it. If any of those exist, it reads the CLAUDE.md files instead. To read both, set **Project instructions** to `claude-md-and-agents-md` in `/config`. Sessions on Amazon Bedrock, Vertex (Agent Platform), Foundry, an LLM gateway, or with telemetry off read it only from v2.1.281 (2026-09-23). The alternative that works everywhere is a one-line CLAUDE.md that imports `@AGENTS.md`.

One trap: adding a personal `CLAUDE.local.md` to a repository that relies on `AGENTS.md` makes Claude stop reading `AGENTS.md` for you, because CLAUDE.local.md counts in that check. [Portability](/en/book3-architect/11-portability) covers running one setup across several tools.

### What belongs in instruction files

Instruction files load into every session and are resent on every turn, so the bar is high. Anthropic's July 2026 guidance for Claude 5 generation models is to keep CLAUDE.md for repository-specific gotchas and leave out what Claude can discover from the code. The `/doctor` checkup now proposes trims along exactly that line: it cuts directory layouts, dependency lists, and architecture overviews, and keeps pitfalls, rationale, and conventions that differ from tool defaults.

Good content:

```markdown
# Build and test
- Test one file: `pnpm test -- --testPathPattern=<path>` (the full suite takes 9 minutes)
- `pnpm typecheck` after any change under packages/schema

# Gotchas
- Integration tests need Redis: `docker compose up redis -d`
- The payments service uses webhooks in dev; start the tunnel first
- Never edit files under src/generated/; run `pnpm codegen`
```

Poor content: "write clean code", documentation for public libraries, anything that changes daily, and long procedures. Procedures belong in skills, which load only when used.

The docs' size target is under 200 lines per file. Three tools help you stay there:

- **Path-scoped rules.** Files in `.claude/rules/` with `paths:` frontmatter load only when Claude reads a matching file.
- **Imports** with `@path` organize a long file but do not save context, because imported files load at launch. Import depth is limited to four hops.
- **HTML block comments** are stripped before injection, so maintainer notes cost nothing.

Run `/doctor prompt-audit` (v2.1.283 or later) after every model change to find instructions written for older models, references to files that no longer exist, and files that contradict each other. [Context Engineering](/en/book2-advanced/15-context-engineering) covers the audit in detail.

### Path-scoped rules

```markdown
<!-- .claude/rules/api-handlers.md -->
---
paths:
  - "src/api/handlers/**/*.ts"
---

# API handler rules
- Validate all input with zod before any processing
- Return 422 for validation errors, 400 for malformed requests
- Never return raw database errors to the client
```

This loads only when Claude reads a file under `src/api/handlers/`. The trade-off: path-scoped rules and nested CLAUDE.md files enter the conversation history when they load, so compaction summarizes them away until Claude reads a matching file again. A rule that must always hold belongs in the root CLAUDE.md. A rule that must never be broken belongs in a hook, because instruction files are context, not enforcement.

## Auto memory

Auto memory is on by default in local sessions. As Claude works, it saves notes for itself in `~/.claude/projects/<project>/memory/`. The `<project>` path is derived from the git repository, so all worktrees and subdirectories of one repo share a memory directory.

### What Claude saves, and what it skips

The first edition said auto memory collects build commands and code patterns. That is no longer the design. Claude now saves four kinds of note, recorded as a `type` in each file's frontmatter:

| Type | Contents |
|---|---|
| `user` | Your role, expertise, and working preferences |
| `feedback` | Corrections you give and approaches you confirm |
| `project` | Ongoing work, deadlines, and decisions that cannot be derived from the code or git history |
| `reference` | Where to find things outside the project, such as an issue tracker or dashboard |

Claude skips anything it can derive from the codebase (architecture, file paths, debugging fixes) and anything your CLAUDE.md already says. That division is the core of the architecture: code and git are the source of truth for the code; instruction files hold rules; auto memory holds what lives only in your head.

### How it loads

```text
~/.claude/projects/<project>/memory/
├── MEMORY.md            # index, one line per memory, loaded every session
├── user_role.md         # one memory per file
├── feedback_testing.md
└── ...
```

The first 200 lines or 25KB of `MEMORY.md`, whichever comes first, load at session start. Topic files do not; Claude reads them when it needs them. When the index nears the limit, Claude Code reminds Claude to shorten it; past the limit, it tells Claude to rewrite it, because anything beyond is dropped on the next load. Since v2.1.214, Claude Code stamps a `modified` timestamp in the frontmatter of memory files it writes, so you and Claude can see how current a fact is.

Auto memory is machine-local. It is not shared across machines or cloud environments, and it is excluded from the transcript cleanup sweep, so files stay until you or Claude delete them.

### Control it

- `/memory` lists your instruction files, toggles auto memory, and opens the memory folder.
- "Remember that the API tests need a local Redis" saves to auto memory. "Add this to CLAUDE.md" writes to the instruction file instead.
- Turn it off per project with `"autoMemoryEnabled": false` in the project settings, or everywhere with `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`.
- Background sessions and sessions started by another Claude Code session can turn auto memory off but not back on.

### Subagent memory

A subagent can keep its own memory with the `memory` frontmatter field. Scopes are `user` (`~/.claude/agent-memory/<name>/`), `project` (`.claude/agent-memory/<name>/`, the recommended default because it can be committed), and `local` (`.claude/agent-memory-local/<name>/`). The main conversation's auto memory is not loaded into subagents, except forks, which inherit the parent's context.

```yaml
---
name: code-reviewer
description: Reviews code for quality and best practices
memory: project
---
Before reviewing, check your memory for patterns seen before.
After reviewing, save new recurring issues to your memory.
```

### Shared memory across related projects

`autoMemoryDirectory` redirects where auto memory lives, and it is read from any settings scope. Point a frontend and its API server at the same directory and they share what Claude learns:

```json
{
  "autoMemoryDirectory": "~/shared-memory/platform-team"
}
```

The value must be absolute or start with `~/`. When the setting comes from a repository's `.claude/settings.json`, Claude Code applies the same workspace-trust rule it applies to hooks in settings files, for good reason: a repository that chooses where your memory is read from can feed instructions into every session. Use this only for projects that genuinely share conventions.

## Which layer holds what

| Mechanism | Written by | Loaded | Best for |
|---|---|---|---|
| CLAUDE.md / AGENTS.md | You | Every session | Rules, commands, gotchas |
| Path-scoped rules | You | When matching files are read | Area-specific rules |
| Skills | You | When invoked | Procedures |
| Auto memory | Claude | Index every session; topics on demand | Preferences, corrections, project context not in code |
| Task files (`TODO.md`, `SPEC.md`, handoff notes) | You or Claude | When read | Current work, session continuity |
| Hooks | You | At lifecycle events | Rules that must be enforced |

## External memory and code graphs

Two kinds of third-party tool sit on top of the built-ins, and both were among the most-starred Claude Code ecosystem repositories on GitHub in early October 2026.

**Session memory** tools capture what happened in past sessions and bring relevant parts back. The best known is [claude-mem](https://github.com/thedotmack/claude-mem) (Apache-2.0). Per its README, it uses lifecycle hooks (SessionStart, UserPromptSubmit, PostToolUse, Stop, SessionEnd) to record tool usage, compresses observations into summaries with a model, stores them in SQLite with Chroma for vector search, and gives Claude MCP search tools that return a compact index first and full details only for chosen IDs. It installs as a plugin:

```text
/plugin marketplace add thedotmack/claude-mem
/plugin install claude-mem
```

or with `npx claude-mem install`.

**Code graphs** pre-index the repository's symbols, call edges, and dependencies so the agent can ask one structural question instead of running grep and reading file after file. [CodeGraph](https://github.com/colbymchenry/codegraph) (MIT) is one; it runs locally, keeps the index in a `.codegraph/` directory, re-syncs on file changes, and exposes an MCP server:

```bash
npm i -g @colbymchenry/codegraph   # or the install script in its README
codegraph install                  # wires the MCP server into your agents
cd your-project && codegraph init  # builds the index
```

Before either, try the official layer: **code intelligence plugins** connect Claude to a language server (for example `typescript-lsp`, `pyright-lsp`, `gopls-lsp` from the official marketplace), so it jumps to definitions, finds references, and sees type errors after edits without scanning files. The docs recommend them for large codebases. If your organization already runs a code search or RAG index, the docs suggest exposing it as an MCP tool. [Large Projects](/en/book2-advanced/18-large-projects) covers that setup.

### When an external layer helps

- **Very large or unfamiliar codebases** where most of a task's tokens go to discovery. CodeGraph's own benchmark (seven open-source repos, Claude Opus 4.8, headless runs, median of four per arm, August 2026) reports 44% lower cost and 62% fewer tokens on average for one architecture question each. These are the vendor's numbers on its chosen questions; treat them as a hypothesis to test, not a result.
- **Long-running work across many sessions** where the same investigations keep being redone, and handoff files are not enough.
- **Several agent tools on one codebase.** Both projects support other agents such as Codex, which built-in auto memory does not.

### When it hurts

- **It can grow your context, not shrink it.** CodeGraph's README is unusually candid here: its benchmarks measure tokens processed, but in multi-turn sessions its responses left about 80% more retrieval context resident at the end (67K tokens against 18K on VS Code), because one dense answer stays in the window where small grep results would have been evicted. Session memory tools inject context at session start and on prompts by design. Measure the baseline with `/context` before and after.
- **Stale or wrong memories propagate.** An automatically captured "fact" from a failed experiment can steer every later session. Built-in auto memory is plain files you can read in a minute; a vector store of compressed observations is harder to audit.
- **Two sources of truth.** If CLAUDE.md, auto memory, and an external store disagree, behavior gets less predictable, and "why did it do that?" gets harder to answer.
- **Data leaves your machine unless you check.** Read each tool's data handling before installing. claude-mem's installer, per its README, offers a hosted "observer" with sign-in and lets you choose your own OpenRouter or Gemini key, or your Anthropic plan, instead; passing an explicit `--provider` flag or setting `CLAUDE_MEM_ONLINE_OPTIN=false` skips the sign-in. CodeGraph states it is fully local, with anonymous usage telemetry you can turn off with `codegraph telemetry off`.
- **Plugins run code.** Hooks and MCP servers from a plugin run with your user permissions. Treat a memory plugin like any dependency with that much access. [Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods) covers vetting.

### Run a trial, then decide

Do not install memory tools on reputation or star counts. Test on your own repository, the same way CodeGraph measured itself:

1. Pick five real questions or small tasks from your backlog.
2. Run each headless without the tool and record cost and outcome:
   ```bash
   claude -p "How does a request reach the billing service?" --output-format json > before.json
   ```
3. Install the tool, run the same prompts, and save `after.json`. Compare `total_cost_usd`, the number of turns, and whether the answers were correct.
4. Run `/context` in a fresh interactive session with and without the tool to see the baseline it adds.
5. Keep it only if it wins on correctness and cost on your work. Uninstall cleanly if it does not (CodeGraph provides `codegraph uninstall`).

## Troubleshooting

**Claude ignores a CLAUDE.md rule.** Run `/context` and check the list under **Memory files**. If the file is not there, Claude cannot see it. Make the rule concrete ("use 2-space indentation", not "format nicely") and look for conflicts across files. If it must always happen, write a hook.

**AGENTS.md is not loading.** Look for a `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` on the path, confirm v2.1.281 or later with `claude --version`, and check **Project instructions** in `/config`.

**You do not know what auto memory saved.** Open `/memory`, choose the auto memory folder, and read the files. Edit or delete anything wrong; they are plain markdown.

**An instruction vanished after `/compact`.** Root CLAUDE.md is re-read from disk after compaction. Instructions given only in chat, path-scoped rules, and nested CLAUDE.md files are not, until a matching file is read. Move the instruction to the root CLAUDE.md.

## Check that it worked

1. Run `/context` in a fresh session. Under **Memory files** you should see exactly the instruction files you expect, and no more.
2. Run `/memory`, open the auto memory folder, and confirm `MEMORY.md` is short and each entry is still true.
3. If you trialed an external tool, you should have a before-and-after comparison on your own tasks that justifies keeping or removing it.

## Sources

- "How Claude remembers your project" (CLAUDE.md, AGENTS.md, auto memory, troubleshooting), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/memory
- "Create custom subagents" (Enable persistent memory), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Code intelligence plugins", Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/plugins/code-intelligence
- "Set up Claude Code in a monorepo or large codebase", Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/large-codebases
- "Explore the context window" (What survives compaction), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/context-window
- "The new rules of context engineering for Claude 5 generation models", Thariq Shihipar, Anthropic (Claude blog), 2026-07-24. https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/
- thedotmack/claude-mem, README, GitHub, accessed 2026-10-04 (last push 2026-10-04). https://github.com/thedotmack/claude-mem
- colbymchenry/codegraph, README (benchmarks re-measured 2026-08-05; note on context; telemetry), GitHub, accessed 2026-10-04. https://github.com/colbymchenry/codegraph
- GitHub search snapshot of Claude Code ecosystem repositories by stars, compiled for this edition on 2026-10-04 (claude-mem about 96K stars, CodeGraph about 73K).
