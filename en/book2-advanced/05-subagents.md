# Subagents

> Verified on 2026-10-04 with Claude Code 2.1.289.

A subagent is a worker that Claude starts inside your session to do one side task. It gets its own context window, its own system prompt and its own tool set, does the work, and hands back a summary. The search results, logs and file contents it read stay in its context, not yours.

That much has not changed since early 2026. What has changed is how subagents run. They now run in the background by default, they can start subagents of their own, and a new kind, the fork, starts with your whole conversation instead of a blank page. This chapter covers how each kind behaves, what it costs, and when you are better off without one.

For the list of built-in agent types and ready-made custom agents, see the [Agent Catalog](/en/book2-advanced/06-agent-catalog). For separate sessions that run side by side, see [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions).

## What changed in 2026

| When | Version | Change |
|---|---|---|
| June 8–12 | v2.1.172 | Subagents can spawn their own subagents (nesting). |
| June 29 – July 3 | v2.1.198 | Subagents run in the background by default. |
| August 10–14 | v2.1.232 | Fork mode is on by default in interactive sessions. |
| — | v2.1.210 | Claude Code scans each subagent's final report before Claude reads it. |
| — | v2.1.212 | `/subtask` starts a forked subagent; `/fork` now copies the whole session instead. |
| — | v2.1.217 | A limit on concurrent subagents (default 20). |
| — | v2.1.219 | Nesting depth defaults to three layers. |

The Task tool was renamed Agent in v2.1.63. Old `Task(...)` references in settings and agent files still work as aliases.

## What a subagent starts with

A normal (non-fork) subagent does not see your conversation. Claude writes a delegation message that summarizes the task, and the subagent works from that. Its starting context is:

- **System prompt**: the agent's own prompt plus environment details such as the working directory. It does not get the Claude Code system prompt.
- **Task message**: the delegation prompt Claude wrote.
- **CLAUDE.md files**: every level your main session loads, including any `AGENTS.md` loaded as project instructions. The built-in Explore and Plan agents skip these. A custom agent can skip them with `omitClaudeMd: true`.
- **Git status**: a snapshot taken when it starts (Explore and Plan skip it).
- **Preloaded skills**: the full text of any skill named in its `skills` field.

It does not get your output style, your auto memory, or the files Claude already read. If a rule must reach the subagent, such as "ignore the `vendor/` directory", say it in the prompt you give Claude when you delegate.

A fork is the exception. It inherits the system prompt, tools, model and full message history of the main session at the moment it spawns. More on forks below.

## Background is the default

Since v2.1.198, Claude keeps working while subagents run and picks up their results when they finish. With fork mode on (the interactive default), every subagent Claude spawns runs in the background and Claude cannot ask for the foreground.

What this means in practice:

- **Permission prompts come to you.** When a background subagent hits a tool call that needs approval, the prompt appears in your main session and names the subagent. Approve it, or press Esc to deny that one call without stopping the subagent. An answer that lasts beyond one call, such as a session-wide grant, applies to your main conversation too.
- **The tool set is smaller.** A background subagent keeps every MCP tool but only these built-in tools: `Read`, `Grep`, `Glob`, `LSP`, `Bash`, `PowerShell`, `Edit`, `Write`, `NotebookEdit`, `WebFetch`, `WebSearch`, `TodoWrite`, `Skill`, `ToolSearch`, `EnterWorktree`, `ExitWorktree`, `Monitor`, `TaskStop`, `SendMessage` and `Artifact`. Others are removed silently, so the same agent file can resolve to different tools in the foreground and the background. Forks skip this filter.
- **Results arrive later.** The result reaches Claude as a completion notification in a later turn. If you ask about progress first, Claude should tell you the subagent is still running rather than guess.
- **You can watch it.** Running subagents appear in a panel below the prompt. `/tasks` lists everything running in the background of the session, including subagents that just finished, and lets you open a transcript or stop one.

You can still steer. Press `Ctrl+B` to send a running task to the background. Set `background: true` in an agent file to keep that agent in the background even when Claude wants to wait for it. Set `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` to force everything into the foreground.

In non-interactive mode (`claude -p`) and the Agent SDK, fork mode is off by default. There Claude runs subagents in the background unless it needs the result before continuing.

## Nested subagents

A subagent can start subagents of its own, up to three layers below your main conversation. This suits a delegated task that itself splits into parallel parts, for example a reviewer subagent that sends one verifier per finding to check it.

In an interactive session, a subagent that launches background subagents waits for their results before it finishes, so only the top-level summary reaches you. In `-p` mode and the SDK the launcher does not wait, and a nested subagent that finishes late reports to your main conversation instead.

The panel below the prompt shows nested subagents as a tree, with a `(+N)` count on each row that still has descendants.

