# Chapter 21: Worktree & Isolation

When you are working on multiple branches simultaneously or want to protect your main session from experimental changes, Git worktrees provide a powerful isolation mechanism. This chapter covers how to use worktrees with Claude Code to run parallel independent sessions, each with its own isolated context and filesystem state.

---

## What is a Git Worktree?

A Git worktree is a repository checkout that exists independently of your main working directory. Unlike traditional branch switching (which modifies files in place), each worktree is a separate directory pointing to the same Git repository with a different branch checked out.

**Why this matters for Claude Code:**

When you switch branches in a single directory, Claude's entire context shifts — all file reads reference the new branch state. This can cause confusion if you want to compare implementations or work on two features in parallel without losing context.

With worktrees, you can:
- Run Claude in worktree A on feature/auth and Claude in worktree B on feature/payments simultaneously
- Each session has independent context and filesystem state
- Switch between sessions without losing progress
- Merge or compare work without conflicts

**Example scenario:**

You are fixing a critical bug while a feature implementation is in progress. Instead of stashing work and switching branches, create a worktree for the bug fix. Claude works on the bug in its own directory while your feature work remains untouched. When the bug is fixed and merged, simply delete the worktree.

---

## `claude -w [name]` — Starting Isolated Sessions

Start a new Claude session in a worktree using the `-w` flag:

```bash
cd your-project
claude -w bugfix/auth-timeout
```

Claude automatically creates a new worktree named `bugfix/auth-timeout` (or creates the branch if it does not exist) and starts a session there.

**Under the hood:**

```bash
# Claude runs this for you
git worktree add --track -b bugfix/auth-timeout origin/main
cd .claude/worktrees/bugfix/auth-timeout
claude --name "bugfix: auth timeout"
```

Note: Claude Code creates worktrees at `.claude/worktrees/<name>` (a sibling directory alongside your project). The `.git/worktrees/` directory only contains git's internal bookkeeping metadata — it is not where you work.

The session is isolated: file reads, writes, and git operations all operate within the worktree. When you exit the session, the worktree remains (so you can resume it later) but does not occupy a terminal.

**Resume a worktree session:**

```bash
claude -w bugfix/auth-timeout
```

If the worktree exists, Claude attaches to it. If you have a session history there, you can resume it with `/resume`. If not, a fresh session starts.

**List all active worktrees:**

```bash
claude worktree list
```

Shows all worktrees associated with the repository, their branches, and whether a Claude session is currently running in each.

---

## Agent Isolation (`isolation: "worktree"` in Agent Tool)

For multi-agent projects, you can configure agents to run in isolation using the Agent tool's `isolation` parameter:

```json
{
  "name": "architect",
  "model": "opus",
  "instructions": "Design the authentication system",
  "isolation": "worktree"
}
```

When spawned, this agent automatically:
1. Creates or attaches to a worktree named after the agent
2. Works independently from the main session
3. Cannot interfere with other agents' worktrees or the main directory

**Multi-agent isolation pattern:**

```json
{
  "parallel_agents": [
    {
      "name": "auth-implementation",
      "isolation": "worktree",
      "task": "Implement OAuth flow"
    },
    {
      "name": "database-migration",
      "isolation": "worktree",
      "task": "Add user_roles table"
    },
    {
      "name": "tests-setup",
      "isolation": "worktree",
      "task": "Write integration tests"
    }
  ]
}
```

Each agent runs in its own worktree. If an agent makes a breaking change or goes down a wrong path, it does not affect the other agents. After all agents complete, the main session can review, merge, and test the combined changes.

**Isolation guarantees:**

- **Filesystem isolation:** Each worktree has its own file state
- **Context isolation:** Agent context does not cross into other worktrees
- **Git isolation:** Commits in one worktree do not affect others until explicitly merged
- **Tool isolation:** Each agent's tool use is sandboxed to its worktree (no writes outside it)

This is distinct from simple branching — isolation prevents agents from reading or modifying each other's work even through read operations.

---

## Parallel Development with Worktrees

The most common use case: develop feature A and feature B in parallel without context switching.

**Setup:**

```bash
cd your-project

# Main directory: stays on main branch
git worktree add --track -b feature/user-api
git worktree add --track -b feature/search-index
```

**Parallel sessions:**

Terminal 1:
```bash
cd your-project/.claude/worktrees/feature/user-api
claude
```

Terminal 2:
```bash
cd your-project/.claude/worktrees/feature/search-index
claude
```

Both sessions run independently. You can work on the API while Claude develops search indexing in parallel. Neither session sees the other's uncommitted changes.

