# The Agent View and Sessions

> Verified on 2026-10-04 with Claude Code 2.1.289.

A subagent lives inside one conversation and reports back to it. A session is a whole conversation of its own. Once you have more than one independent task, the useful unit stops being the subagent and becomes the session: one for the bug fix, one for the review, one for the flaky test, each running on its own while you check in on whichever needs you.

Claude Code now has three pieces for this:

- **Agent view** (`claude agents`): one screen that dispatches background sessions and shows which ones are working, waiting on you, or done.
- **Cross-session messaging**: Claude in one session can find your other sessions and send them a message, and you can name a target with an `@` mention.
- **Background sessions from the shell**: `claude --bg`, `claude attach`, `claude logs` and friends, for scripts and for people who prefer a plain terminal.

Agent view is a research preview. Its keys and layout may change.

## Which tool for which job

| You want | Use |
|---|---|
| A side task inside this conversation that returns a summary | A [subagent](/en/book2-advanced/05-subagents) |
| Several independent tasks you hand off and check on later | Agent view |
| Sessions you run yourself to pass findings to each other | Cross-session messaging |
| Claude to split a project, assign teammates and keep them in sync | Agent teams (experimental; see [Orchestrating Many Agents](/en/book3-architect/04-orchestrating-many-agents)) |
| A scripted fan-out of many subagents with cross-checks | Dynamic workflows (see [Automated Workflows](/en/book2-advanced/10-automated-workflows)) |
| Parallel sessions that never edit the same files | [Worktrees](/en/book2-advanced/08-worktrees), which agent view uses for you |

Every one of these multiplies token use. Ten background sessions draw on your plan roughly ten times as fast as one. Check `/usage` before you dispatch a dozen; [Tokens, Limits and Caching](/en/book2-advanced/16-tokens-limits-caching) covers the limits.

## Agent view

### Open it and dispatch work

From your shell:

```bash
claude agents
```

If you have not trusted the directory before, the workspace trust dialog appears first. Agent view then opens with a table of sessions and an input at the bottom.

Type a task and press `Enter`. A new background session starts on it and appears as a row. Every prompt you enter starts a **new** session; it is not a follow-up to the last one. Type three prompts and you have three sessions running in parallel.

The input understands a few prefixes:

| Input | Effect |
|---|---|
| `code-reviewer review PR 1234` | If the first word is one of your [custom agents](/en/book2-advanced/06-agent-catalog), that agent runs the session |
| `@code-reviewer ...` | Same, from anywhere in the prompt |
| `@my-service ...` | Run the session in a sibling repository or worktree (type `@` to list targets) |
| `/my-skill` | Dispatch a skill or command as the first prompt |
| `! pytest -x` | Run a shell command as a background job instead of a Claude session |
| `#1234` or a PR URL | Jump to the session already working on that pull request |

Inside agent view, `/model opus` changes the model for sessions you dispatch next (until you close agent view), and `/resume` opens a picker to bring a past session back as a row.

### Read the rows

Rows are grouped: `Ready for review` (the session has an open pull request), `Needs input`, `Working`, `Completed`. Each row shows a name, a one-line summary, and an age. A `#1234` label at the right links to the session's pull request and is colored by its status: yellow while checks or review are pending, green when checks pass and no review blocks, purple once merged.

The summaries are written by a Haiku-class model at the end of each turn and every few minutes during long turns. Those are small extra requests billed like the session itself.

The icon's shape tells you whether the process is alive: `✻` or an animated `✽` means it is running, `∙` means the process has exited (reply or attach and it restarts where it left off), and `✢` is a `/loop` session sleeping between runs.

### Peek, reply, attach

| Key | Action |
|---|---|
| `↑` / `↓` | Move between rows |
| `Space` | Peek: the session's last output, or the exact question it is asking. Type a reply and press `Enter` |
| `Enter` or `→` | Attach: the full interactive session takes over the terminal |
| `←` on an empty prompt | Detach and go back to the table |
| `Ctrl+T` | Pin a session to the top and keep its process running |
| `Ctrl+R` | Rename |
| `Ctrl+X`, then `Ctrl+X` again within two seconds | Stop, then delete |
| `Ctrl+S` | Group by directory instead of state |
| `?` | All shortcuts |

The peek panel is enough most of the time. A reply to a working session joins its queue instead of interrupting it. A reply of exactly `/stop` stops the session. Permission prompts cannot be answered from the peek panel; attach to answer them.

Detaching never stops a session. To end one from inside, run `/stop`.

You can filter by typing in the input: `s:blocked` shows everything waiting on you, `a:reviewer` shows sessions running that agent, `o:merged` searches results, and filters combine (`s:blocked a:reviewer`).

### Move a session you already have

Inside a regular `claude` session:

