# Chapter 1: Built-in Slash Commands

Claude Code ships with a rich set of built-in slash commands that cover everything from session management to security analysis. These are not just shortcuts — they are the primary interface for controlling Claude's behavior during a session. Mastering them will dramatically change how efficiently you work.

---

## How Commands Work

Type `/` anywhere in the Claude Code prompt to see a filterable list of available commands. Type additional letters to narrow the results. Some commands take required arguments (`<arg>`) while others accept optional arguments (`[arg]`). Commands not listed here may exist on your installation depending on your platform, plan, and environment — for example, `/desktop` only appears on macOS and Windows.

Skills you or your team have created also appear in the `/` menu alongside built-in commands.

---

## Complete Command Reference

### Session Management

| Command | What it does |
|---|---|
| `/clear` | Clears conversation history and frees context. Aliases: `/reset`, `/new` |
| `/compact [instructions]` | Summarizes the conversation to reclaim context; optional instructions focus what is preserved |
| `/fork [name]` | Creates a branch of the current conversation at this point |
| `/resume [session]` | Resumes a previous session by name or ID, or opens a session picker. Alias: `/continue` |
| `/rename [name]` | Renames the current session for easier identification in `/resume` |
| `/rewind` | Rewinds the conversation and code to a previous checkpoint. Alias: `/checkpoint` |
| `/export [filename]` | Exports the current conversation as plain text |
| `/loop` | Enters continuous loop mode where Claude keeps working until a stopping condition is met |
| `/schedule` | Schedules a task or reminder for later execution |

### Information and Diagnostics

| Command | What it does |
|---|---|
| `/help` | Shows help and available commands |
| `/cost` | Shows token usage statistics for the current session |
| `/context` | Visualizes context usage as a colored grid with optimization suggestions |
| `/doctor` | Diagnoses and verifies your Claude Code installation and settings |
| `/status` | Shows version, model, account, and connection status |
| `/stats` | Shows daily usage history, session streaks, and overall usage patterns |
| `/insights` | Generates a session analysis report (interaction patterns, friction points) |
| `/usage` | Shows current plan usage limits and rate limit status |
| `/release-notes` | Shows what changed in the current Claude Code version |

### Code and Git

| Command | What it does |
|---|---|
| `/diff` | Opens an interactive diff viewer showing uncommitted changes and per-turn diffs |
| `/security-review` | Analyzes pending branch changes for security vulnerabilities |
| `/pr-comments [PR]` | Fetches and displays GitHub PR comments (requires `gh` CLI) |
| `/branch [name]` | Creates a new git branch. Alias: `/fork` (when used with a branch name) |
| `/plan` | Enters plan mode where Claude proposes changes without executing them |

### Configuration and Personalization

| Command | What it does |
|---|---|
| `/config` | Opens the Settings interface. Alias: `/settings` |
| `/model [model]` | Selects or changes the AI model mid-session |
| `/effort [low\|medium\|high\|max\|auto]` | Sets the model effort level |
| `/theme` | Changes the color theme (light, dark, colorblind, ANSI variants) |
| `/color [color\|default]` | Sets the prompt bar color for the current session |
| `/vim` | Toggles Vim / Normal editing modes for the input prompt |
| `/keybindings` | Opens or creates a keybindings configuration file |
| `/memory` | Edits `CLAUDE.md` files and manages auto-memory entries |
| `/init` | Initializes the project with a `CLAUDE.md` guide |
| `/mobile` | Optimizes the interface for mobile or narrow-screen use |
| `/sandbox` | Configures the sandboxing mode for code execution |

### Agents and Tools

| Command | What it does |
|---|---|
| `/agents` | Views, creates, and edits sub-agent configurations |
| `/tasks` | Lists and manages background tasks |
| `/permissions` | Views or updates tool permissions for the current session. Alias: `/allowed-tools` |
| `/hooks` | Shows all hook configurations organized by event type |
| `/skills` | Lists available skills |
| `/mcp` | Manages MCP server connections and OAuth authentication |
| `/plugin` | Manages Claude Code plugins |
| `/reload-plugins` | Reloads all plugins without restarting the session |

### Quick Queries and Utilities

| Command | What it does |
|---|---|
| `/btw <question>` | Asks a side question without adding it to the conversation history |
| `/copy` | Copies the last assistant response to the clipboard |
| `/fast [on\|off]` | Toggles fast mode (lower latency, reduced thoroughness) |
| `/feedback [report]` | Submits feedback or a bug report. Alias: `/bug` |
| `/remote-control` | Enables remote control of the current session. Alias: `/rc` |

### IDE and Integrations

| Command | What it does |
|---|---|
| `/chrome` | Configures Chrome browser integration |
| `/install-github-app` | Sets up the Claude GitHub Actions app for a repository |
| `/install-slack-app` | Installs the Claude Slack app via OAuth flow |

---

## Key Commands in Depth

### `/clear` — Reset Context

Clears the conversation history and frees up context window space. Aliases: `/reset`, `/new`.

Use this when a conversation has grown stale, you have solved one problem and are starting a new one, or the context is getting so large that Claude is losing track of early context.

```text
/clear
```

This is not the same as quitting and restarting — it preserves your MCP connections, tool permissions, and session settings while wiping the message history.

**The difference from `/compact`:** `/clear` completely discards history. `/compact` compresses it into a summary, keeping the essence. If you are mid-task and need to reduce context without losing your place, use `/compact`.

```text
/compact focus on the authentication changes we made
```

### `/resume [session]` — Continue Previous Work

Resumes a previous conversation by name or ID, or opens an interactive session picker. Alias: `/continue`.

```text
/resume
/resume auth-refactor
```

