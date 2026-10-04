# Large Projects

> Verified on 2026-10-04 with Claude Code 2.1.289.

A large codebase fails an agent in a boring way. The code is fine and the model is capable. But every instruction file, search result and file read competes for the same context window, and most of it has nothing to do with today's task. Claude spends tokens on the wrong code, then makes decisions from a diluted picture.

This chapter is about the brownfield case: an existing repository, millions of lines or dozens of packages, that you did not write and cannot hold in your head. There are three levers:

1. **Scope** what Claude sees: where you start, which instruction files load, which paths are off limits.
2. **Navigate** by structure instead of by text search: language servers and code graphs.
3. **Write things down** for the next session: research notes, plans and area-specific conventions, written by the agent and reviewed by you.

Cleaner code helps too, and there is some evidence for it. A May 2026 controlled study ("Does Code Cleanliness Affect Coding Agents?", arXiv 2605.20049) ran Claude Code on pairs of repositories that behave identically but differ in static-analysis violations and cognitive complexity. Across 660 trials the pass rate did not change. Agents on the cleaner code used 7 to 8% fewer tokens and revisited files 34% less. So cleanliness bought efficiency, not correctness. It is a small study, but it matches the lesson of this chapter: the agent's cost is mostly navigation.

## Scope what Claude sees

### Choose where to start

The directory you launch `claude` from decides three things: which files Claude can touch without extra permission, which `CLAUDE.md` files load at startup, and which project settings apply.

| Start from | CLAUDE.md loaded at launch | Use when |
| :- | :- | :- |
| Repository root | Root only; subdirectory files load when Claude reads there | The task spans several packages |
| A subdirectory | That directory's file plus every ancestor's | The work stays inside one package |

For a one-package task, start in the package. It is the cheapest scoping you have, and it needs no configuration. Note that `.claude/settings.json` is not inherited from parent directories the way `CLAUDE.md` is, so each place you start from needs its own settings file.

### Layer CLAUDE.md files

One root `CLAUDE.md` for a large repository either grows until it costs context on every task, or stays so generic that it says nothing. Split it:

- Root `CLAUDE.md`: rules that hold everywhere (commit format, "never edit generated code, run codegen").
- A `CLAUDE.md` inside each package or subsystem: that area's stack and traps.

Commit them, and let each directory's owner maintain their file. Review `CLAUDE.md` edits in pull requests like any other documentation change. For the content patterns, see [Memory Architecture](/en/book2-advanced/17-memory-architecture).

