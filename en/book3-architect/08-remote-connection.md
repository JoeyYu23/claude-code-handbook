# Remote Connection

> Verified on 2026-10-04 with Claude Code 2.1.289.

Remote Control lets you drive a Claude Code session that runs on your own machine from a browser at [claude.ai/code](https://claude.ai/code) or from the Claude mobile app. You start a task at your desk and keep steering it from your phone or another computer, without moving the work anywhere.

The key point: the session never leaves your machine. The `claude` process keeps running locally, with your filesystem, MCP servers, tools and project settings. The browser and phone are windows into it. That is the difference from a cloud session, which runs on Anthropic-hosted or self-hosted infrastructure (see [Cloud and Managed Agents](/en/book3-architect/07-cloud-managed-agents)).

## Requirements

- **A claude.ai subscription.** Pro, Max, Team or Enterprise. API keys don't work. On Team and Enterprise, an Owner must first turn on the Remote Control toggle in the Claude Code admin settings.
- **A direct connection to the Anthropic API.** Remote Control is unavailable on Amazon Bedrock, Google Cloud's Agent Platform (formerly Vertex AI) and Microsoft Foundry, and when `ANTHROPIC_BASE_URL` points at a gateway or proxy.
- **A full-scope login.** A long-lived token from `claude setup-token` or `CLAUDE_CODE_OAUTH_TOKEN` can only make model requests. Run `claude auth login` instead.
- **A trusted folder.** In a folder you haven't trusted, `claude remote-control` asks before it starts. Without a terminal to ask on, run `claude` there once first.

## Three ways to start

**Server mode**, for a long-lived session you check in on:

```bash
cd your-project
claude remote-control --name "Payment refactor"
```

The process waits for connections, prints a session URL, and shows a QR code when you press the spacebar. It can serve several sessions at once. The useful flags, all confirmed in `claude remote-control --help`:

| Flag | What it does |
|---|---|
| `--name <name>` | Title shown in the session list |
| `--spawn same-dir` | Default. All sessions share the current directory, so they can collide on the same files |
| `--spawn worktree` | Each on-demand session gets its own git worktree. Press `w` at runtime to toggle |
| `--spawn session` | Classic single-session mode; exits when that session ends |
| `--capacity <N>` | Maximum concurrent sessions (default 32) |
| `--permission-mode <mode>` | Starting permission mode for the sessions it creates |
| `-c`, `--continue` | Bring back the session the last server in this directory started |
| `--session-id <id>` | Bring back one specific session |

**An interactive session that is also remote:**

```bash
claude --remote-control "Payment refactor"
```

You type in the terminal as usual, and the same conversation is open on claude.ai and in the app.

**From a session already running:** type `/remote-control` (or `/rc`), optionally with a name. Your conversation history carries over. The same command works in the Desktop app's Code tab and in the VS Code extension.

To make every interactive session connect automatically, run `/config` and set **Enable Remote Control for all sessions**, or set `remoteControlAtStartup` to `true` in `~/.claude/settings.json`. A project's checked-in settings can turn this off but not on.

## Connecting from another device

Open the printed URL in any browser, scan the QR code with the Claude app, or find the session by name in the session list at claude.ai/code (in the app, tap **Code**). Online sessions show a computer icon with a green dot. If you don't have the app yet, `/mobile` shows a QR code for it.

From the phone or browser you can send messages, attach files, stop background subagents, and run commands such as `/compact`, `/usage` and `/model sonnet`. Terminal-only commands such as `/plugin` and `/resume` work only locally.

To get a push notification when a long task finishes or Claude needs a decision, run `/config` on your machine and turn on **Push when Claude decides**, **Push when actions required**, or both.

## Keeping sessions alive

Remote Control is a local process. Close the terminal, quit the app, or let the machine shut down, and the session goes offline. Three habits help:

- **Run it inside `tmux` or `screen` on a remote host**, so it survives an SSH disconnect:

  ```bash
  ssh you@dev-box
  tmux new-session -s claude-remote
  cd project && claude remote-control --name "dev-box"
  # detach with Ctrl+B, then D
  ```

- **Resume after stopping the server.** If you stop `claude remote-control` with Ctrl+C, run `claude remote-control` again in the same directory to bring back every session it was serving, or `--continue` / `--session-id` for one. This works for about four hours.
- **Know what an outage does.** If the machine is awake but offline, server mode gives up after roughly 10 minutes and exits. An interactive session keeps retrying and reconnects when the network returns. After a laptop sleeps, it reconnects on its own when it wakes.

## Security and data

Your machine makes outbound HTTPS requests only and never opens an inbound port. It registers with the Anthropic API and polls for work; messages between your devices and the local session go through the Anthropic API over TLS, using several short-lived credentials, each scoped to one purpose.

One correction to the first edition: while Remote Control is connected, the session transcript (your messages, Claude's replies and tool activity) is stored on Anthropic's servers so devices stay in sync and the session can reconnect. Execution and file access stay on your machine. Organizations under Zero Data Retention can't enable Remote Control.

Controls worth knowing:

- **`disableRemoteControl`**: set it to `true` in managed settings to turn the feature off on a machine.
- **Trusted Devices (beta)**: when on, each browser, phone or desktop app must enroll and the sign-in must be less than 18 hours old, refreshed with Face ID, Touch ID, Windows Hello or a passkey. Team and Enterprise Owners turn it on under Organization settings > Capabilities > Remote sessions; Pro and Max users turn on **Require trusted devices** in their own settings.
- **Sandboxing**: `claude remote-control` has no sandbox flag. To sandbox the sessions it starts, turn on [sandboxing](/en/book3-architect/09-containment-and-security) in a settings file.

## Remote Control or a cloud session?

| You want to | Use |
|---|---|
| Keep steering work already running on your machine | Remote Control |
| Start a task with no local setup, or run several in parallel | A cloud session (`claude --cloud "task"`) |
| Pull a cloud session down to your terminal | `claude --teleport` or `/teleport` |

Note that `claude --remote` is now a deprecated alias for `--cloud`; it creates a cloud session and has nothing to do with Remote Control.

### Check that it worked

1. Run `claude remote-control --name "rc-test"` in a project. You should see a session URL; pressing the spacebar shows a QR code.
2. Open claude.ai/code on your phone or another computer. "rc-test" should appear with a green dot.
3. Send `run git status and tell me the branch`. The terminal shows the tool activity, and the answer names your local branch, proving the command ran on your machine.
4. If the command errors with `Remote Control requires claude.ai subscription auth`, the message names the credential in the way, such as `ANTHROPIC_API_KEY`. Unset it and try again. `claude doctor` shows which eligibility check failed.

## Sources

- "Continue local sessions from any device with Remote Control", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/remote-control
- "Use Claude Code in the cloud", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/claude-code-on-the-web
- "Settings reference" (`disableRemoteControl`, `remoteControlAtStartup`), Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/settings-reference
- `claude remote-control --help` and `claude --help`, Claude Code 2.1.289, run 2026-10-04.
