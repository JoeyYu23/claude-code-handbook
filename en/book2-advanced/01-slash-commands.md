# Slash Commands

> Verified on 2026-10-04 with Claude Code 2.1.289.

Slash commands are how you steer a session without writing a prompt: switch models, free up context, branch a conversation, review a diff, or hand a long task to a loop that keeps going until a condition holds. This chapter covers the commands that matter most to a developer who runs agents all day, and the few that changed meaning since early 2026.

The full list is long and changes almost weekly. Treat the official [commands reference](https://code.claude.com/docs/en/commands) as the source of truth, and this chapter as the map of what to reach for and when.

## How commands work

Type `/` at the prompt to open a filterable menu, then keep typing to narrow it. A few things are worth knowing about how the menu and the parser behave:

- **Only at the start.** A command is recognized only at the start of your message. Anything after the name becomes its arguments.
- **Queued or immediate.** If you send a command while Claude is still responding, Claude Code usually queues it until the turn ends. Some, such as `/status`, `/tasks` and `/usage`, run immediately without interrupting the response.
- **Not everything shows for everyone.** Availability depends on platform, plan and provider. `/desktop`, for example, appears only on macOS and x64 Windows with a Claude subscription, and the artifact-based commands are unavailable on Amazon Bedrock, Google Cloud and Microsoft Foundry.
- **Built-ins vs bundled skills.** Most entries are built-in commands with fixed behavior. Others, marked **Skill** in the reference, are bundled skills: prompts handed to Claude, which then does the work with its tools. `/code-review`, `/doctor`, `/loop`, `/batch`, `/design` and `/verify` are bundled skills. The difference matters: a bundled skill spends tokens and its quality depends on the model and effort level.
- **Your skills share the menu.** Skills you write appear alongside built-ins, and MCP servers can expose prompts that appear as commands. A skill with the same name as a built-in replaces it in a local terminal session, though not its aliases. See [Custom Skills](/en/book2-advanced/02-custom-skills).

## The commands you will use daily

### Context and conversation

| Command | What it does |
|---|---|
| `/clear [name]` | Starts a new conversation with empty context. Pass a name to label the old one in the `/resume` picker. Aliases: `/reset`, `/new` |
| `/compact [instructions]` | Summarizes the conversation to free space, optionally focused by your instructions |
| `/context [all]` | Shows context usage as a colored grid, with suggestions for heavy tools, memory bloat and capacity warnings |
| `/resume [session]` | Resumes a conversation by ID or name, or opens the picker. Alias: `/continue` |
| `/rename [name]` | Names the session; without a name, generates one from the conversation |
| `/rewind` | Rolls code and conversation back to a checkpoint, or summarizes from a chosen message. Aliases: `/checkpoint`, `/undo` |
| `/btw [question]` | Asks a side question without adding it to the conversation history |
| `/export [filename]` | Exports the conversation as plain text |

`/clear` is no longer a one-way door. In the same Claude Code process you can get the cleared conversation back from the rewind menu, or with `/resume`.

### Model, effort and modes

| Command | What it does |
|---|---|
| `/model [model]` | Switches the model and saves it as your default for new sessions. In the picker, press `s` on a row to switch for this session only |
| `/effort [level\|auto\|status]` | Sets effort: `low` through `xhigh`, `max`, or `auto`. `max` lasts for the session only |
| `/plan [description]` | Enters plan mode; with a description, starts planning that task right away |
| `/fast [on\|off]` | Toggles fast mode |
| `/permissions` | Manages allow, ask and deny rules, and shows recent auto mode denials. Alias: `/allowed-tools` |
| `/config [key=value ...]` | Opens settings, or sets a key directly, for example `/config theme=dark` |

Two behaviors are easy to miss. `/model` now persists your choice as the default unless you use the session-only `s` key. And changing the model or effort mid-session can cost you the prompt cache: Claude Code warns before a switch that would invalidate it. [Voice, Fast Mode and Effort](/en/book2-advanced/20-voice-fast-effort) and [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) cover the trade-off.

### Before you ship

| Command | What it does |
|---|---|
| `/diff` | Reviews working-tree changes, including Claude's edits so far |
| `/code-review [level] [--fix] [--comment] [--max-findings n] [target]` | Reviews the current diff, or a PR number, branch or path, for correctness bugs. Alias: `/review` |
| `/security-review` | Checks the branch's diff against `origin`'s default branch for security vulnerabilities |
| `/simplify [target]` | Looks for cleanup opportunities (reuse, simplification, efficiency, abstraction level) and applies them. It does not hunt for bugs |
| `/verify` | Builds and runs your app to confirm a change works, rather than relying on tests alone. Runs only when you invoke it |

## The new commands in depth

### `/goal`: keep working until a condition holds

`/goal` sets a completion condition and lets Claude keep taking turns without you prompting each one. After every turn, a separate model checks whether the condition holds. If not, Claude starts another turn. The goal clears when the condition is met, when the evaluator judges it impossible, when a turn fails on an error you have to fix, or when you clear it.

```text
/goal all tests in test/auth pass and the lint step is clean
```

Setting a goal starts a turn at once, with the condition itself as the instruction. Run `/goal` with no argument to see the condition, how long it has run and how many turns were evaluated. `/goal clear` (or `stop`, `off`, `reset`, `none`, `cancel`) ends it early. One goal can be active per session.

Three things make a goal work well:

1. **The evaluator reads the transcript, not your disk.** It does not run commands or open files itself. Write the condition so that Claude's own output proves it: "`npm test` exits 0" works because the test output lands in the conversation.
2. **One measurable end state, plus constraints.** A test result, a build exit code, a file count, an empty queue. Add what must not change, such as "no other test file is modified".
3. **A bound.** Add a clause such as `or stop after 20 turns`. The condition can be up to 4,000 characters.

A goal does not change your permission mode. In manual mode Claude still stops to ask before unapproved tool calls, so a goal only runs unattended in [auto mode](/en/book1-getting-started/06-auto-mode-and-permissions). The docs describe the pairing this way: auto mode removes per-tool prompts, and `/goal` removes per-turn prompts.

`/goal` is the session-scoped cousin of a Stop hook. A Stop hook lives in settings and applies to every session in its scope; `/goal` is typed once and lasts for this session. `/loop`, by contrast, repeats on a time interval. [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents) shows `/goal` inside larger setups.

### `/branch`, `/fork` and `/subtask`: three ways to split a conversation

These three names are easy to mix up, and their meanings shifted during 2026. As of 2.1.289:

| Command | What you get | Where the result goes |
|---|---|---|
| `/branch [name]` | A copy of the conversation, and you switch into it. The original stays available through `/resume` | You keep working in the branch |
| `/fork [prompt]` | A copy of the conversation as a new **background session**, while you keep working here | The copy runs on its own; watch it in `claude agents` |
| `/subtask <task>` | A forked **subagent** that inherits the full conversation and works in the background | Its result comes back into this conversation |

`/fork` with a prompt starts the copy working on it immediately. Unless the copy edits in place, Claude Code tells it to create its own worktree before changing code, so two copies do not trample each other's files. On versions 2.1.161 through 2.1.211, and whenever agent view is turned off, `/fork` starts a forked subagent instead, which is what `/subtask` does today. If an older tutorial says `/fork` "reports back", that is the behavior it describes.

Use `/branch` to try a different direction yourself, `/fork` to let a second session pursue an idea in parallel, and `/subtask` for a side task whose answer you need in this conversation. [Subagents](/en/book2-advanced/05-subagents) and [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions) go deeper.

### `/usage`: one place for cost, limits and stats

`/usage` shows session cost, your plan's usage limits and activity stats. On Pro, Max, Team and Enterprise plans it includes a breakdown of what counts against your limits, including which skills, subagents and MCP servers drove usage. `/cost` and `/stats` are now aliases of `/usage` (`/stats` opens on the Stats tab).

When a usage limit blocks you, `/rate-limit-options` lists ways to keep going: wait and continue automatically when the limit resets, add usage credits, or upgrade. [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) covers how to read these numbers.

### `/doctor`: setup checkup and prompt audit

`/doctor` used to be a read-only diagnostics screen. It is now a bundled skill that checks installation health (duplicate installs, `PATH` problems, unparseable settings files), flags slow hooks, finds skills, MCP servers and plugins whose context cost outweighs their use, and can trim checked-in `CLAUDE.md` files by cutting what Claude could derive from the code. It reports findings first and asks before changing anything. Alias: `/checkup`.

```text
/doctor
/doctor prompt-audit
```

`/doctor prompt-audit` (2.1.283 and later) is a different job: Claude audits your `CLAUDE.md` files, skills, agents and commands for outdated or conflicting instructions, including prompting patterns written for older models. Run it after a model upgrade. From the shell, `claude doctor` prints read-only installation diagnostics without starting a session.

### `/code-review`: review at a chosen depth

`/code-review` reviews the current diff for correctness bugs, or a PR number, branch or path you pass. It takes an effort level and a few flags:

```text
/code-review
/code-review high 1234
/code-review --fix
/code-review --comment
/code-review ultra
```

- The level (`low`, `medium`, `high`, `xhigh`, `max`) sets depth. With no level, it reuses the last one you typed.
- `--fix` applies the findings. `--comment` posts them on the GitHub PR or GitLab merge request.
- `--max-findings <n>|all|default` (2.1.288 and later) reports more or fewer findings than the usual limit.
- `ultra` runs a deep multi-agent review in a cloud sandbox ([ultrareview](https://code.claude.com/docs/en/ultrareview)). It includes 3 free runs on Pro and Max, then needs usage credits. `/ultrareview` is an alias, and `claude ultrareview` runs it from the shell.

`/code-review` runs as a background subagent, so you can keep working while it reviews. `/review` is now an alias of `/code-review`; before 2.1.223 it was a separate single-pass PR reviewer.

### `/design`: draft UI as artboards

`/design [brief]` (research preview, 2.1.265 and later) drafts UI mockups, screen flows, landing pages or posters as artboards on one canvas, published as a Claude Design artifact. You edit the artboards in a desktop browser, export them as PNG or PDF, and have Claude implement the one you pick.

```text
/design a settings screen for a mobile banking app
```

It needs a session where artifacts are available and an account where the Design template is on, so it is unavailable on Bedrock, Google Cloud, Foundry and Claude Platform on AWS. [Agents That See](/en/book2-advanced/14-agents-that-see) covers the visual loop.

## Other commands worth knowing

| Command | What it does |
|---|---|
| `/background [prompt]` | Detaches this session to run as a background agent and frees the terminal. Alias: `/bg` |
| `/tasks` | Lists background work in this session, including finished subagents |
| `/batch <instruction>` | Splits a large change into 5 to 30 independent units, each in its own worktree and background subagent |
| `/loop [interval] [prompt]` | Repeats a prompt while the session is open; omit the interval and Claude paces itself |
| `/schedule [description]` | Creates and manages cloud [routines](/en/book3-architect/06-scheduled-agents-routines). Alias: `/routines` |
| `/skills`, `/skill-doctor`, `/reload-skills` | List skills, show each skill's context cost and usage, and pick up skills changed on disk |
| `/plugin`, `/reload-plugins` | Manage plugins and apply changes without restarting |
| `/hooks`, `/mcp` | Show hook configuration; manage MCP servers (`/mcp reconnect all` retries failed ones) |
| `/memory`, `/init` | Edit `CLAUDE.md` and auto memory; generate a starter `CLAUDE.md` |
| `/import [codex\|gemini\|cursor]` | Brings instruction files, MCP servers, commands, subagents and skills over from another agent. `--dry-run` previews |
| `/advisor [model\|off]` | Pairs your model with a stronger advisor it consults at key moments |
| `/autocompact [auto\|<tokens>]` | Sets how full the context gets before auto-compaction |
| `/output-style [style]` | Lists or switches output styles, for example `concise` |
| `/remote-control`, `/teleport`, `/desktop` | Continue this session from another device, pull a cloud session here, or open it in the desktop app |
| `/status`, `/help`, `/release-notes` | Version, model and account; help; changelog picker |

### Removed or renamed commands

- `/pr-comments` was removed in 2.1.91. Ask Claude to read the PR comments instead.
- `/vim` was removed in 2.1.92. Use `/config` and set the editor mode.
- `/agents` no longer opens an editor (since 2.1.198). It reminds you to ask Claude to create subagents or to edit `.claude/agents/` directly.
- `/mobile` shows a QR code to download the mobile app; it does not change the layout.
- `/ultraplan` was removed. Use plan mode.

## Patterns that pay off

**Pair `/goal` with a check Claude can show.** "Done" should be a command whose output lands in the transcript. Vague goals ("make it better") run until the evaluator gives up or your turn bound hits.

**Run `/context` before you `/compact`.** It tells you what is actually filling the window. Often the answer is an MCP server or a skill listing, not the conversation, and compaction will not fix that.

**Review at two depths.** Use `/code-review` at your normal level on every change, and save `ultra` for changes that touch money, auth or data. Use `/simplify` separately; it looks at cleanup, not bugs.

**Use `/btw` for questions that should not stick.** It answers from current context and leaves no trace in history, so it does not crowd out the task.

**Run `/doctor prompt-audit` after every model change.** Instructions written to coax an older model can fight a newer one.

### Check that it worked

1. Run `/status` and confirm the version line shows 2.1.289 or later. Several commands in this chapter have minimum versions.
2. Type `/go` and confirm `/goal` is highlighted in the menu. If it is missing, see [Troubleshooting](/en/book1-getting-started/troubleshooting).
3. Run `/usage` and confirm you see your plan's limits (or session cost on an API key).
4. Run `/doctor`. It should finish with a findings report and ask before changing anything.

## Sources

- Commands reference, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- Keep Claude working toward a goal, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/goal
- What's new, weekly digests for Weeks 20–37 (May 11 – September 11, 2026), Anthropic. https://code.claude.com/docs/en/whats-new
- Claude Code changelog, entries 2.1.283 (2026-09-25) and 2.1.288 (2026-10-02), Anthropic. https://code.claude.com/docs/en/changelog
- `claude --help`, Claude Code 2.1.289, run 2026-10-04.
