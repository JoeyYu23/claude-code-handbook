# Chapter 21: Remote Connection

## What Remote Connection Is

Remote Control is a Claude Code feature that lets you continue a Claude Code session running on your local machine from any browser or mobile device. You start a task at your desk, then pick it up from your phone, a tablet, or another computer — without interrupting the session or losing any context.

The key architectural point: your code never moves to the cloud. The Claude Code process continues running on your local machine. The web and mobile interfaces are just windows into that local session. Your filesystem, MCP servers, local tools, and project configuration all remain on your machine and remain available during the remote session.

This is distinct from Claude Code on the web (which runs on Anthropic-managed cloud infrastructure). Remote Control runs locally and connects remotely.

---

## Requirements

Before using Remote Control:

- Claude Code v2.1.51 or later (`claude --version` to check)
- A paid subscription (Pro, Max, Team, or Enterprise plan — API keys are not supported)
- Authentication via claude.ai (run `/login` if not already authenticated)
- Workspace trust accepted in the project directory (run `claude` in the directory once)

For Team and Enterprise plans, an admin must enable Claude Code in admin settings before Remote Control is available to team members.

---

## Setting Up Remote Access

Three ways to start a Remote Control session:

**Server mode (dedicated remote session):**

```bash
cd your-project
claude remote-control --name "My Project"
```

The process runs in your terminal waiting for remote connections. It displays a session URL and you can press spacebar to show a QR code for quick phone access. This is the right mode when you want to leave the session running and check in on it periodically from other devices.

**Interactive session with remote enabled:**

```bash
claude --remote-control "Feature: OAuth Migration"
```

This gives you a full interactive terminal session that you can also control from claude.ai or the Claude mobile app. Unlike server mode, you can type messages locally while the session is also available remotely.

**Enable remote control for an existing session:**

If you are already in a session and want to enable remote access:

```text
/remote-control My Project
```

This starts Remote Control within the current session, carrying over your existing conversation history.

---

## Connecting from Another Device

Once Remote Control is active, you have several ways to connect:

