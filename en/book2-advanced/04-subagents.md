# Chapter 4: Sub-agents Explained

Sub-agents are one of the most powerful and least understood features in Claude Code. Understanding them correctly — what they are, how they communicate, and when to use them — is the difference between good Claude Code usage and expert-level usage.

---

## What Is a Sub-agent?

A sub-agent is a specialized AI assistant that runs inside a separate context window from your main conversation. When Claude delegates work to a sub-agent, that agent:

- Has its own system prompt (defined by the agent's markdown file)
- Runs with a specific set of tools (potentially different from your main session)
- Works independently and returns a summary of results
- Cannot spawn further sub-agents (sub-agents do not nest)

Think of it as the difference between you doing all the work yourself versus you delegating a specific task to a focused colleague who reports back when done.

Claude Code ships with several built-in sub-agents and lets you create your own.

---

## Built-in Sub-agents

### Explore

The Explore agent is a fast, read-only agent optimized for searching and understanding codebases.

- **Model:** Haiku (fast, low-latency)
- **Tools:** Read-only (no Write or Edit)
- **Purpose:** File discovery, code search, codebase exploration

Claude automatically delegates to Explore when it needs to understand a large area of code before acting. The exploration output stays in the Explore agent's context — not yours. Only the relevant findings return to your main conversation.

When Claude invokes Explore, it specifies a thoroughness level:
- **quick** — targeted lookups of specific files or symbols
- **medium** — balanced exploration of a module or feature area
- **very thorough** — comprehensive analysis of a system

### Plan

The Plan agent is used during plan mode to gather context before presenting an implementation plan.

- **Model:** Inherits from main conversation
- **Tools:** Read-only
- **Purpose:** Codebase research for planning

When you use `/plan` or run in plan mode and ask Claude to understand your codebase, it delegates research to the Plan agent. This prevents the research from consuming your main context and avoids the forbidden pattern of sub-agents spawning sub-agents.

### General-purpose

The general-purpose agent handles complex multi-step tasks that require both exploration and action.

- **Model:** Inherits from main conversation
- **Tools:** All tools
- **Purpose:** Complex research, multi-step operations, code modifications

Claude uses this agent when a task needs both reading many files and modifying them — something that would produce excessive output if done inline in your main conversation.

---

## How the Agent Tool Works

When Claude delegates to a sub-agent, it uses the Agent tool internally. The invocation looks something like this from Claude's perspective:

```
Agent(
  type: "code-reviewer",
  prompt: "Review the auth module changes in git diff HEAD~1. Focus on security vulnerabilities. Return a prioritized list of issues.",
  context: { files: [...], task: ... }
)
```

The sub-agent receives this prompt as its initial user message and works autonomously until it finishes or hits its `maxTurns` limit. The Agent tool call returns when the sub-agent calls its own Stop or reaches the turn limit.

You can influence this behavior through the sub-agent's markdown configuration — specifically the `maxTurns` field, the system prompt (the markdown body), and the `tools` field.

---

## Sub-agent Configuration Files

Sub-agents are defined as Markdown files with YAML frontmatter. Here is the full structure:

```markdown
---
name: code-reviewer
description: Expert code review specialist. Proactively reviews code after modifications.
tools: Read, Grep, Glob, Bash
model: sonnet
permissionMode: default
maxTurns: 15
memory: user
---

You are a senior code reviewer ensuring high standards of quality and security.

When invoked:
1. Run `git diff HEAD~1` to see recent changes
2. Focus review on modified files
3. Check for: readability, naming, error handling, test coverage, security
4. Format findings as: Critical / Warning / Suggestion

Include specific file paths and line numbers.
```

### Key Frontmatter Fields

**`name`** — The identifier used to reference this agent. Must be unique within its scope.

**`description`** — How Claude decides when to delegate to this agent. Write this carefully. "Code review specialist" is less useful than "Expert code review specialist. Proactively reviews code immediately after writing or modifying any code."

**`tools`** — Allowlist of tools. If omitted, the agent inherits all tools from the main conversation. To restrict to read-only, specify `Read, Grep, Glob, Bash`.

**`disallowedTools`** — Denylist that removes tools from the inherited or specified set.

**`model`** — Which model this agent uses. Options: `haiku` (fast, cheap), `sonnet` (balanced), `opus` (most capable), `inherit` (same as main conversation), or a full model ID.

**`permissionMode`** — How the agent handles permission prompts:
  - `default` — Standard prompts
  - `acceptEdits` — Auto-accept file edits
  - `dontAsk` — Auto-deny anything not explicitly allowed
  - `bypassPermissions` — Skip all checks (use with extreme caution)
  - `plan` — Read-only plan mode

**`maxTurns`** — How many agentic turns the agent can take before stopping. Prevents runaway agents.

**`memory`** — Persistent memory scope: `user` (across all projects), `project` (this project, shareable), or `local` (this project, not committed).

**`background`** — Set `true` to always run this agent as a background task.

**`isolation`** — Set `worktree` to run the agent in a temporary git worktree (isolated copy of the repo). The worktree is cleaned up if the agent makes no changes.

**`skills`** — List of skill names to preload into this agent's context at startup. The full skill content is injected, not just made available.

---

## Foreground vs Background Agents

Sub-agents can run in two modes:

**Foreground (blocking):** The main conversation waits until the agent finishes. Permission prompts and questions are passed through to you. Use this when you need to interact with the agent's progress or when the result is immediately needed.

**Background (concurrent):** The agent runs while you continue working. Before launch, Claude Code asks for any tool permissions the agent will need upfront. Once running, it auto-denies anything not pre-approved. Questions from background agents fail silently (the agent continues without the answer).

To background a running task, press `Ctrl+B`. To request background execution explicitly:

```text
Run the test suite in the background and tell me when it's done
```

To see all background tasks:

```text
/tasks
```

If a background agent fails due to missing permissions, you can resume it in the foreground to retry with interactive prompts.

---

## Agent Isolation with Worktrees

For tasks that modify files, you can run an agent in a completely isolated git worktree:

```yaml
---
name: experimental-refactor
description: Experimental refactoring that may need to be discarded
isolation: worktree
---
```

When `isolation: worktree` is set, Claude Code creates a temporary copy of your repository in a separate directory. The agent works in that copy. If the agent makes changes you want to keep, they are available for cherry-picking. If not, the worktree is discarded.

This is ideal for risky or exploratory refactors where you want a safety net without the overhead of creating a branch manually.

You can also start a session in a worktree from the CLI:

```bash
claude -w experimental-caching
```

This creates a worktree at `<repo>/.claude/worktrees/experimental-caching`.

---

## Agent Scoping and Priority

Like skills, agents are scoped by where their files live:

| Location | Scope | Priority |
|---|---|---|
| `--agents` CLI flag | Current session only | Highest |
| `.claude/agents/` | Current project | High |
| `~/.claude/agents/` | All your projects | Medium |
| Plugin's `agents/` directory | Where plugin is enabled | Low |

When two agents have the same name at different scopes, the higher-priority one wins. Run `claude agents` from the command line (outside a session) to see all configured agents grouped by source.

---

## Communication Between Agents

Sub-agents do not communicate directly with each other. Communication flows through the parent:

```text
You
 └── Main Claude conversation
      ├── Delegates to Agent A → returns result to main
      ├── Passes A's result to Agent B → returns result to main
      └── Synthesizes A + B results, reports to you
```

This architecture is intentional. It prevents the complexity of arbitrary agent-to-agent messaging while still enabling sophisticated coordination through the parent.

If you need a more complex topology where agents truly work in parallel and produce independent deliverables, see Chapter 6 on parallel orchestration and the Agent Teams feature.

---

## Resuming Sub-agents

Each sub-agent invocation creates a new instance with fresh context by default. But Claude tracks agent IDs, and you can ask it to resume a previous agent:

```text
Continue the code review where the agent left off
```

Resumed sub-agents retain their full conversation history — all previous tool calls, results, and reasoning. The agent picks up exactly where it stopped.

Sub-agent transcripts are stored at:
```text
~/.claude/projects/{project}/{sessionId}/subagents/agent-{agentId}.jsonl
```

---

## Cost and Performance Considerations

Sub-agents are not free. Each agent start incurs model initialization cost, and each turn consumes tokens. Here are the key levers:

**Use Haiku for exploration.** The built-in Explore agent uses Haiku. For your own research agents, specify `model: haiku` to dramatically reduce cost while keeping reasonable capability.

**Set `maxTurns` explicitly.** Without a limit, an ambitious agent can run indefinitely. For most tasks, 10-20 turns is sufficient. For quick lookups, set it to 3-5.

**Scope tool access tightly.** An agent that can only `Read` and `Grep` will not accidentally run expensive bash commands.

**Use background for non-urgent work.** Background agents do not block your conversation. Kick off a long test run or analysis in the background and keep working.

**Consider the context cost of results.** Sub-agent results return to your main conversation. If a sub-agent produces a 10,000-token analysis, that now lives in your main context. Instruct agents to be concise in their reports.

---

## When to Use Sub-agents vs Doing Work Directly

Use sub-agents when:
- The task produces verbose output you do not need in your main conversation (running tests, fetching docs, processing logs)
- You want to enforce specific tool restrictions
- The work is self-contained and can return a meaningful summary
- You want to parallelize independent tasks

Do work directly in the main conversation when:
- The task requires frequent back-and-forth
- Multiple phases share significant context
- You are making a quick, targeted change
- Latency is important (sub-agents have startup overhead)

Use skills instead of sub-agents when:
- You want a reusable workflow that runs inline in your main context
- The task is short and context isolation is not needed

---

**Next up:** [Chapter 5 — Agent Types Catalog](./05-agent-catalog.md) — An overview of the most useful specialized agent types, with configuration examples for each.
