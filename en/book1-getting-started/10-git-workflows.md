# Git Workflows

> Verified on 2026-10-04 with Claude Code 2.1.289.

## Why git matters, in one paragraph

Git is the tool that records every change to your project. Each *commit* is a snapshot you can return to. A *branch* is a separate line of work, so you can try something without touching the main version. A *pull request* (PR) is a proposal to merge a branch into the main one, so someone can review it first. It is "track changes" for code.

This matters more when an agent is writing the code. Git is the one undo button that covers everything Claude does, including the things the in-session `/rewind` cannot undo (shell commands, deleted files). If you take one habit from this chapter, take this one: **work on a branch, commit when something works.**

## Commit your work

```text
Commit the changes I have made
```

Claude checks `git status`, reads the changes, stages the relevant files, writes a message and creates the commit. Good messages say why, not just what:

```text
fix: validate email format before saving

The old check only looked for an @ sign, which let invalid
addresses through. Require a domain with proper structure.
```

You can limit what goes in: "Commit only the authentication changes, not the UI changes."

Before a commit, look at what is about to be saved. Ask: "Show me what has changed since the last commit and explain it in plain language," or run `/diff`. This is where you catch stray changes, and it matters most for files that should never be saved to git, such as `.env` files with passwords or API keys. If a project has no `.gitignore` yet, ask Claude to create one before the first commit.

A good rhythm: commit when you finish a unit of work, before a risky change, and when something works for the first time. Commits are free. You can tidy them later, but you cannot create them in the past.

## One branch per task

The habit that scales: every task gets its own branch.

```text
Create a branch for adding the user profile feature
```

Claude picks a name (such as `feature/user-profile`), creates it and switches to it. You can name it yourself: "Create a branch called fix/login-redirect." A common convention is `<type>/<topic>`, such as `feat/search` or `fix/login-redirect`. Check where you are any time with "What branch am I on?"

Why bother? Work on a branch cannot break the main version. If the task goes badly, you delete the branch. If it goes well, you open a pull request. Many teams also block direct pushes to the main branch, so branches are how work gets in at all.

## The pull-request flow

1. **Branch** for the task.
2. **Work and commit** in small steps.
3. **Ask for a review of your own diff** before anyone else sees it. Run `/code-review` in your session. It reviews your branch's commits plus uncommitted changes for correctness bugs, running as a background subagent with its own context. (Pass `--fix` to have it apply the findings.)
4. **Open the pull request:**

```text
Create a pull request for this branch. Mention that the main change is in payments, and ask reviewers to look at the error handling.
```

Claude pushes the branch if needed and uses the GitHub command-line tool, `gh`, to open the PR with a title and description based on the actual changes. You need `gh` installed and logged in (`gh auth status` tells you). On GitLab, Claude can use `glab` for merge requests.

5. **Review it** before it goes to anyone else. Ask: "Highlight the risks in this PR."
6. **Merge** after review, then delete the branch.

Claude Code links a session to the PR it creates. Later, `claude --from-pr 1234` (with your PR number) opens the session picker filtered to sessions tied to that PR, so you can pick the conversation back up when a reviewer asks for changes. You can also paste a PR URL into the `/resume` picker.

## Common situations

**Get the latest changes from your team.** "Someone merged to main. Update my branch." Claude fetches and merges (or rebases, if you say so).

**Merge conflicts.** When two people change the same lines, git cannot merge automatically and marks the file with `<<<<<<<` and `>>>>>>>`. Ask Claude to look: it can read both sides, explain what each intended, and propose a resolution. Read the explanation, then say yes or no.

**"I committed something wrong."** Describe the situation and ask for the options before any command runs. The right answer depends on whether the commit was pushed:

- Not pushed, want to keep the changes: `git reset HEAD~1`.
- Not pushed, want to throw it away: `git reset --hard HEAD~1` (destroys the changes).
- Already pushed: `git revert HEAD` makes a new commit that undoes it, which is safe for shared branches.

Claude Code's auto mode blocks destructive git commands that discard local work when you did not ask for that, but do not rely on it as your only protection.

## A short introduction to worktrees

A branch changes what is in your folder. If you switch branches, everything in the folder changes with it. So what if you want Claude to build one feature while you (or a second Claude) fix a bug, at the same time?

A **git worktree** is a second, separate folder checked out on its own branch, sharing the same history and remote. Edits in one never touch the other. Claude Code has a flag for it:

```bash
claude --worktree feature-auth
```

(`-w` is the short form.) By default this creates a folder under `.claude/worktrees/feature-auth/` in your repository, on a new branch called `worktree-feature-auth`, and starts Claude in it. Run the command again with a different name in a second terminal for a second, isolated session. A few details from the docs:

- The repository needs at least one commit first.
- When you exit, an empty worktree is removed automatically. If it has work in it, Claude asks whether to keep or remove it.
- A worktree is a fresh checkout, so gitignored files such as `.env` are not copied unless you list them in a `.worktreeinclude` file at the project root.
- Add `.claude/worktrees/` to your `.gitignore`.
- You can list your worktrees with plain git, not with a Claude command: `git worktree list`.
- In the Claude desktop app, pick the **worktree** option when you start a session to get the same thing.

You do not need worktrees for your first projects. They become useful when you run several agents at once, which is covered in [Worktrees](/en/book2-advanced/08-worktrees).

### Check that it worked

- After a commit: `git log --oneline -3` shows your new commit at the top.
- After creating a branch: `git branch --show-current` prints its name.
- After opening a PR: `gh pr view --web` opens it in your browser, or `gh pr view` prints it. Check that the title, description and file list match what you meant.
- After starting a worktree: `git worktree list` shows the new folder and branch.

## Sources

- Anthropic, "Common workflows: Create pull requests; Run parallel sessions with worktrees", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/common-workflows
- Anthropic, "Run parallel sessions with worktrees", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/worktrees
- Anthropic, "Code Review: Review a diff locally", Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/code-review
- Anthropic, "Choose a permission mode" (auto mode and destructive git), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/permission-modes
- Anthropic, "What's new" Week 25 (auto mode blocks destructive git), Claude Code docs, accessed 2026-10-04. https://code.claude.com/docs/en/whats-new
- Git project, `git-worktree` documentation. https://git-scm.com/docs/git-worktree
