# Auto Mode and Permissions

> Verified on 2026-10-04 with Claude Code 2.1.289.

Claude Code acts on your real computer. When it edits a file, the file changes. When it runs a command, the command really runs. Some of those actions can be undone; a force-push, a deleted cloud bucket or a leaked password cannot.

The permission system decides which actions Claude may take without asking you. This chapter explains how it works now that **auto mode** is the default, what auto mode lets through and what it blocks, how to set hard limits with **deny rules**, and when to switch auto mode off.

## What changed in 2026

For most of Claude Code's history, it asked you before every file edit and most commands. That sounds safe, but Anthropic found a problem with it: people approve 97% of permission prompts. Anthropic's reading is that many users click through reflexively instead of reviewing. A safety check that everyone waves through is not much of a check.

Auto mode is the answer Anthropic shipped:

- **March 2026:** auto mode arrives as a research preview.
- **14 August 2026:** new sessions on the Pro, Max and Team plans start in auto mode.
- **Version 2.1.283 (late September 2026):** auto mode is the starting mode for interactive terminal and VS Code sessions on every plan and provider.

In a controlled study Anthropic ran with 1,053 paid testers, human reviewers caught 13.6% of dangerous commands; auto mode caught 89%. Those are Anthropic's own numbers from a test environment, not an independent audit, but they explain the decision.

## How auto mode works

In auto mode, a second AI model, the **classifier**, reviews actions instead of you. Every action Claude wants to take goes through a fixed order, and the first step that applies decides it:

1. **Your own rules come first.** If the action matches a deny, ask or allow rule you wrote, that rule decides. A deny rule blocks it outright; an ask rule shows you a prompt even in auto mode.
2. **Routine local work is approved directly.** Reading files and editing files inside your project folder run without asking and without the classifier. (A few sensitive locations are exceptions; see *Protected paths* below.)
3. **Everything else goes to the classifier.** Shell commands, network requests and actions outside your folder are judged against a set of block and allow rules.
4. **If the classifier blocks,** Claude is told why and usually finds another way, or tells you it needs your go-ahead.

Two design details are worth knowing. The classifier sees your messages, Claude's tool calls and your `CLAUDE.md`, but not the *results* of tools, so text hidden in a web page or file cannot argue with the classifier directly. And when Claude hands work to a subagent, the classifier checks the task before it starts, each action while it runs, and its report before Claude reads it.

### What auto mode allows by default

- File operations inside your working folder
- Installing dependencies already declared in your project (for example in `package.json` or `requirements.txt`)
- Reading `.env` and sending credentials to the service they belong to
- Read-only web requests
- Pushing to a branch of the repository you are working in (branches named like deploy targets, such as `production` or `gh-pages`, are judged separately), and opening a pull request for the work you asked for
- Reading, reviewing and writing security-related code as part of your task

### What auto mode blocks by default

The full list is long and grows with each version. The main categories, in plain terms:

- **Running code from the internet,** such as `curl ... | bash`
- **Sending sensitive data out** to places outside your project, including putting secrets or personal data into commits, pull requests, gists or public repositories
- **Production changes:** deploys, database migrations, production feature flags, infrastructure teardown (`terraform destroy` and similar)
- **Destroying work:** force-push, `git reset --hard`, `git clean -fd` and other commands that discard uncommitted changes; irreversibly deleting files that existed before the session
- **Widening access:** granting IAM or repository permissions, changing DNS or TLS certificates, writing to secret managers, opening tunnels that expose your machine to the internet
- **Weakening safety:** disabling CI checks, merging a pull request no human approved, approving Claude's own pull request, commenting out security tests, running commands with flags like `--insecure`
- **Unsupervised agents:** launching another agent loop with approvals or sandboxing turned off
- **Printing a live password or token** into the transcript or a file

To see every rule in its exact wording, run this in your terminal:

```bash
claude auto-mode defaults
```

It prints the default allow, block and hard-deny rules as JSON. `claude auto-mode config` prints the rules actually in effect for you, including any changes you or your company made.

### Talking to the classifier

The classifier reads the conversation, so what you say matters.

**Boundaries you state are enforced.** If you write "don't push until I've reviewed it", the classifier blocks pushes even though they are normally allowed, until you lift the boundary in a later message. The catch: this lives in the conversation, and if the conversation is compacted, the message can be summarized away. For a boundary that must hold, write a rule (below).

**Approvals must be specific.** To let through something that is normally blocked, name the action and the specific thing that makes it risky. "You can force-push" clears nothing. "Force-push the `feature/login` branch to origin, I rebased it on purpose" can. An approval covers that one action, not the rest of the session. Some blocks cannot be cleared this way at all; for those, leave auto mode and answer a prompt yourself.

