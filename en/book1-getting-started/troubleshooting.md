# Troubleshooting

> Verified on 2026-10-04 with Claude Code 2.1.289.

Find the message you are seeing, then follow the steps. Two commands help with almost anything:

- `/doctor` inside a session checks your installation, settings, extensions and context usage, and proposes fixes you can approve.
- `claude doctor` from your shell does a health check when `claude` will not start a session.

## Usage limits and errors from the service

### "You've hit your session limit" (or weekly, Opus, Sonnet limit)

Messages look like `You've hit your session limit · resets 3:45pm`. Your subscription's rolling allowance is used up. It is not a fault.

1. Wait until the reset time shown.
2. Run `/usage` to see your limits and reset times.
3. For an Opus or Sonnet limit, run `/model` and switch to a model outside that family. Session and weekly limits are shared across all models, so switching does not help there.
4. Run `/usage-credits` to buy extra usage on Pro or Max, or to ask your admin on Team or Enterprise.

If the message says `You've hit your monthly spend limit`, raise the limit in your usage settings at claude.ai/settings/usage, or ask your admin.

### "API Error: Request rejected (429)"

You hit a rate limit on your API key or cloud project. Run `/status` to confirm which credential is active, and check your provider's console for limits. If you run many agents at once, fewer in parallel will help.

### "529 Overloaded" or "500 Internal server error"

The service is busy or having a problem on its side; your usage is not the cause. Check status.claude.com, wait a minute, and type `try again`. For 529 you can also switch models with `/model`, since capacity is tracked per model.

### "Prompt is too long" or "Context limit reached"

The conversation no longer fits in Claude's working memory. Run `/compact` to summarize it, or `/clear` to start fresh. If you see `Autocompact is thrashing`, a file or tool output keeps refilling the window: ask Claude to read big files in smaller pieces, or run `/compact keep only the plan and the diff`.

## Login problems

### "Not logged in" or "Authentication required"

Run `/login` in a session, or `claude auth login` in your terminal, and finish sign-in in the browser. If Claude Code prints a URL, copy it into your browser. `claude auth status` shows who you are signed in as.

### "Invalid API key" or `401`

Run `/status` to see which credential is active. A stray `ANTHROPIC_API_KEY` in your environment can override your subscription login. Remove it, or run `/login`.

## Installation problems

### "claude: command not found"

On macOS and Linux the installer places `claude` at `~/.local/bin/claude`. If that folder is not on your PATH, add it:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

(Use `~/.bashrc` if you use Bash.) Open a new terminal afterward. If you have only installed the VS Code extension, there is no `claude` command: the extension keeps its own private copy. Install the CLI separately (see [Installation](/en/book1-getting-started/04-installation)).

For other install errors, such as `EACCES` or certificate errors, see Anthropic's page "Troubleshoot installation and login".

## Permission problems

### Claude asks for permission too often, or not at all

Press `Shift+Tab` to see and change the permission mode. Auto mode is the starting mode in recent versions for interactive terminal and VS Code sessions, so a session that "edits files without asking" is usually working as designed. See [Auto Mode and Permissions](/en/book1-getting-started/06-auto-mode-and-permissions).

### An action was blocked in auto mode

In auto mode a separate classifier model checks each action, and it can block one.

1. A blocked action produces a notification and appears in `/permissions` under the **Recently denied** tab. Press `r` there to retry it with a manual approval.
2. If the classifier blocks 3 actions in a row or 20 in total, auto mode pauses and Claude Code goes back to asking you. Approve the action it asks about to resume auto mode.
3. If you said something like "don't push yet" earlier in the conversation, the classifier treats it as a boundary and blocks matching actions until you lift it in a later message.
4. To override a block, tell Claude that the specific action is allowed and name what makes it risky (for example the branch of a force push). Saying only "you can force-push" does not clear it, and an approval covers one action.
5. For a step that stays blocked, leave auto mode with `Shift+Tab` and answer the normal prompt yourself.

Messages such as `auto mode cannot determine the safety of <tool> right now` mean the classifier could not give an answer. Wait a few seconds and ask again. If the classifier's own context is full, run `/compact`. If it keeps happening, run `claude --debug` for details or leave auto mode.

### "Denied by permission rules"

Run `/permissions` to see the allow, ask and deny rules, and which settings file each comes from. Deny rules win in every mode.

## Memory and instruction problems

### Claude ignores my CLAUDE.md

