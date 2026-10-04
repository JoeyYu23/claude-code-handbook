# Worktrees

> Verified on 2026-10-04 with Claude Code 2.1.289.

When two agents edit the same checkout, they overwrite each other. Git worktrees fix that: each agent gets its own directory and branch, backed by one shared repository. Claude Code now creates worktrees for you in three places: when you start a session with `--worktree`, when a subagent has `isolation: worktree`, and when a background session from agent view is about to edit files.

This chapter covers how to use them, how to clean them up, and the part most guides skip: a worktree keeps agents from colliding, but it does not keep an agent in. It is not a security boundary.

## What a worktree is

A git worktree is a second working directory attached to the same repository. It has its own files and its own checked-out branch, and it shares the repository's history, objects, refs and configuration with your main checkout.

For agents this gives you:

- Two sessions can work on `feature/auth` and `fix/timeout` at the same time without stashing or switching branches.
- Each session sees only its own uncommitted changes.
- You merge or discard each branch on its own schedule.

## Start a session in a worktree

```bash
claude --worktree feature-auth
# or
claude -w feature-auth
```

Claude Code creates `.claude/worktrees/feature-auth/` at the repository root, on a new branch named `worktree-feature-auth`, and starts the session there. Leave out the name and it generates one. Run the same command with a different name in another terminal for a second isolated session.

Interactive runs need workspace trust: if you have never run Claude in the repository, run `claude` there once first. Add the directory to `.gitignore` so worktrees do not show up as untracked files:

```gitignore
.claude/worktrees/
```

Add `--tmux` to open the worktree session in its own tmux session (iTerm2 native panes when available, `--tmux=classic` for plain tmux).

You can also ask mid-session: "work in a worktree". Claude creates one with the `EnterWorktree` tool and leaves it with `ExitWorktree`. Entering a path outside `.claude/worktrees/` asks for your approval first, because the move takes the session's write access and project configuration with it.

::: tip There is no `claude worktree` subcommand
The first edition showed `claude worktree list`. That command does not exist. Use `git worktree list`.
:::

### Set up the environment

A worktree is a fresh checkout of tracked files only. Dependencies, build output and gitignored files such as `.env` are not there. Either ask Claude to run your setup, or add a `.worktreeinclude` file at the project root. It uses `.gitignore` syntax, and files that match and are gitignored get copied into every new worktree Claude Code creates:

```text
.env
.env.local
config/secrets.json
```

Notice what this does: it copies your secrets into every agent's directory. That is often what you want for a dev database URL. Think twice before listing production credentials.

### Choose the base branch

By default a new worktree branches from the remote default branch (`origin/HEAD`, usually `main`), fetched if it is more than 24 hours stale. That gives a clean start but drops your unpushed work. To branch from your current `HEAD` instead:

```json
{
  "worktree": {
    "baseRef": "head"
  }
}
```

Use `"head"` when subagents must build on in-progress work. `worktree.baseRef` accepts only `"fresh"` (the default) and `"head"`, not a branch name.

### Start from a pull request

```bash
claude --worktree "#1234"
```

Claude Code fetches that pull request's head from `origin` and creates `.claude/worktrees/pr-1234`. GitHub pull request URLs and GitLab merge request URLs work too. Quote `#1234` so your shell does not read it as a comment. The fetch never prompts for a password, so load your SSH key into `ssh-agent` first.

## Worktrees for subagents and background sessions

Give a custom agent its own worktree with one frontmatter line:

```markdown
---
name: refactorer
description: Applies mechanical refactors across many files
isolation: worktree
---

Apply the requested refactor across every affected file, then run the tests
and report the results.
```

Or ask Claude to "use worktrees for your agents". Each subagent gets a temporary worktree that is removed automatically if it makes no changes. Subagent worktrees use the same base branch rule as `--worktree`.

Background sessions dispatched from agent view or `claude --bg` move into a worktree on their own before their first edit (see [The Agent View and Sessions](/en/book2-advanced/07-agent-view-and-sessions)). The built-in `/batch` skill splits one large change into 5 to 30 units and runs each in its own worktree-isolated subagent.