### When something gets blocked

You see a short notice near the input, such as `bash denied by auto mode · [Data Exfiltration] · /permissions`. The text in brackets names the rule that matched. Then:

- Open `/permissions` and go to the **Recently denied** tab to see what was blocked. Select an entry and press `r` to retry it with your manual approval.
- If the same kind of action keeps getting blocked because it touches something you trust (a company package registry, a team bucket), an administrator can list it as trusted infrastructure. Run `/auto-mode-setup` (Pro, Max and Team plans only) to have Claude Code draft those entries.
- If the classifier blocks 3 actions in a row, or 20 in one session, auto mode pauses and Claude Code goes back to asking you. Approving the prompted action resumes auto mode.

### What auto mode is not

Anthropic's documentation is blunt: "Auto mode reduces permission prompts but does not guarantee safety." It is a classifier making judgment calls, and classifiers can be fooled.

In August 2026 the security researcher Johann Rehberger (Embrace the Red) published a chain of tricks that led Claude Code in auto mode to run attacker code planted in a downloaded archive. In his telling, Anthropic treated it as informative rather than a bug, describing auto mode as a best-effort classifier, not a security guarantee. His advice: run unattended agents in a container, virtual machine or sandbox, restrict network access, and do not treat an auto mode approval as proof that a command is safe.

That is the right mental model. Auto mode makes ordinary work faster and catches most mistakes. It is not a wall. Book 3's [Containment and Security](/en/book3-architect/09-containment-and-security) chapter covers the walls.

## Deny rules: limits that always hold

Permission rules are standing orders you write down. There are three kinds:

- **Allow:** do this without asking.
- **Ask:** always ask me first, in every mode, including auto.
- **Deny:** never do this.

They are checked in that strict order of priority: **deny, then ask, then allow**. A deny rule wins over everything, and it applies in every mode, even `bypassPermissions`. Unlike something you say in chat, it does not disappear when the conversation is compacted. Rules are enforced by Claude Code itself, not by the model, so the model cannot talk its way past them.

### Writing rules

A rule names a tool, optionally with a pattern in parentheses:

| Rule | Matches |
|---|---|
| `Bash(npm run test *)` | Any command starting with `npm run test` |
| `Bash(git push *)` | Commands starting with `git push` |
| `Read(./.env)` | Reading the `.env` file in the project folder |
| `Read(./secrets/**)` | Reading anything under `secrets/` |
| `Edit(./migrations/**)` | Changing anything under `migrations/` |
| `WebFetch(domain:example.com)` | Fetching pages from example.com |

Rules live in settings files, under a `permissions` key:

- `~/.claude/settings.json`: your own rules, for every project
- `.claude/settings.json` in a project: shared with everyone who uses the project (commit it to git)
- `.claude/settings.local.json` in a project: your own rules for this project only

Here is a sensible starting point for a project's `.claude/settings.json`:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ],
    "ask": [
      "Bash(git push *)",
      "Bash(gh pr create *)"
    ]
  }
}
```

The deny rules keep Claude's file tools away from your secrets. The ask rules give you a checkpoint before anything leaves your machine, while auto mode handles everything else. You can also add and remove rules interactively: type `/permissions` in a session. The dialog shows every rule and which file it came from.

::: warning Know the limits of rules
A Bash rule matches the command as written. `Bash(git push *)` does not catch `git -C . push`, which does the same thing. A `Read` deny rule stops Claude's file tools and common commands like `cat`, but not a Python script that opens the file itself. For a guarantee at the operating-system level, use Claude Code's sandbox, covered in Book 3.
:::

## The other permission modes

Auto mode is one of six modes. Press `Shift+Tab` during a session to cycle through the common ones. The status bar at the bottom shows which is active.

| Mode | Status bar | What runs without asking | Use it for |
|---|---|---|---|
| **Auto** (`auto`) | `⏵⏵ auto mode on` | Everything, with the classifier checking risky actions | Most everyday work |
| **Manual** (`default`) | `⏸ manual mode on` | Reading only; Claude asks before edits and most commands | Learning, sensitive work, unfamiliar code |
| **Accept edits** (`acceptEdits`) | `⏵⏵ accept edits on` | Reads, file edits, and simple file commands like `mkdir` and `mv` | Changes you will review afterwards with `git diff` |
| **Plan** (`plan`) | `⏸ plan mode on` | Reading and exploring; no edits until you approve a plan | Big or risky changes, unfamiliar projects |
| **Don't ask** (`dontAsk`) | `⏵⏵ don't ask on` | Reads, plus whatever your allow rules permit; everything else is refused | Scripts and CI with an exact allowlist |
| **Bypass** (`bypassPermissions`) | `⏵⏵ bypass permissions on` | Everything, with no checks | Throwaway containers and VMs only |