Two limits apply, each with its own environment variable:

```json
{
  "env": {
    "CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH": "2",
    "CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS": "10"
  }
}
```

- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` sets how many layers can exist below the main conversation. `1` turns nesting off.
- `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` caps how many run at once (default 20). At the cap, spawning fails with `Concurrent subagent limit reached` until one finishes. There is no cap on the total number over a session.

To stop one particular agent from spawning, such as a reviewer you want to stay simple, leave `Agent` out of its `tools` list or add it to `disallowedTools`.

::: warning
Nesting multiplies spend quickly. Three layers of fan-out with five agents each is 155 agents. Set a lower depth or concurrency limit before you let a delegated task fan out across a large codebase.
:::

## Forks

A fork is a subagent that inherits the entire conversation instead of starting fresh. You can hand it a side task without re-explaining the situation, and its tool calls still stay out of your main context. Only its final result comes back.

Start one yourself with `/subtask`:

```text
/subtask draft unit tests for the parser changes so far
```

The fork appears in the panel below your prompt and runs in the background. Use these keys in the panel:

| Key | Action |
|---|---|
| `↑` / `↓` | Move between rows |
| `Enter` | Open the fork's transcript and send it follow-up messages |
| `x` | Stop a running fork, or dismiss a finished row |
| `Esc` | Return to the prompt |

With fork mode on, Claude can also start forks itself by requesting the `fork` subagent type. If you want fork mode's background behavior but not forks, deny the type with a permission rule:

```json
{
  "permissions": {
    "deny": ["Agent(fork)"]
  }
}
```

To turn fork mode off entirely, set `CLAUDE_CODE_FORK_SUBAGENT=0`. Set it to `1` to turn it on for `-p` and SDK runs.

A fork cannot spawn further forks. When Claude spawns one through the Agent tool it can pass `isolation: "worktree"` so the fork's edits land in a separate git worktree.

::: tip `/subtask` and `/fork` are different
`/subtask` starts a forked **subagent** whose result returns to your conversation. `/fork` copies your whole **session** into a new background session that runs on its own (see [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions)). On v2.1.161 through v2.1.211, `/fork` meant what `/subtask` means now. With agent view turned off, `/fork` keeps the old meaning.
:::

## Cache inheritance

Prompt caching decides much of what a subagent costs, and the two kinds behave differently.

| | Fork | Non-fork subagent |
|---|---|---|
| Context | Full conversation history | Fresh, from the delegation prompt |
| System prompt and tools | Same as main session | From the agent file, filtered for background runs |
| Model | Same as main session | From the agent's `model` field and the model order |
| Prompt cache | Reads the parent's cache on its first request | Builds its own cache from scratch |

Because a fork's prefix is identical to the parent's, its first request reads the cache the parent already paid for. Anthropic's Opus 5.5 announcement (September 24, 2026) puts it this way: forked subagents "start from the parent's cache instead of paying for the same context again."

A non-fork subagent has a different system prompt and tool set, so its first request misses. It warms its own cache over its turns. Two details matter:

- Subagent requests fall outside the main-conversation TTL bucket. Even on a subscription, where the main conversation gets a one-hour cache, subagents get five minutes unless you choose otherwise with the `subagentPromptCacheTtl` setting, the `CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` variable, or per agent with `experimental: { cacheTtl: 1h }` in its frontmatter.
- Resuming a subagent keeps its earlier work in its context, so for follow-up work it is usually cheaper than spawning a fresh one and re-explaining. Whether its first request reuses the cache its original run warmed is not spelled out in the docs; check with `/usage` before you rely on it.

The rule of thumb: if the side task needs most of what is already in your conversation, fork. If it needs a narrow slice, a fresh subagent with a tight prompt is cheaper because it carries less. [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) covers TTLs in depth.

## Choosing a model

Claude Code resolves a subagent's model in this order:

1. The `model` parameter Claude passes for this one call
2. The agent file's `model` field (`inherit` means the main conversation's model)
3. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable
4. The main conversation's model

Two things trip people up:

- **Explore no longer defaults to Haiku.** The built-in Explore agent now runs on the main conversation's model (on a subscription with Fable as the main model, it runs on the model the `opus` alias points to). To explore on a cheaper model, define your own agent named `Explore` with `model: haiku`; it overrides the built-in.
- **The environment variable is a default, not an override.** To force one model onto every subagent, teammate and workflow agent, also set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1`. Forks still run on the main model.

To see which model a subagent is actually on, run `/tasks` while it runs. The row names the model.

## Resuming and messaging a subagent

Each delegation creates a new instance. To continue one instead, ask Claude:

```text
Continue that code review and now look at the authorization logic
```

