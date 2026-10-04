# Installation

> Verified on 2026-10-04 with Claude Code 2.1.289.

## Before we begin

Installation is the most technical part of this book, and it is shorter than it looks: one command, one sign-in, one check. Most people are done in ten minutes.

You have three ways in. Pick one now; you can add the others later.

| Option | Good for | Needs a terminal? |
|---|---|---|
| **Terminal (CLI)** | The full feature set; this book's examples | Yes |
| **Desktop app** | Working on files on your computer with a visual interface | No |
| **Web (claude.ai/code)** | Running tasks on a cloud machine against a GitHub repository | No |

This chapter covers all three, terminal first.

## What you need

**A paid Claude account, or API access.** Claude Code needs one of:

- A Claude **Pro, Max, Team or Enterprise** subscription. The free Claude plan does not include Claude Code.
- A **Claude Console** account (pay-as-you-go API billing with pre-paid credits).
- Access through **Amazon Bedrock, Google Cloud or Microsoft Foundry**, if your company uses one of those. Your administrator will give you the settings.

As a rough guide at the time of writing, Pro costs $20 a month billed monthly and Max starts at $100 a month, with more usage. Prices and what each plan includes change, so check [claude.com/pricing](https://claude.com/pricing) before you buy. If you are unsure, start with Pro and upgrade if you hit the usage limits often. Book 3's [Cost Reality, Measured](/en/book3-architect/10-cost-reality-measured) chapter shows how to work out what you actually use.

**A supported computer.** The terminal version runs on:

- macOS 13 or later
- Windows 10 (version 1809) or later, or Windows Server 2019 or later
- Ubuntu 20.04+, Debian 10+, or Alpine Linux 3.19+
- 4 GB of RAM or more, on an x64 or ARM64 processor

**An internet connection,** and a location in one of [Anthropic's supported countries](https://www.anthropic.com/supported-countries).

**A terminal.** Every computer has one:

- **Mac:** press Command + Space, type "Terminal", press Enter.
- **Windows:** open the Start menu and type "PowerShell".
- **Linux:** usually Ctrl+Alt+T, or find "Terminal" in your applications.

If the terminal is new to you, Anthropic's [terminal guide](https://code.claude.com/docs/en/terminal-guide) walks through opening one and pasting a command.

## Install on Mac or Linux

### Step 1: Run the installer

Paste this into your terminal and press Enter:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

This downloads Anthropic's official installer and runs it. It places the `claude` program at `~/.local/bin/claude`. You do not need `sudo`.

The same command works inside WSL on Windows.

### Step 2: Open a new terminal and check

Close the terminal window and open a new one, so it picks up the new program. Then run:

```bash
claude --version
```

You should see a version number followed by `(Claude Code)`, for example:

```
2.1.289 (Claude Code)
```

Your number will be the same or newer. If you see `command not found`, jump to [Troubleshooting](#troubleshooting) below.

## Install on Windows

You can run Claude Code natively on Windows or inside WSL (the Windows Subsystem for Linux). If you are not sure, choose native.

### Step 1 (recommended): Install Git for Windows

[Git for Windows](https://git-scm.com/downloads/win) gives Claude Code a Bash shell to run commands in. It is optional: without it, Claude Code uses PowerShell instead. Most guides and examples assume Bash, so installing it saves confusion later. Accept the installer's defaults.

### Step 2: Run the installer

Open **PowerShell** (you do not need to run it as Administrator) and run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

If you prefer the older **Command Prompt** (CMD), use this instead:

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

How to tell which one you are in: PowerShell's prompt starts with `PS`, like `PS C:\Users\you>`. CMD's does not. Two common errors give it away:

- `The token '&&' is not a valid statement separator` means you pasted the CMD command into PowerShell.
- `'irm' is not recognized` means you pasted the PowerShell command into CMD.

### Step 3: Open a new window and check

Close PowerShell, open it again, and run:

```powershell
claude --version
```

You should see a version number followed by `(Claude Code)`.

### Using WSL instead

If you already work in WSL, open your WSL terminal and use the Mac/Linux command above. Install and run `claude` inside WSL, not from PowerShell. WSL 2 is needed for Claude Code's optional sandbox, which Book 3 covers.

## Other ways to install

The installer above is the one Anthropic recommends, because it updates itself in the background. Package managers work too, but most of them do not auto-update.

**Homebrew (Mac and Linux):**

```bash
brew install --cask claude-code
```

There are two casks: `claude-code` follows the *stable* channel, usually about a week behind and skipping releases with major problems; `claude-code@latest` gets each release as it ships. Update with `brew upgrade claude-code` (or `claude-code@latest`).

**WinGet (Windows):**

```powershell
winget install Anthropic.ClaudeCode
```

Update with `winget upgrade Anthropic.ClaudeCode`.

**Linux package managers.** apt, dnf and apk repositories exist for Debian, Fedora, RHEL and Alpine. Follow the "Install with Linux package managers" section of Anthropic's [setup guide](https://code.claude.com/docs/en/setup), which has the repository details. Alpine also needs a few extra packages; the same page lists them.

## Sign in

Go to a folder you want to work in and start Claude Code:

```bash
cd ~/Documents
claude
```

The first time, Claude Code asks you to sign in. It opens a browser window where you log in with your Claude account (or your Console account) and approve access. Then return to the terminal.

A few things that can happen here:

- **The browser does not open.** Press `c` to copy the sign-in link, then paste it into a browser yourself.
- **You are on a remote machine, in WSL 2 or in a container.** The browser may open on a different machine. After you sign in, the page shows a code instead of redirecting; paste that code into the terminal where it says `Paste code here if prompted`.
- **You have an `ANTHROPIC_API_KEY` environment variable set.** Claude Code skips the browser and asks you once to approve that key instead. If you meant to use your subscription, unset the variable first; an API key bills your Console account, not your plan.

Claude Code may also ask whether you trust the files in the folder. Say yes only for folders you know. Chapter 6 explains why this matters.

You can also sign in or switch accounts without starting a session:

```bash
claude auth login            # sign in with a Claude subscription (the default)
claude auth login --console  # sign in with a Console (API billing) account
claude auth status --text    # show how you are signed in
```

Inside a session, `/login` switches accounts and `/logout` signs out.

## The desktop app

If you would rather not use a terminal, the Claude desktop app includes Claude Code.

1. Download it from [claude.com/download](https://claude.com/download) (macOS for Intel and Apple Silicon, Windows x64 and ARM64; a Linux build for Ubuntu and Debian is in beta).
2. Install, open it and sign in with your Claude account.
3. Click the **Code** tab at the top. If it asks you to upgrade, Claude Code needs a paid plan.
4. Choose **Local**, click **Select folder**, and pick a project folder.

The app has three tabs: **Chat** (ordinary conversation, no file access), **Cowork** (a background agent for general tasks) and **Code** (Claude Code). You do not need the CLI installed for the Code tab. If you have both, running `/desktop` in a terminal session hands it over to the app.

## The web version

[claude.ai/code](https://claude.ai/code) runs Claude Code on a cloud machine instead of your computer. It is available on Pro, Max and Team plans, and for Enterprise users with the right seat type.

1. Go to claude.ai/code and sign in.
2. Connect GitHub when asked. The session clones your repository into a fresh virtual machine. For private repositories, install the Claude GitHub App on that account or organization.
3. Describe a task. Claude works, then pushes a branch you can review and turn into a pull request.

Cloud sessions keep running if you close the tab, and you can follow them from the Claude mobile app. They do not see your local files or settings, only the repository. Book 2's [Desktop and Web](/en/book2-advanced/19-desktop-and-web) chapter covers both apps in depth.

## Keeping it up to date

The native installer updates Claude Code in the background; new versions take effect the next time you start it. To update right away:

```bash
claude update
```

It reports either `Successfully updated from <old> to version <new>` or that you are already up to date. If you prefer fewer, better-tested updates, switch to the stable channel in `/config` under **Auto-update channel**.

## What happened behind the scenes

On Mac and Linux the installer put a small launcher at `~/.local/bin/claude` that points into `~/.local/share/claude/versions/`. On Windows it lives under `%USERPROFILE%\.local\bin\`. Your settings and conversation history live in a folder called `~/.claude` in your home directory. You do not need to touch it, but it is useful to know where it is.

## Troubleshooting

**`command not found: claude` (or `'claude' is not recognized`).** The install folder is not on your PATH, the list of places your terminal looks for programs. First, close the terminal and open a new one. If that does not help on a Mac (which uses the Zsh shell), run:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

On Linux with Bash, use `~/.bashrc` in place of `~/.zshrc`. Then try `claude --version` again.

**The install command prints HTML or `syntax error near unexpected token '<'`, or a 403 error.** Something between you and the download server, often a corporate proxy, returned a web page instead of the script. Anthropic's [installation troubleshooting page](https://code.claude.com/docs/en/troubleshoot-install) has a table that maps each error message to a fix.

**`App unavailable in region`.** Claude Code is not available in your country.

**Login loops or fails.** Run `/logout`, close Claude Code, start it again and sign in fresh.

**Anything else.** Run the built-in checkup:

```bash
claude doctor
```

It checks your installation and settings without starting a session. Inside a session, `/doctor` runs a fuller checkup and can fix some problems for you.

### Check that it worked

Run these two commands in a new terminal:

```bash
claude --version
claude doctor
```

The first should print a version number followed by `(Claude Code)`. The second should end with `No installation issues found.` Then start `claude` in any folder and confirm you reach a prompt with no sign-in request. On the desktop app, the check is simpler: the **Code** tab opens and lets you select a folder.

## Sources

- "Advanced setup" (system requirements, install methods, updates), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/setup
- "Quickstart" (sign-in and account types), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/quickstart
- "Troubleshoot installation and login", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/troubleshoot-install
- "Get started with the desktop app", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/desktop-quickstart
- "Get started with Claude Code in the cloud", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/web-quickstart
- "Plans and pricing", Anthropic, accessed 2026-10-04. https://claude.com/pricing
- `claude --help`, `claude auth login --help`, `claude doctor`, Claude Code 2.1.289, run 2026-10-04.
