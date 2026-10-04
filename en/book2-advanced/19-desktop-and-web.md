# Desktop and Web

> Verified on 2026-10-04 with Claude Code 2.1.289.

Claude Code runs the same engine in the terminal, in the Desktop app, in the browser, and in the mobile app. For a developer the question is not which one is best. It is which surface fits the job in front of you, and how to move work between them without losing it. This chapter covers the Desktop app's Code tab and cloud sessions (the "web" in the title). Letting an agent look at its own work, with artifacts, a browser, a simulator or computer use, is the subject of [Agents That See](/en/book2-advanced/14-agents-that-see); this chapter only says where those panes live.

## Which surface for which job

| Surface | Runs on | Pick it when |
| :- | :- | :- |
| CLI | Your machine | You want scripting, `--print`, the Agent SDK, CI, remote servers, third-party providers, or the full feature set |
| Desktop (Code tab) | Your machine, a cloud VM, SSH or WSL | You want parallel sessions in one window, visual diff review, a live app preview |
| Web (claude.ai/code) | Cloud | A long task needs little steering, or must keep going while you are offline |
| Mobile (Claude app) | Cloud sessions; steers local ones | You start or watch work away from your desk |

The docs state that the CLI is the most complete surface for terminal-native work: scripting and the Agent SDK are CLI-only. Desktop is interactive only, so `--print` and `--output-format` have no equivalent. You can mix surfaces on one project. Configuration, `CLAUDE.md`, MCP servers, hooks and skills are shared across the local surfaces.

## The Desktop app

The Claude Desktop app has three tabs: **Chat**, **Cowork** (Dispatch and longer agentic work for non-code tasks), and **Code**. This chapter is about **Code**. It is available for macOS and Windows, with a Linux beta. Sign in with a paid account (Pro, Max, Team or Enterprise), open the Code tab and pick four things before your first message:

- **Environment**: Local, Cloud, an SSH connection, or on Windows a WSL distribution.
- **Project folder** (for cloud sessions, one or more repositories).
- **Model**, changeable mid-session.
- **Permission mode**: Manual, Accept edits, Plan, Auto, and Bypass permissions once enabled. These map to the `default`, `acceptEdits`, `plan`, `auto` and `bypassPermissions` values in `permissions.defaultMode`. `dontAsk` is CLI-only. See [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions) for what Auto's classifier allows.

### Sessions and worktrees

Each conversation is a **session** with its own history and folder. Open several with `Cmd+N` (`Ctrl+N` on Windows), and cycle with `Ctrl+Tab`. In a Git repository, tick the **worktree** option next to the branch name and the session gets an isolated copy of the project, so parallel sessions cannot overwrite each other until you commit. Worktrees default to `<project-root>/.claude/worktrees/`, with a configurable location and branch prefix in Settings. Add a `.worktreeinclude` file to copy gitignored files such as `.env` into new worktrees. Archiving a session (sidebar icon) removes its worktree, and an opt-in setting archives sessions automatically after their pull request merges or closes. The mechanics are in [Worktrees](/en/book2-advanced/08-worktrees).

Claude can also work across sessions. Ask "which session touched the auth refactor?" or "tell the payments session the schema changed" and it can list, read, message and (after asking you) archive your other Desktop sessions. It sees only sessions the Desktop app runs itself, the 20 most recent by default. Not cloud sessions and not terminal sessions. Terminal-to-terminal messaging is separate; see [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions).

### Panes: diff, browser, terminal, files