- `/background` (or `/bg`) moves this conversation into a background session and frees your terminal. `/bg run the tests and fix failures` adds one last instruction first.
- `←` on an empty prompt does the same and opens agent view with that row selected. Turn this off with the `leftArrowOpensAgents` setting.
- `/fork` copies the conversation into a new background session while you keep working in the original. The copy carries your model, permission mode, effort and "don't ask again" grants. After the fork the two are independent.

The prompt footer counts background sessions waiting on you, such as `← 2 agents`.

To make plain `claude` open agent view, run `/config defaultToAgentsView=true`. To turn background sessions and agent view off, set `disableAgentView` to `true` (administrators can enforce it in managed settings).

## Background sessions from the shell

```bash
claude --bg --name "flaky-test" "investigate the flaky SettingsChangeDetector test"
```

prints a short ID and the commands that take it:

```text
backgrounded · 7c5dcf5d · flaky-test
  claude agents             list sessions
  claude attach 7c5dcf5d    open in this terminal
  claude logs 7c5dcf5d      show recent output
  claude stop 7c5dcf5d      stop this session
```

| Command | Does |
|---|---|
| `claude --bg "<prompt>"` | Start a background session (the prompt is positional; `--bg` refuses `-p`) |
| `claude --agent <name> --bg "<prompt>"` | Start it with one of your custom agents |
| `claude --resume <session-id> --bg "<prompt>"` | Continue an existing conversation in the background |
| `claude --bg --exec 'pytest -x'` | Run a shell command as a background job (output kept in memory about five minutes after exit) |
| `claude attach <id>` | Open it in this terminal |
| `claude logs <id>` | Print recent output |
| `claude stop <id>` | Stop it; the conversation is kept |
| `claude rm <id>` | Delete it, and its worktree when that is safe |
| `claude respawn <id>` / `--all` | Restart onto the current Claude Code binary |
| `claude agents --json` | Print live sessions as JSON (add `--all` for completed ones, `--cwd <path>` to filter) |

`claude agents` also takes dispatch defaults for everything you start from it:

```bash
claude agents --permission-mode plan --model opus --effort high
```

### Who keeps them running

A supervisor process hosts background sessions, so they keep working after you close agent view or the terminal. They survive sleep: processes resume on wake. A shutdown stops them. A session that is finished or waiting for you and stays unattached for about an hour has its process stopped to free memory; the conversation stays on disk and resumes when you reply or attach. Pin a session with `Ctrl+T` to keep it hot.

### Where their edits go

A dispatched session starts in your working directory but, before it edits anything, moves into its own git worktree under `.claude/worktrees/`. Parallel sessions read the same checkout and each write to their own. When the session has made changes there, Claude is instructed to commit without asking, push the branch if there is a remote, and open a draft pull request when the task calls for one. It is told never to push to `main` or `master`, force-push, or merge. If your task, `CLAUDE.md` or memory says you handle git yourself, that wins.

Sessions you background yourself with `←` or `/bg` keep editing where they were. Outside a git repository there is no isolation unless you configure a `WorktreeCreate` hook. To turn isolation off for a repository, set `"worktree": {"bgIsolation": "none"}` in `.claude/settings.json`.

Deleting a session from agent view removes its worktree including uncommitted changes, so commit first. `claude rm` is more cautious: it keeps a worktree that has uncommitted changes or unpushed commits and tells you how to proceed. [Worktrees](/en/book2-advanced/08-worktrees) covers cleanup.

### Permission mode

A session you background with `/bg` or `←` keeps its permission mode. A session dispatched from `claude agents` started in a shell, or with `claude --bg`, starts the way a new `claude` would in that directory, unless you passed dispatch defaults. `claude --bg --permission-mode bypassPermissions` is refused until you have accepted the bypass disclaimer once interactively, because nobody is watching that session. Auto mode is usually the better choice for unattended work; see [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions).

## Cross-session messaging

Since v2.1.224 (August 2026), Claude in one session can message your other Claude Code sessions. There is nothing to enable on a supported version. Claude finds targets with the `ListAgents` tool and sends with `SendMessage`, either when you ask or on its own, for example after it changes something another session builds on.

A message is plain text that one Claude writes to another. It never carries the sender's conversation history or files.

### Send one

Ask in plain words:

```text
Tell the session working on the payments API that users.name is now users.display_name
```

Or name the target with an `@` mention (v2.1.232 and later). Type `@` and the first letters of the session's name, and pick it from the typeahead:

```text
Let @api-worker know the schema migration finished
```

Names with spaces go in quotes: `@"release notes"`. If two live sessions answer to the same name, Claude asks which one you mean.

To see what Claude can reach, run `/list-agents` (also `/peers`). It lists subagents, teammates, your other local sessions including background ones, and, while this session is connected to Remote Control, your cloud sessions and sessions on other machines.

To wait on another session without polling, ask for a notice:

```text
Tell me when the migration session finishes what it's working on
```

