# Chapter 10: Git Workflows

## Why Git Matters (A Quick Primer)

If you are new to development, here is the essential context: git is a version control system. It is the tool that lets you track every change ever made to your code, go back to any previous version, work on multiple features at the same time without them interfering with each other, and collaborate with other people without everyone overwriting each other's work.

Think of git like a very sophisticated "track changes" system for code. Every time you "commit" in git, you are taking a snapshot of your project at that moment. Those snapshots form a history that you can navigate, branch from, and merge together.

Almost every real project uses git. If you are not using git on your projects today, this chapter will convince you to start.

Claude Code is excellent at git. It writes good commit messages, manages branches cleanly, and can even create pull requests for you. Let's walk through the most common scenarios.

---

## Committing Changes

The most basic git operation is committing — saving a snapshot of your changes with a description of what you did.

The traditional way to commit involves running git commands yourself, writing a commit message, and staging the right files. Claude Code handles all of this:

```
Commit the changes I have made
```

Claude will:
1. Run `git status` to see what has changed
2. Review the changes to understand what was done
3. Stage the appropriate files
4. Write a descriptive commit message
5. Create the commit

The commit messages Claude writes are notably good. Rather than vague messages like "fix stuff" or "update files," Claude writes messages that explain the purpose of the change:

```
fix: validate email format before saving to database

The previous validation only checked for an @ symbol, which allowed
invalid addresses through. Updated to use RFC-compliant regex that
requires a valid domain with proper structure.
```

This kind of detailed commit message is valuable months later when you are trying to understand why a change was made.

**Committing specific files:**

If you only want to commit some of your changes:

```
Commit only the changes to the authentication module, not the UI changes
```

Claude will stage only the relevant files and leave the others unstaged.

---

## Creating Branches

When you are working on a new feature or fixing a bug, best practice is to create a separate branch. This isolates your work from the main codebase until it is ready to merge.

```
Create a new branch for adding the user profile feature
```

Claude will:
1. Choose a reasonable branch name (something like `feature/user-profile`)
2. Create the branch
3. Switch to it
4. Confirm you are on the new branch

You can also specify the name yourself:

```
Create a branch called feature/payment-integration
```

**Checking your current branch:**

```
What branch am I on, and what branches exist?
```

Claude will run `git branch` and tell you clearly where you are and what other branches are available.

**Switching branches:**

```
Switch to the main branch
```

```
Switch back to the feature/user-profile branch
```

---

## Reviewing What Has Changed

Before committing, it is often useful to review what you have actually changed. Git's `diff` command shows the differences between your current files and the last commit.

```
Show me what has changed since the last commit
```

Claude will run `git diff` and then explain the changes to you in plain language — not just dump the raw diff at you, but actually narrate what each change does.

This is particularly useful when:
- You have been working for a while and want to sanity-check everything before committing
- You are looking at a large diff and want a summary instead of reading every line
- You want to make sure no stray changes crept in

---

## Making Pull Requests

A pull request (PR) is how you propose merging your branch's changes into the main codebase. It is the standard workflow for collaborative development — you push your branch, open a pull request, someone reviews it, and then it gets merged.

Claude Code can create pull requests for you using the `gh` command-line tool (GitHub's official CLI):

```
Create a pull request for the changes on this branch
```

Claude will:
1. Push your branch to GitHub (if it has not been pushed)
2. Run `gh pr create`
3. Write a PR title and description based on your commits and the actual changes
4. Open the PR

The PR descriptions Claude writes are similarly thorough — it looks at what actually changed in the code and writes a description that explains the purpose, approach, and any important notes for the reviewer.

You can give Claude context to include:

```
Create a PR for this feature. Note that the main change is in the payment processing module, and reviewers should pay attention to the error handling logic.
```

**Viewing existing PRs:**

```
Show me the open pull requests on this repository
```

---

## Common Scenarios

### Scenario: Starting a new feature

```
Me: I'm going to add a search feature. Can you set up a branch for this?

Claude: I'll create a feature branch for the search functionality.

Running: git checkout -b feature/search
Switched to a new branch 'feature/search'

You're now on the feature/search branch. Any changes you make here
won't affect main until you merge. Ready to start building?
```

### Scenario: Saving your progress at the end of the day

```
Me: Save everything I've done today as a commit

Claude: Let me check what has changed.

Running: git status
[output showing modified files]

I see you've modified:
- src/components/SearchBar.jsx
- src/api/search.js
- tests/search.test.js

These look like a coherent set of changes for the search feature.
Let me commit them:

Running: git add .
Running: git commit -m "feat: add basic search functionality

Adds SearchBar component and search API endpoint.
Basic text matching implemented; no pagination yet."

Committed. Your work is saved.
```

### Scenario: Whoops, I need to undo something

```
Me: I made a commit but the change was wrong. How do I undo it?

Claude: There are a few options depending on what you want:

1. If you want to keep the changes but remove the commit (so you can fix
   things and re-commit):
   git reset HEAD~1

2. If you want to undo the changes entirely:
   git reset --hard HEAD~1

3. If the commit has already been pushed to a remote, it's safer to
   create a new "reverting" commit:
   git revert HEAD

Which situation are you in?
```

Notice how Claude does not just run the command — it asks a clarifying question first, because the right answer depends on context. This is especially important for git operations that can be hard to undo.

### Scenario: Getting the latest changes from your team

```
Me: Someone merged changes to main. How do I get those?

Claude: I'll update your branch with the latest changes from main.

Running: git fetch origin
Running: git merge origin/main

Updated successfully. Your branch now includes the latest changes
from main. No conflicts were found.
```

### Scenario: Merge conflicts

When two people change the same part of the same file in different branches, git cannot automatically merge them — this is called a conflict.

```
Me: I tried to merge main into my branch and got conflicts

Claude: Let me look at the conflicts.

Running: git status
[output showing conflicted files]

You have conflicts in:
- src/components/Header.jsx

Let me look at the conflict in that file...

[reads the file, which contains conflict markers <<< === >>>]

The conflict is in the navigation menu. Main branch added a "Settings"
link, and your branch changed the styling of the existing links.

Here's what I'd suggest: keep both changes — apply the style changes
from your branch to all the links including the new "Settings" link.
Want me to resolve it that way?
```

Claude can read conflict markers, understand both sets of changes, and propose a resolution that preserves what both sides intended.

---

## Setting Up Your Safety Net

If you take one thing from this chapter, make it this: **commit frequently**.

Every time you reach a working state — even if it is not perfect, even if it is just "added a new empty file" — commit. Commits are free. Commits are your safety net. With frequent commits, the worst case is you lose 30 minutes of work, not three hours.

A sensible rhythm:
- Commit when you finish a logical unit of work
- Commit before you start a risky change
- Commit before calling it a night
- Commit when something works for the first time

You can always squash commits together later. You cannot create commits in the past.

---

**Next up:** [Chapter 11 — Building a Simple Website](./11-build-website.md) — A hands-on walkthrough building a portfolio site from scratch with Claude Code.
