# Context Engineering

> Verified on 2026-10-04 with Claude Code 2.1.289.

Context engineering is deciding what the model sees on each turn: what loads before you type, what accumulates while it works, and what gets thrown away. The first edition called this "context window management" and treated it mostly as a space problem. Two things changed since then.

First, the windows got big. On the Anthropic API, Sonnet 5 and later, Opus 4.7 and later, and the Fable models run with a 1M-token context window on every plan, including Pro. Running out of room is rarer.

Second, everything else got more expensive in relative terms. Claude Code re-sends the whole conversation on every request, so every token you let in is paid for again on every later turn (mostly at the cached rate, but paid). Anthropic reported in September 2026 that context per request in Claude Code grew 2.6x between March and September. A bigger window means you can carry more; it does not mean you should.

This chapter covers the current rules for Claude 5 generation models, how to measure and shrink what loads by default, and how to use compaction deliberately. [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) covers the billing side of the same decisions.

## What is in the window before you type

Before your first prompt, Claude Code has already loaded:

- the system prompt and the built-in tool definitions
- your CLAUDE.md files (user, project, local) and unscoped rules, or AGENTS.md where applicable
- the first 200 lines or 25KB of auto memory's `MEMORY.md`
- environment information and a git status snapshot
- MCP tool names (full schemas stay deferred by default and load on demand through tool search)
- one-line descriptions of every skill Claude can invoke
- anything you add yourself: an output style, `--append-system-prompt`, browser tools if Claude in Chrome is on by default

How big is that? In July 2026 Systima put a logging proxy between Claude Code 2.1.207 and the API and measured about 33,000 tokens before the prompt: roughly 6,500 for the system prompt, 24,000 for 27 tool schemas, and 2,000 of injected reminders, against about 7,000 for OpenCode. Their caveats are real: small samples (three runs on Sonnet), one older version, and harness prompts change often. The post drew 700 points on Hacker News because it put a number on something most users never look at. The same post estimated that real setups add tens of thousands more: instruction files and a handful of MCP servers.

Do not adopt their number. Measure yours.

```text
/context
```

`/context` shows the current window as a colored grid, broken down by category, with suggestions for context-heavy tools and memory bloat. Pass `all` to expand the per-item list. Run it in a fresh session in each repository you work in, before you type anything else. That figure is your baseline: the tax every turn of every session pays.

<!-- AUTHOR-DATA: the author's own /context baseline in a fresh session (tokens, and the top three categories), before and after the trims in this chapter -->

## The Claude 5 rules

In July 2026 Thariq Shihipar of Anthropic published "The new rules of context engineering for Claude 5 generation models". The headline fact: Anthropic removed over 80% of Claude Code's system prompt for the newer models with no measurable loss on its coding evaluations. Instructions that helped older models now mostly get in the way. The post's recommendations, translated into actions on your own setup:

1. **Stop overconstraining.** Newer models infer intent well; piles of "never" and "always" rules conflict and crowd out the task. Delete rules that guard against mistakes the current model no longer makes.
2. **Prefer judgment to rules.** The post's example: instead of "never write multi-paragraph docstrings", say "write code that reads like the surrounding code: match its comment density". One principle replaces a list of special cases.
3. **Design interfaces, not examples.** Well-named tool parameters and enums guide the model better than worked examples, which narrow what it tries. If you write skills or MCP tools, put the guidance into the interface.
4. **Disclose progressively.** Load detail when it is needed. Move procedures into skills; let tools load through tool search.
5. **Say it once.** Remove guidance repeated across CLAUDE.md, skills, and tool descriptions.
6. **Let auto memory carry learned facts** instead of hand-maintaining them in CLAUDE.md.
7. **Give rich references.** A test suite, a reference implementation, or an HTML mock beats a prose spec.
8. **Keep CLAUDE.md for gotchas.** Write what Claude cannot discover from the code. Leave out what it can.
9. **Use `/doctor`** to right-size skills and CLAUDE.md files.

Rules 1, 2 and 8 have the biggest payoff for most people, because most CLAUDE.md files were written for 2025 models and have only grown since.

## Keep the baseline small

The baseline is the cheapest place to save, because a token cut there is saved on every turn of every session.

### Trim CLAUDE.md

The docs' target is under 200 lines per CLAUDE.md file; longer files cost more context and reduce adherence. Ask of each line: would removing it cause a specific mistake on this project? If not, cut it. Then:

- Move instructions that matter for only part of the tree into path-scoped rules in `.claude/rules/` with `paths:` frontmatter. They load only when Claude reads a matching file.
- Move multi-step procedures (release steps, migration checklists) into skills. Skills load their body only when invoked.
- Do not split a long file into `@path` imports to save tokens. Imports help organization but load at launch, so they cost the same.
- Use HTML block comments (`<!-- like this -->`) for notes meant for human maintainers. Claude Code strips them before injecting the file.