Claude resumes it with the `SendMessage` tool, using the agent's ID or name. The resumed run keeps its full history. Explore and Plan are one-shot and cannot be resumed; use `general-purpose` or a custom agent when you expect follow-ups. A subagent that stopped at its `maxTurns` limit returns output marked as partial, and Claude can message it to continue.

Subagent transcripts live at `~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl`. They survive compaction of the main conversation and are deleted after `cleanupPeriodDays` (30 by default).

## What a subagent's report can and cannot do

A subagent may read web pages, files or command output you never looked at, and any of that can contain instructions aimed at your main session. Since v2.1.210, Claude Code scans each final report. It inserts a backslash into text that imitates Claude Code's own markup (a `<system-reminder>` tag, a line starting with `Human:`), and it prepends a `[harness: subagent output matched instruction-shaped pattern(s): ...` line when a report imitates such a tag or mentions settings like `bypassPermissions`.

The scan does not judge intent and does not block anything. Two rules hold regardless: no message from any agent counts as your approval for a pending permission prompt, and no agent message can change a subagent's permission settings, `CLAUDE.md` or configuration. Anything a report leads Claude to do still goes through your permission checks. For stronger containment, see [Containment and Security](/en/book3-architect/09-containment-and-security).

## When not to use a subagent

Delegation has a fixed cost: a fresh agent rebuilds context, sends its own requests, and counts toward the same usage limits as your main conversation. Skip it when:

- **The task needs back-and-forth.** A subagent cannot ask you a clarifying question (`AskUserQuestion` is removed from every subagent).
- **The phases share a lot of context.** Planning, implementing and testing one change in one conversation is usually cheaper than three handoffs that each restate the plan.
- **The change is small.** A one-line edit delegated to a fresh agent pays the startup cost for no context savings.
- **You only have a question about the conversation.** Use `/btw`. It sees your full context, has no tools, and its answer is not added to history.
- **You want a reusable procedure in the main context.** That is a skill, not a subagent. See [Custom Skills](/en/book2-advanced/02-custom-skills).
- **You want a second opinion.** A reviewer subagent on the same model shares the author's blind spots, and agreement between them is not proof. See [Agents Checking Agents](/en/book3-architect/05-agents-checking-agents).
- **The work outgrows one conversation.** Many independent tasks, or work that must keep running after you close the terminal, belong in separate sessions ([The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions)) or a scripted workflow ([Automated Workflows](/en/book2-advanced/10-automated-workflows)).

How much does a subagent cost? It depends on your setup. Wes Sander (Practical Systems, September 14, 2026) compared published figures that ranged from 15,000 to 436,000 tokens per subagent. On his own machine, a general-purpose helper paid about 61,500 input tokens before its first tool call and a tool-restricted advisor about 18,700. He argues that "the cost is a function of your install, not the tool." Measure your own instead of trusting anyone's number, including this book's.

<!-- AUTHOR-DATA: share of the author's weekly plan usage that /usage attributes to subagents, and what changed after trimming agent descriptions or switching Explore to a smaller model -->

Use subagents when the side task produces output you will not read again (test runs, log searches, doc fetches), when you want hard tool restrictions, or when independent pieces can run in parallel and come back as short summaries. Ask for short summaries explicitly: every report lands in your main context.

### Check that it worked

1. Ask Claude to run a test suite with a subagent and report only failures. While it runs, a row appears in the panel below the prompt.
2. Run `/tasks`. The subagent is listed with its model (and effort, when its definition sets one). After it finishes, it stays in the list, marked done, for about 30 seconds.
3. Confirm the transcript exists:

   ```bash
   ls ~/.claude/projects/*/*/subagents/ | tail
   ```

4. On a Pro, Max, Team or Enterprise plan, run `/usage` and read the attribution breakdown, which shows the share of recent usage that went to subagents.

## Sources

- "Create custom subagents", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Run agents in parallel", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agents
- "How Claude Code uses prompt caching", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/prompt-caching
- "Manage costs effectively", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/costs
- "Commands", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- "Week 24 · June 8–12, 2026", Claude Code What's New, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w24
- "Week 27 · June 29 – July 3, 2026", Claude Code What's New, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w27
- "Week 33 · August 10–14, 2026", Claude Code What's New, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w33
- "Coding sessions are longer and use more context. Claude Opus 5.5 is built with that in mind.", Michael Segner, Claude blog, Anthropic, 2026-09-24. https://claude.com/blog/claude-opus-5-5-built-for-coding-sessions-that-use-more-context
- "Published Subagent Costs Range From 15,000 to 436,000 Tokens. Measure Your Own.", Wes Sander, Practical Systems, 2026-09-14. https://www.practicalsystems.io/blog/measure-your-subagent-token-cost