If you start at the root but never work in some packages (another team's code, legacy, vendored trees), exclude their instruction files for yourself in `.claude/settings.local.json`:

```json
{
  "claudeMdExcludes": [
    "**/packages/web/**"
  ]
}
```

Patterns are globs matched against absolute paths, so start relative-style patterns with `**/`. Managed-policy `CLAUDE.md` files cannot be excluded. The list is static; to switch focus between packages, start Claude from a different directory instead of editing it.

When you want conventions in one central place rather than scattered per directory, path-scoped rules under `.claude/rules/` (matched by a `paths:` glob) are the alternative. Per-directory files version with the code they describe, so the owners keep them current. Rules are better when one convention applies to many scattered paths.

### Block reads of generated and vendored code

Content searches already respect `.gitignore`, so `node_modules/`, `dist/` and `build/` are usually out of results. Checked-in generated code and vendored SDKs are not. Deny them:

```json
{
  "permissions": {
    "deny": [
      "Read(./**/dist/**/*)",
      "Read(./**/build/**/*)",
      "Read(./**/*.generated.*)",
      "Read(./**/vendor/**/*)"
    ]
  }
}
```

The `/**/*` ending denies everything inside a directory while still letting Claude list or `cd` into it. The docs are explicit about the limits: deny rules cover Claude's built-in file tools and the Bash file commands Claude Code recognizes (`cat`, `head`, `grep`, `find`) when a denied path is an argument. A Bash `grep -r` over a directory that contains denied files still returns them, and subprocesses that open files themselves are not covered. Treat these rules as context hygiene, not as a security boundary. For the real boundary, see [Containment and Security](/en/book3-architect/09-containment-and-security).

### Sparse worktrees and cross-package access

Running agents in parallel means worktrees (see [Worktrees](/en/book2-advanced/08-worktrees)), and by default a worktree checks out the whole repository. In a big repo, `worktree.sparsePaths` limits it to the directories you list, plus root-level files:

```json
{
  "worktree": {
    "sparsePaths": [".claude", "packages/api", "packages/shared"],
    "symlinkDirectories": ["node_modules"]
  }
}
```

Paths are relative to the repository root. Include `.claude` or the worktree will not have the root `.claude/settings.json` or rules. `symlinkDirectories` links `node_modules` back to the main checkout instead of copying it. One catch from the docs: inside the new worktree, project settings load from the worktree root, so settings such as deny rules must also exist in the repository root's `.claude/settings.json`, not only in a package's.

If you start in `packages/api` and need to edit `packages/shared`, grant access with `permissions.additionalDirectories` in settings, or `claude --add-dir ../shared` for one session. The two differ in what they load:

| Added with | Loads CLAUDE.md and rules | Loads skills |
| :- | :- | :- |
| `additionalDirectories` setting | Never | Never |
| `--add-dir` or `/add-dir` | Only with `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` | Yes |

### Per-directory skills

Skills in `packages/api/.claude/skills/` load on demand when Claude works there, so API testing procedures do not cost context during frontend work. Keep each description short and lead with the words a request would contain ("writing or modifying tests in packages/api"). When many skills pile up, some lose their descriptions entirely and Claude loses the keywords it uses to pick them. Skills the whole repository shares belong in the root `.claude/skills/`; skills that need their own versioning belong in a plugin ([Plugins, Marketplace and Mods](/en/book2-advanced/04-plugins-marketplace-mods)).

### Check that it worked

1. Start `claude` in `packages/api`. Run `/context` and look at **Memory files**: you should see the root and `packages/api` files and none from `packages/web`.
2. Ask Claude to read a file under a denied path such as `dist/`. The read should be refused.
3. Create a session with `claude --worktree`, then run `git worktree list` and check that the new worktree contains only the sparse paths plus root files.

## Navigate by structure, not by text

In a big repository, "where is this symbol defined and who calls it" can cost dozens of grep and read calls. Two kinds of tooling replace that with a lookup.

**Language servers (official).** A code intelligence plugin connects Claude to a language server over LSP. Claude gets go-to-definition and find-references through a read-only `LSP` tool, and it sees type errors and missing imports right after its own edits. Install the language server binary first, then the plugin from the official marketplace:

```text
/plugin install typescript-lsp@claude-plugins-official
```

Plugins exist for C/C++, C#, Go, Java, Kotlin, Lua, PHP, Python, Ruby, Rust, Swift and TypeScript/JavaScript, among others. They work in terminal sessions but not in cloud sessions. To confirm a server started, ask Claude to introduce a type error and fix it; a `Found N new diagnostic issues` line under the edit means the server is running. If it does not appear, open `/plugin` and check the **Errors** tab for `Executable not found in $PATH`.

**Code graphs (third party).** A code graph indexes your repository once into a database of symbols and call edges, and exposes it to the agent as an MCP tool. The best-known open-source example is CodeGraph (`colbymchenry/codegraph`). Per its README the setup is `codegraph install` (wire it into your agents) and then `codegraph init` in each project, which builds a local `.codegraph/` index that stays in sync as files change. It exposes a single MCP tool, `codegraph_explore`, that returns the relevant source, the call paths between symbols and a blast-radius summary in one call. We did not run it for this handbook, so treat the commands as the project's own and check its README.

Its benchmark claims are the project's, not independent. On seven open-source repositories, with Claude Code answering one architecture question per repo, the README reports 88% fewer tool calls, 62% fewer tokens and 44% lower cost with the index. It also states a cost: the same dense answers stay in the window afterwards, leaving about 80% more retrieval context resident at the end of a multi-turn session (on VS Code, 67k tokens against 18k). That trade matters if you run long sessions in a small window.

How to choose: start with the language-server plugin for your main language. It is official, cheap and also catches the agent's own mistakes. Add a code graph when exploration questions ("how does a request reach the database?") dominate your sessions and you see Claude burning dozens of reads on them. Measure on your own repo before you commit to either; see [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) for how to read the cost.

If your organization already runs code search or a RAG index, exposing it as an MCP server is the same idea with infrastructure you already trust ([MCP in Practice](/en/book2-advanced/12-mcp-in-practice)).

## Let the agent write the docs, and review them

In a brownfield repo, the scarce resource is knowledge that is not in the code: why a module is shaped this way, which tests are slow, what must never change. Agents are good at drafting that knowledge from the code and bad at knowing which parts you care about. The workable split: the agent writes, you review the claims that matter.

HumanLayer's guide "Getting AI to Work in Complex Codebases" (a GitHub write-up of an August 2025 talk, still widely cited in 2026) describes a research, plan, implement loop. They report using it to land a bug fix in a 300,000-line Rust codebase they had never worked in. Their rule is to keep context utilisation low, roughly 40 to 60%, by compacting the findings of each phase into a short document and starting the next phase from that document. In their example, the plan built from a research document fixed the issue in a better place than a plan written without research. That is one team's account of one task, not a benchmark, but the shape is sound.

You can run it with plain Claude Code features:

1. **Research.** In plan mode, or a subagent so file reads stay out of your main session, ask: "Trace how an order reaches the payment provider. Write what you find to `docs/research/payment-flow.md`: files, entry points, and anything surprising." Read it. Correct it. This is the cheap place to catch a wrong mental model, before any code exists.
2. **Plan.** Ask for a plan that cites the research file, names the exact files to change and the tests that prove it. In plan mode Claude writes the plan to a file, and Claude Code re-injects that file after each compaction, so the plan survives a long session where chat history may not.
3. **Implement** from the plan, ideally in a fresh session, so the context holds the plan and not the exploration.
4. **Fold lessons back.** What the session learned about an area ("migrations are append-only, never edit a merged one") goes into that area's `CLAUDE.md`. A `Stop` hook can propose these updates: it receives the session transcript path when Claude finishes, so a script can review the session while the gap is fresh ([Hooks](/en/book2-advanced/09-hooks)).

Rules for agent-written documentation:

- **Only write what the code cannot tell you.** Claude can derive the folder layout and function signatures at any time. Run `/doctor` periodically; it trims checked-in `CLAUDE.md` files by cutting content Claude could derive from the codebase.
- **Date it and link to code.** A research note without a commit or date goes stale silently. Put the commit hash in the header.
- **Review it like code.** A confident wrong paragraph in `CLAUDE.md` is loaded into every future session. Put these files through pull requests.
- **Delete when the model improves.** Instructions that worked around an old limitation become overhead later. Revisit after major model releases.

### Check that it worked

Open a fresh session in the area you documented and ask a question the new notes should answer ("what must I know before changing the payment retry logic?"). If Claude answers correctly without reading much code, the notes work. If it re-explores from scratch, they are not loading: check `/context` for the file, and check your exclude patterns.

## Changes that span packages

When one change touches a shared type and every call site, give Claude the whole change in one session instead of one package at a time. Decisions made while editing the shared type then stay consistent at the call sites. Plan first (see above) and let the plan file carry the intent through compaction. If the change is large enough to split across agents, split by files that do not overlap, run each in its own worktree and branch, and merge through pull requests. [Subagents](/en/book2-advanced/05-subagents) and [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions) cover the mechanics. Context handling across sessions is in [Context Engineering](/en/book2-advanced/15-context-engineering).

## Sources

- Set up Claude Code in a monorepo or large codebase. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/large-codebases
- Code intelligence plugins. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/plugins/code-intelligence
- Best practices for Claude Code. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/best-practices
- Commands reference (`/context`, `/doctor`, `/add-dir`). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Does Code Cleanliness Affect Coding Agents? A Controlled Minimal-Pair Study. arXiv 2605.20049, 2026-05-19. https://arxiv.org/abs/2605.20049
- CodeGraph README (colbymchenry/codegraph), accessed 2026-10-04; benchmark figures are the project's own. https://github.com/colbymchenry/codegraph
- Getting AI to Work in Complex Codebases. HumanLayer, GitHub README (talk dated 2025-08-20). https://github.com/humanlayer/advanced-context-engineering-for-coding-agents