### Run `/doctor` and `/doctor prompt-audit`

`/doctor` (alias `/checkup`) is a full setup checkup since July 2026. Among other things it finds unused skills, MCP servers, and plugins compared with their context cost, deduplicates local CLAUDE.md files against checked-in ones, and proposes trimming CLAUDE.md content Claude could derive from the codebase: directory layouts, dependency lists, architecture overviews. It reports first and asks before changing anything.

`/doctor prompt-audit` (v2.1.283 or later) is the instruction-file audit:

```text
/doctor prompt-audit
/doctor prompt-audit .claude/skills/deploy
```

Claude reviews your CLAUDE.md, CLAUDE.local.md, and AGENTS.md files plus the rules, skills, commands, subagents, and output styles under `.claude/` and `~/.claude/`. It looks for instructions written for older models, references to files or commands that no longer exist, and files that contradict each other. You get findings with proposed edits; nothing changes until you ask Claude to apply them. Pass a path to audit one file or directory. The audit runs through the bundled `/claude-api` skill, so it is unavailable if you turned that skill off.

A sensible cadence is after every model change and once a month otherwise. Instruction files rot quietly: the model gets better, the rules stay.

### Prune skills, MCP servers and always-on tools

- **Skills:** every skill in the listing adds its description to context on every turn, used or not. `/skill-doctor` (v2.1.252 or later) shows each skill's context cost and how often it is used. Turn off what you do not use. Skills marked `disable-model-invocation: true` stay out of the listing entirely until you call them by name.
- **MCP servers:** tool schemas are deferred by default, so an idle server costs mostly its name list and instructions. It still costs something, and without tool search a server that connects mid-session can invalidate the cache. Disable servers you are not using in `/mcp`. Where a good CLI exists (`gh`, `aws`, `gcloud`), the docs still call it more context-efficient than an MCP server. [MCP, CLI or Skill?](/en/book2-advanced/11-mcp-cli-or-skill) works through that choice.
- **Browser tools:** turning Claude in Chrome on by default loads its tools in every session. Use `claude --chrome` when you need it.

### Check that it worked

Run `/context` in a fresh session before and after your trims and compare the totals. Then do one routine task and check that Claude still follows the rules you kept. A smaller baseline that breaks behavior is not a win.

## During the session

Most of the window fills after you start. The habits that keep it focused have not changed much, but there are better tools for them.

- **Be specific about what to read.** "Fix the 401 after token refresh in `src/api/auth.ts`" reads one file; "look at the auth module" reads a directory.
- **Attach files with `@`.** Lydia Hallie's guide on the Claude blog notes that an @-mention attaches the file to your message without a separate Read call.
- **Quiet noisy commands.** Command output is appended to the conversation and resent on every later turn. Use quiet flags, filter test output to failures, or run noisy work in a subagent.
- **Send research to a subagent.** A subagent works in its own context window and only its summary comes back. Use this for broad exploration, long logs, and documentation lookups. See [Subagents](/en/book2-advanced/05-subagents).
- **Fork when the side task needs your context.** `/subtask <task>` starts a forked subagent that inherits the whole conversation (and reads its cache), works in the background, and returns its result here.
- **Ask side questions with `/btw`.** The answer uses what is already in context and never enters the history. It has no tool access.
- **Clear between unrelated tasks.** `/clear` starts an empty conversation; `/clear name` labels the old one so you can `/resume` it later. Stale context costs tokens on every message and crowds out what you need next.

## Compaction

When the conversation approaches the auto-compact window, Claude Code summarizes older history and continues. On models with a native 1M window, the default is to compact at about 967K tokens. You rarely want to get that far.

### Choose when it happens

- `/compact` with a focus keeps what you choose: `/compact keep the migration steps applied and the list of changed files; drop the debugging`.
- `/rewind`, then **Summarize from here** or **Summarize up to here**, compacts only part of the conversation.
- `/autocompact 300k` (v2.1.221 or later) lowers the threshold for the current model and saves it to your user settings. `/autocompact auto` returns to the tuned default. The `--autocompact` flag sets it for one launch and `CLAUDE_CODE_AUTO_COMPACT_WINDOW` for scripts.

A lower window is a quality decision as much as a cost one. Long contexts still degrade attention to early instructions, and a summary written at a natural break is better than one forced in the middle of a task.

You can also guide every compaction from CLAUDE.md, as the docs show:

```markdown
# Compact instructions

When you are using compact, please focus on test output and code changes
```