### What Claude Code enforces inside a worktree

While a session is isolated in a worktree, Claude Code blocks four kinds of tool call, for the session and every subagent it spawns:

- **File edits** (`Edit`, `Write`, `NotebookEdit`) that target the main checkout.
- **Commands** (Bash, PowerShell, Monitor) whose working directory resolves to the main checkout or cannot be verified.
- **Git redirects** into the main checkout through `git -C`, `--git-dir`, `GIT_DIR`, `GIT_WORK_TREE` or a `cd` before git.
- **Commands whose git use cannot be verified** from the text, such as a computed command name. Claude gets a refusal that says how to rewrite the command.

These checks are good at what they are for: stopping an agent that wanders into your main checkout by mistake. Keep reading for what they do not cover.

## What a worktree shares with your main checkout

Claude Code's docs list what every worktree shares, however you created it:

- **The `.git` directory.** Commits, branches, refs and repository config are shared. The sandbox allows writes there so `git commit` works from a worktree.
- **Project-scoped plugins** installed from the main checkout.
- **Permission approvals.** "Yes, and don't ask again" for a Bash command in a worktree is saved to the main checkout's `.claude/settings.local.json` and applies in every worktree of the repository.
- **Untracked `.claude/skills`, `.claude/agents` and `.claude/commands`** from the main checkout, when the worktree has none of its own.

## Why a worktree is not a security boundary

A worktree separates working files. Everything else about the agent stays the same: it runs as your OS user, with your home directory, your environment variables, your SSH keys and cloud credentials, your network, and your repository's shared `.git`. Isolation that only covers which directory gets edited cannot stop an agent, or a prompt injection steering one, that is trying to reach something else.

Concretely:

- **Reads are not restricted.** The worktree checks block edits to the main checkout. They do not stop `cat ~/.aws/credentials` or a read of the main checkout's `.env`.
- **Edits elsewhere are not covered.** The checks protect the main checkout. A write to `~/.bashrc` or another repository is a matter for your permission rules and sandbox, not the worktree.
- **The shared `.git` is an attack surface.** Alex Chaplinsky ("Git worktrees are not an isolation boundary for coding agents", July 30, 2026) shows that because worktrees share one `.git`, an agent in a worktree can install a git hook that then runs as you for the parent repository, rewrite the commit identity in shared config, pop another worktree's entries from the shared stash, and rewrite branches every worktree depends on. Setting `extensions.worktreeConfig` or a custom `core.hooksPath` does not close this, he argues, because both still live in shared config.
- **Claude Code treats repository config as untrusted too.** Since v2.1.247 it skips the repository's own git filter drivers when it creates a worktree, because "a filter driver is a shell command, and anything that can write to the repository, including Claude, could have put one there." That is the right instinct, and it covers worktree creation, not every git command the agent runs later.
- **Approvals leak across.** A "don't ask again" granted in one worktree applies to all of them and to your main checkout.

Use worktrees for what they are good at, collision avoidance, and add a real boundary when the agent runs unattended or touches untrusted input:

| Need | Tool |
|---|---|
| Agents must not overwrite each other | Worktree |
| Agents must not touch each other's refs, hooks, stash or config | A separate clone. Chaplinsky measured a local `git clone --shared` at about the same disk and time cost as a worktree |
| Limit what shell commands can write and which hosts they reach | The sandbox: run `/sandbox`. It is off by default and does not cover hooks, MCP servers or the built-in file tools |
| Keep secrets away from commands | Sandbox `credentials` entries, or keep secrets out of `.worktreeinclude` |
| One boundary around the whole agent | A container or VM |

[Containment and Security](/en/book3-architect/09-containment-and-security) covers the sandbox, containers and prompt injection in depth.

## Clean up

**Interactive `--worktree` sessions** check for work when you exit. A clean worktree from an unnamed session is removed with its branch. A worktree with changes or new commits prompts you to keep or remove it; keeping prints a `claude --worktree <name> --resume` command to come back.

**`-p` runs** have no exit prompt, so their worktrees stay. Remove them yourself.

