# Chapter 1: Built-in Slash Commands

Claude Code ships with a rich set of built-in slash commands that cover everything from session management to security analysis. These are not just shortcuts — they are the primary interface for controlling Claude's behavior during a session. Mastering them will dramatically change how efficiently you work.

---

## How Commands Work

Type `/` anywhere in the Claude Code prompt to see a filterable list of available commands. Type additional letters to narrow the results. Some commands take required arguments (`<arg>`) while others accept optional arguments (`[arg]`). Commands not listed here may exist on your installation depending on your platform, plan, and environment — for example, `/desktop` only appears on macOS and Windows.

Skills you or your team have created also appear in the `/` menu alongside built-in commands.

---

## Session Management

### `/clear`

Clears the conversation history and frees up context window space. Aliases: `/reset`, `/new`.

Use this when a conversation has grown stale, you have solved one problem and are starting a new one, or the context is getting so large that Claude is losing track of early context.

```text
/clear
```

This is not the same as quitting and restarting — it preserves your MCP connections, tool permissions, and session settings while wiping the message history.

### `/compact [instructions]`

Summarizes the conversation into a compressed form to reclaim context space while retaining the key decisions, code changes, and conclusions. Unlike `/clear`, you keep a working memory of what happened.

```text
/compact focus on the authentication changes we made
```

The optional instructions tell Claude which parts of the conversation are most important to preserve in the summary. Without instructions, Claude summarizes everything.

### `/resume [session]`

Resume a previous conversation by name or ID, or open an interactive session picker.

```text
/resume
/resume auth-refactor
```

Sessions are named automatically unless you used `/rename` or the `--name` flag at launch. Resuming is one of the most powerful features for long-running projects — you can pick up a multi-day refactor exactly where you left off. Alias: `/continue`.

### `/fork [name]`

Creates a fork of the current conversation at this point. Both the original and the fork continue independently from here. This is invaluable for exploring two different approaches to the same problem without losing either path.

```text
/fork try-approach-b
```

### `/rewind`

Rewinds the conversation and code to a previous checkpoint. Alias: `/checkpoint`.

```text
/rewind
```

Use this when Claude took a wrong turn several steps ago and you want to go back and try a different direction. Claude Code automatically creates checkpoints as it works.

### `/rename [name]`

Renames the current session for easier identification in `/resume`. Without a name argument, Claude auto-generates one from the conversation history.

```text
/rename payment-gateway-refactor
```

---

## Context and Cost Visibility

### `/cost`

Shows token usage statistics for the current session. Helps you understand how much context you have consumed and what it has cost.

```text
/cost
```

The output varies by subscription type. API key users see dollar amounts; subscription users see relative usage metrics.

### `/context`

Visualizes current context usage as a colored grid. Shows which tools and memory sources are consuming the most tokens. Includes warnings when you are approaching context limits and optimization suggestions.

```text
/context
```

This is the command to reach for when Claude seems to be forgetting earlier parts of the conversation, or when you want to preemptively check whether you need to compact.

### `/stats`

Shows daily usage history, session streaks, model preferences, and overall usage patterns. Useful for understanding how your Claude Code usage trends over time.

```text
/stats
```

### `/usage`

Shows your current plan's usage limits and rate limit status. Useful when you are approaching limits and want to know how much headroom remains.

```text
/usage
```

---

## Project Setup

### `/init`

Initializes the current project with a `CLAUDE.md` guide. Claude analyzes your project structure, existing code, and configuration files to generate a tailored memory file that it will read at the start of every future session.

```text
/init
```

Run this once when you start using Claude Code on an existing project. The generated `CLAUDE.md` will contain detected build commands, test commands, coding conventions, and architecture notes. You can edit it afterward to add anything Claude missed.

### `/memory`

Opens an interface for editing `CLAUDE.md` files, enabling or disabling auto-memory, and viewing auto-memory entries. This is the central place for managing what Claude remembers about your project.

```text
/memory
```

Auto-memory is Claude's ability to automatically save learnings — like the test command or a key architectural decision — without you manually editing `CLAUDE.md`. This command lets you review and curate those auto-saved entries.

### `/add-dir <path>`

Adds a new working directory to the current session. Claude can then read, edit, and create files in that directory.

```text
/add-dir ../shared-lib
/add-dir /absolute/path/to/other-repo
```

Useful for monorepos or multi-repository workflows where the relevant code spans more than one directory.

---

## Code Review and Quality

### `/pr-comments [PR]`

Fetches and displays comments from a GitHub pull request. Automatically detects the PR for your current branch, or you can pass a PR URL or number directly. Requires the `gh` CLI to be installed.

```text
/pr-comments
/pr-comments 456
/pr-comments https://github.com/acme/backend/pull/456
```

After this command loads the PR comments, you can ask Claude to address them: "Go through these review comments and fix each one."

### `/security-review`