The other session sends one notice when it next goes idle or exits. This works only between sessions on the same machine, and the request expires after 12 hours.

### How messages are delivered

- The receiver reads a message between tool calls, so a running tool is never interrupted. An idle receiver starts a new turn.
- It shows as a one-line preview, such as `› Message from @api-worker: Schema migration finished (ctrl+o to expand)`. `Ctrl+O` shows the full text.
- On the same machine, messages travel over a per-session socket (a named pipe on native Windows) that only your OS user can use, never through Anthropic servers. To another machine or a cloud session they go through Anthropic servers over Remote Control.
- A delivered message counts toward usage like a prompt you typed.
- Bursts and loops are throttled at both ends, so two sessions cannot message each other forever.

### What a message cannot do

The receiving Claude is told the message came from another session, not from you, and Claude Code limits it:

- It cannot approve a pending permission prompt.
- It cannot change permission settings, `CLAUDE.md` or other configuration.
- A command in its text, such as `/compact`, arrives as plain text and does not run.
- Anything it asks for still goes through the receiver's own permission prompts.

Claude is also instructed never to ask another session to do something its own session denied. A peer is not a way around a deny rule.

### Control what arrives

Set `crossSessionInbound` per session or in user settings (or pick **Messages from your other sessions** in `/config`):

| Value | Effect |
|---|---|
| `accept` | Deliver every message |
| `hold` | Show a notice, deliver only if an `accept` later applies |
| `refuse` | Drop every message |

With no value set, Claude Code decides per message from the two sessions' permission modes: a session that prompts for permissions accepts messages unless the sender bypasses prompts, and a session in `bypassPermissions` holds messages for your approval unless the sender bypasses too.

Two more controls:

- `"isolatePeerMachines": true` requires your approval before any message leaves this machine, even in `bypassPermissions`.
- Deny rules on `SendMessage` and `ListAgents` stop sending and listing. Note that denying `SendMessage` also removes messaging to subagents and teammates.

A session inside a container cannot reach one on the host, and a WSL 2 session cannot reach a native Windows one.

## Running several sessions on one machine

The features above make parallel sessions possible. These habits make them manageable.

**One task per session, one name per task.** Start sessions with `claude -n "payments-refund"` (or `--name`), or run `/rename payments-refund` inside one. The name shows in the prompt bar, the `/resume` picker and agent view, and it is what other sessions use to message this one. If another live session already has the name, yours is renamed to a variant. Resume later with `claude --resume payments-refund`.

**One worktree per session that edits.** Agent view does this for you. For sessions you start yourself, use `claude -w <name>`. Two sessions editing the same checkout will overwrite each other's work.

**Let sessions talk instead of copying between terminals.** When one session lands a breaking change, ask it to tell the others. When one is blocked on a decision another session made, ask for the answer to be sent across.

**Leave a written trail for long work.** For a feature that spans days, keep a short status file and commit at natural stopping points. Before you stop:

```text
We're done for today. Commit finished work on this branch, then update
WORK_IN_PROGRESS.md with what changed, what is incomplete, the next steps
in order, and any open decisions.
```

A fresh session the next week can read that file and the last few commits instead of relying on a stale conversation. Git history is the most reliable record of what actually happened.

**Watch the bill.** Each session sends its own requests, and agent view adds a small summary request per row at the end of each turn. A dozen working sessions burn through a weekly limit fast; `/usage` shows where it went.

<!-- AUTHOR-DATA: how many sessions the author typically runs in parallel, and the resulting share of the weekly limit used per day -->

## Check that it worked

1. Start a session in the background and confirm it is listed:

   ```bash
   claude --bg --name "smoke-test" "list the five largest files in this repository"
   claude agents --json
   ```

   The JSON array includes an entry with `"kind": "background"` and the name `smoke-test`.

2. Open `claude agents`, select the row, and press `Space`. The peek panel shows its result.
3. Attach with `Enter` and run `/status`. The `Session kind` row reads `background job · attached`.
4. In a second terminal, start `claude -n other`, then run `/list-agents`. The `smoke-test` session is listed. Ask Claude to send it a one-line message and confirm the preview line appears in that session.
5. Clean up with `claude rm <id>`.

## Sources

- "Manage multiple agents with agent view", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- "Message your other Claude Code sessions", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/cross-session-messaging
- "Run agents in parallel", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agents
- "Manage sessions", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/sessions
- "Commands", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- "Week 20 · May 11–15, 2026" (agent view), Claude Code What's New, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w20
- "Week 32 · August 3–7, 2026" (cross-session messaging), Claude Code What's New, Anthropic. https://code.claude.com/docs/en/whats-new/2026-w32
- `claude --help`, `claude agents --help`, `claude attach|logs|stop|rm|respawn --help`, Claude Code 2.1.289, run 2026-10-04.