**Merging worktree changes:**

Once both features are complete:

```bash
# In the main directory
git merge feature/user-api
git merge feature/search-index
```

Resolve any conflicts normally. The worktrees can be cleaned up afterward.

**Use case: Bug fix during feature work**

You are in the middle of a large feature refactor when a critical bug is reported.

```bash
# Main directory (feature/refactor branch)
claude -w hotfix/memory-leak

# In the new terminal
# Claude works on the bug fix while your feature work is unaffected
```

Your feature session remains paused. The bug fix is isolated. When the bug fix is merged to main, switch back to the feature session and continue.

---

## Cleanup & Management

Worktrees are lightweight but accumulate over time. Manage them actively.

**List worktrees:**

```bash
git worktree list
```

Example output:
```
/Users/dev/project                                      f8a3b1c [main]
/Users/dev/project/.claude/worktrees/feature/auth       a2d5e9f [feature/auth]
/Users/dev/project/.claude/worktrees/hotfix/database    7c1b4d2 [hotfix/database]
```

**Remove a worktree:**

```bash
git worktree remove feature/auth
```

This deletes the directory and cleans up Git metadata. The branch remains; you can always create a new worktree for it later.

**Prune stale worktrees:**

Sometimes the worktree directory is deleted manually but Git metadata remains. Clean this up:

```bash
git worktree prune
```

This removes worktree metadata for directories that no longer exist on disk.

**Automate cleanup:**

Add a hook to your CLAUDE.md to remind developers to clean up worktrees:

```markdown
# Cleanup completed worktrees with:
# git worktree list
# git worktree remove [worktree-name]
```

**Delete multiple worktrees:**

```bash
# Remove all worktrees except main (use cautiously)
git worktree list | grep -v '(main)' | awk '{print $1}' | xargs -I {} git worktree remove {}
```

---

## Non-Git Fallbacks

Not all projects use Git, or some directories are outside version control. Claude Code supports worktree-like isolation without Git:

**Directory-based isolation:**

```bash
# Create independent directories manually
mkdir feature-a feature-b
cp -r src feature-a/
cp -r src feature-b/

# Run Claude in each
cd feature-a && claude
cd feature-b && claude
```

This provides filesystem isolation but no version control benefits. You must manually merge changes or use a diff tool.

**Symlink isolation:**

```bash
# Create a symlink-based worktree structure
mkdir worktrees
cd worktrees
cp -r ../src ./feature-a
cp -r ../src ./feature-b
```

Less elegant than Git worktrees but useful for non-Git projects or when you need multiple copies.

**Sandboxed environments:**

For extreme isolation (separate user accounts, containers, VMs):

```bash
# Run in a Docker container
docker run -it -v $(pwd):/project claude-code-dev:latest
```

This isolates not just the directory but the entire environment.

---

## When to Use Worktrees

**Use worktrees when:**

- You are working on 2+ features simultaneously and want to preserve context for each
- You need to hotfix a bug without losing progress on the current feature
- You are running parallel multi-agent development where agents must not interfere with each other
- Your team uses feature branches and you want independent Claude sessions per branch
- You want to compare implementations side-by-side without switching branches

**Do not use worktrees when:**

- You are working sequentially on one feature at a time (simple branching is simpler)
- Your project has no Git repository and creating copies is impractical
- You are doing exploratory work that will be discarded (just use a single branch)
- Context is so large that multiple worktree sessions exceed your token budget

**Worktree size considerations:**

Each worktree is a full checkout of the repository. For a 2 GB codebase, creating 3 worktrees uses 6 GB additional disk space. For large monorepos, consider whether disk usage is acceptable before creating many worktrees.

---

## Quick Reference

| Task | Command |
|---|---|
| Create and start in worktree | `claude -w branch-name` |
| Resume a worktree session | `claude -w branch-name` |
| List all worktrees | `git worktree list` |
| Remove worktree | `git worktree remove branch-name` |
| Clean stale worktree metadata | `git worktree prune` |
| Configure agent isolation | Set `isolation: "worktree"` in agent config |

---

## References

- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree) — Official Git manual
- [Chapter 6: Parallel Agent Orchestration](./06-parallel-agents.md) — Running multiple agents efficiently
- [Chapter 7: Large Project Patterns](./07-large-projects.md) — Architect-coder-review workflows
- [Chapter 18: Multi-session Workflows](./18-multi-session.md) — Long-running project patterns

---

**Next up:** [Chapter 22 — Voice, Fast Mode & Effort Levels](./22-voice-fast-effort.md) — Dictation, speed optimization, and reasoning depth control.
