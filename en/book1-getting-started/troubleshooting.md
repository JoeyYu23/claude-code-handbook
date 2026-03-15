# Troubleshooting

Solutions to the most common problems you will encounter with Claude Code. Organized by category. Start with the error message you are seeing and follow the steps.

---

## Authentication Problems

### "Not logged in" or "Authentication required"

**Symptom:** Claude Code says you need to log in, or immediately asks you to authenticate when you run `claude`.

**Solution:**
1. Run `claude auth login` in your terminal
2. A browser window will open — complete the sign-in
3. Return to your terminal; it should confirm you are logged in
4. Try running `claude` again

If the browser does not open automatically, Claude Code will print a URL. Copy and paste it into your browser manually.

---

### "Authentication expired" or "Session invalid"

**Symptom:** Claude Code was working before but now says your session has expired.

**Solution:**
1. Run `claude auth logout` to clear the old session
2. Run `claude auth login` to sign in again
3. Check your account status at claude.ai — make sure your subscription is active

---

### "API key not found" or "ANTHROPIC_API_KEY not set"

**Symptom:** You are trying to use Claude Code with a direct API key instead of a Claude.ai account, and it cannot find the key.

**Solution:**
1. Set the environment variable in your terminal: `export ANTHROPIC_API_KEY=your-key-here`
2. To make this permanent, add that line to your `~/.zshrc` or `~/.bashrc` file
3. After editing the file, run `source ~/.zshrc` (or restart your terminal)

---

## Installation Problems

### "claude: command not found"

**Symptom:** You type `claude` and the terminal says the command does not exist.

**Solution:**

First, check if Claude Code is installed:
```bash
which claude
ls ~/.claude/bin/
```

If it is not installed, install it:
```bash
curl -fsSL https://claude.ai/install.sh | bash
```

If it is installed but the command is not found, the installation directory might not be in your PATH. Add it:
```bash
echo 'export PATH="$HOME/.claude/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Restart your terminal after making PATH changes.

---

### Claude Code installs but immediately crashes

**Symptom:** Running `claude` causes an error before anything happens, or it exits immediately.

**Solution:**
1. Check if Node.js is installed and up to date: `node --version` (needs version 18 or higher)
2. Try updating Claude Code: `claude update`
3. Try a clean reinstall: uninstall with the uninstall script, then reinstall with the install script
4. Check the error message — it often tells you exactly what is wrong

---

### "Permission denied" during installation

**Symptom:** The install script fails with a permission error.

**Solution:**
Do NOT use `sudo` with the Claude Code install script. The native installer is designed to install to your home directory, which does not require administrator privileges.

If you see permission errors, check:
1. Do you have write access to `~/.claude/` ?
2. Is your home directory on a read-only filesystem?
3. Try: `mkdir -p ~/.claude && chmod u+w ~/.claude`

---

## Runtime Errors

### "Rate limit exceeded"

**Symptom:** Claude Code stops mid-task with a message about rate limits or "too many requests."

**What it means:** You have sent too many requests in a short period. This is a limit imposed by Anthropic's API to prevent abuse.

**Solution:**
1. Wait a few minutes and try again
2. For long automated tasks, consider adding pauses between requests
3. If you hit rate limits regularly, check your usage at console.anthropic.com (if using API key billing)
4. Claude.ai subscription users have usage limits that reset on a billing cycle — check your usage dashboard

---

### "Context length exceeded" or "Conversation too long"

**Symptom:** Claude Code says the conversation is too long, or responses become truncated or low quality after a very long session.

**What it means:** The conversation has exceeded Claude's context window — it can no longer hold the entire history of what was said.

**Solution:**
1. Run `/compact` to compress the conversation history. Claude will summarize earlier parts while keeping recent context.
2. For a fresh start: run `/clear` to start a new conversation (you will need to re-establish context)
3. For large codebases: focus each session on one task rather than trying to do everything in one long conversation
4. Avoid pasting large files repeatedly — reference them with `@filename` instead

---

### "Tool execution failed" or "Command failed"

**Symptom:** Claude Code tried to run a command and it failed.

**Solution:**
1. Read the error message — it usually tells you exactly what failed
2. Ask Claude: "Why did that command fail? Can you try a different approach?"
3. Run the command yourself (use `!` prefix) to see the full error output
4. Check that required tools are installed: `which npm`, `which python`, etc.

---

### "File not found" or "No such file or directory"

**Symptom:** Claude Code cannot find a file it is trying to read or edit.

**Solution:**
1. Make sure you are in the right directory (`pwd` to check)
2. Check if the file name or path is spelled correctly
3. Ask Claude: "What directory are you looking in? What files exist here?"
4. Run `ls` or `find . -name "filename"` to locate the file

---

## Permission Problems

### "Permission denied" when editing a file

**Symptom:** Claude Code tries to edit a file and gets a permission denied error from the operating system.

**Solution:**
1. Check file permissions: `ls -la filename`
2. Make the file writable: `chmod u+w filename`
3. If the file is owned by root or another user, you may need `sudo` — but be careful using `sudo` with Claude Code

---

### "Denied by permission rules" — Claude refuses to do something

**Symptom:** Claude Code tells you it is not allowed to perform a specific action because of your settings.

**Solution:**
1. Run `/permissions` to view the current allow/deny rules
2. Find the deny rule that is blocking the action
3. Either remove the deny rule, or add a more specific allow rule
4. Check both your user settings (`~/.claude/settings.json`) and project settings (`.claude/settings.json`)

---

### Claude keeps asking permission for the same command repeatedly

**Symptom:** You have approved `npm run test` before but Claude asks again in the next session.

**Solution:**
Add the command to your allowlist so it is always approved:

In `.claude/settings.json`:
```json
{
  "permissions": {
    "allow": ["Bash(npm run test)"]
  }
}
```

Or when Claude asks for permission, look for a "don't ask again" option.

---

## VS Code Extension Problems

### The Claude Code extension is not visible

**Symptom:** You installed the extension but cannot find the spark icon.

**Solution:**
1. Make sure you have a file open in the editor — the toolbar icon only appears with a file open
2. Check VS Code version: requires 1.98.0 or higher (Help → About)
3. Restart VS Code: Command Palette → "Developer: Reload Window"
4. Try disabling other AI extensions (Cline, Continue, GitHub Copilot) temporarily — they can sometimes conflict
5. The Status Bar icon (bottom right: "✱ Claude Code") is always visible even without a file open

---

### Claude Code extension never responds to prompts

**Symptom:** You type a prompt and nothing happens.

**Solution:**
1. Check your internet connection
2. Start a new conversation to rule out a stale session
3. Try running `claude` in VS Code's integrated terminal — more detailed errors appear there
4. Reinstall the extension: uninstall via Extensions panel, reload VS Code, reinstall

---

## Git and GitHub Problems

### "gh: command not found" when trying to create a pull request

**Symptom:** Claude Code cannot create a pull request because the `gh` CLI is not installed.

**Solution:**
1. Install the GitHub CLI: https://cli.github.com/
2. Mac: `brew install gh`
3. After installing, authenticate: `gh auth login`
4. Try the pull request command again

---

### "Remote origin not found" or "No remote configured"

**Symptom:** Claude Code cannot push to GitHub because there is no remote repository configured.

**Solution:**
1. Create a new repository on github.com first
2. Then add the remote: `git remote add origin https://github.com/username/repo-name.git`
3. Or ask Claude: "Help me connect this project to a new GitHub repository"