**Direct URL:** Both `claude remote-control` and `/remote-control` display a session URL. Open it in any browser to go directly to the session on [claude.ai/code](https://claude.ai/code).

**QR code:** With `claude remote-control` (server mode), press spacebar to toggle a QR code display. Scan it with the Claude app on iOS or Android to open the session directly.

**Session list:** Open [claude.ai/code](https://claude.ai/code) or the Claude mobile app and find the session by name in the session list. Remote Control sessions show a computer icon with a green status dot when the local machine is online.

---

## Server Mode Options

Server mode (`claude remote-control`) has several useful flags:

```bash
# Custom session name visible in the session list
claude remote-control --name "Backend Refactor"

# Run multiple concurrent sessions, each in its own git worktree
# (requires a git repository — each new session gets a fresh worktree)
claude remote-control --spawn worktree

# Allow all sessions to share the same directory
# (sessions can conflict if editing the same files)
claude remote-control --spawn same-dir

# Set maximum concurrent sessions
claude remote-control --capacity 4

# Verbose logging for debugging
claude remote-control --verbose

# Enable filesystem and network sandboxing
claude remote-control --sandbox
```

The `--spawn worktree` option is particularly powerful for teams: it creates a new isolated git worktree for each remote session, so multiple people can work in parallel on the same repository without interfering with each other's changes.

---

## Enable Remote Control for All Sessions

If you regularly work across devices, enable Remote Control automatically for every interactive session:

```text
/config
```

Set "Enable Remote Control for all sessions" to `true`. With this on, every interactive Claude Code process automatically registers a remote session. Multiple instances each get their own environment and session.

---

## SSH Tunneling for Self-Hosted Environments

If you are running Claude Code on a remote server (a cloud VM, a development machine behind a corporate firewall, or a dedicated build server), you can access it via SSH tunneling combined with Remote Control.

**Setup:**

1. Start Claude Code on the remote server with Remote Control enabled:

```bash
# On the remote server
ssh user@dev-server.example.com
cd project-dir
claude remote-control --name "Dev Server Session"
```

2. The session URL and QR code appear on the server terminal
3. Connect from any device via the session URL

This pattern is useful for:
- Working on a remote development server with a high-memory environment
- Accessing a machine with access to internal network resources
- Running Claude Code on a GPU server for ML development
- Development in a corporate environment where code cannot leave the network

**For fully local tunneling (without claude.ai relay):**

Claude Code's Remote Control works through the Anthropic API relay by default. For environments where all traffic must stay on-premises, there is no supported self-hosted relay option in the current version. In those cases, you would use SSH port forwarding to the local Claude Code terminal directly rather than the Remote Control feature.

---

## Working Across Machines

Remote Control enables a natural cross-machine workflow:

**Morning at the office:**
```bash
# Start a session on your work machine
claude --remote-control "Sprint 14 - Payment Refactor"
```

**On the commute home:**
- Open the Claude app
- Find "Sprint 14 - Payment Refactor" in the session list
- Review what Claude accomplished, provide feedback, answer questions

**At home:**
```bash
# Connect from your home machine to the same session
# (or use the web at claude.ai/code)
```

The conversation stays in sync across all connected devices. Messages sent from the terminal, browser, and mobile app are all part of the same session.

---

## Security Considerations

**How the connection works:**

Your local Claude Code session makes outbound HTTPS requests only. It never opens inbound ports on your machine. When you start Remote Control, it registers with the Anthropic API and polls for work. When you connect from another device, the Anthropic server routes messages between the client and your local session over a streaming connection.

All traffic travels through the Anthropic API over TLS — the same transport security as any Claude Code session. The connection uses multiple short-lived credentials, each scoped to a single purpose and expiring independently.

**What this means for security:**

- Your code and file contents are processed on your local machine
- Messages (your prompts and Claude's responses) pass through Anthropic's API (the same as non-Remote-Control sessions)
- No persistent copies of your code are stored on Anthropic's infrastructure
- The session is tied to your claude.ai account — only accounts you authorize can connect

**For sensitive codebases:**

Remote Control does not change the data flow compared to a standard Claude Code session — both involve messages passing through Anthropic's API. The difference is that Remote Control involves messages coming from additional devices. If your organization's policy allows Claude Code at all, Remote Control does not add materially different risk.

For codebases with the highest sensitivity requirements, review your organization's policies on:
- Whether the Remote Control relay path is approved (it routes through Anthropic's servers)
- Whether mobile devices are approved for development access
- Whether the `--sandbox` flag is required for external access

---

## Troubleshooting

**Session not appearing in the device list:**

Verify the local machine is awake and connected to the network. Remote Control requires the local machine to be reachable. If the machine has been sleeping, the session may have timed out — run `claude remote-control` again.

**Connection drops and does not recover:**

Remote Control automatically reconnects after network interruptions. For extended outages (more than roughly 10 minutes while the machine is awake), the session times out. Run `claude remote-control` again to start a new session. Conversation history from the previous session is preserved locally and can be resumed with `claude --continue`.

**"Claude Code not enabled" error on Team/Enterprise:**

An administrator needs to enable Claude Code in admin settings at claude.ai/admin-settings/claude-code before team members can use Remote Control.

**Terminal must stay open:**

Remote Control runs as a local process. If you close the terminal window or kill the `claude` process, the session ends. For sessions you want to persist indefinitely (even when you close your laptop), run Claude Code in a terminal multiplexer (tmux or screen):

```bash
tmux new-session -s claude-remote
claude remote-control --name "Long Running Task"
# Detach with Ctrl+B, D
```

The session continues running even when you disconnect from the terminal.

---

**Next up:** [Chapter 22 — Security & Privacy](./22-security.md) — Keeping your code and credentials safe while using Claude Code.
