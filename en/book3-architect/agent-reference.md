# Agent Type Reference

> Verified on 2026-10-04 with Claude Code 2.1.289.

This appendix is a lookup table for the agent types Claude Code ships with and the fields you can set in an agent file. For how and when to use subagents, read [Subagents](/en/book2-advanced/05-subagents); for ready-made roles, see the [Agent Catalog](/en/book2-advanced/06-agent-catalog). Field names and defaults change between versions, so where a row carries a version requirement it is quoted from the [sub-agents documentation](https://code.claude.com/docs/en/sub-agents).

## Ways an agent runs

| Kind | What it is | Typical use |
| --- | --- | --- |
| Main session | The conversation you type into. | Everything by default. |
| Subagent | A worker with its own context window, system prompt, tool list and permissions. Only its summary returns to the parent. | Side tasks that would flood the main context with search results or logs. |
| Fork | A subagent that inherits the whole conversation so far. Start one with `/subtask <task>` (v2.1.212 or later; on v2.1.161 to v2.1.211 the command was `/fork`, which now copies the session into a new background session). | Hand off a side task without re-explaining. Shares the parent's prompt cache. |
| Background session | An independent session you dispatch and watch from agent view (`claude agents`). | Many parallel tasks. See [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions). |
| Agent-team teammate | A session that a lead session spawns and supervises. | Coordinated multi-agent work. See [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents). |
| Non-interactive run | `claude -p "..."`; no session UI. | CI and scripts. |

## Built-in subagents

Built-ins inherit the parent's permission rules. Explore and Plan skip your CLAUDE.md files and the git status snapshot to stay cheap; every other subagent loads both unless its definition sets `omitClaudeMd`.

| Agent | Model | Tools | Used for |
| --- | --- | --- | --- |
| `Explore` | The main conversation's model. (When the main model is Fable, Explore runs on the Opus the `opus` alias resolves to if you connect with a subscription, Console account or LLM gateway through `ANTHROPIC_BASE_URL`; on Bedrock, Google Cloud's Agent Platform, Microsoft Foundry, Claude Platform on AWS and a Claude apps gateway it stays on the main model.) | Read-only; Write and Edit denied. | File discovery and code search. Claude picks a thoroughness level: quick, medium or very thorough. |
| `Plan` | Inherits the main conversation. | Read-only; Write and Edit denied. | Research during plan mode. |
| `general-purpose` | `CLAUDE_CODE_SUBAGENT_MODEL` if set and nothing else assigns a model; otherwise the main conversation's model. | Every tool available to subagents. | Multi-step tasks that need both exploring and changing code. |
| `claude` | None of its own. | Every tool available to subagents. | Catch-all; also the default agent for dispatched background sessions. |
| `statusline-setup` | Sonnet | Not listed in the docs. | Runs when you use `/statusline`. |
| `claude-code-guide` | Haiku | Not listed in the docs. | Answers questions about Claude Code features. |

Two changes since the first edition matter most. Explore used to run on a small fast model; it now follows the main conversation. To keep exploration cheap, define your own subagent named `Explore` with `model: haiku`; a user or project definition overrides the built-in. And subagents can now spawn their own subagents.

### Switching built-ins off

- Block one type: add it to `permissions.deny` (for example an `Agent(fork)` rule for forks).
- Block all delegation: deny the `Agent` tool.
- Remove only Explore and Plan: set `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1` (v2.1.198 or later).
- In non-interactive mode and the Agent SDK, `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1` removes every built-in type.

## Agent file format

An agent is a Markdown file with YAML frontmatter; the body is the system prompt. A subagent receives that prompt plus basic environment details, not the Claude Code system prompt. Only `name` and `description` are required.

```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices. Use after code changes.
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. Give specific, actionable feedback.
```

### Where agent files live

Highest priority first:

| Location | Scope |
| --- | --- |
| Managed settings (`.claude/agents/` in the managed settings directory) | Organization |
| `--agents` CLI flag (JSON, session only) | Current session |
| `.claude/agents/` | Current project |
| `~/.claude/agents/` | All your projects |
| A plugin's `agents/` directory | Where the plugin is enabled |

Directories are scanned recursively, and identity comes only from `name`, so subfolders are for your own tidiness. Edits to existing agent directories are picked up within a few seconds; the first agent file in a brand-new `agents` directory needs a restart.

### Frontmatter fields