---

### Git says "nothing to commit"

**Symptom:** You ask Claude to commit but git says there is nothing to commit.

**What it means:** All your files are either already committed or excluded by `.gitignore`.

**Solution:**
1. Run `git status` to see what git sees
2. If you have new files that git is not tracking, run `git add .` to stage them
3. Ask Claude: "What is the current git status? Why does it say nothing to commit?"

---

## CLAUDE.md Problems

### Claude is not following instructions in CLAUDE.md

**Symptom:** You have instructions in CLAUDE.md but Claude seems to be ignoring them.

**Solution:**
1. Run `/memory` to verify the CLAUDE.md file is actually being loaded — it will be listed there if it is
2. Make sure the file is in the right location: either `./CLAUDE.md` or `./.claude/CLAUDE.md`
3. Make instructions more specific: "Use 2-space indentation" works better than "write clean code"
4. Keep the file under 200 lines — longer files have lower adherence
5. Check for contradictions: two rules saying different things may cancel each other out

---

### CLAUDE.md changes are not being picked up

**Symptom:** You edited CLAUDE.md but Claude seems to be using the old version.

**Solution:**
1. Start a new Claude Code session — CLAUDE.md is read at the start of each session
2. Run `/memory` to confirm which version is loaded
3. Make sure you saved the file before starting the session

---

## Performance and Slow Responses

### Claude Code is responding very slowly

**Symptom:** Responses take 30 seconds or more; it feels sluggish.

**Possible causes and solutions:**
1. **High demand:** Anthropic's servers may be under high load. Wait a few minutes and try again.
2. **Very long conversation:** Use `/compact` to compress history. Long conversations slow things down.
3. **Large files in context:** Avoid having Claude hold very large files in memory unnecessarily.
4. **Network issues:** Check your internet connection. Try `ping claude.ai`.

---

### Claude Code seems to "forget" things mid-session

**Symptom:** Claude stops referencing context it knew earlier in the same conversation.

**What it means:** The conversation may have been compacted automatically (Claude summarized older messages to free up context space).

**Solution:**
1. Remind Claude of key context: "Earlier in this session you were working on X. Here's a quick summary of where we are..."
2. Keep important facts in CLAUDE.md so they survive compaction
3. Use `/compact` manually before starting a new major task to compact on your terms

---

## Getting More Help

If none of the above solves your problem:

1. **Ask Claude directly:** "I'm having trouble with [description]. What should I try?" Claude has access to its own documentation and can help troubleshoot itself.

2. **Check the official docs:** https://code.claude.com/docs

3. **File an issue:** For bugs, the GitHub repository at https://github.com/anthropics/claude-code accepts issues with detailed bug reports.

4. **Community:** The developer community around Claude Code shares tips and solutions in online forums and Discord servers — search for "Claude Code community."

---

*Found a problem not listed here? The debugging mindset from Chapter 12 applies: describe the symptom precisely, note what you have already tried, and use Claude itself to help diagnose the issue.*