### What survives

The docs list what happens to each kind of content. The parts that surprise people:

| Content | After compaction |
|---|---|
| Project-root CLAUDE.md, unscoped rules, auto memory | Re-read from disk and re-injected |
| Path-scoped rules and nested CLAUDE.md files | Gone until Claude reads a matching file again |
| Files Claude read or edited | Up to five re-read, most recently modified first; files over 5,000 tokens come back as a path only |
| Invoked skill bodies | Re-injected, capped at 5,000 tokens per skill and 25,000 total, oldest dropped first |
| The skill listing | Not re-injected; only skills you invoked are kept |
| The plan from plan mode | Re-injected from disk |
| Instructions you only typed in chat | Summarized, possibly lost |

Two practical consequences. If a rule must survive compaction, drop its `paths:` frontmatter or move it into the root CLAUDE.md. And put the most important instructions at the top of each `SKILL.md`, because truncation keeps the start.

Editing the root CLAUDE.md mid-session does not apply until the next `/clear`, `/compact`, or restart. That is deliberate: the file is part of the cached prefix.

### What compaction costs

Compaction sends a summarization request with your full history. While the cache is warm, that request reads the history from cache and is cheap; after a long break it reprocesses everything at full price. So compact at a natural break while you are still working, not after you come back from lunch. Hallie's guide gives the same advice: compact before stepping away. If you have gone down a path you want to abandon, `/rewind` is cheaper than compaction, because it returns to a prefix that is already cached.

## Signs the context is working against you

These signals from the first edition still hold:

- Claude asks about things you already settled.
- Rules from CLAUDE.md stop being followed consistently.
- Quality drops: mistakes it was not making an hour ago.
- It refers to an old version of a file or function.
- Answers get vaguer and less tied to your code.

When you see them, compact with a focus or clear and restart with a short handoff. Pushing on in a polluted context compounds the problem.

## Work that spans sessions

For multi-day work, do not rely on one long conversation. End each session with a handoff file the next one reads:

```text
Before we stop, write WORK_IN_PROGRESS.md: what is done, the current
state of the code, next steps, and open decisions. Keep it under 40 lines.
```

The next session starts with `Read WORK_IN_PROGRESS.md and continue.` Name sessions with `/rename` so `/resume` finds them, and use `/recap` for a one-line summary of where a session stands without touching its history. On Pro and Max, when you resume a large session after a long break, Claude Code offers to resume from a summary so later requests do not carry the full history.

What belongs in files that load automatically versus files Claude reads on demand is the subject of [Memory Architecture](/en/book2-advanced/17-memory-architecture).

## Check that it worked

1. Run `/context` in a fresh session and record the total. Repeat after trimming; the number should drop.
2. Run `/doctor prompt-audit` and confirm it reports no conflicting or stale instructions, or that you have decided on each finding.
3. Add `context_window.used_percentage` to your status line (see the status line docs) so you see the window fill as you work, and confirm that a focused task finishes well before auto-compaction.

## Sources

- "The new rules of context engineering for Claude 5 generation models", Thariq Shihipar, Anthropic (Claude blog), 2026-07-24. https://claude.dev/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models/
- "Claude Code Is Way More Token-Hungry Than OpenCode. We Measured Exactly How Much" (page title: "Claude Code Sends 4.7x More Tokens Than OpenCode Before Reading Your Prompt"), Systima, 2026-07-12. https://systima.ai/blog/claude-code-vs-opencode-token-overhead (Hacker News discussion: https://news.ycombinator.com/item?id=48883275)
- "Opus 5.5 built for coding sessions that use more context", Michael Segner, Anthropic (Claude blog), 2026-09-24. https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context
- "Maximizing the value of your Claude Code sessions", Lydia Hallie, Anthropic (Claude blog), 2026-08-14. https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions
- "Explore the context window" (What survives compaction), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/context-window
- "How Claude remembers your project" (Audit your instruction files, CLAUDE.md size), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/memory
- "Model configuration" (extended context, auto-compact window), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/model-config
- "Commands" reference (`/context`, `/doctor`, `/autocompact`, `/subtask`, `/btw`, `/skill-doctor`), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- "Manage costs effectively" (Reduce token usage), Claude Code Docs, accessed 2026-10-04. https://code.claude.com/docs/en/costs
- What's new, Week 28 (July 6–10, 2026: `/doctor` checkup) and Week 36 (August 31 – September 4: `/skill-doctor`), Anthropic. https://code.claude.com/docs/en/whats-new
- Claude Code changelog, v2.1.283 (2026-09-25: `/doctor prompt-audit`). https://code.claude.com/docs/en/changelog