Names are camelCase and must match exactly. Claude Code silently ignores a field it does not recognize.

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Unique ID. Cannot contain `:` or start with `-`. |
| `description` | Yes | When Claude should delegate. Keep it short: combined custom descriptions over 15,000 tokens trigger a startup warning. |
| `tools` | No | Allowlist, comma-separated or a YAML list. Omitted means every tool available to subagents. |
| `disallowedTools` | No | Denylist, applied before `tools`. An entry such as `Bash(git push *)` still removes the whole tool; use a permission deny rule for command-level blocks. |
| `model` | No | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit`. |
| `permissionMode` | No | `default` (alias `manual`), `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`. Ignored if the parent runs in `bypassPermissions`, `acceptEdits` or auto mode. |
| `maxTurns` | No | Stop after this many agentic turns; output is marked partial (v2.1.246 or later). |
| `skills` | No | Skills whose full content is injected at startup. |
| `mcpServers` | No | Server names or inline definitions scoped to this agent. |
| `hooks` | No | Lifecycle hooks scoped to this agent. |
| `memory` | No | Persistent memory scope: `user`, `project` or `local`. |
| `background` | No | `true` always runs it in the background. |
| `omitClaudeMd` | No | `true` skips user, project and local CLAUDE.md (v2.1.271 or later). |
| `effort` | No | `low`, `medium`, `high`, `xhigh` or `max`; available levels depend on the model. |
| `isolation` | No | `worktree` runs it in a temporary git worktree, cleaned up if nothing changed. |
| `color` | No | Display color in the task list. |
| `initialPrompt` | No | First user turn when the agent runs as the main session agent. |
| `experimental` | No | Map of options; `cacheTtl: 5m` or `1h` chooses the prompt-cache lifetime (v2.1.248 or later). |

Plugin-supplied agents ignore `hooks`, `mcpServers` and `permissionMode` for security. To use them, copy the file into `.claude/agents/`.

::: warning Not an agent field
`disable-model-invocation` is a skill setting, not an agent field. Putting it in an agent file does nothing, because unrecognized fields are ignored without an error. To stop Claude delegating to an agent, deny the type with `permissions.deny` instead.
:::

### Model resolution order

1. The `model` Claude passes for that one invocation.
2. The agent's `model` frontmatter (`inherit` means the main model).
3. `CLAUDE_CODE_SUBAGENT_MODEL`.
4. The main conversation's model.

A family alias such as `opus` resolves to the main model's exact version when the main model is in that family. To force one model everywhere, set `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` as well (v2.1.257 or later); definitions then stop choosing models. Subagents inherit the session's extended-thinking setting; there is no per-agent switch.

## Controlling who can spawn whom

- Subagents can nest by default, up to three layers below the main conversation. Set `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` to change it; `1` turns nesting off.
- At the depth limit the `Agent` tool is withheld from the subagent. To keep a given agent from spawning at all, leave `Agent` out of its `tools` or list it in `disallowedTools`.
- An allowlist of spawnable types, `tools: Agent(worker, researcher), Read, Bash`, works only for an agent run as the main thread with `claude --agent`. Inside a subagent definition the type list is ignored.
- Twenty subagents may run at once by default; the twenty-first fails with `Concurrent subagent limit reached`. Change it with `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` (v2.1.217 or later).

## Tools a subagent never gets

Every subagent loses `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode` (unless its `permissionMode` is `plan`), `ScheduleWakeup`, `WaitForMcpServers`, `Workflow` and `EndConversation`. Background subagents, which is the default when fork mode is on, keep only a reduced built-in set plus all MCP tools.

## Agent SDK

To build your own agent product rather than configure Claude Code, use the [Agent SDK](https://platform.claude.com/docs/en/agent-sdk/overview). The first edition showed a TypeScript snippet with an `AgentRuntime` class; that code was not taken from the SDK documentation, so check the SDK pages for the current API.

### Check that it worked

1. Save a file with `name` and `description` in `.claude/agents/`.
2. Ask Claude to use it by name ("Use the code-reviewer agent on this diff"). Typing `@` and the agent name also works as an explicit mention.
3. While it runs, open `/tasks`: the row names the agent and the model it is using. If the file was skipped (no `name`, no `description`, bad YAML), run Claude Code with `--debug` to see why, or run `claude plugin validate .claude/agents`.

## Sources

- Create custom subagents, Anthropic, Claude Code documentation (accessed 2026-10-04): https://code.claude.com/docs/en/sub-agents
- Claude Code CLI help, version 2.1.289 (`claude --help`, `claude agents --help`).
- Agent SDK overview, Anthropic (accessed 2026-10-04): https://platform.claude.com/docs/en/agent-sdk/overview