Sessions are named automatically unless you used `/rename` or the `--name` flag at launch. Resuming is one of the most powerful features for long-running projects — you can pick up a multi-day refactor exactly where you left off.

### `/fork [name]` — Explore Without Risk

Creates a fork of the current conversation at this point. Both the original and the fork continue independently from here.

```text
/fork try-approach-b
```

This is invaluable for exploring two different approaches to the same problem without losing either path.

### `/rewind` — Go Back in Time

Rewinds the conversation and code to a previous checkpoint. Alias: `/checkpoint`.

```text
/rewind
```

Running this shows the conversation history so you can select where to rewind to. Claude Code automatically creates checkpoints as it works.

### `/context` — Understand Context Usage

Visualizes current context usage as a colored grid. Shows which tools and memory sources are consuming the most tokens. Includes warnings when you are approaching context limits and optimization suggestions.

```text
/context
```

This is the command to reach for when Claude seems to be forgetting earlier parts of the conversation, or when you want to preemptively check whether you need to compact.

### `/cost` — Monitor Token Usage

Shows token usage statistics for the current session. The output varies by subscription type — API key users see dollar amounts; subscription users see relative usage metrics.

```text
/cost
```

### `/doctor` — Diagnose Problems

Diagnoses and verifies your Claude Code installation and settings. Checks for common configuration problems, connectivity issues, and version mismatches.

```text
/doctor
```

Run this first when anything is behaving unexpectedly. It often surfaces the problem immediately.

### `/model [model]` — Change the Model

Selects or changes the AI model mid-session. Supports model aliases (`sonnet`, `opus`, `haiku`) or full model IDs. For models that support effort levels, use left/right arrows to adjust.

```text
/model
/model opus
/model claude-sonnet-4-6
```

### `/effort [level]` — Control Reasoning Depth

Sets the model effort level without changing the model. Higher effort means more careful reasoning, at the cost of speed and token usage.

```text
/effort low
/effort medium
/effort high
/effort max
/effort auto
```

`max` applies to the current session only and requires Opus 4.6. Without an argument, shows the current level.

### `/btw <question>` — Side Questions

Asks a quick side question without adding it to the conversation history. Claude uses its current context to answer but the exchange is discarded afterward.

```text
/btw what does the AuthMiddleware class do?
```

This is ideal for quick clarifying questions while you are in the middle of a task. Unlike a regular prompt, `/btw` does not accumulate in your context.

### `/diff` — Interactive Diff Viewer

Opens an interactive diff viewer showing uncommitted changes and per-turn diffs. Use left/right arrows to switch between the current git diff and individual Claude turns. Use up/down to browse files.

```text
/diff
```

Particularly useful for reviewing what Claude has changed across multiple turns before committing.

### `/security-review` — Security Scan Before Merging

Analyzes pending changes on the current branch for security vulnerabilities. Reviews the git diff and identifies risks like injection vulnerabilities, authentication issues, and data exposure.

```text
/security-review
```

Run this before merging any branch that touches authentication, user input handling, or external API calls.

### `/plan` — Review Before Acting

Enters plan mode directly from the prompt. Claude analyzes your codebase and proposes changes without executing them, letting you review before anything is modified.

```text
/plan
```

### `/loop` — Continuous Execution Mode

Enters continuous loop mode where Claude keeps working autonomously until a defined stopping condition is met. Useful for long-running tasks like processing all files in a directory or completing a series of related fixes.

```text
/loop
```

### `/schedule` — Deferred Tasks

Schedules a task or reminder to run at a later time, letting you queue work without blocking your current session.

```text
/schedule
```

### `/permissions` — Tool Access Control

Views or updates tool permissions for the current session. Alias: `/allowed-tools`.

```text
/permissions
```

### `/hooks` — View Hook Configuration

Shows all hook configurations for the current session, organized by event type. Tells you which settings file each hook comes from and what command it runs.

```text
/hooks
```

### `/mcp` — MCP Server Management

Manages MCP server connections and handles OAuth authentication flows for remote servers. Use this to check server status, authenticate with servers that require OAuth, and diagnose connection problems.

```text
/mcp
```

### `/agents` — Sub-agent Management

Manages sub-agent configurations. View available agents, create new ones with guided setup or Claude-generated prompts, edit existing configurations, and see which agents are active when duplicates exist.

```text
/agents
```

### `/install-github-app` — GitHub Actions Setup

Sets up the Claude GitHub Actions app for a repository. Walks you through selecting a repo and configuring the integration, including creating the required secrets.

```text
/install-github-app
```

---

## Power User Patterns

**Start every new project with `/init`.** This one-time investment creates a `CLAUDE.md` that dramatically improves Claude's performance on your codebase for all future sessions.

**Use `/compact` before big tasks.** If you have had a long exploratory conversation and now want Claude to implement something, compact first. Claude will have a fresh summary of the key decisions rather than a long raw history.

**Chain `/pr-comments` with a fix request.** Fetch review comments, then immediately ask Claude to address them. Claude will read both the comments and the current code state and make targeted fixes.

**Use `/btw` aggressively.** Many developers do not realize `/btw` exists. It is perfect for quick clarifying questions mid-task without polluting context.

**Set effort explicitly for complex tasks.** For architecture decisions or security reviews, `/effort high` or `/effort max` gives you Claude's most careful reasoning. Drop back to `/effort auto` for routine tasks to preserve speed.

**Use `/fork` to explore alternatives.** Before committing to a major refactor direction, fork the conversation and try both paths. You can always return to the original fork.

**Rename sessions for multi-project workflows.** When working across multiple projects or long-running tasks, use `/rename` to give sessions meaningful names, then use `/resume` to switch between them by name.

---

**Next up:** [Chapter 2 — Custom Skills](./02-custom-skills.md) — How to write your own slash commands and automate repeatable workflows.