The Code tab is a set of panes you can drag into any layout: chat, diff, browser, terminal, file, plan, tasks, subagent, and on macOS the iOS Simulator. Pop one out to a second screen when you have one. Useful shortcuts (macOS; Windows uses `Ctrl`): `Cmd+Shift+D` diff, `Cmd+Shift+B` browser, `` Ctrl+` `` terminal, `Cmd+;` side chat, `Cmd+Shift+M` permission mode, `Cmd+Shift+I` model, `Cmd+Shift+E` effort, and `Cmd+/` for the full list. The terminal-style shortcuts such as `Shift+Tab` to cycle modes do not apply here.

Three panes change how you review:

- **Diff view.** A `+12 -1` indicator opens a file-by-file diff. Click a line to leave a comment, then submit all comments at once with `Cmd+Enter`; Claude revises and shows a new diff. **Review code** asks Claude to review its own diff for compile errors, definite logic errors, security issues and obvious bugs. It deliberately skips style and anything a linter would catch.
- **Browser and preview.** Claude starts your dev server and opens it in the Browser pane. With auto-verify on (the default), after every edit it takes screenshots, inspects the DOM, clicks and fills forms, and fixes what it finds. The server setup lives in `.claude/launch.json` (JSON with comments); edit it if you use `yarn dev` or another port. Set `"autoVerify": false` there to turn it off for a project. The pane uses a clean browser profile with none of your logins; when Claude must act as you in logged-in sites, use the Claude in Chrome extension instead.
- **PR status.** After you open a pull request, a CI bar polls checks through the `gh` CLI. **Auto-fix** lets Claude read failing checks and iterate. **Auto-merge** squash-merges once checks pass, but only if auto-merge is enabled in the GitHub repository settings first.

A side chat (`Cmd+;` or `/btw`) answers a question from the session's context without adding anything to it. It is the right tool for "what does this function do?" in the middle of a long task. Side chats are not saved when you close the app.

### Moving between Desktop and the terminal

- From a terminal session: `/desktop` (macOS and x64 Windows, Claude subscription sign-in only) saves the session, opens it in the app, and exits the CLI. `claude --desktop` does the same from your shell; add `--continue` for the latest conversation or `--resume <session-id>` for a specific one. A session name will not work here, only the ID shown by `/status`.
- From Desktop: type `/resume` in a local session to list sessions started from the CLI on this computer. Desktop continues the same session rather than a copy.
- To the cloud: the session menu's **Open in > Cloud** continues a local session as a cloud session, carrying the conversation over as a summary.

Desktop and CLI can run side by side on the same project. They keep separate session lists but share configuration.

### What Desktop does not have

Per the docs: no `--print` or Agent SDK scripting, no agent teams (use dynamic workflows, which run in Desktop), no inline autocomplete, and terminal-dialog commands such as `/permissions` reply that they are unavailable. Edit settings files instead. Third-party providers work through a gateway or the separate Desktop-on-3P setup; the default is Anthropic's API.

### Check that it worked

1. Start a session with the worktree option on. In the project folder, `git worktree list` shows a new entry under `.claude/worktrees/`.
2. Ask Claude to change a visible element of your app. The Browser pane should open, and Claude's reply should mention a screenshot or check it ran.
3. Open the diff pane, comment on a line, and press `Cmd+Enter`. A new diff should appear with your change applied.

## Cloud sessions (web and mobile)

A cloud session is Claude Code on Anthropic-managed infrastructure by default, or on your organization's self-hosted environment. It keeps running after you close the laptop. Cloud sessions are available on Pro, Max and Team plans, and for Enterprise users with premium or Chat + Claude Code seats. Start one from claude.ai/code, the Code tab in the Claude mobile app, the Desktop app (choose **Cloud**), your terminal, or a routine.

From the terminal:

```bash
claude --cloud "Fix the flaky test in auth.spec.ts"
```

Facts worth knowing before you rely on it:

- The VM clones your repository's GitHub remote at your current branch, **not** your local checkout. Push first if you have local commits. If the repo has no remote, or the Claude GitHub App is not installed on it, Claude Code uploads a bundle of your local repository instead (leaving uncommitted changes to files such as `.env` and key files out on macOS, Linux and WSL, and telling you which).
- Each `--cloud` call is a separate session. Run several for independent tasks.
- Handoff from the CLI is one-way. Pull a cloud session into your terminal with `claude --teleport` (picker) or `claude --teleport <session-id>`, or `/teleport` inside a session. Your working tree must be clean, you must be in a checkout of the same repository, the branch must be pushed, and you must use the same claude.ai account. The terminal gets its own copy; new work there does not appear in the cloud session. `--resume` does not list cloud sessions.
- Connect GitHub through the Claude GitHub App at onboarding, or run `/web-setup` in the terminal to send your local `gh` token. Auto-fix for pull requests needs the GitHub App.
- Cloud sessions share rate limits with the rest of your Claude usage, with no separate compute charge. Running many in parallel burns your limits proportionally.
- Only GitHub is supported for cloning and PR creation (GitHub Enterprise Server for Team and Enterprise). Code intelligence plugins do not run in cloud sessions, and voice dictation does not work there.
- Organizations with Zero Data Retention cannot use cloud sessions.

**Auto-fix** keeps a pull request moving on its own. Turn it on from the CI bar at claude.ai/code, with `/autofix-pr` while on the PR's branch in your terminal (it detects the PR with `gh` and starts a cloud session), or by telling Claude on mobile to watch the PR. Claude then reacts to CI failures and review comments: it pushes clear fixes, asks you about ambiguous requests, and notes duplicates. It does not see merge conflicts, because GitHub emits no event for them. Claude's replies to review threads are posted under your GitHub account, labeled as Claude Code. Check your repository for comment-triggered automation (Atlantis, deploy workflows on `issue_comment`) before enabling it; a Claude reply can trigger those.

To steer a *local* session from your phone or browser, use Remote Control (`/remote-control`, or `claude --remote-control`) instead; the work stays on your machine. Dispatch, from the Cowork tab, lets you message a task from your phone and have Desktop run it as a Code session (Pro and Max only). Book 3 covers scheduled and remote work in depth: [Remote Connection](/en/book3-architect/08-remote-connection), [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents).

### Check that it worked

1. Push your branch, then run `claude --cloud "Run the test suite and report failures"`. The CLI shows a setup checklist and the session appears at claude.ai/code and in the mobile app.
2. When it finishes, run `claude --teleport` and pick it. You should land in your terminal on the session's branch with the full conversation loaded.

## Computer use and visual checking

Computer use, the iOS Simulator pane, the browser pane and Claude in Chrome are tools for letting the agent see the result. Which to pick, and what each is allowed to touch, is in [Agents That See](/en/book2-advanced/14-agents-that-see). One rule from the Desktop docs is worth repeating here: Claude tries the most precise tool first (a connector, then Bash, then Chrome, then the Simulator pane) and uses computer use only when nothing else can reach the app. Computer use is a research preview on macOS and Windows, needs a Pro or Max plan, and is off until you enable it in Settings.

## Troubleshooting

- **403 or auth errors in the Code tab.** Sign out and back in; confirm an active paid subscription; if the CLI works, fully quit the app (not just the window) and relaunch.
- **Claude cannot find `npm`, `node` or other tools.** Desktop does not always inherit your shell environment. On macOS, launched from the Dock it reads your shell profile for `PATH` and a fixed set of Claude Code variables, not every variable you export. Set other variables in the local environment editor (environment dropdown, **Local**, gear icon).
- **"Git is required" or Git LFS errors.** Worktree sessions need Git; install it (and Git LFS if the repo uses it) and restart.
- **Layout, terminal and file editor missing.** They require Claude Desktop v1.2581.0 or later. Check for updates.

## Sources

- Desktop application (Code tab reference). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/desktop
- Use Claude Code in the cloud. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/claude-code-on-the-web
- Platforms and integrations. Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/platforms
- Commands reference (`/desktop`, `/teleport`, `/autofix-pr`, `/btw`). Anthropic, Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/commands
- `claude --help`, Claude Code 2.1.289 (`--cloud`, `--teleport`, `--desktop`, `--worktree`, `--remote-control`).