**Subagent and background-session worktrees** are swept automatically once they are older than `cleanupPeriodDays` (30 days by default), but only if they hold no changed files, untracked files or unpushed commits. While an agent runs, Claude Code holds a `git worktree lock` on its worktree, so `git worktree remove` refuses until it finishes.

Manual cleanup with plain git:

```bash
git worktree list
git worktree remove .claude/worktrees/feature-auth
git worktree remove --force .claude/worktrees/feature-auth   # discard uncommitted changes
git worktree unlock .claude/worktrees/feature-auth           # if git says it is locked
git worktree prune                                            # forget directories deleted by hand
```

Removing a worktree keeps its branch. Delete the branch separately with `git branch -D` once you are sure it is merged or unwanted.

Each worktree is a full checkout of tracked files plus whatever dependencies you install there. On a large monorepo, a dozen agents means a dozen copies of `node_modules`. Two settings help: `sparsePaths` checks out only the listed directories (plus root-level files), and `symlinkDirectories` links a directory back to the main checkout instead of copying it:

```json
{
  "worktree": {
    "sparsePaths": [".claude", "packages/api", "packages/shared"],
    "symlinkDirectories": ["node_modules"]
  }
}
```

A symlinked `node_modules` is shared by every worktree, so an agent that installs a package changes it for all of them. [Large Projects](/en/book2-advanced/18-large-projects) covers monorepos further.

## Worktrees you create yourself

Use git directly to check out an existing branch or put the worktree outside the repository:

```bash
git worktree add ../project-bugfix fix-issue-456
cd ../project-bugfix
claude
```

A background session started inside a linked worktree edits that worktree in place instead of creating another, and the automatic sweep never removes a worktree you created with `git worktree add`.

For Mercurial, SVN or Perforce, configure `WorktreeCreate` and `WorktreeRemove` hooks to create and remove working copies; `--worktree`, subagent isolation and `/batch` then use your hook. See [Hooks](/en/book2-advanced/09-hooks).

## Quick reference

| Task | Command or setting |
|---|---|
| Start a session in a new worktree | `claude -w <name>` |
| Start from a pull request | `claude -w "#1234"` |
| Resume a kept worktree session | `claude --worktree <name> --resume` |
| Branch from current work instead of `main` | `"worktree": {"baseRef": "head"}` |
| Copy gitignored files in | `.worktreeinclude` |
| Isolate a custom agent | `isolation: worktree` in its frontmatter |
| Check out only some directories | `"worktree": {"sparsePaths": [...]}` |
| Turn off isolation for background sessions | `"worktree": {"bgIsolation": "none"}` |
| List, remove, unlock, prune | `git worktree list / remove / unlock / prune` |

### Check that it worked

1. Start an isolated session and confirm where it is:

   ```bash
   claude -w smoke-test
   ```

   Inside it, ask Claude to run `pwd && git branch --show-current`. You should see a path ending in `.claude/worktrees/smoke-test` and the branch `worktree-smoke-test`.

2. From your main checkout, run `git worktree list`. The new worktree appears with its branch.
3. Ask the session to edit a file by its path in the main checkout. Claude Code refuses with an error naming the worktree.
4. Exit the session without changes. Run `git worktree list` again: the worktree is gone (or, for a named session, you were asked whether to keep it).

## Sources

- "Run parallel sessions with worktrees", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/worktrees
- "Configure the sandboxed Bash tool", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/sandboxing
- "Manage multiple agents with agent view" (How file edits are isolated), Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/agent-view
- "Create custom subagents", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/sub-agents
- "Set up Claude Code in a monorepo or large codebase", Claude Code docs, Anthropic, accessed 2026-10-04. https://code.claude.com/docs/en/large-codebases
- "Git worktrees are not an isolation boundary for coding agents", Alex Chaplinsky, Fletch, 2026-07-30. https://fletch.sh/blog/git-worktrees-vs-clones-for-ai-agents/
- "git-worktree documentation", Git project. https://git-scm.com/docs/git-worktree
- `claude --help` (`-w, --worktree`, `--tmux`), Claude Code 2.1.289, run 2026-10-04.