1. Run `/context` and look under **Memory files**. If your file is not listed, Claude cannot see it. `/memory` lets you open and edit the files.
2. Check the location: `./CLAUDE.md` or `./.claude/CLAUDE.md` for the project, `~/.claude/CLAUDE.md` for you.
3. Make the wording specific ("Use 2-space indentation") and look for contradictions between files.
4. Remember that instructions are context, not a guarantee. If something must always happen, use a hook.

### Claude ignores my AGENTS.md

By default Claude reads `AGENTS.md` only when there is no `CLAUDE.md` or `CLAUDE.local.md` in your working folder or any folder above it. Check, in order:

1. Is there a `CLAUDE.md`, `.claude/CLAUDE.md` or `CLAUDE.local.md` in your folder or above it (other than `~/.claude/CLAUDE.md`)? If so, Claude reads that instead. Either set **Project instructions** to `claude-md-and-agents-md` in `/config`, or add `@AGENTS.md` at the top of that CLAUDE.md.
2. Run `claude --version`. Direct AGENTS.md reading needs 2.1.277 or later, and some sessions (for example on Amazon Bedrock, or with telemetry off) needed 2.1.281.
3. In `/config`, make sure **Project instructions** is not `claude-md` or `managed-only`. If the setting is missing entirely, your session cannot read AGENTS.md directly; import it from a CLAUDE.md.

To confirm, run `/memory` and look for the AGENTS.md path in the list.

### Edits to CLAUDE.md are not picked up

CLAUDE.md is read when a session starts. Start a new session, or confirm the version Claude loaded with `/memory`.

### Claude "forgot" something mid-session

The conversation was probably compacted. Instructions that only existed in chat can be lost; the project-root CLAUDE.md is reloaded from disk. Put anything important there.

## Editor problems

### VS Code: no spark icon, or the extension does not respond

1. You need VS Code 1.94.0 or later (Help, About).
2. The toolbar icon appears only when a file is open. The **Claude Code** item in the bottom-right Status Bar always works.
3. Run "Developer: Reload Window" from the Command Palette.
4. Run `claude` in the integrated terminal for more detailed error messages.
5. On macOS Tahoe and later, `Cmd+Esc` may do nothing because the system's Game Overlay uses it. Free the shortcut in system settings or rebind **Claude Code: Focus input** in VS Code's Keyboard Shortcuts editor.

### JetBrains: IDE not detected

Confirm the plugin is installed and enabled, restart the IDE completely, and start `claude` from the IDE's integrated terminal (or run `/ide`).

## Speed and stability

### Claude Code is slow or using a lot of memory

Run `/compact`, or restart and use `claude --continue` to resume in a fresh process. To see whether a plugin, MCP server or hook is the cause, start with `claude --safe-mode`, which disables all customizations for that session.

### Garbled text in an editor's terminal

Run `/terminal-setup` inside Claude Code, which turns off the terminal's GPU renderer setting that causes it.

### Claude Code hangs

Press `Ctrl+C`. If it does not respond, close the terminal. You do not lose the conversation: run `claude --resume` in the same folder to pick it up.

## Git problems

`gh: command not found` means the GitHub CLI is not installed; install it from cli.github.com and run `gh auth login`. `No remote configured` means the project is not connected to a GitHub repository yet; ask Claude to help connect it. For "nothing to commit", run `git status` to see what git sees. See [Git Workflows](/en/book1-getting-started/10-git-workflows).

## Getting more help

1. Ask Claude directly. It can read its own documentation.
2. Run `/feedback` to report a problem to Anthropic.
3. Search the issues at github.com/anthropics/claude-code.
4. For billing or account problems, use Get help at claude.ai.

### Check that it worked

After any fix, repeat the action that failed. For installation and login problems, `claude --version` and `claude auth status` should both answer without errors.

## Sources

- Anthropic, Claude Code "Error reference", accessed 2026-10-04. https://code.claude.com/docs/en/errors
- Anthropic, Claude Code "Troubleshooting", accessed 2026-10-04. https://code.claude.com/docs/en/troubleshooting
- Anthropic, "Troubleshoot installation and login", accessed 2026-10-04. https://code.claude.com/docs/en/troubleshoot-install
- Anthropic, "Choose a permission mode" (auto mode blocks), accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- Anthropic, "How Claude remembers your project" (AGENTS.md troubleshooting), accessed 2026-10-04. https://code.claude.com/docs/en/memory
- Anthropic, "Use Claude Code in VS Code" and "JetBrains IDEs", accessed 2026-10-04. https://code.claude.com/docs/en/vs-code