A note on names: the mode that asks about everything used to be called "default". It is now labeled **Manual** everywhere you see it, and the CLI accepts `manual` as a name, but in settings files its value is still `default`.

From auto mode, `Shift+Tab` goes to Manual, then Accept edits, then Plan, then back to Auto. Don't ask is never in the cycle; Bypass appears only if you started the session with it enabled.

**Plan mode** deserves a habit. For any change that touches many files, press `Shift+Tab` until you see `⏸ plan mode on` (or start your message with `/plan`). Claude reads, investigates and writes a plan without changing your code. When it is ready, you choose **Yes, and use auto mode**, **Yes, manually approve edits**, or **No, keep planning**. Press `Ctrl+G` to edit the plan in your text editor first.

**Bypass mode** turns every check off. Start it only inside an isolated container or VM with no access to anything you care about. Claude Code refuses to start in this mode as the root user on Mac and Linux, which is a hint about how seriously to take it.

## When to switch auto mode off

Auto mode is a good default. Switch to Manual or Plan when:

- **You are learning.** Watching each proposed action and approving it is slow, and it is the fastest way to understand what Claude does. Spend your first few sessions in Manual mode.
- **The project is unfamiliar or untrusted.** A repository you just downloaded may contain instructions written to trick an agent. Use Plan mode to look before anything runs.
- **Real credentials are within reach.** If your machine can reach production systems, cloud accounts or customer data, prefer Manual mode plus deny rules, or move the work into a container.
- **It keeps getting blocked.** Repeated blocks mean the classifier is missing context about your setup. Switch to Manual to finish the task, then fix the configuration.
- **Your company says so.** Organizations can turn auto mode off for everyone.

### How to switch

**For this session:** press `Shift+Tab` until the status bar shows the mode you want.

**For one launch:**

```bash
claude --permission-mode manual
```

**For every session on your machine:** add this to `~/.claude/settings.json`:

```json
{
  "permissions": {
    "defaultMode": "default"
  }
}
```

The next session will show `⏸ manual mode on`. To go back, set it to `"auto"` or remove the line. One quirk: `"auto"` written in a project's `.claude/settings.json` is ignored on purpose, so a downloaded project cannot switch auto mode on for you. Put it in your user settings.

**For a whole company:** administrators set `"disableAutoMode": "disable"` inside `permissions` in managed settings. Auto mode then disappears from the cycle for everyone.

## Protected paths

Writes to a few locations never count as routine edits, because changing them could change how git, your editor or Claude Code itself behaves. Manual and accept-edits modes always ask before writing to them, and auto mode always sends them to the classifier instead of approving them as ordinary file edits. They include the `.git`, `.vscode`, `.idea` and `.claude` folders and files such as `.bashrc`, `.zshrc`, `.gitconfig` and `.mcp.json`. Separately, no allow rule can approve an `rm` that targets a critical location such as your home folder, your project folder or the filesystem root. You do not need to memorize the list; just know that if Claude asks before touching one of these, that is intended.

### Check that it worked

Prove your deny rule works with a harmless test, in your practice folder from Chapter 5:

1. Create a fake secret file: `echo "API_KEY=not-a-real-key" > .env`
2. Create `.claude/settings.json` with the deny rules from the example above.
3. Start `claude`, run `/permissions`, and confirm `Read(./.env)` appears under deny rules, with `.claude/settings.json` as its source.
4. Ask: `What is in the .env file?` Claude should report that it cannot read it.
5. Press `Shift+Tab` and watch the status bar change from `auto mode on` to `manual mode on`, `accept edits on`, `plan mode on` and back.

Finally, in a separate terminal, run `claude auto-mode config` and confirm it prints JSON. That is the rule set auto mode is using for you.

## Sources

- "Choose a permission mode", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- "Configure permissions", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/permissions
- "Configure auto mode", Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/auto-mode-config
- "What's new" (Week 13 research preview; Week 32 default from 14 August), Claude Code Docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
- Conner Phillippi et al., "Auto mode is now the default in Claude Code for Pro, Max, and Team plans", Claude blog, Anthropic, 2026-08-07. https://claude.com/blog/auto-mode-default-in-claude-code
- Johann Rehberger, "Breaking Claude Code Opus 5 Auto Mode", Embrace The Red, 2026-08-26. https://embracethered.com/blog/posts/2026/breaking-claude-code-opus-5-and-automode/
- `claude --help`, `claude auto-mode --help`, `claude auto-mode defaults`, Claude Code 2.1.289, run 2026-10-04.