Analyzes pending changes on the current branch for security vulnerabilities. Reviews the git diff and identifies risks like injection vulnerabilities, authentication issues, and data exposure.

```text
/security-review
```

Run this before merging any branch that touches authentication, user input handling, or external API calls. It is faster and more focused than a general code review.

### `/diff`

Opens an interactive diff viewer showing uncommitted changes and per-turn diffs. Use left/right arrows to switch between the current git diff and individual Claude turns. Use up/down to browse files.

```text
/diff
```

Particularly useful for reviewing what Claude has changed across multiple turns before committing.

---

## Diagnostics and Configuration

### `/doctor`

Diagnoses and verifies your Claude Code installation and settings. Checks for common configuration problems, connectivity issues, and version mismatches.

```text
/doctor
```

Run this first when anything is behaving unexpectedly. It often surfaces the problem immediately.

### `/config`

Opens the Settings interface where you can adjust theme, model, output style, and other preferences. Alias: `/settings`.

```text
/config
```

### `/model [model]`

Selects or changes the AI model mid-session. Supports model aliases (`sonnet`, `opus`, `haiku`) or full model IDs. For models that support effort levels, use left/right arrows to adjust.

```text
/model
/model opus
/model claude-sonnet-4-6
```

The change takes effect immediately — you do not need to wait for the current response to finish.

### `/effort [low|medium|high|max|auto]`

Sets the model effort level without changing the model. Higher effort means more careful reasoning, at the cost of speed and token usage. `max` applies to the current session only and requires Opus 4.6.

```text
/effort high
/effort max
/effort auto
```

Without an argument, shows the current level.

### `/permissions`

Views or updates tool permissions for the current session. Lets you allow or deny specific tools or tool patterns. Alias: `/allowed-tools`.

```text
/permissions
```

### `/hooks`

Shows all hook configurations for the current session, organized by event type. Tells you which settings file each hook comes from and what command it runs.

```text
/hooks
```

---

## MCP and Integrations

### `/mcp`

Manages MCP server connections and handles OAuth authentication flows for remote servers.

```text
/mcp
```

Use this to check server status, authenticate with servers that require OAuth, and diagnose connection problems.

### `/agents`

Manages subagent configurations. View available agents, create new ones with guided setup or Claude-generated prompts, edit existing configurations, and see which agents are active when duplicates exist.

```text
/agents
```

### `/install-github-app`

Sets up the Claude GitHub Actions app for a repository. Walks you through selecting a repo and configuring the integration, including creating the required secrets.

```text
/install-github-app
```

### `/install-slack-app`

Installs the Claude Slack app by opening a browser to complete the OAuth flow.

```text
/install-slack-app
```

---

## Navigation and Utilities

### `/help`

Shows help and available commands. A good starting point if you are not sure what is available.

```text
/help
```

### `/btw <question>`

Asks a quick side question without adding it to the conversation history. Claude uses its current context to answer but the exchange is discarded afterward.

```text
/btw what does the AuthMiddleware class do?
```

This is ideal for quick clarifying questions while you are in the middle of a task. Unlike a regular prompt, `/btw` does not accumulate in your context.

### `/copy`

Copies the last assistant response to the clipboard. When code blocks are present, shows an interactive picker so you can choose a specific block or the full response.

```text
/copy
```

### `/export [filename]`

Exports the current conversation as plain text. With a filename writes directly to a file; without opens a dialog.

```text
/export
/export session-notes.txt
```

### `/plan`

Enters plan mode directly from the prompt. In plan mode, Claude analyzes your codebase and proposes changes without executing them, letting you review before anything is modified.

```text
/plan
```

### `/vim`

Toggles between Vim and Normal editing modes for the input prompt.

```text
/vim
```

### `/theme`

Changes the color theme. Includes light and dark variants, colorblind-accessible daltonized themes, and ANSI themes that use your terminal's palette.

```text
/theme
```

### `/exit`

Exits the CLI. Alias: `/quit`.

```text
/exit
```

---

## Power User Patterns

**Start every new project with `/init`.** This one-time investment creates a `CLAUDE.md` that dramatically improves Claude's performance on your codebase for all future sessions.

**Use `/compact` before big tasks.** If you have had a long exploratory conversation and now want Claude to implement something, compact first. Claude will have a fresh summary of the key decisions rather than a long raw history.

**Chain `/pr-comments` with a fix request.** Fetch review comments, then immediately ask Claude to address them. Claude will read both the comments and the current code state and make targeted fixes.

**Use `/btw` aggressively.** Many developers do not realize `/btw` exists. It is perfect for quick clarifying questions mid-task without polluting context.

**Set effort explicitly for complex tasks.** For architecture decisions or security reviews, `/effort high` or `/effort max` gives you Claude's most careful reasoning. Drop back to `/effort auto` for routine tasks to preserve speed.

---

**Next up:** [Chapter 2 — Custom Skills](./02-custom-skills.md) — How to write your own slash commands and automate repeatable workflows.
