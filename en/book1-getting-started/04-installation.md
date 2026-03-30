# Chapter 4: Installation

## Before We Begin

Installation is the most "technical" part of this book — but it is more straightforward than it looks. You will type a few commands, and then you will be done. The whole process takes most people under ten minutes.

This chapter covers installation on Mac, Windows, and Linux. Jump to your operating system's section. If you hit any problems, the troubleshooting section at the end of this chapter covers the most common issues.

---

## What You Need

**An account.** Claude Code requires a Claude subscription (Pro, Max, Teams, or Enterprise) or an Anthropic Console account (API access with pre-paid credits). If you do not have one yet, go to [claude.com](https://claude.com) and sign up before starting. The free Claude.ai plan does not include Claude Code access.

**Which plan should I pick?** Here is a quick comparison to help you decide before installing. You can always change your plan later.

| Plan | Price | Best For | Context Window |
|------|-------|----------|----------------|
| Pro | $20/month | Occasional use, a few hours per week | 200K tokens |
| Max 5 | $100/month | Daily development, regular usage | 1M tokens |
| Max 20 | $200/month | Primary dev tool, parallel agents, heavy usage | 1M tokens |
| API Direct | Pay per token | CI/CD pipelines, automation, bursty usage | Depends on model |
| Team | $25+/user/month | Team collaboration with admin controls | 1M tokens |
| Enterprise | Custom pricing | Large organizations, compliance needs | 1M tokens |

> **Important note on Team plans:** The $25/user/month Team Standard tier does **not** include Claude Code access. Claude Code requires Team Premium seats at a higher price point. Check [claude.ai/pricing](https://claude.ai/pricing) for the latest details.

**Quick decision:** Try the water → Pro ($20). Serious daily use → Max 5 ($100). All-in → Max 20 ($200). For a deep dive into real usage costs and leverage calculations, see [Chapter 23: Cost Reality](../book3-architect/09-cost-reality.md).

**A terminal.** This is the text-based interface you type commands into. Every computer has one built in:
- Mac: Terminal (search "Terminal" in Spotlight, or find it in Applications > Utilities)
- Windows: PowerShell or Command Prompt (search "PowerShell" in the Start menu)
- Linux: Any terminal emulator (usually accessible by pressing Ctrl+Alt+T)

**An internet connection.** Claude Code needs to connect to Anthropic's servers.

**4 GB of RAM or more.** Almost every computer made in the last ten years meets this requirement.

That is it. No other software is required for the basic installation.

---

## Installing on Mac

Mac installation is the simplest. Open your Terminal and run one command.

### Step 1: Open Terminal

Press Command + Space to open Spotlight search, type "Terminal," and press Enter. A window will appear with a prompt — something like:

```
yourusername@MacBookPro ~ %
```

That blinking cursor is waiting for you to type.

### Step 2: Run the Installer

Copy and paste this command exactly, then press Enter:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

What does this do? It downloads the official Claude Code installer from Anthropic's servers and runs it. You will see some output as it downloads and installs. It looks something like this:

```
Downloading Claude Code...
Installing to /Users/yourusername/.local/bin/claude
Installation complete!
Claude Code has been added to your PATH.
```

The exact output may vary. As long as you do not see any red error messages, things are going well.

### Step 3: Verify the Installation

Close your Terminal window and open a new one (this makes sure your system picks up the new installation). Then type:

```bash
claude --version
```

You should see a version number printed, like:

```
Claude Code 2.x.x
```

If you see that, installation succeeded. Move to Step 4.

### Step 4: Start Claude Code

Navigate to a folder you want to work in (or just stay in your home directory for now) and type:

```bash
claude
```

The first time you run this, Claude Code will prompt you to log in. It will open a browser window where you authenticate with your Claude account. Follow the prompts, come back to your terminal, and you are in.

---

## Installing on Windows

Windows installation has two approaches. We recommend the native Windows installation, which works in PowerShell or Command Prompt. If you are already a developer familiar with WSL (Windows Subsystem for Linux), that works too.

### Step 1: Install Git for Windows (Required)

Claude Code requires Git for Windows. If you are not sure whether you have it, you probably do not. Download and install it from:

```
https://git-scm.com/downloads/win
```

Run the installer. During installation, accept the defaults — you do not need to change any settings. Once it is installed, proceed.

### Step 2: Open PowerShell

Click the Start menu, type "PowerShell," and click "Windows PowerShell." You do not need to run it as Administrator.

### Step 3: Run the Installer

In PowerShell, run:

```powershell
irm https://claude.ai/install.ps1 | iex
```

If you prefer the Command Prompt over PowerShell, use this instead:

```batch
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

Wait for the installation to complete. You will see progress output in the window.

### Step 4: Verify the Installation

Close your PowerShell window and open a new one. Then run:

```powershell
claude --version
```

You should see a version number. If you do, great — move on.

### Step 5: Start Claude Code

Navigate to a project folder and type:

```
claude
```

On first run, Claude Code will open a browser window for you to log in with your Claude account. Complete the login and return to PowerShell.

### Alternative: WSL (Windows Subsystem for Linux)

If you already use WSL and prefer a Linux-style environment, Claude Code works great there. Open your WSL terminal and follow the Linux installation instructions in the next section. WSL 2 is recommended (it also supports Claude Code's optional sandboxing feature for enhanced security).

---

## Installing on Linux

Linux installation is the same single-command approach as Mac.

### Step 1: Open Your Terminal

Most Linux desktops have a terminal accessible from the applications menu, or by pressing Ctrl+Alt+T.

### Step 2: Run the Installer

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

For **Ubuntu, Debian, and most mainstream distributions**, this will work as-is. No additional dependencies needed.

For **Alpine Linux** and other musl-based distributions, you need to install a few additional packages first:

```bash
apk add libgcc libstdc++ ripgrep
```

Then run the installer.

### Step 3: Verify and Start

```bash
claude --version
claude
```

Same as Mac — verify you see a version number, then start Claude Code and log in on first launch.

---

## Alternative Installation: Homebrew (Mac/Linux)

If you use Homebrew as your package manager, you can install Claude Code through it:

```bash
brew install --cask claude-code
```

One important note: Homebrew installations do **not** auto-update. When new versions of Claude Code are released, you will need to run this command to update:

```bash
brew upgrade claude-code
```

The native installer (the `curl` command above) handles updates automatically in the background, which is why we recommend it for most people.

---

## Alternative Installation: WinGet (Windows)

If you use WinGet on Windows:

```powershell
winget install Anthropic.ClaudeCode
```

Same caveat as Homebrew — WinGet installations do not auto-update. Run `winget upgrade Anthropic.ClaudeCode` periodically to stay current.

---

## What Happened Behind the Scenes?

If you are curious: the installer placed a program called `claude` in a folder that your terminal knows how to find (usually `~/.local/bin/claude` on Mac/Linux, or a similar location on Windows). When you type `claude`, your terminal finds and runs that program.

Claude Code stores your login credentials and settings in a folder called `~/.claude` on Mac/Linux, or the equivalent on Windows. You do not need to go in there, but it is good to know it exists.

---

## Troubleshooting Common Issues

### "command not found: claude" after installation

Your terminal does not know where to find the `claude` program. This usually means the installation folder is not in your system's PATH — the list of places your terminal looks for programs.

**Fix:** Close your terminal completely and open a new window. Installation updates the PATH, but the change only takes effect in new terminal sessions.

If a fresh terminal still shows the error, the installer may have added the PATH update to your shell configuration file (like `~/.bashrc` or `~/.zshrc`) but your terminal is not reading it. Try running:

```bash
source ~/.bashrc    # if you use bash
source ~/.zshrc     # if you use zsh (default on newer Macs)
```

Then try `claude --version` again.

### "Permission denied" error during installation

Do **not** use `sudo` with the Claude Code installer. The installer is designed to work without elevated privileges. Using `sudo` can cause permission problems.

If you see permission errors, it usually means your user account does not have write access to the installation directory. The installer uses `~/.local/bin`, which should always be writable by your own account. Try logging out and logging back in, then running the installer again.

### "curl: command not found" on Windows

The `curl` command may not be available in your version of Windows. Use the PowerShell command instead:

```powershell
irm https://claude.ai/install.ps1 | iex
```

Or install [Git for Windows](https://git-scm.com/downloads/win) first, which includes curl.

### Login does not open a browser window

Claude Code tries to open your default browser for authentication. If no browser opens:

1. Check if your default browser is set. Try opening any website manually first.
2. Look in the terminal — Claude Code may have printed a URL. Copy and paste that URL into your browser manually.
3. Make sure you have an active internet connection.

### "Claude Code is not available in your region"

Anthropic's services are not available in all countries. Check [anthropic.com/supported-countries](https://www.anthropic.com/supported-countries) for the current list of supported regions.

### Installation succeeded but Claude Code is very slow on first start

The first time Claude Code starts, it downloads some additional components. This is normal and only happens once. Subsequent starts will be fast.

### Getting more help

If you are stuck, run this command — it performs a diagnostic check of your installation:

```bash
claude doctor
```

This will tell you what is working and what is not, and often suggests how to fix the issue. If `claude doctor` itself does not work, check the official troubleshooting page at [code.claude.com/docs/en/troubleshooting](https://code.claude.com/docs/en/troubleshooting).

---

## You're In

Once you see the Claude Code welcome screen after running `claude`, you have everything you need. The hard part is done.

In the next chapter, we will walk through your very first conversation with Claude Code — from saying hello to watching it create a real file on your computer.

---

**Next up:** [Chapter 5 — Your First Conversation](./05-first-conversation.md) — Starting Claude Code, asking your first questions, and watching it take real actions.
